import { z } from "zod";

/** Límites del chat público: protegen el costo de la API y el tamaño del contexto. */
export const LIMITS = {
  userChars: 1500,
  assistantChars: 8000,
  totalChars: 40000,
  /** Mensajes que se envían al modelo (los más recientes). */
  keepMessages: 16,
  maxMessages: 60,
  /** Ventanas de frecuencia por IP: ráfaga por minuto y tope por 10 minutos. */
  perMinute: 8,
  perTenMinutes: 40,
} as const;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(LIMITS.maxMessages),
  lang: z.enum(["es", "en"]).optional(),
  page: z.string().max(300).optional(),
});

export type ChatTurn = z.infer<typeof messageSchema>;
export type ChatRequest = { messages: ChatTurn[]; lang: "es" | "en"; page: string };
export type ParseResult = { ok: true; value: ChatRequest } | { ok: false; error: string };

/** Valida el cuerpo de la petición y recorta el historial a los últimos mensajes, empezando por uno del usuario. */
export function parseChatRequest(input: unknown): ParseResult {
  const parsed = bodySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_body" };
  const all = parsed.data.messages.map((m) => ({ role: m.role, content: m.content.trim() })).filter((m) => m.content.length > 0);
  if (!all.length || all[all.length - 1].role !== "user") return { ok: false, error: "last_must_be_user" };
  for (const m of all) {
    if (m.role === "user" && m.content.length > LIMITS.userChars) return { ok: false, error: "message_too_long" };
    if (m.role === "assistant" && m.content.length > LIMITS.assistantChars) return { ok: false, error: "message_too_long" };
  }
  let recent = all.slice(-LIMITS.keepMessages);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  if (recent.reduce((n, m) => n + m.content.length, 0) > LIMITS.totalChars) return { ok: false, error: "conversation_too_long" };
  const page = sanitizePage(parsed.data.page);
  return { ok: true, value: { messages: recent, lang: parsed.data.lang ?? "es", page } };
}

/** Solo rutas internas sencillas: evita que el contexto de página lleve texto arbitrario al modelo. */
export function sanitizePage(page: string | undefined): string {
  if (!page || !page.startsWith("/")) return "/";
  const clean = page.split("#")[0].replace(/[^a-zA-Z0-9/_\-?=&.%]/g, "").slice(0, 160);
  return clean || "/";
}

/** Limitador de frecuencia en memoria (por instancia). Es una defensa básica, no un control global. */
export function createRateLimiter(now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return function check(key: string): { ok: true } | { ok: false; retryAfter: number } {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((h) => t - h < 600_000);
    const lastMinute = recent.filter((h) => t - h < 60_000);
    if (lastMinute.length >= LIMITS.perMinute) return { ok: false, retryAfter: Math.ceil((60_000 - (t - lastMinute[0])) / 1000) };
    if (recent.length >= LIMITS.perTenMinutes) return { ok: false, retryAfter: Math.ceil((600_000 - (t - recent[0])) / 1000) };
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((h) => t - h < 600_000)) hits.delete(k);
    return { ok: true };
  };
}
