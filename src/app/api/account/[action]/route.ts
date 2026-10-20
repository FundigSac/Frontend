import { NextResponse, type NextRequest } from "next/server";
import { PRIVACY_NOTICE_VERSION, fetchMe, openSession } from "@/modules/backend/account";
import { callBackend, relay } from "@/modules/backend/server";
import type { ApiTokens } from "@/modules/backend/session";
import { noStore } from "@/modules/auth/server";
import { isSameOriginRequest, readJsonBody } from "@/shared/security/request-guard";

export const runtime = "nodejs";

/**
 * Cuentas de clientes contra el Backend (BFF): ingresar, registrarse, confirmar el correo y recuperar la contraseña.
 * Solo se reenvían los campos esperados de cada acción; la API valida de nuevo y responde siempre igual cuando un
 * dato no debe revelar si una cuenta existe.
 */
type Body = Record<string, unknown>;
const text = (body: Body, key: string, max = 254) => (typeof body[key] === "string" ? (body[key] as string).slice(0, max) : undefined);
const flag = (body: Body, key: string) => body[key] === true;

async function signIn(request: NextRequest, body: Body): Promise<NextResponse> {
  const login = await callBackend<ApiTokens>("/api/v1/auth/login", { body: { email: text(body, "email"), password: text(body, "password", 128) }, request });
  if (!login.ok) return relay(login);
  const me = await fetchMe(request, login.data.accessToken);
  if (!me.ok) return relay(me);
  const response = NextResponse.json({ user: { name: me.data.fullName, email: me.data.email } }, { headers: noStore });
  return openSession(response, request, login.data, me.data, flag(body, "remember"));
}

const ACTIONS: Record<string, (request: NextRequest, body: Body) => Promise<NextResponse>> = {
  login: signIn,
  register: async (request, body) =>
    relay(
      await callBackend("/api/v1/auth/register", {
        request,
        body: {
          email: text(body, "email"),
          password: text(body, "password", 128),
          fullName: text(body, "fullName", 120),
          companyName: text(body, "companyName", 160) || undefined,
          phone: text(body, "phone", 24) || undefined,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          acceptPrivacyNotice: flag(body, "acceptPrivacyNotice"),
          newsletter: flag(body, "newsletter"),
          source: text(body, "source", 12) || undefined,
        },
      }),
    ),
  "verify-email": async (request, body) => relay(await callBackend("/api/v1/auth/verify-email", { request, body: { token: text(body, "token", 128) } }), { ok: true }),
  "resend-verification": async (request, body) => relay(await callBackend("/api/v1/auth/verify-email/resend", { request, body: { email: text(body, "email") } })),
  "forgot-password": async (request, body) => relay(await callBackend("/api/v1/auth/password/forgot", { request, body: { email: text(body, "email") } })),
  "reset-password": async (request, body) =>
    relay(await callBackend("/api/v1/auth/password/reset", { request, body: { token: text(body, "token", 128), password: text(body, "password", 128) } }), { ok: true }),
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const handler = Object.hasOwn(ACTIONS, action) ? ACTIONS[action] : undefined;
  if (!handler) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404, headers: noStore });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403, headers: noStore });
  const body = await readJsonBody(request, 8 * 1024);
  if (!body.ok || !body.value || typeof body.value !== "object") return NextResponse.json({ error: "INVALID_BODY" }, { status: 400, headers: noStore });
  return handler(request, body.value as Body);
}
