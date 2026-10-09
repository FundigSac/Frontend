// @vitest-environment node
import { describe, expect, it } from "vitest";
import { apiErrorMessage, classifyApiError, GENERIC_ERROR, mapOAuthError, normalizeErrorCode, RATE_LIMIT_ERROR } from "@/modules/auth/errors";

describe("mapeo de errores OAuth", () => {
  it("mapea códigos conocidos a mensajes en español", () => {
    expect(mapOAuthError("access_denied").title).toBe("Acceso cancelado");
    expect(mapOAuthError("account_not_linked").action.href).toBe("/login");
    expect(mapOAuthError("email_not_found").action.href).toBe("/registro");
    expect(mapOAuthError("banned_user").action.href).toBe("/cuenta-restringida");
  });

  it("normaliza mayúsculas, arrays y caracteres raros", () => {
    expect(normalizeErrorCode("ACCESS_DENIED")).toBe("access_denied");
    expect(normalizeErrorCode(["state_mismatch", "x"])).toBe("state_mismatch");
    expect(normalizeErrorCode("<script>alert(1)</script>")).toBe("_script_alert_1___script_");
    expect(mapOAuthError("BANNED_USER").title).toBe("Cuenta restringida");
  });

  it("códigos desconocidos o maliciosos devuelven el mensaje genérico seguro (sin reflejar la entrada)", () => {
    for (const raw of ["", undefined, null, 123, "<img src=x onerror=alert(1)>", "otro_error", "a".repeat(500)]) {
      const view = mapOAuthError(raw);
      expect(view.title).toBe("No pudimos completar el acceso");
      expect(JSON.stringify(view)).not.toContain("onerror");
      expect(view.action.href.startsWith("/")).toBe(true);
    }
  });

  it("todas las acciones son rutas internas", () => {
    for (const code of ["access_denied", "account_not_linked", "email_not_found", "signup_disabled", "banned_user", "state_mismatch", "invalid_code", "unable_to_get_user_info", "provider_not_found"]) {
      const href = mapOAuthError(code).action.href;
      expect(href.startsWith("/") && !href.startsWith("//")).toBe(true);
    }
  });
});

describe("errores de la API en formularios", () => {
  it("clasifica por código y estado", () => {
    expect(classifyApiError({ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 })).toBe("invalid_credentials");
    expect(classifyApiError({ code: "EMAIL_NOT_VERIFIED", status: 403 })).toBe("email_not_verified");
    expect(classifyApiError({ code: "BANNED_USER", status: 403 })).toBe("banned");
    expect(classifyApiError({ status: 429 })).toBe("rate_limited");
    expect(classifyApiError({ code: "INVALID_TOKEN" })).toBe("invalid_token");
    expect(classifyApiError(null)).toBe("other");
  });

  it("nunca muestra el texto del servidor", () => {
    expect(apiErrorMessage({ code: "ALGO_RARO", message: "SQLSTATE 23505 duplicate key" })).toBe(GENERIC_ERROR);
    expect(apiErrorMessage({ status: 429 })).toBe(RATE_LIMIT_ERROR);
    expect(apiErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe("Correo o contraseña incorrectos.");
  });
});
