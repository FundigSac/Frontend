import { NextResponse, type NextRequest } from "next/server";
import {
  FLOW_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  b64url,
  callbackUrl,
  cookieOptions,
  googleConfig,
  publicOrigin,
  safeNext,
  sign,
  verify,
  type FlowState,
  type SessionUser,
} from "@/modules/auth/server";
import { PRIVACY_NOTICE_VERSION, fetchMe, openSession } from "@/modules/backend/account";
import { backendEnabled, callBackend } from "@/modules/backend/server";
import type { ApiTokens } from "@/modules/backend/session";

/** Callback de Google: valida state (CSRF), canjea el código con PKCE, valida el id_token y abre la sesión. */
export const runtime = "nodejs";

type IdClaims = { iss?: string; aud?: string; exp?: number; nonce?: string; email?: string; email_verified?: boolean | string; name?: string; given_name?: string; picture?: string };

const GOOGLE_PICTURE = /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//;

function claimsOf(idToken: string): IdClaims | null {
  try {
    return JSON.parse(new TextDecoder().decode(b64url.decode(idToken.split(".")[1] ?? ""))) as IdClaims;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const here = request.nextUrl;
  if (here.origin !== origin) {
    const target = new URL(`${origin}${here.pathname}`);
    here.searchParams.forEach((v, k) => target.searchParams.set(k, v));
    return NextResponse.redirect(target, 307);
  }

  const config = googleConfig();
  const flow = config ? await verify<FlowState>(config.secret, request.cookies.get(FLOW_COOKIE)?.value) : null;
  const page = flow?.from === "registro" ? "registro" : "login";

  const fail = (code: string) => {
    const response = NextResponse.redirect(new URL(`/${page}?error=${code}`, origin), 303);
    response.cookies.delete({ name: FLOW_COOKIE, path: "/api/auth" });
    response.headers.set("Cache-Control", "no-store");
    return response;
  };

  if (!config) return fail("not_configured");
  const params = here.searchParams;
  const googleError = params.get("error");
  if (googleError) return fail(googleError === "access_denied" ? "cancelled" : "google");
  if (!flow || !params.get("state") || params.get("state") !== flow.state) return fail("state");
  const code = params.get("code");
  if (!code) return fail("google");

  let idToken: string | undefined;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: callbackUrl(origin),
        grant_type: "authorization_code",
        code_verifier: flow.verifier,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return fail("exchange");
    idToken = ((await res.json()) as { id_token?: string }).id_token;
  } catch {
    return fail("network");
  }

  // El id_token llega directamente del endpoint de tokens de Google por TLS (OIDC Core §3.1.3.7): basta validar sus campos.
  const claims = idToken ? claimsOf(idToken) : null;
  if (!claims || !["https://accounts.google.com", "accounts.google.com"].includes(claims.iss ?? "") || claims.aud !== config.clientId) return fail("exchange");
  if (typeof claims.exp !== "number" || claims.exp < Date.now() / 1000 || claims.nonce !== flow.nonce) return fail("exchange");
  if (!claims.email || (claims.email_verified !== true && claims.email_verified !== "true")) return fail("unverified");

  const user: SessionUser = {
    name: (claims.name || claims.given_name || claims.email.split("@")[0]).slice(0, 80),
    email: claims.email.toLowerCase().slice(0, 120),
    ...(claims.picture && GOOGLE_PICTURE.test(claims.picture) ? { picture: claims.picture.slice(0, 300) } : {}),
  };
  const response = NextResponse.redirect(new URL(safeNext(flow.next), origin), 303);
  response.cookies.delete({ name: FLOW_COOKIE, path: "/api/auth" });
  response.headers.set("Cache-Control", "no-store");

  // Con Backend: la API valida el mismo id_token con las claves de Google y crea o vincula la cuenta de cliente. Si la
  // API no responde o no tiene Google habilitado, se mantiene la sesión solo con Google (como antes de conectarla).
  if (idToken && backendEnabled()) {
    const api = await callBackend<ApiTokens>("/api/v1/auth/google", {
      request,
      body: { idToken, privacyNoticeVersion: PRIVACY_NOTICE_VERSION, source: flow.from === "registro" ? "registro" : "login" },
    });
    const me = api.ok ? await fetchMe(request, api.data.accessToken) : null;
    if (api.ok && me?.ok) return openSession(response, request, api.data, me.data, true, user.picture);
  }
  response.cookies.set(SESSION_COOKIE, await sign(config.secret, user, SESSION_MAX_AGE), cookieOptions(request, SESSION_MAX_AGE));
  return response;
}
