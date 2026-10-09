import { describe, expect, it } from "vitest";
import {
  CATEGORY_TABS,
  DEFAULT_FILTERS,
  RESOURCE_ITEMS,
  countByCategory,
  filterResources,
  filtersToQuery,
  normalizeText,
  parseFilters,
} from "@/modules/resources/library";

const ids = (f: Partial<typeof DEFAULT_FILTERS>) => filterResources({ ...DEFAULT_FILTERS, ...f }).map((i) => i.id);

describe("biblioteca de recursos (W13)", () => {
  it("sin filtros devuelve todos los documentos", () => {
    expect(ids({})).toHaveLength(RESOURCE_ITEMS.length);
  });

  it("la categoría coincide de forma exacta", () => {
    expect(ids({ cat: "manuales" })).toEqual(["manual-instalacion-zanja", "guia-golpe-ariete"]);
    expect(ids({ cat: "planos" })).toEqual(["planos-cad-buzones"]);
  });

  it("la familia usa pertenencia (un documento puede aplicar a varias familias)", () => {
    expect(ids({ fam: "valvulas" })).toEqual(["catalogo-general-2026", "planos-cad-buzones", "ficha-valvulas-compuerta", "guia-golpe-ariete"]);
    expect(ids({ fam: "marcos" })).toContain("catalogo-general-2026");
  });

  it("categoría y familia se combinan (AND)", () => {
    expect(ids({ cat: "manuales", fam: "tuberias" })).toEqual(["manual-instalacion-zanja", "guia-golpe-ariete"]);
    expect(ids({ cat: "catalogos", fam: "valvulas" })).toEqual(["catalogo-general-2026"]);
    expect(ids({ cat: "planos", fam: "tuberias" })).toEqual([]);
  });

  it("la búsqueda ignora mayúsculas y tildes y busca en código, título, descripción y metadatos", () => {
    expect(ids({ q: "GOLPE DE ARIETE" })).toEqual(["guia-golpe-ariete"]);
    expect(ids({ q: "hidraulico" })).toEqual(["guia-golpe-ariete"]);
    expect(ids({ q: "iso 2531" })).toEqual(["catalogo-general-2026"]);
    expect(ids({ q: "FT-VAL-F4F5-PN25" })).toEqual(["ficha-valvulas-compuerta"]);
    expect(ids({ q: "  dwg " })).toEqual(["planos-cad-buzones"]);
  });

  it("una búsqueda sin coincidencias devuelve vacío", () => {
    expect(ids({ q: "no-existe-este-termino" })).toEqual([]);
  });

  it("los conteos de pestañas se derivan de los datos", () => {
    expect(countByCategory("all")).toBe(RESOURCE_ITEMS.length);
    const sum = CATEGORY_TABS.filter((t) => t.value !== "all").reduce((n, t) => n + countByCategory(t.value), 0);
    expect(sum).toBe(RESOURCE_ITEMS.length);
  });

  it("normalizeText quita tildes y colapsa espacios", () => {
    expect(normalizeText("  Ficha   Técnica ")).toBe("ficha tecnica");
  });
});

describe("filtros en la URL", () => {
  it("parseFilters acepta valores válidos y descarta los desconocidos", () => {
    expect(parseFilters({ q: "iso", cat: "fichas", fam: "marcos" })).toEqual({ q: "iso", cat: "fichas", fam: "marcos" });
    expect(parseFilters({ cat: "hack", fam: ["valvulas", "x"] })).toEqual({ q: "", cat: "all", fam: "valvulas" });
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it("parseFilters limita la longitud de la consulta", () => {
    expect(parseFilters({ q: "a".repeat(500) }).q).toHaveLength(120);
  });

  it("filtersToQuery omite los valores predeterminados y es reversible", () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toBe("");
    const qs = filtersToQuery({ q: "iso 2531", cat: "catalogos", fam: "valvulas" });
    expect(qs).toBe("q=iso+2531&cat=catalogos&fam=valvulas");
    const sp = new URLSearchParams(qs);
    expect(parseFilters({ q: sp.get("q") ?? undefined, cat: sp.get("cat") ?? undefined, fam: sp.get("fam") ?? undefined })).toEqual({ q: "iso 2531", cat: "catalogos", fam: "valvulas" });
  });
});
