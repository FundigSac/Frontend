import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  buildConsentCookie,
  clearConsentCookie,
  createRecord,
  isCategoryAllowed,
  parseConsent,
  readConsentFromCookieString,
  serializeConsent,
  statusOf,
} from "@/modules/consent/consent";

const NOW = new Date("2026-03-04T15:00:00.000Z");

describe("modelo de consentimiento de cookies", () => {
  it("las necesarias siempre están activas y el registro es serializable", () => {
    const record = createRecord({ performance: false, customization: true }, NOW);
    expect(record).toEqual({ necessary: true, performance: false, customization: true, version: 1, savedAt: NOW.toISOString() });
    expect(parseConsent(serializeConsent(record))).toEqual(record);
  });

  it("statusOf clasifica las elecciones", () => {
    expect(statusOf({ performance: true, customization: true })).toBe("all");
    expect(statusOf({ performance: false, customization: false })).toBe("necessary-only");
    expect(statusOf({ performance: true, customization: false })).toBe("custom");
  });

  it("parseConsent descarta datos corruptos, de otra versión o con tipos inválidos", () => {
    expect(parseConsent(undefined)).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent("%7Bno-json")).toBeNull();
    expect(parseConsent(encodeURIComponent(JSON.stringify({ version: 2, performance: true, customization: true })))).toBeNull();
    expect(parseConsent(encodeURIComponent(JSON.stringify({ version: 1, performance: "yes", customization: true })))).toBeNull();
    expect(parseConsent(encodeURIComponent("[1,2]"))).toBeNull();
  });

  it("no puede forzar 'necessary: false' desde la cookie", () => {
    const raw = encodeURIComponent(JSON.stringify({ version: 1, necessary: false, performance: true, customization: false, savedAt: NOW.toISOString() }));
    expect(parseConsent(raw)?.necessary).toBe(true);
  });

  it("la cookie es de primera parte, SameSite=Lax, 180 días y Secure sólo en https", () => {
    const record = createRecord({ performance: true, customization: false }, NOW);
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

  it("lee el registro desde una cadena de cookies con otras cookies presentes", () => {
    const record = createRecord({ performance: true, customization: true }, NOW);
    const value = serializeConsent(record);
    expect(readConsentFromCookieString(`a=1; ${CONSENT_COOKIE}=${value}; b=2`)).toEqual(record);
    expect(readConsentFromCookieString("a=1; b=2")).toBeNull();
    expect(readConsentFromCookieString("")).toBeNull();
  });

  it("sin decisión ninguna categoría opcional está permitida", () => {
    expect(isCategoryAllowed(null, "performance")).toBe(false);
    expect(isCategoryAllowed(createRecord({ performance: true, customization: false }, NOW), "performance")).toBe(true);
    expect(isCategoryAllowed(createRecord({ performance: true, customization: false }, NOW), "customization")).toBe(false);
  });
});
