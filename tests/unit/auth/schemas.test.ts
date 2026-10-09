// @vitest-environment node
import { describe, expect, it } from "vitest";
import { changePasswordSchema, emailSchema, fieldErrors, forgotSchema, isValidRuc, loginSchema, profileSchema, registerSchema, resetSchema } from "@/modules/auth/schemas";

const STRONG = "caballo-bateria-grapa-correcto";

describe("validadores de autenticación (zod)", () => {
  it("normaliza el correo (trim + minúsculas)", () => {
    expect(emailSchema.parse("  Ana@Empresa.COM.pe ")).toBe("ana@empresa.com.pe");
  });

  it("rechaza correos inválidos con mensaje en español", () => {
    const r = forgotSchema.safeParse({ email: "no-es-correo" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).email).toMatch(/correo válido/);
  });

  it("registro: acepta datos válidos", () => {
    expect(registerSchema.safeParse({ name: "Ana Pérez", email: "ana@example.test", password: STRONG }).success).toBe(true);
  });

  it.each([
    ["corta", "abc123"],
    ["11 caracteres", "a1b2c3d4e5f"],
    ["común", "contraseña123"],
    ["repetitiva", "aaaaaaaaaaaaaaaa"],
    ["sólo espacios", "            "],
  ])("registro: rechaza contraseña %s", (_label, password) => {
    const r = registerSchema.safeParse({ name: "Ana Pérez", email: "ana@example.test", password });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).password).toBeTruthy();
  });

  it("registro: rechaza contraseña que contiene el correo y nombres con caracteres peligrosos", () => {
    expect(registerSchema.safeParse({ name: "Ana", email: "anapaulina@example.test", password: "xx-anapaulina-yy-zz" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "<script>", email: "a@example.test", password: STRONG }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "A", email: "a@example.test", password: STRONG }).success).toBe(false);
  });

  it("registro: máximo 128 caracteres de contraseña", () => {
    expect(registerSchema.safeParse({ name: "Ana Pérez", email: "ana@example.test", password: "ab".repeat(65) }).success).toBe(false);
  });

  it("login: sólo exige que la contraseña no esté vacía (no filtra la política)", () => {
    expect(loginSchema.safeParse({ email: "ana@example.test", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "ana@example.test", password: "" }).success).toBe(false);
  });

  it("restablecer: confirmación debe coincidir", () => {
    expect(resetSchema.safeParse({ newPassword: STRONG, confirm: STRONG }).success).toBe(true);
    const r = resetSchema.safeParse({ newPassword: STRONG, confirm: "otra" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).confirm).toMatch(/no coinciden/);
  });

  it("cambiar contraseña: la nueva debe ser distinta de la actual", () => {
    const r = changePasswordSchema.safeParse({ currentPassword: STRONG, newPassword: STRONG, confirm: STRONG });
    expect(r.success).toBe(false);
  });

  describe("RUC peruano", () => {
    it("valida dígito verificador", () => {
      expect(isValidRuc("20131312955")).toBe(true); // RUC de la SUNAT (verificador módulo 11)
      expect(isValidRuc("20131312956")).toBe(false);
      expect(isValidRuc("2013131295")).toBe(false);
      expect(isValidRuc("30131312955")).toBe(false);
      expect(isValidRuc("abcdefghijk")).toBe(false);
    });
  });

  describe("perfil", () => {
    it("campos opcionales vacíos → null", () => {
      const r = profileSchema.parse({ name: "Ana Pérez", company: "", ruc: "", phone: "" });
      expect(r).toEqual({ name: "Ana Pérez", company: null, ruc: null, phone: null });
    });
    it("normaliza el RUC con espacios/guiones y valida teléfono", () => {
      const r = profileSchema.parse({ name: "Ana Pérez", company: " FUNDIGSAC ", ruc: "2013 1312-955", phone: "+51 987 654 321" });
      expect(r.ruc).toBe("20131312955");
      expect(r.company).toBe("FUNDIGSAC");
    });
    it("rechaza RUC y teléfono inválidos", () => {
      const r = profileSchema.safeParse({ name: "Ana Pérez", company: "", ruc: "12345", phone: "abc" });
      expect(r.success).toBe(false);
      if (!r.success) expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(["phone", "ruc"]);
    });
  });
});
