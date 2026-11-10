import { describe, expect, it } from "vitest";
import { CATALOG_CELLS, findCatalogSheet } from "@/modules/catalog/public-catalog";
import { pressureOf, specLine } from "@/modules/catalog/spec-line";
import { DATASHEETS } from "@/screens/islands/w06-ficha-data";

describe("línea técnica de las tarjetas (X1-2 / B8-3)", () => {
  it("toma presión, material y unión de las filas de la ficha", () => {
    expect(specLine([["Material", "Hierro dúctil GGG50"], ["Conexión", "Embone (espiga-campana), estándar Luflex"], ["Clase", "ISO PN16"]])).toEqual(["PN16", "Hierro dúctil GGG50", "Embone"]);
    expect(specLine([["Material", "HDPE"], ["Unión", "Termofusión"]])).toEqual(["HDPE", "Termofusión"]);
  });

  it("normaliza la presión y no la repite en la unión", () => {
    expect(pressureOf([["Clase de brida", "ISO PN16 (DN200 también PN10)"]])).toBe("PN16");
    expect(specLine([["Conexión", "Bridada DIN PN10 / PN16"]])).toEqual(["PN10 / PN16", "Bridada DIN"]);
    expect(pressureOf([["Bridas", "ISO 7005-2 · EN 1092-2, doble perforación PN10/PN16"]])).toBe("PN10 / PN16");
  });

  it("no inventa: sin dato, «Por confirmar» o en bar no hay presión nominal", () => {
    expect(specLine([])).toEqual([]);
    expect(specLine([["Presión o clase", "Por confirmar"], ["Material", "Por confirmar"]])).toEqual([]);
    expect(pressureOf([["Presión de entrada", "Hasta 16 bar"]])).toBeUndefined();
  });

  it("descarta valores largos en vez de recortarlos a medias", () => {
    expect(specLine([["Material", "Hierro dúctil GGG50 / latón / bronce de alta resistencia"]])).toEqual([]);
  });

  it("cada parte mostrada aparece tal cual en la ficha publicada del producto", () => {
    for (const cell of CATALOG_CELLS) {
      const sheet = findCatalogSheet(cell.slug);
      if (!sheet) continue;
      for (const lang of ["es", "en"] as const) {
        const text = sheet.specs[lang].map(([, v]) => v.replace(/\s+/g, "")).join(" ").toUpperCase();
        for (const part of specLine(sheet.specs[lang])) {
          for (const token of part.split(" / ")) expect(text, `${cell.slug} ${lang}: ${part}`).toContain(token.replace(/\s+/g, "").toUpperCase());
        }
      }
    }
  });

  it("las fichas de compuerta con datos aprobados dan su presión nominal", () => {
    expect(pressureOf(DATASHEETS.fundigsac.specs)).toBe("PN10 / PN16");
  });
});
