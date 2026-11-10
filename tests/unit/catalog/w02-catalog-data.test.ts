import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cellBySlug, cellsOfFamily, FAMILIES as CATALOG_FAMILIES } from "@/modules/catalog/public-catalog";
import { FAMILY_TEXT, PRODUCT_TEXT } from "@/screens/islands/w02-catalog-copy";
import { FAMILIES, FEATURED_PRODUCTS, facetCounts, isFamilyId } from "@/screens/islands/w02-catalog-data";
import imageLoader from "@/shared/media/image-loader";

const squash = (value: string) => value.replace(/\s+/g, "");

describe("catálogo general: familias (punto 5)", () => {
  it("tiene tarjeta para cada familia del catálogo, incluidas termofusión y medidores", () => {
    expect(FAMILIES.map((f) => f.id).sort()).toEqual(CATALOG_FAMILIES.map((f) => f.slug).sort());
    for (const id of ["equipos-termofusion", "medidores"] as const) {
      const card = FAMILIES.find((f) => f.id === id)!;
      expect(card.href).toBe(`/productos/${id}`);
      expect(cellsOfFamily(id).length).toBeGreaterThan(0);
      expect(existsSync(path.join("public", card.image))).toBe(true);
      expect(FAMILY_TEXT.es[id].label).toBeTruthy();
      expect(FAMILY_TEXT.en[id].label).toBeTruthy();
    }
    expect(isFamilyId("medidores")).toBe(true);
    expect(isFamilyId("inexistente")).toBe(false);
  });

  it("los destacados nuevos enlazan a su ficha y su rango es el publicado en la lista de precios", () => {
    for (const product of FEATURED_PRODUCTS.filter((p) => p.sheet)) {
      const cell = cellBySlug(product.sheet!)!;
      expect(cell, product.id).toBeTruthy();
      expect(product.href).toBe(cell.href);
      expect(squash(product.descriptor)).toBe(squash(cell.range ?? ""));
      expect(PRODUCT_TEXT.es[product.id].name).toBeTruthy();
      expect(PRODUCT_TEXT.en[product.id].name).toBeTruthy();
    }
  });
});

describe("conteo por filtro (X5-1)", () => {
  it("sin búsqueda cuenta todos los destacados por familia", () => {
    const counts = facetCounts("");
    expect(counts.todas).toBe(FEATURED_PRODUCTS.length);
    for (const family of FAMILIES) expect(counts[family.id]).toBe(FEATURED_PRODUCTS.filter((p) => p.family === family.id).length);
  });

  it("con búsqueda cuenta solo lo que coincide y deja en 0 las familias sin resultados", () => {
    const counts = facetCounts("medidor");
    expect(counts.todas).toBe(1);
    expect(counts.medidores).toBe(1);
    expect(counts.valvulas).toBe(0);
    expect(facetCounts("zzz-nada").todas).toBe(0);
  });

  it("busca en los dos idiomas y sin tildes", () => {
    expect(facetCounts("termofusion").todas).toBeGreaterThan(0);
    expect(facetCounts("meter").medidores).toBe(1);
  });
});

describe("variantes de imagen", () => {
  it("una foto de ~270 px en un teléfono (DPR 1,75) baja la variante de 480 px", () => {
    expect(imageLoader({ src: "/media/home-v2/compuerta-con-timon-v4.webp", width: 480 })).toBe("/media/home-v2/compuerta-con-timon-v4-w480.webp");
    expect(imageLoader({ src: "/media/a.jpg", width: 384 })).toBe("/media/a-w384.webp");
    expect(imageLoader({ src: "/media/a.jpg", width: 500 })).toBe("/media/a-w640.webp");
    expect(imageLoader({ src: "/media/a.svg", width: 500 })).toBe("/media/a.svg?w=500");
  });
});
