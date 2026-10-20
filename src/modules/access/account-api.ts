"use client";

import { useSyncExternalStore } from "react";
import type { AuthUser } from "@/modules/auth/use-auth";
import type { AccessCopy } from "./access-copy";

/** Respuesta de las rutas /api/account/* (BFF del Backend), ya clasificada para la pantalla. */
export type AccountResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; field?: string; retryAfter?: number; offline?: boolean };

type ErrorBody = { error?: string; errors?: { field?: string; code?: string }[] };

async function post<T>(action: string, body: Record<string, unknown>): Promise<AccountResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/account/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { ok: false, code: "offline", offline: true };
  }
  const data = (await res.json().catch(() => ({}))) as T & ErrorBody;
  if (res.ok) return { ok: true, data };
  if (res.status === 429) return { ok: false, code: "limited", retryAfter: Number(res.headers.get("Retry-After")) || 900 };
  if (res.status === 503) return { ok: false, code: "offline", offline: true };
  // El primer error de campo es más útil que el código general VALIDATION_ERROR.
  const first = data.errors?.[0];
  return { ok: false, code: first?.code ?? data.error ?? "unknown", field: first?.field };
}

export const accountApi = {
  login: (email: string, password: string, remember: boolean) => post<{ user: AuthUser }>("login", { email, password, remember }),
  register: (body: { email: string; password: string; fullName: string; companyName?: string; phone?: string; newsletter: boolean; acceptPrivacyNotice: boolean; source: string }) =>
    post<{ message: string }>("register", body),
  verifyEmail: (token: string) => post<{ ok: true }>("verify-email", { token }),
  resendVerification: (email: string) => post<{ message: string }>("resend-verification", { email }),
  forgotPassword: (email: string) => post<{ message: string }>("forgot-password", { email }),
  resetPassword: (token: string, password: string) => post<{ ok: true }>("reset-password", { token, password }),
};

/** Mensaje en el idioma de la pantalla para un error de la API (los códigos vienen del Backend). */
export function accountError(t: AccessCopy, result: Extract<AccountResult<unknown>, { ok: false }>): string {
  const e = t.api.errors;
  if (result.code === "limited") return e.limited(Math.max(1, Math.ceil((result.retryAfter ?? 60) / 60)));
  if (result.offline) return e.offline;
  const message = (e as Record<string, unknown>)[result.code];
  return typeof message === "string" ? message : e.unknown;
}

/** Token de los enlaces del correo: va en el fragmento (#token=…) para no viajar en cabeceras ni registros. */
export function tokenFromHash(): string | null {
  const match = /(?:^|[#&])token=([A-Za-z0-9_-]{20,128})/.exec(window.location.hash);
  return match ? match[1] : null;
}

const subscribeHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};

/** Token del enlace leído en el navegador: undefined en el servidor y durante la hidratación; luego string o null. */
export function useHashToken(): string | null | undefined {
  return useSyncExternalStore(subscribeHash, tokenFromHash, () => undefined);
}

/** Página del sitio desde la que llegó la persona a registrarse (la API solo admite estas). */
export function signupSource(next: string | null): "registro" | "carrito" | "cotizar" | "login" {
  if (next?.startsWith("/carrito")) return "carrito";
  if (next?.startsWith("/cotizar")) return "cotizar";
  return "registro";
}
