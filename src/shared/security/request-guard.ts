import "server-only";

/**
 * Defensas comunes de las rutas de la API que cambian estado o consumen recursos (chat, cierre de sesión).
 * No sustituyen a la validación de cada ruta: solo cortan antes lo que nunca debería llegar.
 */

const firstHeader = (value: string | null) => value?.split(",")[0]?.trim() || null;

/**
 * Solo peticiones del propio sitio. Si el navegador envía `Sec-Fetch-Site` (todos los actuales lo hacen), debe ser
 * `same-origin` (o `none`, escrita por la persona); además, si llega `Origin`, su host debe ser el de la petición.
 * Sin ninguna de las dos cabeceras (curl, pruebas) se deja pasar: no hay navegador al que proteger de CSRF.
 */
export function isSameOriginRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = firstHeader(request.headers.get("x-forwarded-host")) || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type JsonBody = { ok: true; value: unknown } | { ok: false; status: 400 | 413 | 415; error: string };

/**
 * Lee un cuerpo JSON sin pasar de `maxBytes`: corta por `Content-Length` y, si no viene, mientras llega el flujo.
 * Así una petición enorme no ocupa memoria del servidor antes de que la validación la rechace.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBody> {
  if (!/^application\/json\b/i.test(request.headers.get("content-type") ?? "")) return { ok: false, status: 415, error: "unsupported_media_type" };
  const declared = Number(request.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413, error: "payload_too_large" };
  if (!request.body) return { ok: false, status: 400, error: "invalid_body" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => {});
      return { ok: false, status: 413, error: "payload_too_large" };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, status: 400, error: "invalid_body" };
  }
}
