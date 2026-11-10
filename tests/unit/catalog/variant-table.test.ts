import { describe, expect, it } from "vitest";
import { products as PRICE_LIST } from "@/lib/catalog";
import { CATALOG_CELLS, findCatalogSheet, valveOrderOptions } from "@/modules/catalog/public-catalog";
import { VALVE_SHEETS } from "@/modules/catalog/valve-sheets";
import { cartVariant, classifyPart, pressureOf, variantKey, variantTable } from "@/modules/catalog/variant-table";

describe("variantTable (X1-4)", () => {
  it("separa DN y pulgadas sin inventar columnas", () => {
    const table = variantTable(['DN50 · 2"', 'DN65 · 2 1/2"', 'DN80 · 3"'])!;
    expect(table.columns).toEqual(["dn", "inch"]);
    expect(table.rows[1].cells).toEqual({ dn: "DN65", inch: '2 1/2"' });
  });

  it("reconoce modelo, medida, detalle, peso y serie SDR", () => {
    expect(classifyPart("HDL 160-2M", 0)).toBe("model");
    expect(classifyPart("40–160 mm", 1)).toBe("size");
    expect(classifyPart("palanca", 1)).toBe("detail");
    expect(classifyPart("42,5 kg", 2)).toBe("weight");
    expect(classifyPart("SDR17", 1)).toBe("sdr");
    expect(classifyPart("75 × 63 mm", 0)).toBe("size");
    const table = variantTable(["SUD 40-200M4 · manivela · 40–200 mm · 42,5 kg", "SDP40-200M4 · palanca · 40–200 mm · 45 kg"])!;
    expect(table.columns).toEqual(["model", "size", "detail", "weight"]);
  });

  it("solo hay tabla con dos medidas o más", () => {
    expect(variantTable([])).toBeNull();
    expect(variantTable(["DN50 · 2\""])).toBeNull();
  });

  it("cada celda sale de la etiqueta publicada: al unirlas se recupera la etiqueta", () => {
    for (const cell of CATALOG_CELLS) {
      const sheet = findCatalogSheet(cell.slug);
      if (!sheet) continue;
      const table = variantTable(sheet.variants.es);
      if (!table) continue;
      table.rows.forEach((row, i) => {
        const parts = sheet.variants.es[i].split(" · ");
        expect(Object.values(row.cells).join(" · ").split(" · ").sort()).toEqual([...parts].sort());
      });
    }
  });

  it("las claves de dirección (?medida=) son únicas dentro de cada ficha y no cambian con el idioma", () => {
    for (const p of PRICE_LIST) {
      const keys = (p.variants ?? []).map((v) => variantKey(v.sdr ? `${v.label} · ${v.sdr}` : v.label));
      expect(new Set(keys).size, p.slug).toBe(keys.length);
      for (const key of keys) expect(key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
    expect(variantKey('DN150 · 6"')).toBe("dn150-6");
    const sheet = findCatalogSheet("maquina-termofusion-sud-sdp-4-mordazas")!;
    const es = variantTable(sheet.variants.es)!;
    const en = variantTable(sheet.variants.en, sheet.variants.es)!;
    expect(en.rows.map((r) => r.key)).toEqual(es.rows.map((r) => r.key));
  });
});

describe("bloque de pedido (B10-2)", () => {
  it("la presión sale de la clase publicada y no del paréntesis que depende de la medida", () => {
    expect(pressureOf([["Clase", "ISO PN16"]])).toBe("PN16");
    expect(pressureOf([["Clase de brida", "ISO PN16 (DN200 también PN10)"]])).toBe("PN16");
    expect(pressureOf([["Presión", "PN16"]])).toBe("PN16");
    expect(pressureOf([["Serie", "SDR11"], ["Clases", "C40 · K9 · K7"]])).toBeUndefined();
  });

  it("el carrito guarda la medida y la presión publicada, sin repetirla", () => {
    expect(cartVariant('DN100 · 4"', "PN16")).toBe('DN100 · 4" · PN16');
    expect(cartVariant("DN100 · PN16", "PN16")).toBe("DN100 · PN16");
    expect(cartVariant("63 mm", undefined)).toBe("63 mm");
    expect(cartVariant(undefined, "PN16")).toBe("PN16");
  });

  it("las fichas de válvula reciben las medidas de la lista de precios", () => {
    for (const sheet of VALVE_SHEETS) {
      const options = valveOrderOptions(sheet.slug);
      const listed = PRICE_LIST.find((p) => p.slug === sheet.slug)?.variants?.length ?? 0;
      expect(options.variants.es.length, sheet.slug).toBe(listed);
      expect(options.variants.en.length).toBe(listed);
    }
    expect(valveOrderOptions("valvula-check-swing").pressure).toBe("PN16");
  });

  it("las fichas por confirmar no muestran presión", () => {
    for (const cell of CATALOG_CELLS.filter((c) => c.status === "por-confirmar")) {
      expect(findCatalogSheet(cell.slug)?.pressure, cell.slug).toBeUndefined();
    }
  });
});
