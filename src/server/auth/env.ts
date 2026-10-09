import "server-only";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Configuración de entorno de autenticación, con validaciones explícitas. */
export const isProduction = () => process.env.NODE_ENV === "production";

const MIN_SECRET_LENGTH = 32;
let devSecretWarned = false;

/**
 * BETTER_AUTH_SECRET es obligatorio en producción (mín. 32 caracteres).
 * En desarrollo/test, si falta, se genera un secreto aleatorio y se persiste en `.data/auth-dev-secret`
 * (carpeta ignorada por git) para que todos los procesos/workers de `next dev` compartan el mismo
 * valor y las sesiones sobrevivan reinicios. Nunca se usa en producción.
 */
export function getAuthSecret(): string {
  const configured = process.env.BETTER_AUTH_SECRET?.trim();
  if (configured) {
    if (configured.length < MIN_SECRET_LENGTH) {
      throw new Error(`BETTER_AUTH_SECRET debe tener al menos ${MIN_SECRET_LENGTH} caracteres (genera uno con: openssl rand -base64 32).`);
    }
    return configured;
  }
  if (isProduction()) {
    throw new Error("BETTER_AUTH_SECRET es obligatorio en producción. Genera uno con: openssl rand -base64 32");
  }
  const file = path.join(process.cwd(), ".data", "auth-dev-secret");
  let secret: string | undefined;
  try {
    secret = readFileSync(file, "utf8").trim();
  } catch {
    /* se crea abajo */
  }
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    secret = randomBytes(32).toString("base64url");
    try {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, secret, { mode: 0o600 });
    } catch {
      /* si no se puede persistir, el secreto vive sólo en este proceso */
    }
  }
  if (!devSecretWarned) {
    devSecretWarned = true;
    console.warn("[auth] BETTER_AUTH_SECRET no está definido: se usa un secreto de desarrollo generado localmente (.data/auth-dev-secret). NO válido para producción.");
  }
  return secret;
}

/** URL pública del sitio (BETTER_AUTH_URL). Obligatoria en producción. */
export function getBaseUrl(): string | undefined {
  const raw = process.env.BETTER_AUTH_URL?.trim();
  if (!raw) {
    if (isProduction()) throw new Error("BETTER_AUTH_URL es obligatorio en producción (p. ej. https://fundigsac.com).");
    return undefined; // en desarrollo Better Auth infiere el origen desde la petición
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("BETTER_AUTH_URL no es una URL válida.");
  }
  if (isProduction() && url.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL debe usar https en producción.");
  }
  return url.origin;
}

/** Orígenes adicionales de confianza para el chequeo CSRF/Origin (AUTH_TRUSTED_ORIGINS, separados por coma). */
export function getTrustedOrigins(): string[] {
  const out = new Set<string>();
  const base = getBaseUrl();
  if (base) out.add(base);
  for (const item of (process.env.AUTH_TRUSTED_ORIGINS ?? "").split(",")) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    try {
      out.add(new URL(trimmed).origin);
    } catch {
      throw new Error(`AUTH_TRUSTED_ORIGINS contiene un origen inválido: "${trimmed}".`);
    }
  }
  return [...out];
}

export type SocialProviderId = "google" | "facebook";

/** Un proveedor sólo se habilita si ambas variables existen. */
export function getEnabledSocialProviders(): Record<SocialProviderId, boolean> {
  const has = (a: string, b: string) => Boolean(process.env[a]?.trim() && process.env[b]?.trim());
  return {
    google: has("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
    facebook: has("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"),
  };
}

/**
 * Cabecera con la IP real del cliente detrás de tu proxy/CDN (p. ej. "x-forwarded-for", "x-real-ip",
 * "cf-connecting-ip"). Sólo configúrala si el proxy la sobrescribe: si el cliente puede falsificarla,
 * podría evadir el rate limiting.
 */
export function getIpHeaders(): string[] | undefined {
  const raw = process.env.AUTH_IP_HEADER?.trim();
  return raw ? raw.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean) : undefined;
}

/**
 * IPs/CIDR de proxies de confianza (AUTH_TRUSTED_PROXIES, separados por coma). Con una cadena
 * X-Forwarded-For de varios saltos, Better Auth descarta los saltos de confianza desde la derecha y toma
 * el primer salto no confiable como IP del cliente. Sin esto, una cadena de varios valores no se usa
 * y el rate limit cae en un único cubo compartido por ruta.
 */
export function getTrustedProxies(): string[] | undefined {
  const raw = process.env.AUTH_TRUSTED_PROXIES?.trim();
  return raw ? raw.split(",").map((p) => p.trim()).filter(Boolean) : undefined;
}
