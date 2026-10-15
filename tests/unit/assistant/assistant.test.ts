import { describe, expect, it, vi } from "vitest";

// "server-only" lanza fuera del entorno de React Server; en pruebas se neutraliza.
vi.mock("server-only", () => ({}));

import { site } from "@/lib/site-info";
import { KNOWLEDGE } from "@/modules/assistant/knowledge";
import { SYSTEM_PROMPT, visitContext } from "@/modules/assistant/prompt";
import { LIMITS, createRateLimiter, parseChatRequest, sanitizePage } from "@/modules/assistant/limits";

describe("base de conocimiento del asistente", () => {
  it("incluye las tres fichas oficiales con sus datos y documentos", () => {
    expect(KNOWLEDGE).toContain("Válvula de compuerta bridada H-ITALY");
    expect(KNOWLEDGE).toContain("FT-HI-100");
    expect(KNOWLEDGE).toContain("DIN 3352 F4");
    expect(KNOWLEDGE).toContain("FT-HD N° 002-2024");
    expect(KNOWLEDGE).toContain("/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf");
    // Brida DN100 PN16 de la ficha FUNDIGSAC de 1 año: D 220, D1 180, D2 156, 8 × 19, M16.
    expect(KNOWLEDGE).toMatch(/\| DN100 \| PN16 \| 220 \| 180 \| 156 \| 19 – 3 \| 8 × 19 \| M16 \|/);
  });

  it("incluye empresa y contacto reales", () => {
    expect(KNOWLEDGE).toContain("RUC 20601839281");
    expect(KNOWLEDGE).toContain("+51 908 849 664");
    expect(KNOWLEDGE).toContain(site.address);
    expect(KNOWLEDGE).toContain("/cotizar");
  });

  it("no expone precios de las listas internas", () => {
    expect(KNOWLEDGE).not.toMatch(/S\/\s?\d|PEN\s?\d|precio:\s?\d/i);
    expect(KNOWLEDGE).not.toMatch(/"price"|price:/);
    expect(SYSTEM_PROMPT).toContain("Nunca des precios");
  });

  it("es un prefijo estable (sin fechas ni datos por visita)", () => {
    expect(SYSTEM_PROMPT).toBe(SYSTEM_PROMPT);
    expect(SYSTEM_PROMPT).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
    // Tamaño razonable para la caché y el costo (caracteres ≈ 4 × tokens).
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(8000);
    expect(SYSTEM_PROMPT.length).toBeLessThan(160000);
  });

  it("describe la visita con página e idioma", () => {
    expect(visitContext("es", "/productos")).toContain("/productos");
    expect(visitContext("en", "/")).toContain("inglés");
  });
});

describe("validación de peticiones del chat", () => {
  it("acepta una conversación válida y usa español por defecto", () => {
    const r = parseChatRequest({ messages: [{ role: "user", content: " Hola " }] });
    expect(r).toEqual({ ok: true, value: { messages: [{ role: "user", content: "Hola" }], lang: "es", page: "/" } });
  });

  it("rechaza cuerpos inválidos, último mensaje del asistente y textos largos", () => {
    expect(parseChatRequest({}).ok).toBe(false);
    expect(parseChatRequest({ messages: [{ role: "system", content: "x" }] }).ok).toBe(false);
    expect(parseChatRequest({ messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }] })).toEqual({ ok: false, error: "last_must_be_user" });
    expect(parseChatRequest({ messages: [{ role: "user", content: "x".repeat(LIMITS.userChars + 1) }] })).toEqual({ ok: false, error: "message_too_long" });
  });

  it("recorta el historial a los últimos mensajes empezando por el usuario", () => {
    const messages = Array.from({ length: 21 }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", content: `m${i}` }));
    const r = parseChatRequest({ messages });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.messages.length).toBeLessThanOrEqual(LIMITS.keepMessages);
    expect(r.value.messages[0].role).toBe("user");
    expect(r.value.messages.at(-1)?.content).toBe("m20");
  });

  it("limpia la página de contexto", () => {
    expect(sanitizePage("/productos/valvulas?familia=compuerta#x")).toBe("/productos/valvulas?familia=compuerta");
    expect(sanitizePage("https://otro.sitio")).toBe("/");
    expect(sanitizePage("/a<script>b")).toBe("/ascriptb");
  });
});

describe("limitador de frecuencia", () => {
  it("frena ráfagas y se recupera con el tiempo", () => {
    let t = 0;
    const check = createRateLimiter(() => t);
    for (let i = 0; i < LIMITS.perMinute; i++) expect(check("ip").ok).toBe(true);
    const blocked = check("ip");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(check("otra-ip").ok).toBe(true);
    t += 61_000;
    expect(check("ip").ok).toBe(true);
  });
});
