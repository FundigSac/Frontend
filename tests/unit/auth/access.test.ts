// @vitest-environment node
import { describe, expect, it } from "vitest";
import { evaluateAccess, isBanned, isUserRole, type SessionUser } from "@/server/auth/access";

const base: SessionUser = { id: "u1", name: "Ana", email: "ana@example.test", emailVerified: true, role: "customer", banned: false };

describe("evaluateAccess (guards)", () => {
  it("sin sesión → /login?next=<ruta segura>", () => {
    expect(evaluateAccess(null, { next: "/cuenta/perfil" })).toEqual({ ok: false, redirectTo: "/login?next=%2Fcuenta%2Fperfil" });
    expect(evaluateAccess(undefined)).toEqual({ ok: false, redirectTo: "/login?next=%2Fcuenta" });
  });

  it("sanitiza el next (open redirect)", () => {
    expect(evaluateAccess(null, { next: "//evil.com" })).toEqual({ ok: false, redirectTo: "/login?next=%2Fcuenta" });
    expect(evaluateAccess(null, { next: "https://evil.com" })).toEqual({ ok: false, redirectTo: "/login?next=%2Fcuenta" });
  });

  it("con sesión válida → ok", () => {
    expect(evaluateAccess(base, { next: "/cuenta" })).toEqual({ ok: true });
  });

  it("usuario bloqueado → /cuenta-restringida (prioridad sobre rol y verificación)", () => {
    expect(evaluateAccess({ ...base, banned: true }, { roles: ["admin"], requireVerifiedEmail: true })).toEqual({ ok: false, redirectTo: "/cuenta-restringida" });
  });

  it("bloqueo vencido ya no restringe; bloqueo vigente con vencimiento sí", () => {
    const now = new Date("2026-10-08T12:00:00Z");
    expect(isBanned({ banned: true, banExpires: new Date("2026-10-01T00:00:00Z") }, now)).toBe(false);
    expect(isBanned({ banned: true, banExpires: new Date("2026-10-09T00:00:00Z") }, now)).toBe(true);
    expect(isBanned({ banned: true, banExpires: null }, now)).toBe(true);
    expect(isBanned({ banned: false, banExpires: null }, now)).toBe(false);
  });

  it("correo sin verificar → /verificar-correo cuando se exige", () => {
    expect(evaluateAccess({ ...base, emailVerified: false }, { requireVerifiedEmail: true, next: "/cuenta/perfil" })).toEqual({
      ok: false,
      redirectTo: "/verificar-correo?next=%2Fcuenta%2Fperfil",
    });
    expect(evaluateAccess({ ...base, emailVerified: false }, {})).toEqual({ ok: true });
  });

  it("rol insuficiente → /acceso-denegado; rol permitido → ok (sin jerarquía implícita)", () => {
    expect(evaluateAccess(base, { roles: ["advisor", "support", "admin"] })).toEqual({ ok: false, redirectTo: "/acceso-denegado" });
    expect(evaluateAccess({ ...base, role: "advisor" }, { roles: ["advisor", "support", "admin"] })).toEqual({ ok: true });
    expect(evaluateAccess({ ...base, role: "support" }, { roles: ["admin"] })).toEqual({ ok: false, redirectTo: "/acceso-denegado" });
    expect(evaluateAccess({ ...base, role: "admin" }, { roles: ["admin"] })).toEqual({ ok: true });
  });

  it("isUserRole sólo acepta los cuatro roles", () => {
    for (const r of ["customer", "advisor", "support", "admin"]) expect(isUserRole(r)).toBe(true);
    for (const r of ["user", "superadmin", "", null, undefined, 1]) expect(isUserRole(r)).toBe(false);
  });
});
