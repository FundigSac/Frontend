import { products as PRICE_LIST, type Product as PriceListProduct } from "@/lib/catalog";
import { DATASHEETS } from "@/screens/islands/w06-ficha-data";
import { PRICE_LIST_EN, translateSpecLabel, translateSpecValue, translateVariant } from "./public-catalog-en";
import { VALVE_SHEETS, type ValveSheet } from "./valve-sheets";

/**
 * Catálogo público: une en una sola lista lo que el sitio puede afirmar de cada producto.
 *  - Fichas W06: datos de la ficha técnica oficial.
 *  - Fichas de válvulas: lista de precios y fundigsac.com (valve-sheets.ts).
 *  - Lista de precios de marzo de 2026 y tarifarios HDPE y de equipos (lib/catalog).
 *  - Productos del sitio anterior sin datos técnicos validados: se muestran con estado "Por confirmar".
 * No hay precios, stock ni certificaciones: se confirman al cotizar.
 */

export type Localized = { es: string; en: string };

export type FamilySlug = "valvulas" | "tuberias" | "marcos-y-tapas" | "accesorios-hdpe" | "conexiones-y-fittings" | "equipos-termofusion" | "medidores";

export type CatalogStatus = "publicado" | "por-confirmar";

export type CatalogLine = { id: string; label: Localized };

export type CatalogFamily = {
  slug: FamilySlug;
  href: string;
  name: Localized;
  /** Título de la página de familia: lo que es y lo que se hace ahí. */
  title: Localized;
  lead: Localized;
  /** Una frase bajo el nombre de la familia en el índice del catálogo. */
  blurb: Localized;
  lines: readonly CatalogLine[];
  metaTitle: string;
  metaDescription: string;
};

/** Lo que necesita una celda de producto: viaja como prop desde el servidor para no meter la lista en el JavaScript. */
export type CatalogCell = {
  slug: string;
  family: FamilySlug;
  line: string;
  name: Localized;
  note: Localized;
  code?: string;
  range?: string;
  image: string;
  alt: Localized;
  href: string;
  status: CatalogStatus;
  search: string;
};

/** Ficha genérica: todo lo que se conoce del producto, en los dos idiomas. */
export type CatalogSheet = CatalogCell & {
  familyName: Localized;
  familyHref: string;
  technicalName?: Localized;
  paragraphs: { es: readonly string[]; en: readonly string[] };
  features: { es: readonly string[]; en: readonly string[] };
  applications: { es: readonly string[]; en: readonly string[] };
  specs: { es: readonly (readonly [string, string])[]; en: readonly (readonly [string, string])[] };
  variants: { es: readonly string[]; en: readonly string[] };
  sourceNote: Localized;
  indexable: boolean;
  sku?: string;
  related: readonly CatalogCell[];
};

export const FAMILIES: readonly CatalogFamily[] = [
  {
    slug: "valvulas",
    href: "/productos/valvulas",
    name: { es: "Válvulas", en: "Valves" },
    title: { es: "Válvulas", en: "Valves" },
    lead: {
      es: "Válvulas para redes de agua, alcantarillado e infraestructura urbana. Elige el tipo, revisa la ficha y agrega a tu cotización la medida que necesitas.",
      en: "Valves for water networks, sewerage and urban infrastructure. Pick the type, check the data sheet and add the size you need to your quote.",
    },
    blurb: { es: "Compuerta, mariposa, retención, regulación y aire.", en: "Gate, butterfly, check, regulating and air valves." },
    lines: [
      { id: "compuerta", label: { es: "Compuerta", en: "Gate" } },
      { id: "mariposa", label: { es: "Mariposa", en: "Butterfly" } },
      { id: "control", label: { es: "Control", en: "Check" } },
      { id: "reduccion", label: { es: "Regulación", en: "Regulating" } },
      { id: "aire", label: { es: "Aire", en: "Air" } },
    ],
    metaTitle: "Válvulas de hierro dúctil en Perú",
    metaDescription: "Válvulas de compuerta, check, reductoras, de alivio y flotadoras de hierro dúctil. Consulta DN, PN y materiales en cada ficha y solicita tu cotización.",
  },
  {
    slug: "tuberias",
    href: "/productos/tuberias",
    name: { es: "Tuberías", en: "Pipes" },
    title: { es: "Tuberías", en: "Pipes" },
    lead: {
      es: "Tuberías de hierro dúctil, acero SCH-40 y HDPE para redes de agua y alcantarillado. Elige el material, revisa los datos publicados y pide tu cotización.",
      en: "Ductile iron, SCH-40 steel and HDPE pipes for water and sewer networks. Pick the material, check the published data and request your quote.",
    },
    blurb: { es: "Hierro dúctil C40, K9 y K7, acero SCH-40 y HDPE.", en: "Ductile iron C40, K9 and K7, SCH-40 steel and HDPE." },
    lines: [
      { id: "hierro-ductil", label: { es: "Hierro dúctil", en: "Ductile iron" } },
      { id: "acero", label: { es: "Acero SCH-40", en: "SCH-40 steel" } },
      { id: "hdpe", label: { es: "HDPE", en: "HDPE" } },
    ],
    metaTitle: "Tuberías de hierro dúctil C40, K9 y K7",
    metaDescription: "Tubería de hierro dúctil clases C40, K9 y K7 para redes de agua potable y alcantarillado. Consulta diámetros disponibles y solicita tu cotización.",
  },
  {
    slug: "marcos-y-tapas",
    href: "/productos/marcos-y-tapas",
    name: { es: "Marcos y tapas", en: "Frames and covers" },
    title: { es: "Marcos y tapas", en: "Frames and covers" },
    lead: {
      es: "Marcos, tapas y rejillas de hierro para buzones, cámaras y drenaje pluvial. Compara los modelos publicados y agrega a tu cotización el que necesitas.",
      en: "Iron frames, covers and grates for manholes, chambers and storm drainage. Compare the published models and add the one you need to your quote.",
    },
    blurb: { es: "Modelos D400, tapas circulares, marcos y rejillas.", en: "D400 models, round covers, frames and grates." },
    lines: [
      { id: "pesado", label: { es: "Tráfico pesado", en: "Heavy traffic" } },
      { id: "circulares", label: { es: "Tapas circulares", en: "Round covers" } },
      { id: "marcos", label: { es: "Marcos", en: "Frames" } },
      { id: "rejillas", label: { es: "Rejillas", en: "Grates" } },
      { id: "peatonal", label: { es: "Peatonal", en: "Pedestrian" } },
    ],
    metaTitle: "Marcos y tapas de buzón D400 en Perú",
    metaDescription: "Marcos y tapas de buzón clase D400 de 600 mm con uno o dos seguros, para vías y redes de alcantarillado. Compara modelos y solicita tu cotización.",
  },
  {
    slug: "accesorios-hdpe",
    href: "/productos/accesorios-hdpe",
    name: { es: "Accesorios HDPE", en: "HDPE accessories" },
    title: { es: "Accesorios HDPE", en: "HDPE accessories" },
    lead: {
      es: "Codos, tees, reducciones, tapones y flanges de HDPE para unir por termofusión, de 63 a 630 mm. Elige la pieza y agrégala a tu cotización.",
      en: "HDPE elbows, tees, reducers, end caps and flanges for butt-fusion joints, from 63 to 630 mm. Pick the part and add it to your quote.",
    },
    blurb: { es: "Codos, tees, reducciones, tapones y flanges por termofusión.", en: "Butt-fusion elbows, tees, reducers, end caps and flanges." },
    lines: [
      { id: "codos", label: { es: "Codos", en: "Elbows" } },
      { id: "derivaciones", label: { es: "Tees y derivaciones", en: "Tees and branches" } },
      { id: "cierres", label: { es: "Reducciones y tapones", en: "Reducers and end caps" } },
      { id: "bridas", label: { es: "Flanges y bridas", en: "Flanges" } },
    ],
    metaTitle: "Accesorios HDPE de termofusión",
    metaDescription: "Codos, tees, cruces, yees, reducciones, tapones y flanges HDPE para unión por termofusión, SDR11 y SDR17, de 63 a 630 mm. Cotiza en Lima.",
  },
  {
    slug: "conexiones-y-fittings",
    href: "/productos/conexiones-y-fittings",
    name: { es: "Conexiones y fittings", en: "Connections and fittings" },
    title: { es: "Conexiones y fittings", en: "Connections and fittings" },
    lead: {
      es: "Acoples, adaptadores, uniones de desmontaje, juntas, bridas, codos y tees para unir tuberías y equipos. Elige la pieza y agrégala a tu cotización.",
      en: "Couplings, adapters, dismantling joints, flexible joints, flanges, elbows and tees to connect pipes and equipment. Pick the part and add it to your quote.",
    },
    blurb: { es: "Acoples, adaptadores, uniones, juntas, bridas, codos y tees.", en: "Couplings, adapters, joints, flanges, elbows and tees." },
    lines: [
      { id: "acoples", label: { es: "Acoples y adaptadores", en: "Couplings and adapters" } },
      { id: "uniones", label: { es: "Uniones y juntas", en: "Joints" } },
      { id: "bridas", label: { es: "Bridas", en: "Flanges" } },
      { id: "piezas", label: { es: "Codos, tees y yees", en: "Elbows, tees and wyes" } },
    ],
    metaTitle: "Acoples, uniones, bridas y fittings",
    metaDescription: "Acoples, adaptadores brida, uniones de desmontaje, juntas flexibles, bridas ISO y ANSI, codos SCH40, tees y yees bridados. Cotiza en Lima.",
  },
  {
    slug: "equipos-termofusion",
    href: "/productos/equipos-termofusion",
    name: { es: "Equipos de termofusión", en: "Fusion equipment" },
    title: { es: "Equipos de termofusión", en: "Fusion equipment" },
    lead: {
      es: "Máquinas de termofusión y electrofusión para soldar tubería de polietileno. Elige el modelo según el rango de diámetros y pide tu cotización.",
      en: "Butt-fusion and electrofusion machines to weld polyethylene pipe. Pick the model by diameter range and request your quote.",
    },
    blurb: { es: "Termofusión de 40 a 630 mm y electrofusión.", en: "Butt fusion from 40 to 630 mm and electrofusion." },
    lines: [
      { id: "termofusion", label: { es: "Termofusión", en: "Butt fusion" } },
      { id: "electrofusion", label: { es: "Electrofusión", en: "Electrofusion" } },
    ],
    metaTitle: "Máquinas de termofusión y electrofusión",
    metaDescription: "Máquinas de termofusión HDL, HDT, HDY, HDC, SUD y SDP y equipos de electrofusión HDM para soldar tubería de polietileno. Cotiza en Lima.",
  },
  {
    slug: "medidores",
    href: "/productos/medidores",
    name: { es: "Medidores", en: "Meters" },
    title: { es: "Medidores de agua", en: "Water meters" },
    lead: {
      es: "Medidores electromagnéticos y tipo Woltman para redes de agua. Elige el tipo y agrega a tu cotización la medida que necesitas.",
      en: "Electromagnetic and Woltman meters for water networks. Pick the type and add the size you need to your quote.",
    },
    blurb: { es: "Electromagnéticos y tipo Woltman.", en: "Electromagnetic and Woltman meters." },
    lines: [
      { id: "medidores", label: { es: "Medidores", en: "Meters" } },
    ],
    metaTitle: "Medidores de caudal electromagnéticos y Woltman",
    metaDescription: "Medidor electromagnético MELEC de DN50 a DN600 y medidor tipo Woltman MWOL de DN50 a DN300 para redes de agua. Cotiza en Lima.",
  },
];

export const findFamily = (slug: FamilySlug) => FAMILIES.find((f) => f.slug === slug) as CatalogFamily;

const PATH = (family: FamilySlug, slug: string) => `/productos/${family}/${slug}`;

const PRICE_SOURCE: Localized = {
  es: "Datos tomados de la lista de precios de FUNDIGSAC. Algunos valores cambian según el modelo y la medida: el equipo técnico confirma la ficha antes de cotizar.",
  en: "Data taken from the FUNDIGSAC price list. Some values change with the model and size: the technical team confirms the data sheet before quoting.",
};

const SHEET_SOURCE: Localized = {
  es: "Datos tomados de la lista de precios de FUNDIGSAC (marzo de 2026) y de la ficha publicada en fundigsac.com. Algunas características cambian según el modelo y la medida: el equipo técnico confirma la ficha del modelo antes de cotizar.",
  en: "Data taken from the FUNDIGSAC price list (March 2026) and from the sheet published on fundigsac.com. Some features change with the model and size: the technical team confirms the sheet of the model before quoting.",
};

const PENDING_SOURCE: Localized = {
  es: "Este producto aún no tiene una ficha validada por Ingeniería. Lo que falta se indica como «Por confirmar» y el equipo técnico lo completa al cotizar.",
  en: "This product does not have a data sheet validated by Engineering yet. Missing data is marked «To be confirmed» and the technical team completes it when quoting.",
};

const specOf = (p: PriceListProduct, key: string) => p.specs?.find(([k]) => k === key)?.[1];

/** "Válvula mariposa wafer con palanca VMTWP" se muestra sin el código, que va aparte en monoespaciada. */
const withoutCode = (name: string, code?: string) => (code && name.endsWith(` ${code}`) ? name.slice(0, -code.length - 1) : name);

function rangeOf(p: PriceListProduct): string | undefined {
  const labels = (p.variants ?? []).map((v) => v.label);
  const dn = labels.map((l) => /^DN(\d+)/.exec(l)?.[1]).filter(Boolean).map(Number);
  if (dn.length) return `DN${Math.min(...dn)} – DN${Math.max(...dn)}`;
  const span = labels.flatMap((l) => {
    const m = /(\d+)–(\d+) mm/.exec(l);
    return m ? [Number(m[1]), Number(m[2])] : [];
  });
  if (span.length) return `${Math.min(...span)} – ${Math.max(...span)} mm`;
  const mm = labels.map((l) => /^(\d+)(?: × \d+)? mm/.exec(l)?.[1]).filter(Boolean).map(Number);
  if (mm.length) return `${Math.min(...mm)} – ${Math.max(...mm)} mm`;
  const model = specOf(p, "Modelo");
  const size = specOf(p, "Medida");
  return [model, size].filter(Boolean).join(" · ") || undefined;
}

/** A qué familia y línea del catálogo va cada producto de la lista de precios. */
function placeOf(p: PriceListProduct): { family: FamilySlug; line: string } | null {
  const s = p.slug;
  if (p.category === "valvulas") {
    if (s.includes("mariposa")) return { family: "valvulas", line: "mariposa" };
    if (s.includes("check") || s.startsWith("filtro")) return { family: "valvulas", line: "control" };
    if (s.includes("de-aire")) return { family: "valvulas", line: "aire" };
    if (s.includes("reductora") || s.includes("alivio") || s.includes("flotadora") || s.startsWith("pilotos")) return { family: "valvulas", line: "reduccion" };
    return { family: "valvulas", line: "compuerta" };
  }
  if (p.category === "hdpe") {
    if (s.startsWith("codo")) return { family: "accesorios-hdpe", line: "codos" };
    if (s.startsWith("tee") || s.startsWith("cruz") || s.startsWith("yee")) return { family: "accesorios-hdpe", line: "derivaciones" };
    if (s.startsWith("reduccion") || s.startsWith("tapon")) return { family: "accesorios-hdpe", line: "cierres" };
    return { family: "accesorios-hdpe", line: "bridas" };
  }
  if (p.category === "equipos") return { family: "equipos-termofusion", line: s.includes("electrofusion") ? "electrofusion" : "termofusion" };
  if (p.category === "medidores") return { family: "medidores", line: "medidores" };
  if (p.slug === "tuberia-sch40-tsch40") return { family: "tuberias", line: "acero" };
  if (p.category === "acoples") {
    if (s.startsWith("brida")) return { family: "conexiones-y-fittings", line: "bridas" };
    if (s.startsWith("union") || s.startsWith("junta") || s.startsWith("anillo")) return { family: "conexiones-y-fittings", line: "uniones" };
    if (s.startsWith("codo")) return { family: "conexiones-y-fittings", line: "piezas" };
    return { family: "conexiones-y-fittings", line: "acoples" };
  }
  if (p.category === "hierro-ductil") {
    if (s.startsWith("tuberia")) return { family: "tuberias", line: "hierro-ductil" };
    if (s.startsWith("marco")) return { family: "marcos-y-tapas", line: "pesado" };
    return { family: "conexiones-y-fittings", line: "piezas" };
  }
  return null;
}

/** Tienen ficha propia con más datos, o son el mismo producto que otra ficha ya publicada. */
const SKIP_PRICE_LIST = new Set([...VALVE_SHEETS.map((s) => s.slug), "valvula-compuerta-bridada"]);

/** Legacy sin datos: el nombre y la foto del catálogo público anterior, con el dato técnico por confirmar. */
const LEGACY_VALVES = new Set(["valvula-guillotina", "valvula-mariposa-excentrica"]);

const legacyImage = (p: PriceListProduct) => (p.slug === "valvula-guillotina" ? "/media/catalog/compuerta-cuchilla.webp" : p.image);

type PendingSeed = {
  slug: string;
  family: FamilySlug;
  line: string;
  image: string;
  name: Localized;
  note: Localized;
  rows: readonly (readonly [string, string])[];
};

const P_DN: readonly [string, string][] = [["Diámetro nominal", "Diameter"], ["Presión o clase", "Pressure or class"], ["Material", "Material"], ["Norma", "Standard"]];
const P_COVER: readonly [string, string][] = [["Medidas", "Dimensions"], ["Clase de carga", "Load class"], ["Material", "Material"], ["Norma", "Standard"]];

/** Productos del sitio anterior: se conservan su nombre, su foto y su descripción, y lo técnico queda por confirmar. */
const PENDING: readonly PendingSeed[] = [
  { slug: "valvula-mariposa", family: "valvulas", line: "mariposa", image: "/media/valvulas-page/mariposa.webp", name: { es: "Válvula mariposa", en: "Butterfly valve" }, note: { es: "Diseño compacto y de bajo torque para grandes diámetros, para regular o cerrar el flujo.", en: "Compact, low-torque design for large diameters, to regulate or shut off the flow." }, rows: P_DN },
  { slug: "tuberia-tyton", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/union-junta.webp", name: { es: "Tubería de hierro dúctil con junta Tyton", en: "Ductile iron pipe with Tyton joint" }, note: { es: "Unión flexible de campana para redes de agua potable.", en: "Flexible socket joint for drinking water networks." }, rows: P_DN },
  { slug: "tuberia-union-junta", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/union-junta.webp", name: { es: "Tubería con unión junta", en: "Push-on joint pipe" }, note: { es: "Instalación rápida para redes de agua y alcantarillado, con sellado hermético.", en: "Fast installation for water and sewer networks, with a watertight seal." }, rows: P_DN },
  { slug: "tuberia-union-mecanica", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/union-mecanica.webp", name: { es: "Tubería con unión mecánica", en: "Mechanical joint pipe" }, note: { es: "Uniones fáciles de acoplar para proyectos de gran escala.", en: "Easy-to-couple joints for large-scale projects." }, rows: P_DN },
  { slug: "tuberia-con-bridas", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/bridas.webp", name: { es: "Tubería con bridas", en: "Flanged pipe" }, note: { es: "Para conexiones bridadas en sistemas de presión, con montaje rápido.", en: "For flanged connections in pressure systems, with fast assembly." }, rows: P_DN },
  { slug: "tuberia-con-revestimiento", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/revestimiento.webp", name: { es: "Tubería con revestimiento", en: "Lined pipe" }, note: { es: "Protección contra la corrosión en redes de conducción de agua.", en: "Protection against corrosion in water conveyance networks." }, rows: P_DN },
  { slug: "tuberia-mortero-cemento", family: "tuberias", line: "hierro-ductil", image: "/media/tuberias-page/mortero.webp", name: { es: "Tubería con revestimiento de mortero de cemento", en: "Cement mortar lined pipe" }, note: { es: "Protección interna para redes de saneamiento.", en: "Internal protection for sanitation networks." }, rows: P_DN },
  { slug: "tuberia-hdpe", family: "tuberias", line: "hdpe", image: "/media/tuberias-page/hdpe.webp", name: { es: "Tubería HDPE", en: "HDPE pipe" }, note: { es: "Tubería flexible de polietileno para redes de agua.", en: "Flexible polyethylene pipe for water networks." }, rows: P_DN },
  { slug: "marco-tapa-d400", family: "marcos-y-tapas", line: "circulares", image: "/media/marcos-page/tapa-circular.webp", name: { es: "Tapa circular dúctil", en: "Ductile round cover" }, note: { es: "Tapa para tráfico vehicular y uso urbano, con superficie antideslizante.", en: "Cover for vehicle traffic and urban use, with a non-slip surface." }, rows: P_COVER },
  { slug: "marco-y-tapa-clase-d400", family: "marcos-y-tapas", line: "pesado", image: "/media/marcos-page/marco-d400.webp", name: { es: "Marco y tapa clase D400", en: "Class D400 frame and cover" }, note: { es: "Conjunto completo para zonas de alto tráfico.", en: "Complete set for heavy-traffic areas." }, rows: P_COVER },
  { slug: "tapa-para-valvula", family: "marcos-y-tapas", line: "circulares", image: "/media/marcos-page/tapa-valvula.webp", name: { es: "Tapa para válvula", en: "Valve cover" }, note: { es: "Tapa compacta para cámaras de válvulas.", en: "Compact cover for valve chambers." }, rows: P_COVER },
  { slug: "marco-rectangular", family: "marcos-y-tapas", line: "marcos", image: "/media/marcos-page/marco-rectangular.webp", name: { es: "Marco rectangular", en: "Rectangular frame" }, note: { es: "Marcos de hierro dúctil para cámaras de diferentes dimensiones.", en: "Ductile iron frames for chambers of different sizes." }, rows: P_COVER },
  { slug: "rejilla-pluvial", family: "marcos-y-tapas", line: "rejillas", image: "/media/marcos-page/rejilla.webp", name: { es: "Rejilla pluvial", en: "Storm drain grate" }, note: { es: "Captación y drenaje de aguas de lluvia en calzadas y veredas.", en: "Collects and drains rainwater on roads and sidewalks." }, rows: P_COVER },
  { slug: "tapa-de-registro", family: "marcos-y-tapas", line: "peatonal", image: "/media/marcos-page/tapa-registro.webp", name: { es: "Tapa de registro", en: "Inspection cover" }, note: { es: "Para cámaras de inspección de tránsito liviano.", en: "For inspection chambers with light traffic." }, rows: P_COVER },
];

const CONFIRM: Localized = { es: "Por confirmar", en: "To be confirmed" };

/* ---- Fichas W06: la ficha técnica oficial manda ---- */
const W06_CELLS: readonly CatalogCell[] = [
  {
    slug: "valvula-compuerta", family: "valvulas", line: "compuerta", href: PATH("valvulas", "valvula-compuerta"),
    name: { es: "Válvula de compuerta bridada", en: "Flanged gate valve" },
    note: { es: "Cierre elástico con extremos bridados, paso completo y baja pérdida de carga para redes de agua.", en: "Resilient seat with flanged ends, full bore and low head loss for water networks." },
    code: "H-ITALY", range: DATASHEETS.base.sizeRange, image: "/media/valvula-hd/v-01.webp", alt: { es: "Válvula de compuerta azul", en: "Blue gate valve" }, status: "publicado",
    search: "valvula compuerta bridada h-italy hierro ductil cierre agua en1074 gate valve flanged pn10 pn16",
  },
  {
    slug: "valvula-compuerta-fundigsac", family: "valvulas", line: "compuerta", href: PATH("valvulas", "valvula-compuerta-fundigsac"),
    name: { es: "Válvula de compuerta FUNDIGSAC", en: "FUNDIGSAC gate valve" },
    note: { es: "Asiento resiliente, diseño DIN 3352 F4 y extremos bridados. Marca FUNDIGSAC.", en: "Resilient seat, DIN 3352 F4 design and flanged ends. FUNDIGSAC brand." },
    code: "FUNDIGSAC", range: DATASHEETS.fundigsac.sizeRange, image: "/media/valvula-fundigsac/f-07.webp", alt: { es: "Válvula de compuerta azul FUNDIGSAC con el logotipo en relieve", en: "Blue FUNDIGSAC gate valve with the embossed logo" }, status: "publicado",
    search: "valvula compuerta fundigsac bridada din 3352 f4 hierro ductil ggg50 gate valve pn10 pn16",
  },
  {
    slug: "valvula-compuerta-fundigsac-garantia-extendida", family: "valvulas", line: "compuerta", href: PATH("valvulas", "valvula-compuerta-fundigsac-garantia-extendida"),
    name: { es: "Válvula de compuerta FUNDIGSAC", en: "FUNDIGSAC gate valve" },
    note: { es: "Garantía extendida. Cierre elástico con extremos bridados, con volante o dado.", en: "Extended warranty. Resilient seat with flanged ends, with handwheel or operating cap." },
    code: "FUNDIGSAC", range: DATASHEETS.extendida.sizeRange, image: "/media/valvula-fundigsac-cuadrante/g-01.webp", alt: { es: "Válvula de compuerta azul FUNDIGSAC con cuadrante de maniobra", en: "Blue FUNDIGSAC gate valve with operating cap" }, status: "publicado",
    search: "valvula compuerta fundigsac garantia extendida cuadrante dado volante hierro ductil gate valve extended warranty",
  },
];

const normal = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function sheetCell(s: ValveSheet): CatalogCell {
  const line = s.slug.includes("check") ? "control" : s.slug.includes("reductora") || s.slug.includes("alivio") || s.slug.includes("flotadora") ? "reduccion" : "compuerta";
  return {
    slug: s.slug, family: "valvulas", line, href: PATH("valvulas", s.slug),
    name: { es: s.es.name, en: s.en.name }, note: { es: s.es.lead, en: s.en.lead },
    code: s.code, range: s.range, image: s.image, alt: { es: s.es.imageAlt, en: s.en.imageAlt }, status: "publicado",
    search: normal([s.es.name, s.en.name, s.es.technicalName, s.en.technicalName, s.code, s.range, s.es.lead, s.en.lead].join(" ")),
  };
}

function priceCell(p: PriceListProduct): CatalogCell | null {
  const place = placeOf(p);
  const image = legacyImage(p);
  if (!place || !image) return null;
  const code = specOf(p, "Código");
  const en = PRICE_LIST_EN[p.slug];
  const nameEs = withoutCode(p.name, code);
  const nameEn = en ? withoutCode(en[0], code) : nameEs;
  const pending = LEGACY_VALVES.has(p.slug);
  return {
    slug: p.slug, ...place, href: PATH(place.family, p.slug),
    name: { es: nameEs, en: nameEn }, note: { es: p.summary, en: en?.[1] ?? p.summary },
    code, range: rangeOf(p), image, alt: { es: nameEs, en: nameEn }, status: pending ? "por-confirmar" : "publicado",
    search: normal([nameEs, nameEn, code ?? "", p.summary, en?.[1] ?? "", ...(p.variants ?? []).map((v) => v.label), ...(p.specs ?? []).map(([, v]) => v)].join(" ")),
  };
}

function pendingCell(p: PendingSeed): CatalogCell {
  return {
    slug: p.slug, family: p.family, line: p.line, href: PATH(p.family, p.slug), name: p.name, note: p.note, image: p.image, alt: p.name, status: "por-confirmar",
    search: normal([p.name.es, p.name.en, p.note.es, p.note.en].join(" ")),
  };
}

const PRICE_LIST_VISIBLE = PRICE_LIST.filter((p) => !SKIP_PRICE_LIST.has(p.slug));

/** Orden: primero lo que tiene datos publicados, y dentro de cada familia las fichas más completas. */
export const CATALOG_CELLS: readonly CatalogCell[] = [
  ...W06_CELLS,
  ...VALVE_SHEETS.map(sheetCell),
  ...PRICE_LIST_VISIBLE.map(priceCell).filter((c): c is CatalogCell => c !== null),
  ...PENDING.map(pendingCell),
].sort((a, b) => FAMILIES.findIndex((f) => f.slug === a.family) - FAMILIES.findIndex((f) => f.slug === b.family) || Number(a.status === "por-confirmar") - Number(b.status === "por-confirmar"));

export const cellsOfFamily = (family: FamilySlug) => CATALOG_CELLS.filter((c) => c.family === family);
export const cellBySlug = (slug: string) => CATALOG_CELLS.find((c) => c.slug === slug);

/** Otros productos de la misma línea o, si no alcanzan, de la misma familia. */
function relatedCells(cell: CatalogCell, slugs?: readonly string[]): CatalogCell[] {
  const picked = (slugs ?? []).map(cellBySlug).filter((c): c is CatalogCell => Boolean(c));
  const sameLine = CATALOG_CELLS.filter((c) => c.family === cell.family && c.line === cell.line && c.slug !== cell.slug);
  const sameFamily = CATALOG_CELLS.filter((c) => c.family === cell.family && c.slug !== cell.slug);
  const pool = [...picked, ...sameLine.filter((c) => c.status === "publicado"), ...sameFamily.filter((c) => c.status === "publicado"), ...sameFamily];
  return [...new Map(pool.map((c) => [c.slug, c])).values()].slice(0, 4);
}

function familyFields(family: FamilySlug) {
  const f = findFamily(family);
  return { familyName: f.name, familyHref: f.href };
}

function fromValveSheet(s: ValveSheet): CatalogSheet {
  const cell = sheetCell(s);
  return {
    ...cell, ...familyFields("valvulas"),
    technicalName: { es: s.es.technicalName, en: s.en.technicalName },
    paragraphs: { es: s.es.paragraphs, en: s.en.paragraphs },
    features: { es: s.es.features, en: s.en.features },
    applications: { es: s.es.applications, en: s.en.applications },
    specs: { es: s.es.specs, en: s.en.specs },
    variants: { es: [], en: [] },
    sourceNote: SHEET_SOURCE,
    indexable: true,
    sku: s.code,
    related: relatedCells(cell, s.related),
  };
}

function fromPriceList(p: PriceListProduct, cell: CatalogCell): CatalogSheet {
  const specsEs = (p.specs ?? []).map(([k, v]) => [k, v.replace(/\s*\(el documento[^)]*\)/, "")] as const);
  const specsEn = specsEs.map(([k, v]) => [translateSpecLabel(k), translateSpecValue(v)] as const);
  const variantsEs = (p.variants ?? []).map((v) => (v.sdr ? `${v.label} · ${v.sdr}` : v.label));
  const pending = LEGACY_VALVES.has(p.slug);
  const pendingRows = (rows: readonly (readonly [string, string])[]) => ({ es: rows.map(([a]) => [a, CONFIRM.es] as const), en: rows.map(([, b]) => [b, CONFIRM.en] as const) });
  return {
    ...cell, ...familyFields(cell.family),
    paragraphs: { es: [], en: [] }, features: { es: [], en: [] }, applications: { es: [], en: [] },
    specs: pending ? pendingRows(P_DN) : { es: specsEs, en: specsEn },
    variants: { es: variantsEs, en: variantsEs.map(translateVariant) },
    sourceNote: pending ? PENDING_SOURCE : PRICE_SOURCE,
    indexable: !pending,
    sku: cell.code,
    related: relatedCells(cell),
  };
}

function fromPending(p: PendingSeed): CatalogSheet {
  const cell = pendingCell(p);
  return {
    ...cell, ...familyFields(p.family),
    paragraphs: { es: [], en: [] }, features: { es: [], en: [] }, applications: { es: [], en: [] },
    specs: { es: p.rows.map(([a]) => [a, CONFIRM.es] as const), en: p.rows.map(([, b]) => [b, CONFIRM.en] as const) },
    variants: { es: [], en: [] },
    sourceNote: PENDING_SOURCE,
    indexable: false,
    related: relatedCells(cell),
  };
}

/** Ficha genérica de un producto; las tres compuertas W06 tienen pantalla propia y no pasan por aquí. */
export function findCatalogSheet(slug: string): CatalogSheet | undefined {
  const sheet = VALVE_SHEETS.find((s) => s.slug === slug);
  if (sheet) return fromValveSheet(sheet);
  const pending = PENDING.find((p) => p.slug === slug);
  if (pending) return fromPending(pending);
  const p = PRICE_LIST_VISIBLE.find((x) => x.slug === slug);
  const cell = p && priceCell(p);
  return p && cell ? fromPriceList(p, cell) : undefined;
}

/** Fichas genéricas para el registro de rutas (nombre, descripción y datos estructurados). */
/** Meta descripción de una ficha de la lista de precios: nombre, medidas y uso, sin añadir datos que la ficha no tenga. */
function routeDescription(cell: CatalogCell) {
  const head = [cell.name.es, cell.range].filter(Boolean).join(", ");
  const note = cell.note.es.trim().replace(/\.?$/, ".");
  const text = `${head}. ${note}`;
  const closings = [" Consulta medidas y solicita tu cotización a FUNDIGSAC en Lima.", " Solicita tu cotización a FUNDIGSAC en Lima.", " Cotiza en Lima."];
  const closing = closings.find((c) => text.length + c.length <= 158);
  return closing ? text + closing : text.slice(0, 157).replace(/\s+\S*$/, "") + "…";
}

export const CATALOG_ROUTES = [
  ...PENDING.map((p) => ({ family: p.family, slug: p.slug, name: p.name.es, description: p.note.es, image: p.image, indexable: false as const, sku: undefined })),
  ...PRICE_LIST_VISIBLE.flatMap((p) => {
    const cell = priceCell(p);
    if (!cell) return [];
    return [{ family: cell.family, slug: cell.slug, name: cell.name.es, description: routeDescription(cell), image: cell.image, indexable: LEGACY_VALVES.has(p.slug) ? (false as const) : undefined, sku: cell.code }];
  }),
];

/** Tabla comparativa con los datos publicados de una familia, solo donde hay cifras validadas. */
export type CompareTable = { head: Localized[]; rows: { name: Localized; href: string; cells: string[] }[] };

const CODE_HEAD: Localized = { es: "Código", en: "Code" };

const COMPARE: Partial<Record<FamilySlug, { head: Localized[]; keys: string[]; slugs: string[] }>> = {
  "marcos-y-tapas": {
    head: [CODE_HEAD, { es: "Modelo", en: "Model" }, { es: "Medida", en: "Size" }, { es: "Peso", en: "Weight" }, { es: "Seguros", en: "Locks" }],
    keys: ["Código", "Modelo", "Medida", "Peso", "Seguros"],
    slugs: ["marco-y-tapa-pesada-2seg", "marco-y-tapa-liviana-1seg"],
  },
  tuberias: {
    head: [CODE_HEAD, { es: "Clases o serie", en: "Classes or series" }, { es: "Normas", en: "Standards" }, { es: "Rango", en: "Range" }],
    keys: ["Código", "Clases|Serie", "Normas", "Rango publicado|Rango nominal"],
    slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "tuberia-sch40-tsch40"],
  },
};

export function compareTable(family: FamilySlug): CompareTable | undefined {
  const config = COMPARE[family];
  if (!config) return undefined;
  const rows = config.slugs.flatMap((slug) => {
    const p = PRICE_LIST.find((x) => x.slug === slug);
    const cell = cellBySlug(slug);
    if (!p || !cell) return [];
    const cells = config.keys.map((key) => {
      const found = key.split("|").map((k) => specOf(p, k)).find(Boolean);
      return found ? found.replace(/\s*\(el documento[^)]*\)/, "") : CONFIRM.es;
    });
    return [{ name: cell.name, href: cell.href, cells }];
  });
  return rows.length ? { head: config.head, rows } : undefined;
}

/** Documentos publicados de cada familia: solo archivos que existen en /public/docs. */
export type CatalogDocument = { name: Localized; format: string; href: string };

const FAMILY_DOCUMENTS: Partial<Record<FamilySlug, readonly CatalogDocument[]>> = {
  valvulas: [
    { name: { es: "Ficha técnica · Válvula de compuerta bridada FT-HI-100", en: "Data sheet · Flanged gate valve FT-HI-100" }, format: "PDF", href: "/docs/ficha-tecnica-valvula-compuerta-bridada.pdf" },
    { name: { es: "Ficha técnica · Válvula de compuerta FUNDIGSAC", en: "Data sheet · FUNDIGSAC gate valve" }, format: "PDF", href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf" },
    { name: { es: "Flyer · Válvula FUNDIGSAC con volante", en: "Flyer · FUNDIGSAC valve with handwheel" }, format: "PDF", href: "/docs/flyer-valvula-compuerta-fundigsac-volante.pdf" },
    { name: { es: "Flyer · Válvula FUNDIGSAC con dado", en: "Flyer · FUNDIGSAC valve with operating cap" }, format: "PDF", href: "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf" },
  ],
};

export const familyDocuments = (family: FamilySlug) => FAMILY_DOCUMENTS[family] ?? [];
