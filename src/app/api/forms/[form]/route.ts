import type { NextRequest } from "next/server";
import { RECEIPT_COOKIE, RECEIPT_MAX_AGE, receiptCookieValue } from "@/modules/backend/receipt";
import { callBackend, relay } from "@/modules/backend/server";
import { apiAccessToken, withApiCookies } from "@/modules/backend/session";
import { cookieOptions } from "@/modules/auth/server";
import { isSameOriginRequest, readJsonBody } from "@/shared/security/request-guard";

export const runtime = "nodejs";

/**
 * Formularios públicos del sitio hacia el Backend (BFF). Lista cerrada: el navegador elige el formulario, nunca la
 * ruta de la API. El cuerpo se reenvía tal cual porque la API lo valida con sus DTO (campos desconocidos = 400).
 * Con sesión de cliente, la cotización y la consulta quedan vinculadas a su cuenta.
 */
const FORMS = {
  quote: { path: "/api/v1/quotes", idempotent: true, withSession: true },
  inquiry: { path: "/api/v1/inquiries", idempotent: false, withSession: true },
  complaint: { path: "/api/v1/complaints", idempotent: true, withSession: false },
  "privacy-request": { path: "/api/v1/privacy/requests", idempotent: false, withSession: false },
  consent: { path: "/api/v1/privacy/consents", idempotent: false, withSession: false },
} as const;

type FormName = keyof typeof FORMS;
const isForm = (value: string): value is FormName => Object.hasOwn(FORMS, value);
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,128}$/;
const noStore = { "Cache-Control": "no-store" };

type QuoteReceipt = { folio: string; receiptToken: string; receivedAt: string };

export async function POST(request: NextRequest, { params }: { params: Promise<{ form: string }> }) {
  const { form } = await params;
  if (!isForm(form)) return Response.json({ error: "NOT_FOUND" }, { status: 404, headers: noStore });
  if (!isSameOriginRequest(request)) return Response.json({ error: "FORBIDDEN" }, { status: 403, headers: noStore });
  const body = await readJsonBody(request, 48 * 1024);
  if (!body.ok) return Response.json({ error: body.error.toUpperCase() }, { status: body.status, headers: noStore });

  const spec = FORMS[form];
  const headers: Record<string, string> = {};
  const key = request.headers.get("idempotency-key");
  if (spec.idempotent && key && IDEMPOTENCY_KEY.test(key)) headers["Idempotency-Key"] = key;
  const session = spec.withSession ? await apiAccessToken(request) : null;

  const result = await callBackend<QuoteReceipt>(spec.path, { body: body.value, request, headers, token: session?.token });
  // Al navegador solo vuelve el folio: el token de la constancia queda en una cookie httpOnly que lee la confirmación.
  const response = withApiCookies(relay(result, result.ok && form === "quote" ? { folio: result.data.folio } : undefined), session?.cookies, request);
  if (result.ok && form === "quote") {
    const value = await receiptCookieValue(result.data);
    if (value) response.cookies.set(RECEIPT_COOKIE, value, { ...cookieOptions(request, RECEIPT_MAX_AGE, "/cotizar") });
  }
  return response;
}
