import { describe, expect, it } from "vitest";
import { CATALOG_PRODUCTS, hasProductPage, quoteHref } from "@/modules/catalog/data";
import {
  EMPTY_FILTERS, facetCount, fold, highlightRanges, paginate, parseQuery, parseState, runSearch, stateToParams, type Filters,
} from "@/modules/catalog/search";

const ids = (q: string, f: Filters = EMPTY_FILTERS, sort: Parameters<typeof runSearch>[2] = "relevancia") => runSearch(q, f, sort).map((h) => h.product.id);

describe("dataset", () => {
  it("es demo, con ids y SKUs únicos y rutas internas válidas", () => {
    expect(CATALOG_PRODUCTS.every((p) => p.demo === true)).toBe(true);
    expect(new Set(CATALOG_PRODUCTS.map((p) => p.id)).size).toBe(CATALOG_PRODUCTS.length);
    const skus = CATALOG_PRODUCTS.flatMap((p) => (p.sku ? [p.sku] : []));
    expect(new Set(skus).size).toBe(skus.length);
    for (const p of CATALOG_PRODUCTS) {
      expect(p.href.startsWith("/productos/")).toBe(true);
      expect(p.image.startsWith("/images/stitch/")).toBe(true);
      expect(p.specs).toHaveLength(4);
    }
  });
  it("enlaza a la ficha propia sólo cuando existe y precarga la cotización", () => {
    const f4 = CATALOG_PRODUCTS.find((p) => p.id === "vcp-f4-01")!;
    expect(hasProductPage(f4)).toBe(true);
    expect(quoteHref(f4)).toBe("/cotizar?producto=valvula-compuerta");
    const k9 = CATALOG_PRODUCTS.find((p) => p.id === "tub-k9")!;
    expect(hasProductPage(k9)).toBe(false);
    expect(quoteHref(k9)).toBe("/cotizar");
  });
});

describe("normalización y consulta", () => {
  it("ignora acentos y mayúsculas conservando la longitud", () => {
    expect(fold("Válvula ÑANDÚ")).toBe("valvula nandu");
    expect(fold("Tubería").length).toBe("Tubería".length);
  });
  it("extrae criterios DN/PN y términos", () => {
    expect(parseQuery("Válvula compuerta PN 16, DN200")).toEqual({ terms: ["valvula", "compuerta"], dn: [200], pn: [16] });
  });
});

describe("búsqueda", () => {
  it("'válvula compuerta pn 16' devuelve exactamente las 6 compuertas PN 16 (F4 primero)", () => {
    const r = ids("válvula compuerta pn 16");
    expect(r[0]).toBe("vcp-f4-01");
    expect([...r].sort()).toEqual(["vcp-br-03", "vcp-dom-04", "vcp-f4-01", "vcp-f5-02", "vcp-knf-05", "vcp-tel-06"]);
  });
  it("tolera plurales y acentos", () => {
    expect(ids("VALVULAS compuertas")).toEqual(ids("válvula compuerta"));
    expect(ids("tuberia")).toContain("tub-ty-05");
  });
  it("entiende sinónimos de obra y las búsquedas frecuentes de la página 404", () => {
    expect(ids("tubo K9 ISO 2531")).toEqual(expect.arrayContaining(["tub-k9", "tub-ty-05"]));
    expect(ids("tubo K9 ISO 2531").every((id) => id.startsWith("tub-"))).toBe(true);
    expect(ids("tapa D400 EN 124")).toContain("mar-d4-07");
    expect(ids("válvula DN 200").length).toBeGreaterThan(0);
  });
  it("encuentra por SKU exacto primero", () => {
    expect(ids("TUB-AC-06")[0]).toBe("tub-ac-06");
  });
  it("DN 200 incluye sólo piezas cuyo rango contiene 200", () => {
    const r = runSearch("DN 200", EMPTY_FILTERS, "relevancia").map((h) => h.product);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.dn && p.dn[0] <= 200 && p.dn[1] >= 200)).toBe(true);
  });
  it("todos los términos deben coincidir (AND)", () => {
    expect(ids("compuerta tyton")).toEqual([]);
  });
  it("sin consulta lista todo el catálogo, con las 8 fichas del diseño primero", () => {
    const r = ids("");
    expect(r).toHaveLength(CATALOG_PRODUCTS.length);
    expect(r.slice(0, 8)).toEqual(["vcp-f4-01", "vma-wf-02", "vch-sw-03", "vrp-pl-04", "tub-ty-05", "tub-ac-06", "mar-d4-07", "rej-ab-08"]);
  });
  it("ordena por DN ascendente/descendente y por SKU", () => {
    const asc = runSearch("", EMPTY_FILTERS, "dn-asc").map((h) => h.product.dn?.[0] ?? 1e9);
    expect([...asc].sort((a, b) => a - b)).toEqual(asc);
    const desc = runSearch("", EMPTY_FILTERS, "dn-desc").map((h) => h.product.dn?.[1] ?? -1);
    expect([...desc].sort((a, b) => b - a)).toEqual(desc);
    const sku = runSearch("", EMPTY_FILTERS, "sku").map((h) => h.product.sku ?? "~");
    expect([...sku].sort((a, b) => a.localeCompare(b, "es"))).toEqual(sku);
  });
});

describe("filtros y facetas", () => {
  it("filtra por categoría, PN, norma y unión", () => {
    expect(ids("", { ...EMPTY_FILTERS, cat: ["tuberias"] }).every((id) => id.startsWith("tub-"))).toBe(true);
    expect(ids("", { ...EMPTY_FILTERS, pn: [40] })).toEqual(["tub-ty-05"]);
    expect(ids("", { ...EMPTY_FILTERS, norma: ["awwa"] })).toEqual([]);
    expect(ids("", { ...EMPTY_FILTERS, joint: ["roscada"] })).toEqual(["vcp-dom-04"]);
    // "bridada" abarca F4 y F5
    expect(ids("", { ...EMPTY_FILTERS, joint: ["bridada"] })).toContain("vcp-f5-02");
  });
  it("rango DN usa solapamiento", () => {
    const r = runSearch("", { ...EMPTY_FILTERS, dnMin: 700, dnMax: 1200 }, "relevancia").map((h) => h.product);
    expect(r.every((p) => p.dn && p.dn[1] >= 700)).toBe(true);
    expect(r.map((p) => p.id)).toContain("tub-k9");
  });
  it("categoría desconocida ('accesorios') no devuelve nada", () => {
    expect(ids("", { ...EMPTY_FILTERS, cat: ["accesorios"] })).toEqual([]);
  });
  it("el conteo de faceta ignora su propia selección", () => {
    const f: Filters = { ...EMPTY_FILTERS, cat: ["valvulas"] };
    const marcos = facetCount("", f, "cat", (p) => p.category === "marcos-y-tapas");
    expect(marcos).toBe(CATALOG_PRODUCTS.filter((p) => p.category === "marcos-y-tapas").length);
  });
});

describe("resaltado, paginación y URL", () => {
  it("resalta sin distinguir acentos y fusiona rangos", () => {
    expect(highlightRanges("Válvula Compuerta", ["valvula", "compuerta"])).toEqual([[0, 7], [8, 17]]);
    expect(highlightRanges("Válvulas", ["valvula"])).toEqual([[0, 7]]);
    expect(highlightRanges("nada", ["xyz"])).toEqual([]);
  });
  it("pagina con límites seguros", () => {
    const items = Array.from({ length: 19 }, (_, i) => i);
    expect(paginate(items, 1, 8).items).toHaveLength(8);
    expect(paginate(items, 3, 8).items).toEqual([16, 17, 18]);
    expect(paginate(items, 99, 8).page).toBe(3);
    expect(paginate([], 1, 8)).toEqual({ items: [], page: 1, pages: 1 });
  });
  it("serializa y recupera el estado desde la URL (ida y vuelta)", () => {
    const state = parseState(new URLSearchParams("q=tapa&cat=marcos-y-tapas&pn=16,25&dn=100-300&orden=dn-asc&pagina=2&vista=tabla&hom=sedapal&union=roscada&norma=en124"));
    expect(state.q).toBe("tapa");
    expect(state.filters).toMatchObject({ cat: ["marcos-y-tapas"], pn: [16, 25], dnMin: 100, dnMax: 300, hom: ["sedapal"], joint: ["roscada"], norma: ["en124"] });
    expect(state.sort).toBe("dn-asc");
    expect(state.page).toBe(2);
    expect(state.view).toBe("tabla");
    expect(parseState(stateToParams(state))).toEqual(state);
  });
  it("descarta valores inválidos de la URL", () => {
    const s = parseState({ orden: "hack", pn: "abc,16", union: "x", pagina: "-3", hom: "zzz", norma: "nope" });
    expect(s.sort).toBe("relevancia");
    expect(s.filters.pn).toEqual([16]);
    expect(s.filters.joint).toEqual([]);
    expect(s.filters.hom).toEqual([]);
    expect(s.filters.norma).toEqual([]);
    expect(s.page).toBe(1);
  });
});
