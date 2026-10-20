"use client";

/**
 * Envío de formularios públicos al Backend a través del BFF (/api/forms/...). El resultado dice qué hacer en pantalla:
 * - `saved`: registrado, con folio real;
 * - `offline`: no hay Backend conectado o no responde; el formulario sigue con su envío por correo o WhatsApp;
 * - `invalid`: la API rechazó datos concretos (se muestran junto al campo o en un aviso);
 * - `limited`: demasiados envíos seguidos desde la misma conexión.
 */
export type FieldError = { field?: string; code?: string; message?: string };

export type SubmitOutcome<T> =
  | { kind: "saved"; data: T }
  | { kind: "offline" }
  | { kind: "invalid"; errors: FieldError[]; code: string }
  | { kind: "limited"; retryAfter: number };

export type BackendForm = "quote" | "inquiry" | "complaint" | "privacy-request" | "consent";

/** Clave por intento: si la red falla y se reintenta, la API devuelve el mismo folio en lugar de duplicar. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function submitForm<T>(form: BackendForm, body: unknown, idempotencyKey?: string): Promise<SubmitOutcome<T>> {
  let response: Response;
  try {
    response = await fetch(`/api/forms/${form}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
      body: JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { kind: "offline" };
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string; errors?: FieldError[] } & T;
  if (response.ok) return { kind: "saved", data };
  if (response.status === 429) return { kind: "limited", retryAfter: Number(response.headers.get("Retry-After")) || 60 };
  if (response.status === 400 || response.status === 409 || response.status === 422) {
    return { kind: "invalid", errors: data.errors ?? [], code: data.error ?? "ERROR" };
  }
  return { kind: "offline" };
}
