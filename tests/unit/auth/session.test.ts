import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// "server-only" lanza fuera del entorno de React Server; en pruebas se neutraliza.
vi.mock("server-only", () => ({}));

import { callbackUrl, googleConfig, publicOrigin, safeNext, sameOrigin, sha256, sign, verify } from "@/modules/auth/server";

const SECRET = "x".repeat(40);
const req = (url: string, headers: Record<string, string> = {}) => new NextRequest(url, { headers });

afterEach(() => vi.unstubAllEnvs());

describe("sesión firmada", () => {
  it("firma y verifica el contenido", async () => {
    const token = await sign(SECRET, { name: "Ana", email: "ana@empresa.pe" }, 60);
    expect(await verify<{ name: string; email: string }>(SECRET, token)).toMatchObject({ name: "Ana", email: "ana@empresa.pe" });
  });

  it("rechaza firma ajena, contenido alterado, formato inválido y vencidos", async () => {
    const token = await sign(SECRET, { name: "Ana", email: "ana@empresa.pe" }, 60);
    expect(await verify("y".repeat(40), token)).toBeNull();
    const [payload, mac] = token.split(".");
    const forged = btoa(JSON.stringify({ name: "Root", email: "root@empresa.pe", exp: 9999999999 })).replace(/=+$/, "");
    expect(await verify(SECRET, `${forged}.${mac}`)).toBeNull();
    expect(await verify(SECRET, `${payload}.${mac}.extra`)).toBeNull();
    expect(await verify(SECRET, "basura")).toBeNull();
    expect(await verify(SECRET, undefined)).toBeNull();
    const expired = await sign(SECRET, { a: 1 }, -10);
    expect(await verify(SECRET, expired)).toBeNull();
  });

  it("PKCE S256 coincide con el vector de la RFC 7636", async () => {
    expect(await sha256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});

describe("redirecciones seguras", () => {
  it("safeNext solo admite rutas internas", () => {
    expect(safeNext("/carrito?x=1")).toBe("/carrito?x=1");
    for (const bad of ["//evil.com", "https://evil.com", "/" + String.fromCharCode(92) + "evil.com", "javascript:alert(1)", "/api/auth/logout", "", null, undefined, "/a\nb"]) expect(safeNext(bad)).toBe("/");
  });

  it("publicOrigin: AUTH_URL manda; 127.0.0.1 se trata como localhost; respeta los encabezados del proxy", () => {
    expect(publicOrigin(req("http://127.0.0.1:3000/api/auth/google", { host: "127.0.0.1:3000" }))).toBe("http://localhost:3000");
    expect(publicOrigin(req("http://x/api/auth/google", { host: "internal", "x-forwarded-host": "fundigsac-web.vercel.app", "x-forwarded-proto": "https" }))).toBe("https://fundigsac-web.vercel.app");
    vi.stubEnv("AUTH_URL", "https://fundigsac-web.vercel.app/");
    expect(publicOrigin(req("http://localhost:3000/x"))).toBe("https://fundigsac-web.vercel.app");
    expect(callbackUrl("https://fundigsac-web.vercel.app")).toBe("https://fundigsac-web.vercel.app/api/auth/callback/google");
  });

  it("sameOrigin rechaza orígenes ajenos", () => {
    expect(sameOrigin(req("http://localhost:3000/api/auth/logout", { host: "localhost:3000", origin: "http://localhost:3000" }))).toBe(true);
    expect(sameOrigin(req("http://localhost:3000/api/auth/logout", { host: "localhost:3000", origin: "https://evil.com" }))).toBe(false);
    expect(sameOrigin(req("http://localhost:3000/api/auth/logout", { host: "localhost:3000" }))).toBe(true);
  });
});

describe("configuración", () => {
  it("googleConfig exige las tres variables y un AUTH_SECRET de 32+ caracteres", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    vi.stubEnv("AUTH_SECRET", "corto");
    expect(googleConfig()).toBeNull();
    vi.stubEnv("AUTH_SECRET", SECRET);
    expect(googleConfig()).toEqual({ clientId: "id", clientSecret: "secret", secret: SECRET });
  });
});
