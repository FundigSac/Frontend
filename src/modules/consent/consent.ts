/**
 * Modelo de consentimiento de cookies (puro, sin acceso al DOM: usable en servidor y cliente).
 *
 * Hoy el sitio NO instala cookies opcionales (no hay analítica, píxeles ni personalización persistente),
 * por lo que no existe banner global. Este módulo guarda la preferencia del usuario en una cookie propia
 * (`fundigsac-consent`) para que, el día que se agregue una herramienta opcional, se condicione a `hasConsent()`.
 * La cookie no contiene identificadores de seguimiento: sólo las elecciones y la fecha en que se tomaron.
 */
export const CONSENT_COOKIE = "fundigsac-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_MAX_AGE_SECONDS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;

export type OptionalCategory = "performance" | "customization";
export type ConsentChoices = Record<OptionalCategory, boolean>;
export type ConsentRecord = ConsentChoices & {
  /** Siempre activas (cookies técnicas necesarias). */
  necessary: true;
  version: typeof CONSENT_VERSION;
  /** Fecha ISO en que la persona guardó su elección. */
  savedAt: string;
};

export type ConsentStatus = "necessary-only" | "all" | "custom";

export function createRecord(choices: ConsentChoices, now: Date = new Date()): ConsentRecord {
  return { necessary: true, performance: choices.performance, customization: choices.customization, version: CONSENT_VERSION, savedAt: now.toISOString() };
}

export function statusOf(choices: ConsentChoices): ConsentStatus {
  if (choices.performance && choices.customization) return "all";
  if (!choices.performance && !choices.customization) return "necessary-only";
  return "custom";
}

export function serializeConsent(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record));
}

/** Interpreta el valor de la cookie; cualquier dato inválido o de otra versión se descarta (→ sin decisión). */
export function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    if (d.version !== CONSENT_VERSION || typeof d.performance !== "boolean" || typeof d.customization !== "boolean") return null;
    const savedAt = typeof d.savedAt === "string" && !Number.isNaN(Date.parse(d.savedAt)) ? d.savedAt : new Date(0).toISOString();
    return { necessary: true, performance: d.performance, customization: d.customization, version: CONSENT_VERSION, savedAt };
  } catch {
    return null;
  }
}

/** Valor de `document.cookie` (o del encabezado `Cookie`) → registro, si existe. */
export function readConsentFromCookieString(cookies: string | null | undefined): ConsentRecord | null {
  if (!cookies) return null;
  for (const part of cookies.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === CONSENT_COOKIE) return parseConsent(part.slice(index + 1).trim());
  }
  return null;
}

/** Cadena `Set-Cookie`/`document.cookie`: first-party, SameSite=Lax, Secure sólo en https, 180 días. */
export function buildConsentCookie(record: ConsentRecord, options: { secure: boolean }): string {
  return `${CONSENT_COOKIE}=${serializeConsent(record)}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${options.secure ? "; Secure" : ""}`;
}

export const clearConsentCookie = (options: { secure: boolean }): string =>
  `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${options.secure ? "; Secure" : ""}`;

/** ¿Hay consentimiento para esa categoría? Sin decisión guardada ⇒ false (nada opcional se activa por omisión). */
export function isCategoryAllowed(record: ConsentRecord | null, category: OptionalCategory): boolean {
  return record ? record[category] : false;
}
