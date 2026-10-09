// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isSafeRedirectPath, loginUrl, safeRedirectPath } from "@/server/auth/redirects";

describe("safeRedirectPath (open redirect)", () => {
  it.each(["/cuenta", "/cuenta/perfil", "/productos?categoria=valvulas", "/cotizar#form", "/"])("acepta %s", (p) => {
    expect(isSafeRedirectPath(p)).toBe(true);
    expect(safeRedirectPath(p)).toBe(p);
  });

  it.each([
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "https://evil.com",
    "http://evil.com/x",
    "javascript:alert(1)",
    "data:text/html,<script>",
    "evil.com",
    "cuenta",
    "",
    "/%2F%2Fevil.com",
    "/%5Cevil.com",
    "/a\\b",
    "/path\r\nSet-Cookie: x=1",
    "/path\u0000",
    "/%0d%0aLocation:https://evil.com",
    "/%E0%A4%A",
  ])("rechaza %j", (p) => {
    expect(isSafeRedirectPath(p)).toBe(false);
    expect(safeRedirectPath(p)).toBe("/cuenta");
  });

  it("rechaza no-strings y valores demasiado largos", () => {
    expect(safeRedirectPath(undefined)).toBe("/cuenta");
    expect(safeRedirectPath(null)).toBe("/cuenta");
    expect(safeRedirectPath(42)).toBe("/cuenta");
    expect(safeRedirectPath("/" + "a".repeat(600))).toBe("/cuenta");
  });

  it("usa el primer valor de un array (searchParams repetidos) y respeta el fallback", () => {
    expect(safeRedirectPath(["/cuenta/perfil", "//evil.com"])).toBe("/cuenta/perfil");
    expect(safeRedirectPath(["//evil.com"], "/")).toBe("/");
  });

  it("loginUrl codifica la ruta y omite rutas inseguras", () => {
    expect(loginUrl("/cuenta/perfil")).toBe("/login?next=%2Fcuenta%2Fperfil");
    expect(loginUrl("//evil.com")).toBe("/login");
    expect(loginUrl(undefined)).toBe("/login");
  });
});
