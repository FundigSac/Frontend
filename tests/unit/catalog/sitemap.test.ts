import { afterEach, describe, expect, it, vi } from "vitest";
import { CATALOG_ROUTES, FAMILIES } from "@/modules/catalog/public-catalog";
import { CATEGORIES, PRODUCTS } from "@/modules/catalog/registry";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("rutas del catálogo reconstruidas con el diseño del 4 de noviembre", () => {
  it("cada familia y cada ficha de la lista de precios tiene ruta, como en origin/main", () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual(FAMILIES.map((f) => f.slug));
    for (const r of CATALOG_ROUTES) expect(PRODUCTS.some((p) => p.category === r.family && p.slug === r.slug), `${r.family}/${r.slug}`).toBe(true);
    const keys = PRODUCTS.map((p) => `${p.category}/${p.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("el sitemap lista las siete familias y solo las fichas indexables", async () => {
    vi.stubEnv("SITE_INDEXABLE", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((e) => new URL(e.url).pathname);
    for (const f of FAMILIES) expect(urls).toContain(f.href);
    for (const p of PRODUCTS) expect(urls.includes(`/productos/${p.category}/${p.slug}`), p.slug).toBe(p.indexable !== false);
  });
});
