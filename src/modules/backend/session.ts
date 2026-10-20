import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { authSecret, publicOrigin, sign, verify } from "@/modules/auth/server";
import { callBackend } from "./server";

/**
 * Sesión con la API del Backend. Los tokens (JWT de acceso de 15 min y refresh rotativo) viven en una cookie httpOnly
 * firmada que solo viaja a /api: ni el JavaScript de la página ni las demás rutas la ven. Cuando el acceso vence, se
 * renueva con el refresh (que la API rota en cada uso) y la cookie se reescribe en la misma respuesta.
 */
export const API_COOKIE = "fundigsac-api";
const COOKIE_PATH = "/api";
/** Margen para no usar un token que vence mientras viaja. */
const SKEW_SECONDS = 30;

export type ApiTokens = { accessToken: string; expiresIn: number; refreshToken: string; refreshExpiresIn: number };
type Stored = { a: string; r: string; x: number; p: boolean };
export type CookieChange = { set?: { value: string; maxAge: number | undefined }; clear?: true };

function options(request: NextRequest, maxAge: number | undefined) {
  return { httpOnly: true, sameSite: "lax" as const, secure: publicOrigin(request).startsWith("https:"), path: COOKIE_PATH, ...(maxAge ? { maxAge } : {}) };
}

/** Cookie nueva con los tokens. Sin «recordarme» es de sesión del navegador (se borra al cerrarlo). */
export async function apiCookie(tokens: ApiTokens, remember: boolean): Promise<CookieChange | null> {
  const secret = authSecret();
  if (!secret) return null;
  const stored: Stored = { a: tokens.accessToken, r: tokens.refreshToken, x: Math.floor(Date.now() / 1000) + tokens.expiresIn, p: remember };
  return { set: { value: await sign(secret, stored, tokens.refreshExpiresIn), maxAge: remember ? tokens.refreshExpiresIn : undefined } };
}

/** Aplica a la respuesta los cambios de cookie (nueva, renovada o borrada). */
export function withApiCookies(response: NextResponse, change: CookieChange | null | undefined, request: NextRequest): NextResponse {
  if (change?.clear) response.cookies.delete({ name: API_COOKIE, path: COOKIE_PATH });
  else if (change?.set) response.cookies.set(API_COOKIE, change.set.value, options(request, change.set.maxAge));
  return response;
}

/**
 * La API rota el refresh en cada uso y, si ve el mismo dos veces, cierra todas las sesiones (posible robo). Dos
 * peticiones simultáneas de la misma persona comparten aquí una sola renovación durante unos segundos.
 */
const inflight = new Map<string, { at: number; promise: ReturnType<typeof callBackend<ApiTokens>> }>();

function refreshOnce(refreshToken: string, request: NextRequest) {
  const now = Date.now();
  for (const [key, entry] of inflight) if (now - entry.at > 15_000) inflight.delete(key);
  const existing = inflight.get(refreshToken);
  if (existing) return existing.promise;
  const promise = callBackend<ApiTokens>("/api/v1/auth/refresh", { body: { refreshToken }, request });
  inflight.set(refreshToken, { at: now, promise });
  return promise;
}

async function read(request: NextRequest): Promise<Stored | null> {
  const secret = authSecret();
  if (!secret) return null;
  const data = await verify<Stored>(secret, request.cookies.get(API_COOKIE)?.value);
  return data && typeof data.a === "string" && typeof data.r === "string" && typeof data.x === "number" ? { ...data, p: data.p === true } : null;
}

/**
 * Token de acceso vigente de la persona, renovándolo si hace falta. `cookies` indica si hay que reescribir o borrar la
 * cookie en la respuesta. null: no hay sesión con la API.
 */
export async function apiAccessToken(request: NextRequest): Promise<{ token: string | null; cookies: CookieChange | null } | null> {
  const stored = await read(request);
  if (!stored) return null;
  if (stored.x - SKEW_SECONDS > Date.now() / 1000) return { token: stored.a, cookies: null };
  const refreshed = await refreshOnce(stored.r, request);
  if (!refreshed.ok) {
    // Sesión vencida o revocada (cambio de contraseña, cuenta desactivada): se borra. Si la API no responde, se conserva.
    return { token: null, cookies: refreshed.reason === "http" ? { clear: true } : null };
  }
  // Se conserva el tipo de cookie (persistente o de sesión) que eligió la persona al ingresar.
  return { token: refreshed.data.accessToken, cookies: await apiCookie(refreshed.data, stored.p) };
}

/** Refresh token guardado (para cerrar la sesión en la API). */
export async function storedRefreshToken(request: NextRequest): Promise<string | null> {
  return (await read(request))?.r ?? null;
}
