import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, authSecret, cookieOptions, noStore, sign, type SessionUser } from "@/modules/auth/server";
import { callBackend } from "./server";
import { apiCookie, withApiCookies, type ApiTokens } from "./session";

/**
 * Versión del aviso de privacidad que el sitio muestra al registrarse o enviar un formulario (Ley 29733). La API guarda
 * en cada cuenta y solicitud qué versión se aceptó; cambia junto con el texto de /privacidad.
 */
export const PRIVACY_NOTICE_VERSION = "2026-10";

export type Me = { fullName: string; email: string };

/** Perfil de la cuenta recién autenticada (nombre y correo para la cabecera). */
export async function fetchMe(request: NextRequest, accessToken: string) {
  return callBackend<Me>("/api/v1/account/me", { token: accessToken, request });
}

/**
 * Abre en la misma respuesta la sesión del sitio (perfil, cookie en /) y la de la API (tokens, cookie en /api). Con
 * «recordarme» ambas duran lo que el refresh de la API; sin él, hasta cerrar el navegador.
 */
export async function openSession(response: NextResponse, request: NextRequest, tokens: ApiTokens, me: Me, remember: boolean, picture?: string): Promise<NextResponse> {
  const secret = authSecret();
  if (!secret) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503, headers: noStore });
  const user: SessionUser = { name: me.fullName.slice(0, 80), email: me.email, api: true, ...(picture ? { picture } : {}) };
  const maxAge = tokens.refreshExpiresIn;
  const options = cookieOptions(request, maxAge);
  response.cookies.set(SESSION_COOKIE, await sign(secret, user, maxAge), remember ? options : { ...options, maxAge: undefined });
  return withApiCookies(response, await apiCookie(tokens, remember), request);
}
