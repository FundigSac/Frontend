import { NextResponse, type NextRequest } from "next/server";
import { FLOW_COOKIE, FLOW_MAX_AGE, callbackUrl, cookieOptions, googleConfig, publicOrigin, randomToken, safeNext, sha256, sign, type FlowState } from "@/modules/auth/server";

/** Inicia el flujo OAuth 2.0 con Google (código + PKCE S256 + state + nonce) y redirige a accounts.google.com. */
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const here = request.nextUrl;
  const from = here.searchParams.get("from") === "registro" ? "registro" : "login";
  const next = safeNext(here.searchParams.get("next"));

  // Si se entró por otro host (p. ej. 127.0.0.1 o un alias de Vercel), se pasa al origen registrado en Google:
  // la cookie del flujo está ligada al host y el callback debe llegar al mismo.
  if (here.origin !== origin) {
    const target = new URL(`${origin}${here.pathname}`);
    here.searchParams.forEach((v, k) => target.searchParams.set(k, v));
    return NextResponse.redirect(target, 307);
  }

  const config = googleConfig();
  if (!config) return NextResponse.redirect(new URL(`/${from}?error=not_configured`, origin), 303);

  const flow: FlowState = { state: randomToken(24), verifier: randomToken(48), nonce: randomToken(24), next, from };
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: await sha256(flow.verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
    hl: here.searchParams.get("hl") === "en" ? "en" : "es",
  }).toString();

  const response = NextResponse.redirect(url, 303);
  response.cookies.set(FLOW_COOKIE, await sign(config.secret, flow, FLOW_MAX_AGE), cookieOptions(request, FLOW_MAX_AGE, "/api/auth"));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
