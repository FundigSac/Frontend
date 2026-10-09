import { CATALOG_PRODUCTS, FAMILY_LABEL, type CatalogProduct, type HomologationId, type JointId } from "./data";

/* ───────────────────────── Normalización ───────────────────────── */

/** Minúsculas y sin acentos, conservando la longitud del texto (1 carácter → 1 carácter). */
export function foldChar(ch: string): string {
  const base = ch.normalize("NFD")[0] ?? ch;
  return base.toLowerCase();
}
export function fold(text: string): string {
  let out = "";
  for (const ch of text) out += foldChar(ch);
  return out;
}

/* ───────────────────────── Consulta ───────────────────────── */

export type ParsedQuery = {
  /** Términos libres normalizados (todos deben coincidir). */
  terms: string[];
  /** Criterios numéricos reconocidos en el texto: "DN 200", "PN 16". */
  dn: number[];
  pn: number[];
};

/** Sinónimos de uso común en obra → término del catálogo. */
const SYNONYMS: Record<string, string> = { tubo: "tuberia", tubos: "tuberia", tubing: "tuberia", cano: "tuberia", canos: "tuberia", buzon: "marco", buzones: "marco", alcantarilla: "marco" };

export function parseQuery(raw: string): ParsedQuery {
  let text = fold(raw).replace(/[,;]+/g, " ");
  const dn: number[] = [];
  const pn: number[] = [];
  text = text.replace(/\b(dn|pn)\s*-?\s*(\d{1,4})\b/g, (_m, kind: string, num: string) => {
    (kind === "dn" ? dn : pn).push(Number(num));
    return " ";
  });
  const terms = text.split(/\s+/).map((t) => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")).filter(Boolean).map((t) => SYNONYMS[t] ?? t);
  return { terms, dn, pn };
}

/** Variantes de un término para tolerar plurales simples (válvulas → valvula). */
function termVariants(term: string): string[] {
  const out = [term];
  if (term.length > 4 && term.endsWith("es")) out.push(term.slice(0, -2));
  if (term.length > 3 && term.endsWith("s")) out.push(term.slice(0, -1));
  return out;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termRegex(term: string): RegExp {
  return new RegExp(`(?:^|[^a-z0-9])(?:${termVariants(term).map(escapeRe).join("|")})`);
}

/* ───────────────────────── Texto indexado ───────────────────────── */

type Index = { name: string; sku: string; standards: string; family: string; specs: string; summary: string; extra: string };
const indexCache = new Map<string, Index>();

function indexOf(p: CatalogProduct): Index {
  const hit = indexCache.get(p.id);
  if (hit) return hit;
  const idx: Index = {
    name: fold(`${p.name} ${p.result?.title ?? ""}`),
    sku: fold(p.sku ?? ""),
    standards: fold(`${p.standards.join(" ")} ${p.badges.join(" ")} ${p.result?.norm ?? ""}`),
    family: fold(`${FAMILY_LABEL[p.family]} ${p.kicker} ${p.result?.tag ?? ""}`),
    specs: fold(p.specs.map(([a, b]) => `${a} ${b}`).join(" ")),
    summary: fold(`${p.summary} ${p.result?.summary ?? ""}`),
    extra: fold(`${p.material} ${p.result?.hm.text ?? ""}`),
  };
  indexCache.set(p.id, idx);
  return idx;
}

const WEIGHTS: [keyof Index, number][] = [["sku", 12], ["name", 10], ["standards", 6], ["family", 5], ["specs", 3], ["summary", 2], ["extra", 2]];

/** Relevancia de un producto para la consulta; `null` si no cumple (todos los términos y criterios numéricos). */
export function scoreProduct(p: CatalogProduct, q: ParsedQuery): number | null {
  if (q.pn.length && !(p.pn && q.pn.every((n) => p.pn!.includes(n)))) return null;
  if (q.dn.length && !(p.dn && q.dn.every((n) => n >= p.dn![0] && n <= p.dn![1]))) return null;
  const idx = indexOf(p);
  let score = 0;
  for (const term of q.terms) {
    const re = termRegex(term);
    let best = 0;
    let any = false;
    for (const [field, weight] of WEIGHTS) {
      if (re.test(idx[field])) {
        any = true;
        best += weight;
      }
    }
    if (!any) return null;
    score += best;
  }
  // Un SKU/código exacto es siempre lo más relevante.
  if (p.sku && q.terms.length === 1 && fold(p.sku) === q.terms[0]) score += 50;
  return score;
}

/* ───────────────────────── Filtros ───────────────────────── */

export const STANDARD_GROUPS = [
  { id: "iso2531", label: "ISO 2531 / EN 545", re: /ISO 2531|EN 545/i },
  { id: "en1171", label: "EN 1171 / EN 1074", re: /EN 1171|EN 1074/i },
  { id: "en124", label: "EN 124-2 (D400 / C250)", re: /EN 124/i },
  { id: "awwa", label: "AWWA C509 / C515", re: /AWWA C5(09|15)\b/i },
] as const;

export type SortId = "relevancia" | "dn-asc" | "dn-desc" | "pn-desc" | "norma" | "sku";
export const SORT_IDS: readonly SortId[] = ["relevancia", "dn-asc", "dn-desc", "pn-desc", "norma", "sku"];

export type Filters = {
  /** Categorías (slug) o valores especiales que no tienen productos (p. ej. "accesorios"). */
  cat: string[];
  pn: number[];
  /** Tipos de unión. "bridada" abarca todas las bridadas. */
  joint: JointId[];
  /** Ids de STANDARD_GROUPS. */
  norma: string[];
  hom: HomologationId[];
  dnMin?: number;
  dnMax?: number;
};

export const EMPTY_FILTERS: Filters = { cat: [], pn: [], joint: [], norma: [], hom: [] };

export function activeFilterCount(f: Filters): number {
  return (f.cat.length ? 1 : 0) + (f.pn.length ? 1 : 0) + (f.joint.length ? 1 : 0) + (f.norma.length ? 1 : 0) + (f.hom.length ? 1 : 0) + (f.dnMin !== undefined || f.dnMax !== undefined ? 1 : 0);
}

const jointMatches = (sel: JointId, joint: JointId) => (sel === "bridada" ? joint.startsWith("bridada") : sel === joint);

export type FacetKey = keyof Filters | "dn";

/** Aplica filtros. `skip` permite ignorar una faceta (para contar sus opciones). */
export function matchesFilters(p: CatalogProduct, f: Filters, skip?: FacetKey): boolean {
  if (skip !== "cat" && f.cat.length && !f.cat.includes(p.category)) return false;
  if (skip !== "pn" && f.pn.length && !(p.pn && p.pn.some((n) => f.pn.includes(n)))) return false;
  if (skip !== "joint" && f.joint.length && !f.joint.some((j) => jointMatches(j, p.joint))) return false;
  if (skip !== "norma" && f.norma.length) {
    const groups = STANDARD_GROUPS.filter((g) => f.norma.includes(g.id));
    if (!groups.some((g) => p.standards.some((s) => g.re.test(s)))) return false;
  }
  if (skip !== "hom" && f.hom.length && !f.hom.some((h) => p.homologation.includes(h))) return false;
  if (skip !== "dn" && (f.dnMin !== undefined || f.dnMax !== undefined)) {
    if (!p.dn) return false;
    const lo = f.dnMin ?? 0;
    const hi = f.dnMax ?? Infinity;
    if (p.dn[1] < lo || p.dn[0] > hi) return false;
  }
  return true;
}

/* ───────────────────────── Búsqueda y orden ───────────────────────── */

/** Orden "relevancia técnica" del catálogo sin consulta: primero las 8 fichas del diseño, luego el resto. */
const CATALOG_ORDER = ["vcp-f4-01", "vma-wf-02", "vch-sw-03", "vrp-pl-04", "tub-ty-05", "tub-ac-06", "mar-d4-07", "rej-ab-08"];
export const catalogRank = (p: CatalogProduct) => {
  const i = CATALOG_ORDER.indexOf(p.id);
  return i === -1 ? CATALOG_ORDER.length + CATALOG_PRODUCTS.indexOf(p) : i;
};

export type SearchHit = { product: CatalogProduct; score: number };

export function searchHits(query: string, products: readonly CatalogProduct[] = CATALOG_PRODUCTS): SearchHit[] {
  const q = parseQuery(query);
  const hits: SearchHit[] = [];
  for (const product of products) {
    const score = scoreProduct(product, q);
    if (score !== null) hits.push({ product, score });
  }
  return hits;
}

const maxPn = (p: CatalogProduct) => (p.pn?.length ? Math.max(...p.pn) : -1);

export function sortHits(hits: SearchHit[], sort: SortId, hasQuery: boolean): SearchHit[] {
  const out = [...hits];
  const byRelevance = (a: SearchHit, b: SearchHit) =>
    b.score - a.score || (hasQuery ? CATALOG_PRODUCTS.indexOf(a.product) - CATALOG_PRODUCTS.indexOf(b.product) : catalogRank(a.product) - catalogRank(b.product));
  const cmp: Record<SortId, (a: SearchHit, b: SearchHit) => number> = {
    relevancia: byRelevance,
    "dn-asc": (a, b) => (a.product.dn?.[0] ?? 1e9) - (b.product.dn?.[0] ?? 1e9) || (a.product.dn?.[1] ?? 1e9) - (b.product.dn?.[1] ?? 1e9) || byRelevance(a, b),
    "dn-desc": (a, b) => (b.product.dn?.[1] ?? -1) - (a.product.dn?.[1] ?? -1) || byRelevance(a, b),
    "pn-desc": (a, b) => maxPn(b.product) - maxPn(a.product) || byRelevance(a, b),
    norma: (a, b) => (a.product.standards[0] ?? "~").localeCompare(b.product.standards[0] ?? "~", "es") || byRelevance(a, b),
    sku: (a, b) => (a.product.sku ?? "~").localeCompare(b.product.sku ?? "~", "es") || byRelevance(a, b),
  };
  return out.sort(cmp[sort]);
}

/** Búsqueda completa: texto + filtros + orden. */
export function runSearch(query: string, filters: Filters, sort: SortId, products: readonly CatalogProduct[] = CATALOG_PRODUCTS): SearchHit[] {
  const parsed = parseQuery(query);
  const hasQuery = parsed.terms.length + parsed.dn.length + parsed.pn.length > 0;
  const hits = searchHits(query, products).filter((h) => matchesFilters(h.product, filters));
  return sortHits(hits, sort, hasQuery);
}

/** Conteo de resultados por opción de una faceta, ignorando la propia faceta (patrón estándar de facetas). */
export function facetCount(query: string, filters: Filters, skip: FacetKey, test: (p: CatalogProduct) => boolean, products: readonly CatalogProduct[] = CATALOG_PRODUCTS): number {
  return searchHits(query, products).filter((h) => matchesFilters(h.product, filters, skip) && test(h.product)).length;
}

export function paginate<T>(items: readonly T[], page: number, size: number): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const safe = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: items.slice((safe - 1) * size, safe * size), page: safe, pages };
}

/* ───────────────────────── Resaltado ───────────────────────── */

/** Rangos [inicio, fin) del texto original que coinciden con los términos (sin distinguir acentos ni mayúsculas). */
export function highlightRanges(text: string, terms: readonly string[]): [number, number][] {
  if (!terms.length) return [];
  const folded = fold(text);
  const ranges: [number, number][] = [];
  for (const term of terms) {
    const variants = termVariants(term).sort((a, b) => b.length - a.length);
    const re = new RegExp(`(?<=^|[^a-z0-9])(?:${variants.map(escapeRe).join("|")})`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(folded))) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      ranges.push([m.index, m.index + m[0].length]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/* ───────────────────────── Estado ↔ URL ───────────────────────── */

export type CatalogState = {
  q: string;
  filters: Filters;
  sort: SortId;
  page: number;
  view: "tarjetas" | "tabla";
};

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const getParam = (p: RawParams, key: string): string => {
  if (p instanceof URLSearchParams) return p.get(key) ?? "";
  const v = p[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
};
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

const JOINTS: readonly JointId[] = ["bridada", "bridada-f4", "bridada-f5", "ranurada", "roscada", "tyton", "acerrojada", "mecanica", "ninguna"];
const HOMS: readonly HomologationId[] = ["sedapal", "otass", "wras"];

export function parseState(p: RawParams): CatalogState {
  const dnRaw = getParam(p, "dn");
  const m = /^(\d{0,4})-(\d{0,4})$/.exec(dnRaw);
  const sort = getParam(p, "orden") as SortId;
  return {
    q: getParam(p, "q").slice(0, 120),
    filters: {
      cat: list(getParam(p, "cat")).slice(0, 6),
      pn: list(getParam(p, "pn")).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n < 1000),
      joint: list(getParam(p, "union")).filter((j): j is JointId => (JOINTS as readonly string[]).includes(j)),
      norma: list(getParam(p, "norma")).filter((id) => STANDARD_GROUPS.some((g) => g.id === id)),
      hom: list(getParam(p, "hom")).filter((h): h is HomologationId => (HOMS as readonly string[]).includes(h)),
      dnMin: m && m[1] ? Number(m[1]) : undefined,
      dnMax: m && m[2] ? Number(m[2]) : undefined,
    },
    sort: SORT_IDS.includes(sort) ? sort : "relevancia",
    page: Math.max(1, Number(getParam(p, "pagina")) || 1),
    view: getParam(p, "vista") === "tabla" ? "tabla" : "tarjetas",
  };
}

export function stateToParams(s: CatalogState): URLSearchParams {
  const u = new URLSearchParams();
  if (s.q.trim()) u.set("q", s.q);
  if (s.filters.cat.length) u.set("cat", s.filters.cat.join(","));
  if (s.filters.dnMin !== undefined || s.filters.dnMax !== undefined) u.set("dn", `${s.filters.dnMin ?? ""}-${s.filters.dnMax ?? ""}`);
  if (s.filters.pn.length) u.set("pn", s.filters.pn.join(","));
  if (s.filters.joint.length) u.set("union", s.filters.joint.join(","));
  if (s.filters.norma.length) u.set("norma", s.filters.norma.join(","));
  if (s.filters.hom.length) u.set("hom", s.filters.hom.join(","));
  if (s.sort !== "relevancia") u.set("orden", s.sort);
  if (s.page > 1) u.set("pagina", String(s.page));
  if (s.view === "tabla") u.set("vista", "tabla");
  return u;
}
