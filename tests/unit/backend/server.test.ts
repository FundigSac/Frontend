import { afterEach, describe, expect, it, vi } from "vitest";

// "server-only" lanza fuera del entorno de React Server; en pruebas se neutraliza.
vi.mock("server-only", () => ({}));

import { backendUrl, callBackend, clientIp, relay } from "@/modules/backend/server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("cliente del Backend (BFF)", () => {
  it("acepta solo URLs http(s) y quita la barra final", () => {
    vi.stubEnv("BACKEND_URL", "http://localhost:8080/");
    expect(backendUrl()).toBe("http://localhost:8080");
    vi.stubEnv("BACKEND_URL", "javascript:alert(1)");
    expect(backendUrl()).toBeNull();
    vi.stubEnv("BACKEND_URL", "");
    expect(backendUrl()).toBeNull();
  });

  it("sin BACKEND_URL no llama a nadie y responde not_configured", async () => {
    vi.stubEnv("BACKEND_URL", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await callBackend("/api/v1/quotes", { body: {} })).toMatchObject({ ok: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("solo reenvía la IP del visitante detrás de un proxy de confianza", () => {
    const request = new Request("http://localhost/api", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } });
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TRUST_PROXY", "");
    expect(clientIp(request)).toBeNull();
    vi.stubEnv("TRUST_PROXY", "1");
    expect(clientIp(request)).toBe("203.0.113.7");
    expect(clientIp(new Request("http://localhost/api", { headers: { "x-forwarded-for": "<script>" } }))).toBeNull();
  });

  it("al navegador no le llegan detalles internos y un 204 se convierte en 200 con cuerpo", async () => {
    vi.stubEnv("BACKEND_URL", "http://api.test");
    const problem = { code: "VALIDATION_ERROR", detail: "Revise", errors: [{ field: "email", code: "INVALID_EMAIL", message: "x", rejected: "secreto" }], requestId: "r1" };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(problem), { status: 400 })));
    const failed = relay(await callBackend("/api/v1/inquiries", { body: {} }));
    expect(failed.status).toBe(400);
    expect(await failed.json()).toEqual({ error: "VALIDATION_ERROR", message: "Revise", errors: [{ field: "email", code: "INVALID_EMAIL", message: "x" }] });

    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    const ok = relay(await callBackend("/api/v1/auth/verify-email", { body: {} }), { ok: true });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
  });

  it("un Backend caído responde 503 unreachable", async () => {
    vi.stubEnv("BACKEND_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const response = relay(await callBackend("/api/v1/quotes", { body: {} }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe("UNREACHABLE");
  });
});
