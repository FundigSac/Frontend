import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  OPTIONAL_CATEGORIES,
  POLICY_VERSION,
  buildConsentCookie,
  clearConsentCookie,
  createRecord,
  expiresAt,
  isCategoryAllowed,
  parseConsent,
  readConsentFromCookieString,
  serializeConsent,
  statusOf,
} from "@/modules/consent/consent";

const NOW = new Date("2026-03-04T15:00:00.000Z");
const enc = (value: unknown) => encodeURIComponent(JSON.stringify(value));

describe("modelo de consentimiento de cookies", () => {
  it("las necesarias siempre están activas y el registro guarda origen, versión de la política y fecha", () => {
    const record = createRecord({ thirdParty: true }, "preferences", NOW);
    expect(record).toEqual({ necessary: true, thirdParty: true, version: CONSENT_VERSION, policy: POLICY_VERSION, source: "preferences", savedAt: NOW.toISOString() });
    expect(parseConsent(serializeConsent(record))).toEqual(record);
  });

  it("el origen por omisión es el aviso", () => {
    expect(createRecord({ thirdParty: false }, undefined, NOW).source).toBe("banner");
  });

  it("statusOf distingue todo aceptado de solo lo necesario", () => {
    expect(statusOf({ thirdParty: true })).toBe("all");
    expect(statusOf({ thirdParty: false })).toBe("necessary-only");
    expect(OPTIONAL_CATEGORIES).toEqual(["thirdParty"]);
  });

  it("parseConsent descarta datos corruptos, de otra política o con tipos inválidos", () => {
    expect(parseConsent(undefined)).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent("%7Bno-json")).toBeNull();
    expect(parseConsent(enc({ version: 3, thirdParty: true, policy: POLICY_VERSION }))).toBeNull();
    expect(parseConsent(enc({ version: CONSENT_VERSION, thirdParty: "yes", policy: POLICY_VERSION }))).toBeNull();
    expect(parseConsent(enc({ version: CONSENT_VERSION, thirdParty: true, policy: "2020-01" }))).toBeNull();
    expect(parseConsent(encodeURIComponent("[1,2]"))).toBeNull();
  });

  it("si cambia la política vigente, la decisión anterior deja de valer y se vuelve a preguntar", () => {
    const old = enc({ version: CONSENT_VERSION, necessary: true, thirdParty: true, policy: "2025-01", source: "banner", savedAt: NOW.toISOString() });
    expect(parseConsent(old)).toBeNull();
  });

  it("una cookie de la versión 1 se conserva como decisión pero sin consentir contenido de terceros", () => {
    const legacy = enc({ version: 1, necessary: true, performance: true, customization: true, savedAt: NOW.toISOString() });
    const record = parseConsent(legacy);
    expect(record).not.toBeNull();
    expect(record?.thirdParty).toBe(false);
    expect(record?.savedAt).toBe(NOW.toISOString());
    expect(record?.version).toBe(CONSENT_VERSION);
  });

  it("no puede forzar 'necessary: false' ni un origen inventado desde la cookie", () => {
    const raw = enc({ version: CONSENT_VERSION, necessary: false, thirdParty: true, policy: POLICY_VERSION, source: "hack", savedAt: NOW.toISOString() });
    const record = parseConsent(raw);
    expect(record?.necessary).toBe(true);
    expect(record?.source).toBe("banner");
  });

  it("una fecha inválida se reemplaza por la época (la decisión queda vencida, no rota)", () => {
    const record = parseConsent(enc({ version: CONSENT_VERSION, thirdParty: false, policy: POLICY_VERSION, source: "banner", savedAt: "ayer" }));
    expect(record?.savedAt).toBe(new Date(0).toISOString());
  });

  it("la cookie es de primera parte, SameSite=Lax, 180 días y Secure sólo en https", () => {
    const record = createRecord({ thirdParty: true }, "banner", NOW);
    const http = buildConsentCookie(record, { secure: false });
    const https = buildConsentCookie(record, { secure: true });
    expect(http.startsWith(`${CONSENT_COOKIE}=`)).toBe(true);
    expect(http).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`);
    expect(CONSENT_MAX_AGE_SECONDS).toBe(180 * 86400);
    expect(http).toContain("SameSite=Lax");
    expect(http).toContain("Path=/");
    expect(http).not.toContain("Secure");
    expect(https.endsWith("; Secure")).toBe(true);
    expect(http).not.toMatch(/Domain=/i);
    expect(clearConsentCookie({ secure: true })).toContain("Max-Age=0");
  });

  it("la cookie no contiene identificadores de seguimiento: solo elecciones, origen, versión y fecha", () => {
    const record = createRecord({ thirdParty: true }, "banner", NOW);
    expect(Object.keys(record).sort()).toEqual(["necessary", "policy", "savedAt", "source", "thirdParty", "version"]);
  });

  it("calcula hasta cuándo vale la decisión (180 días)", () => {
    const record = createRecord({ thirdParty: true }, "banner", NOW);
    expect(expiresAt(record).toISOString()).toBe(new Date(NOW.getTime() + 180 * 86400 * 1000).toISOString());
  });

  it("lee el registro desde una cadena de cookies con otras cookies presentes", () => {
    const record = createRecord({ thirdParty: true }, "policy", NOW);
    const value = serializeConsent(record);
    expect(readConsentFromCookieString(`a=1; ${CONSENT_COOKIE}=${value}; b=2`)).toEqual(record);
    expect(readConsentFromCookieString("a=1; b=2")).toBeNull();
    expect(readConsentFromCookieString("")).toBeNull();
  });

  it("sin decisión ninguna categoría opcional está permitida", () => {
    expect(isCategoryAllowed(null, "thirdParty")).toBe(false);
    expect(isCategoryAllowed(createRecord({ thirdParty: true }, "banner", NOW), "thirdParty")).toBe(true);
    expect(isCategoryAllowed(createRecord({ thirdParty: false }, "banner", NOW), "thirdParty")).toBe(false);
  });
});
