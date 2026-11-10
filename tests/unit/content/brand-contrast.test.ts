import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/shared/ui/contrast";

/** Tokens del naranja de marca tal como están en globals.css (B18-1). */
function brandTokens(): Record<string, string> {
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/--(brand-orange[a-z-]*):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) tokens[match[1]] = match[2];
  return tokens;
}

const LIGHT_SURFACES = ["#ffffff", "#fbfaf7", "#f7f5f1", "#f4f6f9", "#fff3ea"];
const DARK_SURFACES = ["#161615", "#1d1c1b", "#282726"];

describe("contraste del naranja de marca (B18-1)", () => {
  const t = brandTokens();

  it("la fórmula coincide con los valores de referencia de WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    // El naranja vivo con texto blanco no alcanza AA: por eso no se usa como fondo de texto.
    expect(contrastRatio("#f26a1b", "#ffffff")).toBeCloseTo(3.06, 2);
    expect(contrastRatio("#BF5720", "#ffffff")).toBeCloseTo(4.57, 2);
  });

  it("globals.css define los cinco tokens", () => {
    expect(Object.keys(t).sort()).toEqual(["brand-orange", "brand-orange-cta", "brand-orange-cta-hover", "brand-orange-ink", "brand-orange-ink-dark"]);
  });

  it("los botones naranjas con texto blanco pasan AA para texto normal (≥ 4.5:1), también en hover", () => {
    expect(contrastRatio(t["brand-orange-cta"], "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t["brand-orange-cta-hover"], "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("el texto naranja pasa AA sobre todas las superficies claras del sitio", () => {
    for (const surface of LIGHT_SURFACES) expect(contrastRatio(t["brand-orange-ink"], surface), surface).toBeGreaterThanOrEqual(4.5);
  });

  it("el texto naranja del modo oscuro pasa AA sobre las superficies oscuras", () => {
    for (const surface of DARK_SURFACES) expect(contrastRatio(t["brand-orange-ink-dark"], surface), surface).toBeGreaterThanOrEqual(4.5);
  });

  it("el naranja vivo sigue sirviendo como acento gráfico (bordes, foco, iconos ≥ 3:1) sobre blanco", () => {
    expect(contrastRatio(t["brand-orange"], "#ffffff")).toBeGreaterThanOrEqual(3);
  });
});
