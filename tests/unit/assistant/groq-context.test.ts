import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { groqSystemPrompt } from "@/modules/assistant/groq-context";

const approxTokens = (s: string) => Math.ceil(s.length / 3.6);

describe("contexto compacto para Groq", () => {
  it("una consulta general cabe holgada en el tope gratuito de 8 000 tokens por minuto", () => {
    const prompt = groqSystemPrompt("Hola, ¿qué venden?");
    console.info("general", prompt.length, approxTokens(prompt));
    expect(approxTokens(prompt)).toBeLessThan(2800);
    expect(prompt).toContain("RUC");
    expect(prompt).not.toContain("Válvula de compuerta bridada H-ITALY (");
  });

  it("una consulta de válvula añade las tres fichas y una de medidas solo el DN pedido", () => {
    const prompt = groqSystemPrompt("¿Qué longitud y brida tiene la válvula compuerta DN150 PN16?");
    console.info("medidas", prompt.length, approxTokens(prompt));
    expect(prompt).toContain("FUNDIGSAC garantía extendida");
    expect(prompt).toMatch(/\| DN150 \| PN16 \|/);
    expect(prompt).not.toMatch(/\| DN300 \| PN16 \|/);
    expect(approxTokens(prompt)).toBeLessThan(4200);
  });

  it("no incluye precios", () => {
    expect(groqSystemPrompt("válvula compuerta DN100 medidas")).not.toMatch(/S\/\s?\d|PEN\s?\d|precio:\s?\d/i);
  });
});

describe("documentos pedidos", () => {
  it("entrega el PDF correcto según el producto", async () => {
    const { requestedDocs } = await import("@/modules/assistant/groq-context");
    expect(requestedDocs("dame la ficha técnica de la válvula FUNDIGSAC con garantía extendida")).toEqual([
      expect.objectContaining({ href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf" }),
    ]);
    expect(requestedDocs("ficha de la válvula H-ITALY")[0].href).toContain("compuerta-bridada.pdf");
    expect(requestedDocs("flyer con dado")).toEqual([expect.objectContaining({ href: "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf" })]);
    expect(requestedDocs("ficha técnica de la válvula compuerta")).toHaveLength(3);
    expect(requestedDocs("qué presión soporta")).toEqual([]);
    expect(requestedDocs("ficha de la tubería")).toEqual([]);
  });
});
