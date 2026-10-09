// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: "x=1" }) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));

const getSessionApi = vi.fn();
vi.mock("@/server/auth/auth", () => ({ getAuth: async () => ({ api: { getSession: getSessionApi } }) }));
// React cache() fuera de un render ejecuta la función cada vez, lo que es adecuado para las pruebas.

function sessionFor(user: Record<string, unknown>) {
  return {
    user: { id: "u1", name: "Ana", email: "ana@example.test", emailVerified: true, role: "customer", banned: false, banExpires: null, ...user },
    session: { id: "s1", token: "t", expiresAt: new Date(Date.now() + 1e6) },
  };
}

async function load() {
  return import("@/server/auth/session");
}

describe("guards de servidor (requireSession / requireRole / requireVerifiedEmail / getOptionalSession)", () => {
  beforeEach(() => {
    getSessionApi.mockReset();
  });

  it("requireSession redirige a login con next seguro cuando no hay sesión", async () => {
    getSessionApi.mockResolvedValue(null);
    const { requireSession } = await load();
    await expect(requireSession("/cuenta/seguridad")).rejects.toThrow("NEXT_REDIRECT:/login?next=%2Fcuenta%2Fseguridad");
    await expect(requireSession("//evil.com")).rejects.toThrow("NEXT_REDIRECT:/login?next=%2Fcuenta");
  });

  it("requireSession devuelve la sesión normalizada", async () => {
    getSessionApi.mockResolvedValue(sessionFor({}));
    const { requireSession } = await load();
    const s = await requireSession();
    expect(s.user.id).toBe("u1");
    expect(s.user.role).toBe("customer");
  });

  it("un rol desconocido en la base se degrada a customer", async () => {
    getSessionApi.mockResolvedValue(sessionFor({ role: "root" }));
    const { requireSession } = await load();
    expect((await requireSession()).user.role).toBe("customer");
  });

  it("requireSession envía a usuarios bloqueados a /cuenta-restringida", async () => {
    getSessionApi.mockResolvedValue(sessionFor({ banned: true }));
    const { requireSession } = await load();
    await expect(requireSession()).rejects.toThrow("NEXT_REDIRECT:/cuenta-restringida");
  });

  it("requireRole: customer → /acceso-denegado; advisor → permitido", async () => {
    const { requireRole } = await load();
    getSessionApi.mockResolvedValue(sessionFor({ role: "customer" }));
    await expect(requireRole(["advisor", "admin"])).rejects.toThrow("NEXT_REDIRECT:/acceso-denegado");
    getSessionApi.mockResolvedValue(sessionFor({ role: "advisor" }));
    await expect(requireRole(["advisor", "admin"])).resolves.toMatchObject({ user: { role: "advisor" } });
  });

  it("requireVerifiedEmail redirige si el correo no está verificado", async () => {
    getSessionApi.mockResolvedValue(sessionFor({ emailVerified: false }));
    const { requireVerifiedEmail } = await load();
    await expect(requireVerifiedEmail("/cuenta")).rejects.toThrow("NEXT_REDIRECT:/verificar-correo?next=%2Fcuenta");
  });

  it("getOptionalSession devuelve sólo { id, role, name, email } y nunca lanza", async () => {
    const { getOptionalSession } = await load();
    getSessionApi.mockResolvedValue(sessionFor({ role: "support" }));
    expect(await getOptionalSession()).toEqual({ user: { id: "u1", role: "support", name: "Ana", email: "ana@example.test" } });
    getSessionApi.mockResolvedValue(null);
    expect(await getOptionalSession()).toBeNull();
    getSessionApi.mockResolvedValue(sessionFor({ banned: true }));
    expect(await getOptionalSession()).toBeNull();
    getSessionApi.mockRejectedValue(new Error("db caída"));
    expect(await getOptionalSession()).toBeNull();
  });
});
