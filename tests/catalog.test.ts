import { describe, expect, it } from "vitest";
import { categories, getProduct, products } from "../src/lib/catalog";
describe("catálogo inicial",()=>{
  it("mantiene slugs únicos y una fuente por producto",()=>{
    expect(new Set(products.map(p=>p.slug)).size).toBe(products.length);
    expect(products.every(p=>p.source.length>0)).toBe(true);
    expect(products.every(p=>categories.some(c=>c.slug===p.category))).toBe(true);
  });
  it("conserva el cambio SDR11 a SDR17 en el codo HDPE",()=>{
    const product=getProduct("codo-hdpe-termofusion-90-sdr11");
    expect(product?.variants?.find(v=>v.label==="315 mm")?.sdr).toBeUndefined();
    expect(product?.variants?.find(v=>v.label==="355 mm")?.sdr).toBe("SDR17");
  });
});
