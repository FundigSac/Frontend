import "server-only";
import type { NextRequest } from "next/server";

/**
 * Sesión propia con Google (OAuth 2.0 + OIDC, flujo de código con PKCE). Sin base de datos ni dependencias:
 * la sesión es una cookie httpOnly firmada con HMAC-SHA256 (AUTH_SECRET) con los datos básicos del perfil.
 * Las dos cookies (sesión y estado del flujo) son técnicas y necesarias; no requieren consentimiento (ver /cookies).
 */

export const SESSION_COOKIE = "fundigsac-session";
export const FLOW_COOKIE = "fundigsac-oauth";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const FLOW_MAX_AGE = 60 * 10;

export type SessionUser = { name: string; email: string; picture?: string };
export type FlowState = { state: string; verifier: string; nonce: string; next: string; from: "login" | "registro" };

const encoder = new TextEncoder();

export const b64url = {
  encode(bytes: Uint8Array): string {
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  decode(text: string): Uint8Array<ArrayBuffer> {
    const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  },
};

export function randomToken(bytes = 32): string {
  return b64url.encode(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(text: string): Promise<string> {
  return b64url.encode(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text))));
}

export type GoogleConfig = { clientId: string; clientSecret: string; secret: string };

/** null si falta alguna variable: el botón de Google lleva entonces a /login con un aviso en lugar de fallar. */
export function googleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const secret = process.env.AUTH_SECRET?.trim();
  return clientId && clientSecret && secret && secret.length >= 32 ? { clientId, clientSecret, secret } : null;
}

async function hmacKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

/** payload.firma, ambos en base64url; `exp` (segundos Unix) va dentro del payload firmado. */
export async function sign<T extends object>(secret: string, data: T, maxAgeSeconds: number): Promise<string> {
  const payload = b64url.encode(encoder.encode(JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds })));
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret, "sign"), encoder.encode(payload)));
  return `${payload}.${b64url.encode(mac)}`;
}

export async function verify<T extends object>(secret: string, token: string | undefined): Promise<T | null> {
  if (!token || token.length > 4096) return null;
  const [payload, mac, extra] = token.split(".");
  if (!payload || !mac || extra !== undefined) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret, "verify"), b64url.decode(mac), encoder.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(b64url.decode(payload))) as T & { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now() / 1000 ? data : null;
  } catch {
    return null;
  }
}

/** Usuario de la sesión actual, o null si no hay cookie válida (o el inicio de sesión no está configurado). */
export async function readSession(request: NextRequest): Promise<SessionUser | null> {
  const config = googleConfig();
  if (!config) return null;
  const data = await verify<SessionUser>(config.secret, request.cookies.get(SESSION_COOKIE)?.value);
  return data && typeof data.email === "string" && typeof data.name === "string" ? { name: data.name, email: data.email, ...(data.picture ? { picture: data.picture } : {}) } : null;
}

const isLoopback = (host: string) => host === "127.0.0.1" || host === "[::1]" || host === "::1";

/**
 * Origen público del sitio. AUTH_URL (producción) fija el origen registrado en Google; sin ella se usa el de la
 * petición. Google no admite IP como URI de redirección, así que 127.0.0.1 se trata como localhost.
 */
export function publicOrigin(request: NextRequest): string {
  const fixed = process.env.AUTH_URL?.trim().replace(/\/+$/, "");
  if (fixed) return fixed;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || request.nextUrl.protocol.replace(":", "");
  const [name, port] = host.split(/:(?=\d+$)/);
  return `${proto}://${isLoopback(name) ? "localhost" : name}${port ? `:${port}` : ""}`;
}

export const callbackUrl = (origin: string) => `${origin}/api/auth/callback/google`;

/** Solo rutas internas: evita redirecciones abiertas (`//otro.sitio`, `/\otro.sitio`, esquemas) y las propias de la API. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return "/";
  if (value.startsWith("/api/")) return "/";
  return value.slice(0, 300);
}

/** Las rutas que cambian estado (cerrar sesión) solo aceptan peticiones del propio sitio. */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") || request.headers.get("host"));
  } catch {
    return false;
  }
}

export function cookieOptions(request: NextRequest, maxAge: number, path = "/") {
  return { httpOnly: true, sameSite: "lax" as const, secure: publicOrigin(request).startsWith("https:"), path, maxAge };
}

export const noStore = { "Cache-Control": "no-store" };
