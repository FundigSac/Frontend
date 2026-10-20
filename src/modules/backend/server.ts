import "server-only";

/**
 * Cliente del Backend FUNDIGSAC (API Spring Boot en Docker) para el servidor de Next.js (patrón BFF). El navegador nunca
 * habla con la API: llama a rutas propias de /api, que reenvían aquí con la IP del visitante y, si hay sesión, el
 * token de acceso que vive en una cookie httpOnly.
 *
 * Sin BACKEND_URL (por ejemplo, en el despliegue de Vercel sin API pública) todo responde `not_configured` y cada
 * formulario sigue con su envío por correo o WhatsApp, como antes de conectar el Backend.
 */

export type BackendProblem = {
  code?: string;
  detail?: string;
  errors?: { field?: string; code?: string; message?: string }[];
};

export type BackendResult<T> =
  | { ok: true; status: number; data: T; headers: Headers }
  | { ok: false; status: number; problem: BackendProblem; reason: "not_configured" | "unreachable" | "http"; retryAfter?: string };

const TIMEOUT_MS = 10_000;

/** URL base de la API sin barra final, o null si no está configurada. Solo http(s). */
export function backendUrl(): string | null {
  const raw = process.env.BACKEND_URL?.trim().replace(/\/+$/, "");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin + url.pathname.replace(/\/+$/, "") : null;
  } catch {
    return null;
  }
}

export const backendEnabled = () => backendUrl() !== null;

/**
 * IP del visitante para que la API aplique sus límites por persona y no por servidor. Solo se confía en
 * X-Forwarded-For detrás de un proxy que la reescribe (Vercel) o si TRUST_PROXY=1; en local no se envía.
 */
export function clientIp(request: Request): string | null {
  const trusted = process.env.VERCEL === "1" || process.env.TRUST_PROXY === "1";
  if (!trusted) return null;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim();
  return ip && /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? ip : null;
}

type CallOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  request?: Request;
  headers?: Record<string, string>;
};

/** Llama a la API (`path` empieza con /api/v1/...) y devuelve el JSON o el problema (RFC 9457) ya leído. */
export async function callBackend<T>(path: string, options: CallOptions = {}): Promise<BackendResult<T>> {
  const base = backendUrl();
  if (!base) return { ok: false, status: 503, problem: { code: "BACKEND_NOT_CONFIGURED" }, reason: "not_configured" };
  const headers = new Headers({ Accept: "application/json", "Accept-Language": "es-PE", ...options.headers });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const ip = options.request ? clientIp(options.request) : null;
  if (ip) headers.set("X-Forwarded-For", ip);

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false, status: 503, problem: { code: "BACKEND_UNREACHABLE" }, reason: "unreachable" };
  }
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (response.ok) return { ok: true, status: response.status, data: json as T, headers: response.headers };
  const problem = (json && typeof json === "object" ? json : {}) as BackendProblem;
  return { ok: false, status: response.status, problem, reason: "http", retryAfter: response.headers.get("Retry-After") ?? undefined };
}

/** Respuesta JSON del BFF hacia el navegador: nunca reenvía detalles internos, solo el código y los errores de campo. */
export function relay(result: BackendResult<unknown>, okBody?: unknown): Response {
  const headers = { "Cache-Control": "no-store" };
  if (result.ok) return Response.json(okBody ?? result.data ?? { ok: true }, { status: result.status, headers });
  const status = result.reason === "http" ? result.status : 503;
  const body = {
    error: result.reason === "http" ? (result.problem.code ?? "ERROR") : result.reason.toUpperCase(),
    message: result.problem.detail,
    errors: (result.problem.errors ?? []).map((e) => ({ field: e.field, code: e.code, message: e.message })),
  };
  return Response.json(body, { status, headers: result.retryAfter ? { ...headers, "Retry-After": result.retryAfter } : headers });
}
