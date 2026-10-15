/**
 * Modelo de consentimiento de cookies (puro, sin acceso al DOM: usable en servidor y cliente).
 *
 * Qué requiere permiso hoy: el contenido de terceros (el mapa de Google Maps, que puede instalar cookies propias
 * y recibir la IP). Lo demás que el sitio guarda (elección de cookies, idioma, tema, cotización y conversación del
 * asistente) es necesario o lo pidió la persona, y se informa en la política de cookies.
 * Criterio: Ley N.º 29733 y D. S. N.º 016-2024-JUS (consentimiento libre, previo, expreso, inequívoco e informado,
 * demostrable) y buenas prácticas de RGPD/ePrivacy (granular, sin casillas premarcadas, rechazar tan fácil como aceptar,
 * revocable en cualquier momento, decisión registrada con fecha y versión de la política).
 * La cookie `fundigsac-consent` no contiene identificadores de seguimiento: sólo elecciones, fecha, origen y versión.
 * Para agregar una herramienta opcional (p. ej. analítica) basta sumar su categoría en OPTIONAL_CATEGORIES, subir
 * POLICY_VERSION (para volver a preguntar) y condicionarla con `hasConsent()`.
 */
export const CONSENT_COOKIE = "fundigsac-consent";
export const CONSENT_VERSION = 2;
/** Versión de la política de cookies; si cambia, la decisión guardada deja de valer y se vuelve a preguntar. */
export const POLICY_VERSION = "2026-10";
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_MAX_AGE_SECONDS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;

export const OPTIONAL_CATEGORIES = ["thirdParty"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];
export type ConsentChoices = Record<OptionalCategory, boolean>;
/** Desde dónde se tomó la decisión (evidencia de cómo se obtuvo). */
export type ConsentSource = "banner" | "preferences" | "policy" | "embed";
export const CONSENT_SOURCES: readonly ConsentSource[] = ["banner", "preferences", "policy", "embed"];

export type ConsentRecord = ConsentChoices & {
  /** Siempre activas (almacenamiento técnico necesario). */
  necessary: true;
  version: typeof CONSENT_VERSION;
  policy: string;
  source: ConsentSource;
  /** Fecha ISO en que la persona guardó su elección. */
  savedAt: string;
};

export type ConsentStatus = "necessary-only" | "all";

export function createRecord(choices: ConsentChoices, source: ConsentSource = "banner", now: Date = new Date()): ConsentRecord {
  return { necessary: true, thirdParty: choices.thirdParty, version: CONSENT_VERSION, policy: POLICY_VERSION, source, savedAt: now.toISOString() };
}

export function statusOf(choices: ConsentChoices): ConsentStatus {
  return OPTIONAL_CATEGORIES.every((c) => choices[c]) ? "all" : "necessary-only";
}

export function serializeConsent(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record));
}

const validDate = (value: unknown) => (typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : new Date(0).toISOString());

/**
 * Interpreta el valor de la cookie. Cualquier dato inválido o de una política distinta se descarta (→ sin decisión).
 * La versión 1 (rendimiento/personalización, que no activaban nada) se conserva como decisión tomada, pero sin
 * consentimiento de contenido de terceros: esa persona nunca lo aceptó.
 */
export function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    if (d.version === 1 && typeof d.performance === "boolean" && typeof d.customization === "boolean") {
      return { necessary: true, thirdParty: false, version: CONSENT_VERSION, policy: POLICY_VERSION, source: "banner", savedAt: validDate(d.savedAt) };
    }
    if (d.version !== CONSENT_VERSION || d.policy !== POLICY_VERSION || typeof d.thirdParty !== "boolean") return null;
    const source = CONSENT_SOURCES.includes(d.source as ConsentSource) ? (d.source as ConsentSource) : "banner";
    return { necessary: true, thirdParty: d.thirdParty, version: CONSENT_VERSION, policy: POLICY_VERSION, source, savedAt: validDate(d.savedAt) };
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

/** Fecha hasta la que vale la decisión (después se vuelve a preguntar). */
export function expiresAt(record: ConsentRecord): Date {
  return new Date(Date.parse(record.savedAt) + CONSENT_MAX_AGE_SECONDS * 1000);
}
