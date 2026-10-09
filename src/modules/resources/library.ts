/**
 * Biblioteca de recursos técnicos (W13): datos tipados + lógica pura de filtrado.
 * Equivale a `applyFilters` del script original de Stitch (categoría exacta, familia por `includes`
 * y búsqueda de texto sobre el texto de la tarjeta), con normalización de tildes/mayúsculas.
 *
 * Los textos son los del diseño. Los códigos, pesos, normas y sellos ("Auditado SEDAPAL", "WRAS Aprobado",
 * "INACAL") NO están verificados: FUNDIGSAC debe validarlos antes de publicar.
 */
export type ResourceCategory = "catalogos" | "fichas" | "manuales" | "planos";
export type ResourceFamily = "valvulas" | "tuberias" | "marcos";
export type CategoryFilter = ResourceCategory | "all";
export type FamilyFilter = ResourceFamily | "all";

export type ResourceItem = {
  id: string;
  category: ResourceCategory;
  /** Familias a las que aplica (el original las guarda como cadena separada por espacios). */
  families: readonly ResourceFamily[];
  badge: string;
  badgeClass: string;
  format: string;
  code: string;
  title: string;
  description: string;
  meta: readonly [{ icon: string; label: string }, { icon: string; label: string }];
  action: { icon: string; label: string };
  /** Página de detalle existente (sólo el catálogo general tiene diseño de detalle). */
  detailHref?: string;
};

export const RESOURCE_ITEMS: readonly ResourceItem[] = [
  {
    id: "catalogo-general-2026",
    category: "catalogos",
    families: ["tuberias", "valvulas", "marcos"],
    badge: "Catálogo Oficial",
    badgeClass: "bg-primary/10 text-primary",
    format: "PDF (48 MB)",
    code: "FUND-CAT-2026-REV1",
    title: "Catálogo General Técnico FUNDIGSAC 2026",
    description: "Incluye tablas dimensionales completas, curvas de caudal, presiones de servicio nominal y tolerancias de fundición según norma ISO 2531 y NTP 350.085.",
    meta: [{ icon: "calendar_month", label: "Edición Enero 2026" }, { icon: "verified_user", label: "Auditado SEDAPAL" }],
    action: { icon: "download", label: "Descargar PDF" },
    detailHref: "/recursos/detalle-tecnico",
  },
  {
    id: "manual-instalacion-zanja",
    category: "manuales",
    families: ["tuberias"],
    badge: "Manual Operativo",
    badgeClass: "bg-secondary-container text-on-secondary-container",
    format: "PDF (14 MB)",
    code: "MAN-INST-STP-04",
    title: "Manual de Manipulación, Instalación en Zanja y Pruebas STP",
    description: "Directivas de manipulación segura de tuberías Tyton, preparación de cama de apoyo, ángulos de deflexión permitidos y protocolos de pruebas hidrostáticas en campo.",
    meta: [{ icon: "layers", label: "Guía en Zanja" }, { icon: "rule", label: "NTP ISO 10804" }],
    action: { icon: "download", label: "Descargar PDF" },
  },
  {
    id: "planos-cad-buzones",
    category: "planos",
    families: ["marcos", "valvulas"],
    badge: "Planos y Modelos",
    badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    format: "DWG / PDF (28 MB)",
    code: "CAD-PACK-BUZ-2026",
    title: "Compendio de Planos Tipo y Secciones CAD para Expedientes",
    description: "Cortes transversales de buzones estándar con marcos D400 y cámaras de válvulas subterráneas en bloques dinámicos DWG y plantillas vectorizadas listas para impresión.",
    meta: [{ icon: "architecture", label: "AutoCAD 2018+" }, { icon: "interests", label: "Escalas 1:20 / 1:50" }],
    action: { icon: "folder_zip", label: "Descargar ZIP" },
  },
  {
    id: "ficha-valvulas-compuerta",
    category: "fichas",
    families: ["valvulas"],
    badge: "Ficha Técnica",
    badgeClass: "bg-surface-container-high text-primary",
    format: "PDF (3.2 MB)",
    code: "FT-VAL-F4F5-PN25",
    title: "Ficha Técnica Unificada: Válvulas de Compuerta F4 y F5 PN 16/25",
    description: "Dimensiones cara a cara según DIN EN 558-1 serie 14/15, torques de apriete, compatibilidad con actuadores eléctricos ISO 5210 y recubrimiento epóxico RAL 5005.",
    meta: [{ icon: "tune", label: "DN 50 - DN 600" }, { icon: "check_circle", label: "WRAS Aprobado" }],
    action: { icon: "download", label: "Descargar PDF" },
  },
  {
    id: "guia-golpe-ariete",
    category: "manuales",
    families: ["valvulas", "tuberias"],
    badge: "Guía de Ingeniería",
    badgeClass: "bg-secondary-container text-on-secondary-container",
    format: "PDF (5.5 MB)",
    code: "GUIA-HID-TRANS-02",
    title: "Guía de Cálculo Hidráulico y Supresión de Golpe de Ariete",
    description: "Metodología de dimensionamiento de cámaras de aire, válvulas anticipadoras de onda y criterios para protección contra transitorios en líneas de impulsión principales.",
    meta: [{ icon: "calculate", label: "Fórmulas y Nomogramas" }, { icon: "speed", label: "Velocidad de Onda" }],
    action: { icon: "download", label: "Descargar PDF" },
  },
  {
    id: "protocolo-ensayos-en124",
    category: "fichas",
    families: ["marcos"],
    badge: "Certificación y Calidad",
    badgeClass: "bg-success/10 text-success",
    format: "PDF (2.8 MB)",
    code: "MET-ENSAYO-EN124-CL400",
    title: "Protocolo de Ensayos Metrológicos y de Carga NTP-EN 124",
    description: "Procedimientos de ensayo de carga residual, resistencia de bancos de pruebas para marcos D400/E600 y ensayos destructivos ejecutados en laboratorios acreditados INACAL.",
    meta: [{ icon: "verified", label: "INACAL / NTP-EN 124" }, { icon: "assignment_turned_in", label: "Trazabilidad de Lote" }],
    action: { icon: "download", label: "Descargar PDF" },
  },
];

export const CATEGORY_TABS: readonly { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Todos los documentos" },
  { value: "catalogos", label: "Catálogos Generales" },
  { value: "fichas", label: "Fichas Técnicas" },
  { value: "manuales", label: "Manuales de Montaje" },
  { value: "planos", label: "Planos CAD / DWG" },
];

export const FAMILY_TABS: readonly { value: FamilyFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "valvulas", label: "Válvulas" },
  { value: "tuberias", label: "Tuberías" },
  { value: "marcos", label: "Marcos y Tapas" },
];

export type ResourceFilters = { q: string; cat: CategoryFilter; fam: FamilyFilter };
export const DEFAULT_FILTERS: ResourceFilters = { q: "", cat: "all", fam: "all" };

export const normalizeText = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Texto indexado de una tarjeta (equivale al `innerText` de la tarjeta original). */
export const searchTextOf = (item: ResourceItem): string =>
  normalizeText([item.badge, item.format, item.code, item.title, item.description, item.meta[0].label, item.meta[1].label, item.action.label].join(" "));

const INDEX = new Map(RESOURCE_ITEMS.map((item) => [item.id, searchTextOf(item)]));

export function matchesFilters(item: ResourceItem, filters: ResourceFilters, text: string = INDEX.get(item.id) ?? searchTextOf(item)): boolean {
  const q = normalizeText(filters.q);
  const matchesCat = filters.cat === "all" || item.category === filters.cat;
  const matchesFam = filters.fam === "all" || item.families.includes(filters.fam);
  const matchesSearch = !q || text.includes(q);
  return matchesCat && matchesFam && matchesSearch;
}

export const filterResources = (filters: ResourceFilters, items: readonly ResourceItem[] = RESOURCE_ITEMS): ResourceItem[] =>
  items.filter((item) => matchesFilters(item, filters));

export const countByCategory = (cat: CategoryFilter, items: readonly ResourceItem[] = RESOURCE_ITEMS): number =>
  cat === "all" ? items.length : items.filter((i) => i.category === cat).length;

const CATEGORY_VALUES = new Set<string>(CATEGORY_TABS.map((t) => t.value));
const FAMILY_VALUES = new Set<string>(FAMILY_TABS.map((t) => t.value));

/** Normaliza parámetros de URL (`?q=&cat=&fam=`): cualquier valor desconocido vuelve al predeterminado. */
export function parseFilters(params: { q?: string | string[]; cat?: string | string[]; fam?: string | string[] }): ResourceFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const cat = first(params.cat);
  const fam = first(params.fam);
  return {
    q: first(params.q).slice(0, 120),
    cat: CATEGORY_VALUES.has(cat) ? (cat as CategoryFilter) : "all",
    fam: FAMILY_VALUES.has(fam) ? (fam as FamilyFilter) : "all",
  };
}

/** Serializa filtros a query string omitiendo valores predeterminados. */
export function filtersToQuery(filters: ResourceFilters): string {
  const sp = new URLSearchParams();
  if (filters.q.trim()) sp.set("q", filters.q.trim());
  if (filters.cat !== "all") sp.set("cat", filters.cat);
  if (filters.fam !== "all") sp.set("fam", filters.fam);
  return sp.toString();
}
