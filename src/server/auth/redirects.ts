/**
 * Sanitización de redirecciones (protección contra open redirect).
 * Sólo se aceptan rutas internas relativas ("/cuenta", "/cuenta/perfil?x=1"):
 * sin esquema, sin host, sin "//", sin barras invertidas ni caracteres de control.
 */
export const DEFAULT_AFTER_LOGIN = "/cuenta";

const MAX_LENGTH = 512;

export function isSafeRedirectPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_LENGTH) return false;
  if (!value.startsWith("/")) return false;
  // "//host", "/\host" y variantes con barra invertida que los navegadores normalizan a "//".
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (value.includes("\\")) return false;
  // Caracteres de control / espacios en blanco no estándar (CR, LF, tab, NUL…).
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  // Evita rutas que, tras decodificar, produzcan "//" o "\" (p. ej. "/%2F%2Fevil.com", "/%5Cevil.com").
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(decoded)) return false;
  // Verificación final: debe resolver al mismo origen.
  try {
    const base = "https://fundigsac.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return false;
  } catch {
    return false;
  }
  return true;
}

/** Devuelve `value` si es una ruta interna segura; si no, `fallback`. */
export function safeRedirectPath(value: unknown, fallback: string = DEFAULT_AFTER_LOGIN): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return isSafeRedirectPath(candidate) ? candidate : fallback;
}

/** Construye `/login?next=<ruta segura>` (sin `next` si la ruta no es segura). */
export function loginUrl(next?: string): string {
  const safe = safeRedirectPath(next, "");
  return safe ? `/login?next=${encodeURIComponent(safe)}` : "/login";
}
