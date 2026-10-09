/**
 * Datos del producto precargado de la cotización W17 (`/cotizar?producto=<slug>`).
 * El producto "valvula-compuerta" reproduce el diseño de Stitch; los otros tres siguen la misma estructura
 * con los datos de sus fichas técnicas en el sitio (W07, W08, W09). SKU, normas, homologaciones y plazos
 * son contenido de diseño NO verificado: FUNDIGSAC debe validarlos antes de publicar.
 */
export const QUOTE_PRODUCT_SLUGS = ["valvula-compuerta", "valvula-mariposa", "tuberia-tyton", "marco-tapa-d400"] as const;
export type QuoteProductSlug = (typeof QUOTE_PRODUCT_SLUGS)[number];

export type QuoteAddon = { value: string; label: string; tag: string; description: string; defaultChecked?: boolean };

export type QuoteProduct = {
  slug: QuoteProductSlug;
  sku: string;
  /** Texto corto para migas de pan. */
  shortName: string;
  category: { name: string; href: string };
  productHref: string;
  /** Sello del encabezado de la tarjeta. */
  badge: string;
  image: { src: string; alt: string };
  material: string;
  title: string;
  summary: string;
  /** Etiqueta usada en el aviso de ingeniería ("este diámetro DN 150"). */
  sizeLabel: string;
  specs: readonly (readonly [string, string])[];
  documents: readonly string[];
  addonsQuestion: string;
  addons: readonly QuoteAddon[];
  units: readonly { value: string; label: string }[];
};

const UNITS = [
  { value: "und", label: "Unidades (UND) - Estándar de Expediente" },
  { value: "juego", label: "Juego completo con contrabridas" },
  { value: "lote", label: "Lote por frente de trabajo" },
] as const;

export const QUOTE_PRODUCTS: Record<QuoteProductSlug, QuoteProduct> = {
  "valvula-compuerta": {
    slug: "valvula-compuerta",
    sku: "VCP-F4-150",
    shortName: "Válvula Compuerta F4",
    category: { name: "Válvulas de Hierro Dúctil", href: "/productos/valvulas" },
    productHref: "/productos/valvulas/valvula-compuerta",
    badge: "Homologado SEDAPAL / OTASS",
    image: { src: "/images/stitch/9647c88ae7.jpg", alt: "Válvula de compuerta de hierro dúctil DN 150 PN 16 con recubrimiento epóxico azul y volante" },
    material: "Hierro Dúctil GGG-50 / EN-GJS-500-7",
    title: "Válvula de Compuerta Bridada con Asiento Elástico F4 PN 16",
    summary: "Cierre estanco bidireccional mediante cuña vulcanizada y paso recto total sin retención de sedimentos.",
    sizeLabel: "DN 150",
    specs: [
      ["Diámetro Nominal (DN)", 'DN 150 (6")'],
      ["Presión de Trabajo (PN)", "PN 16 bar"],
      ["Longitud entre caras", "DIN 3202 F4 (210 mm)"],
      ["Perforación de Bridas", "ISO 7005-2 / EN 1092-2"],
      ["Recubrimiento Sanitario", "Epoxi FBE Azul ≥ 250 µm"],
      ["Elastómero de Cuña", "EPDM grado potable (WRAS)"],
    ],
    documents: ["Certificado 3.1 EN 10204", "Prueba Hidrostática EN 12266-1", "Ficha Técnica Oficial"],
    addonsQuestion: "¿Requiere accesorios de montaje complementarios para DN 150 PN 16?",
    addons: [
      { value: "desmontaje", label: "Unión de Desmontaje Autoportante F2 / PN 16 (DN 150)", tag: "Recomendado", description: "Tirantes de acero cincado y cuerpo en hierro dúctil para fácil extracción en cámara.", defaultChecked: true },
      { value: "adaptador", label: "Brida Adaptadora Universal de Amplio Rango (DN 150)", tag: "Opcional", description: "Para empalme directo a tuberías existentes de PVC-O, HDPE o Asbesto Cemento." },
      { value: "pernos", label: "Kit de Pernos Grado 8.8 Galvanizados + Empaquetaduras EPDM con alma de acero", tag: "Set de 8 pernos/brida", description: "Dimensiones estandarizadas M20 x 80mm para brida ISO PN 16.", defaultChecked: true },
    ],
    units: UNITS,
  },
  "valvula-mariposa": {
    slug: "valvula-mariposa",
    sku: "VMA-EX-DN200",
    shortName: "Válvula Mariposa Excéntrica",
    category: { name: "Válvulas de Hierro Dúctil", href: "/productos/valvulas" },
    productHref: "/productos/valvulas/valvula-mariposa",
    badge: "SEDAPAL Homologado",
    image: { src: "/images/stitch/85ae6c87ca.jpg", alt: "Válvula mariposa doble excéntrica de hierro dúctil con caja reductora manual y recubrimiento epóxico azul" },
    material: "Hierro Dúctil · Disco AISI 316",
    title: "Válvula Mariposa Excéntrica con Caja Reductora Manual",
    summary: "Doble excentricidad de bajo torque hidrodinámico, disco perfilado de mínima pérdida de carga y anillo de asiento sustituible.",
    sizeLabel: "DN 200",
    specs: [
      ["Diámetro Nominal (DN)", 'DN 200 (8")'],
      ["Presión de Trabajo (PN)", "PN 10 / PN 16 / PN 25"],
      ["Longitud entre caras", "ISO 5752 Serie 20"],
      ["Perforación de Bridas", "EN 1092-2"],
      ["Disco", "Acero inoxidable AISI 316"],
      ["Accionamiento", "Caja reductora IP68 (brida ISO 5211)"],
    ],
    documents: ["Certificado 3.1 EN 10204", "Prueba Hidrostática EN 12266-1", "Ficha Técnica Oficial"],
    addonsQuestion: "¿Requiere accesorios de montaje complementarios para DN 200?",
    addons: [
      { value: "desmontaje", label: "Unión de Desmontaje Autoportante / PN 16 (DN 200)", tag: "Recomendado", description: "Tirantes de acero cincado y cuerpo en hierro dúctil para fácil extracción en cámara.", defaultChecked: true },
      { value: "contrabridas", label: "Contrabridas con Kit de Pernos Galvanizados y Empaquetaduras EPDM", tag: "Recomendado", description: "Para conexión a la red según perforación EN 1092-2.", defaultChecked: true },
      { value: "actuador", label: "Actuador Eléctrico con Brida ISO 5211", tag: "Opcional", description: "Para operación remota; se define con el área de ingeniería según el diámetro." },
    ],
    units: UNITS,
  },
  "tuberia-tyton": {
    slug: "tuberia-tyton",
    sku: "TUB-TYT-C40",
    shortName: "Tubería Tyton C40 / K9",
    category: { name: "Tuberías de Hierro Dúctil", href: "/productos/tuberias" },
    productHref: "/productos/tuberias/tuberia-tyton",
    badge: "NTP ISO 2531:2020",
    image: { src: "/images/stitch/b018bc2b92.jpg", alt: "Corte técnico de un tubo de hierro dúctil con campana de junta Tyton y revestimiento interior de mortero" },
    material: "Hierro Dúctil Centrifugado · Clase C40",
    title: "Tubería de Hierro Dúctil Junta Flexible Tyton Clase C40",
    summary: "Tubos centrifugados de 6.00 m de longitud útil con junta de empuje flexible que absorbe deflexiones y asentamientos del terreno.",
    sizeLabel: "DN 200",
    specs: [
      ["Diámetro Nominal (DN)", "DN 200 mm"],
      ["Clase de presión", "C40 / K9"],
      ["Longitud útil", "6.00 m (ISO 2531)"],
      ["Tipo de junta", "Flexible Tyton (elastómero EPDM)"],
      ["Revestimiento exterior", "Cinc 200 g/m² + capa bituminosa"],
      ["Prueba hidrostática", "100% de los tubos en fábrica"],
    ],
    documents: ["Certificado de Calidad por Lote", "Prueba Hidrostática Unitaria", "Ficha Técnica Oficial"],
    addonsQuestion: "¿Requiere accesorios complementarios para tubería DN 200?",
    addons: [
      { value: "juntas", label: "Juntas Tyton de Repuesto (DN 200)", tag: "Recomendado", description: "Anillos de elastómero para montaje y reposiciones en zanja.", defaultChecked: true },
      { value: "accesorios", label: "Codos y Tees de Campana para Cambios de Dirección (DN 200)", tag: "Opcional", description: "Accesorios de hierro dúctil compatibles con la junta Tyton." },
      { value: "manguitos", label: "Manguitos Adaptadores Universales (DN 200)", tag: "Opcional", description: "Para transiciones a tuberías existentes de otros materiales." },
    ],
    units: [
      { value: "und", label: "Tubos (UND de 6.00 m) - Estándar de Expediente" },
      { value: "ml", label: "Metros lineales (ml)" },
      { value: "lote", label: "Lote por frente de trabajo" },
    ],
  },
  "marco-tapa-d400": {
    slug: "marco-tapa-d400",
    sku: "MAR-D4-600",
    shortName: "Marco y Tapa D400",
    category: { name: "Marcos y Tapas de Calzada", href: "/productos/marcos-y-tapas" },
    productHref: "/productos/marcos-y-tapas/marco-tapa-d400",
    badge: "EN 124 · Clase D400",
    image: { src: "/images/stitch/245160faac.jpg", alt: "Marco y tapa articulada circular de hierro dúctil clase D400 para calzada" },
    material: "Hierro Dúctil ASTM A536 / GGG-50",
    title: "Marco y Tapa Articulada Circular Ø 600 mm Clase D400",
    summary: "Dispositivo de cubrimiento y cierre para tráfico pesado con bisagra, bloqueo de seguridad y junta antirruido.",
    sizeLabel: "Ø 600 mm",
    specs: [
      ["Diámetro de paso", "Ø 600 mm (DN 600)"],
      ["Clase de carga", "D400 (400 kN)"],
      ["Norma", "EN 124"],
      ["Material", "Hierro dúctil ASTM A536 / GGG-50"],
      ["Articulación", "Bisagra con bloqueo a 90°"],
      ["Junta", "Perfil de elastómero antirruido"],
    ],
    documents: ["Certificado de Ensayo EN 124", "Trazabilidad de Lote", "Ficha Técnica Oficial"],
    addonsQuestion: "¿Requiere accesorios complementarios para marco y tapa Ø 600 mm?",
    addons: [
      { value: "pernos-antivandalicos", label: "Pernos Antivandálicos con Cerrojo de Acero Inoxidable", tag: "Recomendado", description: "Para evitar la apertura no autorizada de la tapa.", defaultChecked: true },
      { value: "junta-antirruido", label: "Junta de Elastómero Antirruido de Repuesto", tag: "Opcional", description: "Perfil de asiento para reposición en obra." },
      { value: "anclaje", label: "Kit de Anclaje Periférico para Marco", tag: "Opcional", description: "Detalle mecánico de fijación del marco a la losa o calzada." },
    ],
    units: [
      { value: "und", label: "Juegos marco + tapa (UND) - Estándar de Expediente" },
      { value: "lote", label: "Lote por frente de trabajo" },
    ],
  },
};

export const isQuoteProductSlug = (v: unknown): v is QuoteProductSlug => typeof v === "string" && (QUOTE_PRODUCT_SLUGS as readonly string[]).includes(v);
export const findQuoteProduct = (slug: string | undefined): QuoteProduct | undefined => (isQuoteProductSlug(slug) ? QUOTE_PRODUCTS[slug] : undefined);

/** Dígito verificador del RUC peruano (módulo 11). Sólo valida el formato; no consulta a la SUNAT. */
export function isValidRucChecksum(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(ruc[i]), 0);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(ruc[10]);
}

/** Fecha de hoy (YYYY-MM-DD) en America/Lima, para `min` del campo de fecha. */
export function limaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
