import { describe, expect, it } from "vitest";
import { formatLimaDateTime, isLeadReference, leadKindLabel } from "@/modules/quote/format";
import { QUOTE_PRODUCTS, QUOTE_PRODUCT_SLUGS, findQuoteProduct, isValidRucChecksum, limaToday } from "@/modules/quote/products";

describe("productos de cotización (W17)", () => {
  it("hay datos completos para cada slug del catálogo", () => {
    expect([...QUOTE_PRODUCT_SLUGS].sort()).toEqual(["marco-tapa-d400", "tuberia-tyton", "valvula-compuerta", "valvula-mariposa"]);
    for (const slug of QUOTE_PRODUCT_SLUGS) {
      const p = QUOTE_PRODUCTS[slug];
      expect(p.slug).toBe(slug);
      expect(p.specs).toHaveLength(6);
      expect(p.documents).toHaveLength(3);
      expect(p.addons).toHaveLength(3);
      expect(p.productHref).toContain(slug);
      expect(p.image.src).toMatch(/^\/images\/stitch\/.+\.jpg$/);
      expect(p.image.alt.length).toBeLessThanOrEqual(125);
    }
  });

  it("la válvula de compuerta conserva los datos del diseño", () => {
    const p = QUOTE_PRODUCTS["valvula-compuerta"];
    expect(p.sku).toBe("VCP-F4-150");
    expect(p.title).toBe("Válvula de Compuerta Bridada con Asiento Elástico F4 PN 16");
    expect(p.specs[0]).toEqual(["Diámetro Nominal (DN)", 'DN 150 (6")']);
  });

  it("findQuoteProduct sólo acepta slugs conocidos", () => {
    expect(findQuoteProduct("tuberia-tyton")?.sku).toBe("TUB-TYT-C40");
    expect(findQuoteProduct("../etc/passwd")).toBeUndefined();
    expect(findQuoteProduct(undefined)).toBeUndefined();
    expect(findQuoteProduct("__proto__")).toBeUndefined();
  });

  it("valida el dígito verificador del RUC (módulo 11)", () => {
    expect(isValidRucChecksum("20100070970")).toBe(true); // RUC público conocido (Supermercados Peruanos)
    expect(isValidRucChecksum("20100070971")).toBe(false);
    expect(isValidRucChecksum("2010007097")).toBe(false);
    expect(isValidRucChecksum("abcdefghijk")).toBe(false);
  });

  it("limaToday usa la fecha de Lima (UTC-5), no la del servidor", () => {
    expect(limaToday(new Date("2026-01-15T03:30:00Z"))).toBe("2026-01-14");
    expect(limaToday(new Date("2026-01-15T05:00:00Z"))).toBe("2026-01-15");
  });
});

describe("confirmación (W24)", () => {
  it("formatLimaDateTime formatea en hora de Lima", () => {
    expect(formatLimaDateTime(new Date("2026-01-15T15:45:00Z"))).toBe("15 de enero de 2026 · 10:45 hrs (PET)");
    expect(formatLimaDateTime(new Date("2026-01-01T04:59:00Z"))).toBe("31 de diciembre de 2025 · 23:59 hrs (PET)");
  });

  it("isLeadReference valida la forma del folio", () => {
    expect(isLeadReference("COT-2026-000123")).toBe(true);
    expect(isLeadReference("COT-2026-123")).toBe(false);
    expect(isLeadReference("cot-2026-000123")).toBe(false);
    expect(isLeadReference(undefined)).toBe(false);
    expect(isLeadReference("COT-2026-000123; DROP")).toBe(false);
  });

  it("leadKindLabel tiene texto por defecto", () => {
    expect(leadKindLabel("quote")).toBe("Solicitud de cotización");
    expect(leadKindLabel("otro")).toBe("Solicitud");
  });
});
