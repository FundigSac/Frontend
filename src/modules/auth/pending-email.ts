"use client";

/**
 * Correo pendiente de verificación: sólo comodidad para "reenviar" (sessionStorage de la pestaña).
 * No es una sesión ni una credencial.
 */
const KEY = "fundigsac:pending-verification-email";

export function rememberPendingEmail(email: string) {
  try {
    window.sessionStorage.setItem(KEY, email);
  } catch {
    /* almacenamiento no disponible: se pedirá el correo de nuevo */
  }
}

export function readPendingEmail(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "tu correo";
  const visible = local.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(2, Math.min(local.length - 1, 6)))}@${domain}`;
}
