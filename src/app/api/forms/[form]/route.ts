import type { NextRequest } from "next/server";
import { callBackend, relay } from "@/modules/backend/server";
import { isSameOriginRequest, readJsonBody } from "@/shared/security/request-guard";

export const runtime = "nodejs";

/**
 * Formularios públicos del sitio hacia el Backend (BFF). Lista cerrada: el navegador elige el formulario, nunca la
 * ruta de la API. El cuerpo se reenvía tal cual porque la API lo valida con sus DTO (campos desconocidos = 400).
 */
const FORMS = {
  quote: { path: "/api/v1/quotes", idempotent: true },
  inquiry: { path: "/api/v1/inquiries", idempotent: false },
  complaint: { path: "/api/v1/complaints", idempotent: true },
  "privacy-request": { path: "/api/v1/privacy/requests", idempotent: false },
  consent: { path: "/api/v1/privacy/consents", idempotent: false },
} as const;

type FormName = keyof typeof FORMS;
const isForm = (value: string): value is FormName => Object.hasOwn(FORMS, value);
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,128}$/;
const noStore = { "Cache-Control": "no-store" };

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
  return relay(await callBackend(spec.path, { body: body.value, request, headers }));
}
