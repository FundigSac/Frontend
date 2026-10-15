import Anthropic from "@anthropic-ai/sdk";
import { createRateLimiter, parseChatRequest } from "@/modules/assistant/limits";
import { SYSTEM_PROMPT, visitContext } from "@/modules/assistant/prompt";

/**
 * Asistente de FUNDIGSAC: respuesta en streaming (Server-Sent Events) con Claude.
 * Eventos: {"type":"text","text":…}, {"type":"done"}, {"type":"refusal"}, {"type":"error","code":…}.
 * Requiere ANTHROPIC_API_KEY en el entorno; sin ella responde 503 "not_configured" y el widget ofrece
 * WhatsApp y cotización.
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

  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "not_configured" });

  const { messages, lang, page } = parsed.value;
  const client = new Anthropic();
  const encoder = new TextEncoder();
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      try {
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
        reply.on("text", (text) => send({ type: "text", text }));
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
        if (!abort.signal.aborted) {
          console.error("[chat] error", error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : error);
          send({ type: "error", code: errorCode(error) });
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
