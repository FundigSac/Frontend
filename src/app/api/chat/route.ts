import Anthropic from "@anthropic-ai/sdk";
import { guideAnswer, withSuggestions } from "@/modules/assistant/guide";
import { createRateLimiter, parseChatRequest } from "@/modules/assistant/limits";
import { SYSTEM_PROMPT, visitContext } from "@/modules/assistant/prompt";

/**
 * FundigIA: respuesta en streaming (Server-Sent Events).
 * Eventos: {"type":"meta","mode":"ai"|"guide"}, {"type":"text","text":…}, {"type":"done"}, {"type":"refusal"},
 * {"type":"error","code":…}.
 * Con ANTHROPIC_API_KEY responde Claude; sin la clave, o si el servicio falla antes de empezar a responder,
 * contesta la guía rápida (src/modules/assistant/guide.ts) con los datos del sitio, para que el chat siempre funcione.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
const EFFORT = (["low", "medium", "high"] as const).find((e) => e === process.env.CHAT_EFFORT) ?? "low";
const rateLimit = createRateLimiter();

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

/** Solo el propio sitio puede usar el chat (evita que otras webs consuman la API). */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") || request.headers.get("host"));
  } catch {
    return false;
  }
}

function errorCode(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) return "not_configured";
  if (error instanceof Anthropic.RateLimitError) return "busy";
  if (error instanceof Anthropic.APIConnectionError) return "network";
  if (error instanceof Anthropic.APIError && (error.status ?? 0) >= 500) return "busy";
  return "error";
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      resolve();
    });
  });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "forbidden" });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }
  const parsed = parseChatRequest(body);
  if (!parsed.ok) return json(400, { error: parsed.error });

  const limited = rateLimit(clientKey(request));
  if (!limited.ok) return json(429, { error: "rate_limited", retryAfter: limited.retryAfter }, { "Retry-After": String(limited.retryAfter) });

  const { messages, lang, page } = parsed.value;
  const encoder = new TextEncoder();
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      // Guía rápida: se envía por trozos para que se lea como una respuesta escrita en vivo.
      const answerFromGuide = async () => {
        send({ type: "meta", mode: "guide" });
        const text = withSuggestions(guideAnswer(messages[messages.length - 1].content, lang, page));
        for (const piece of text.match(/[\s\S]{1,14}/g) ?? []) {
          if (abort.signal.aborted) return;
          send({ type: "text", text: piece });
          await sleep(14, abort.signal);
        }
        send({ type: "done", stop: "guide" });
      };

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          await answerFromGuide();
          return;
        }
        let started = false;
        try {
          const client = new Anthropic();
          const reply = client.beta.messages.stream(
            {
              model: MODEL,
              max_tokens: 4096,
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              thinking: { type: "adaptive" },
              output_config: { effort: EFFORT },
              // Prefijo estable (rol + base de conocimiento) en caché; el contexto de la visita va al final.
              system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
              messages: [...messages, { role: "system", content: visitContext(lang, page) }],
            },
            { signal: abort.signal },
          );
          reply.on("text", (text) => {
            if (!started) {
              started = true;
              send({ type: "meta", mode: "ai" });
            }
            send({ type: "text", text });
          });
          const final = await reply.finalMessage();
          if (final.stop_reason === "refusal") send({ type: "refusal" });
          else send({ type: "done", stop: final.stop_reason });
          console.info("[chat] uso", {
            model: final.model,
            input: final.usage.input_tokens,
            cacheRead: final.usage.cache_read_input_tokens,
            cacheWrite: final.usage.cache_creation_input_tokens,
            output: final.usage.output_tokens,
          });
        } catch (error) {
          if (abort.signal.aborted) return;
          console.error("[chat] error", error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : error);
          // Si la IA falla antes de escribir, responde la guía; si ya había empezado, se avisa del corte.
          if (!started) await answerFromGuide();
          else send({ type: "error", code: errorCode(error) });
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
