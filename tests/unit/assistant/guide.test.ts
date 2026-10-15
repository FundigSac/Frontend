import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { site } from "@/lib/site-info";
import { detectDn, detectPn, guideAnswer, normalize, withSuggestions } from "@/modules/assistant/guide";

/** Respuesta con espacios normales (la guía usa espacios no separables dentro de cada dato). */
const ask = (q: string, page = "/") => {
  const a = guideAnswer(q, "es", page);
  return { ...a, text: a.text.replace(/ /g, " ") };
};

describe("guía rápida de FundigIA", () => {
  it("normaliza y detecta diámetro y presión en varias formas", () => {
    expect(normalize("¿Válvula DN150?")).toBe("valvula dn150");
    expect(detectDn("medidas de brida dn150")).toBe(150);
    expect(detectDn('brida de 6"')).toBe(150);
    expect(detectDn("valvula de 4 pulgadas")).toBe(100);
    expect(detectDn("brida de 200 mm")).toBe(200);
    expect(detectPn("brida pn16")).toBe("PN16");
    expect(detectPn("trabaja a 10 bar")).toBe("PN10");
  });

  it("da medidas de brida exactas de la ficha FUNDIGSAC", () => {
    const a = ask("Medidas de brida en DN150 PN16", "/productos/valvulas/valvula-compuerta-fundigsac");
    expect(a.text).toContain('FUNDIGSAC 1 año · DN150 (6")');
    expect(a.text).toContain("| Dato | PN16 |");
    expect(a.text).toContain("| D1 | 240 |");
    expect(a.text).toContain("| n × Φd | 8 × 23 |");
    expect(a.text).toContain("| Pernos | M20 |");
    expect(a.text).not.toContain("PN10");
  });

  it("agrupa bridas iguales en doble perforación y da el extremo del vástago", () => {
    const a = ask("medidas del vástago DN150", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida");
    expect(a.text).toContain("FUNDIGSAC garantía extendida · DN150");
    expect(a.text).toContain("Brida (mm), doble perforación:");
    expect(a.text).toContain("| Dato | PN10 / PN16 |");
    expect(a.text).toContain("Extremo del vástago: Ød 28 · K × K 19.3 × 19.3");
  });

  it("compara las tres válvulas y recomienda según el uso", () => {
    const a = ask("Compara las 3 válvulas de compuerta");
    expect(a.text).toContain("H-ITALY");
    expect(a.text).toContain("FUNDIGSAC 1 año");
    expect(a.text).toContain("FUNDIGSAC garantía extendida");
    expect(a.text).toContain("¿Cuál elegir?");
  });

  it("responde normas y garantía juntas cuando se preguntan juntas", () => {
    const a = ask("¿Qué normas cumplen sus válvulas de compuerta y qué garantía ofrece cada modelo?");
    expect(a.text).toContain("**Normas**");
    expect(a.text).toContain("DIN 3352 F4");
    expect(a.text).toContain("**Garantía**");
    expect(a.text).toContain("1 año");
  });

  it("explica términos técnicos, PN, SDR y clases de carga", () => {
    expect(ask("¿Qué significa DIN 3352 F4?").text).toContain("F4 es la versión corta");
    expect(ask("¿Qué presión nominal necesito?").text).toContain("PN16");
    expect(ask("¿Qué SDR necesito para PN10?").text).toContain("SDR 17");
    expect(ask("¿Qué clase de carga necesito para una pista?").text).toContain("D400");
  });

  it("nunca da precios y remite a la cotización", () => {
    const a = ask("¿Cuánto cuesta la válvula de 4 pulgadas?");
    expect(a.text).toContain("/cotizar");
    expect(a.text).not.toMatch(/S\/\s?\d|US\$|\$\s?\d/);
  });

  it("da contacto, ubicación y horario reales", () => {
    expect(ask("¿Cuál es el horario de atención?").text).toContain(site.hours);
    expect(ask("¿Dónde están ubicados?").text).toContain(site.address);
    expect(ask("quiero hablar con un asesor").text).toContain(site.phone);
  });

  it("se presenta como FundigIA y se mantiene en su tema", () => {
    expect(ask("¿Cómo te llamas?").text).toContain("FundigIA");
    const off = ask("Escríbeme un poema sobre gatos");
    expect(off.text).toContain("Estoy enfocado en **FUNDIGSAC**");
  });

  it("resume la válvula de la página que se está viendo", () => {
    const a = ask("Resume la ficha técnica de esta válvula", "/productos/valvulas/valvula-compuerta");
    expect(a.text).toContain("Válvula de compuerta bridada H-ITALY");
    expect(a.text).toContain("/docs/ficha-tecnica-valvula-compuerta-bridada.pdf");
  });

  it("responde en inglés y agrega sugerencias en el formato del widget", () => {
    const a = guideAnswer("Compare the 3 gate valves", "en", "/");
    expect(a.text).toContain("Which one?");
    const text = withSuggestions(a);
    expect(text).toMatch(/\n\[\[[^\]|]+(\|[^\]|]+)+\]\]$/);
  });
});
