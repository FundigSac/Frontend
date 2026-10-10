/**
 * Dataset de catálogo (DEMO).
 *
 * `demo: true` en todos los registros: son productos derivados de lo que muestran las pantallas de diseño (Stitch)
 * y están PENDIENTES DE APROBACIÓN del cliente. Códigos SKU, rangos DN/PN, normas, homologaciones y
 * disponibilidad son textos de maqueta, no datos verificados de FUNDIGSAC. Cuando el cliente entregue el catálogo
 * oficial, este archivo (o su reemplazo por BD) es el único punto a sustituir.
 *
 * Una misma pieza que aparece en varias pantallas de Stitch (p. ej. la compuerta F4 en inicio, catálogo, categoría y
 * resultados de búsqueda) se modela como UN registro.
 */

export type CatalogCategory = "valvulas" | "tuberias" | "marcos-y-tapas";

export type FamilyId =
  | "compuerta" | "mariposa" | "retencion" | "regulacion" | "ventosa"
  | "tuberia" | "marco-tapa" | "rejilla";

/** Tipo de unión / conexión (taxonomía unificada de W02 y W22). */
export type JointId =
  | "bridada" | "bridada-f4" | "bridada-f5" | "ranurada" | "roscada" | "tyton" | "acerrojada" | "mecanica" | "ninguna";

export type HomologationId = "sedapal" | "otass" | "wras";

export type ResultView = {
  tag: string;
  tagClass: string;
  /** Chip superior derecho de la tarjeta de resultados (texto de maqueta; NO es stock en tiempo real). */
  chip?: string;
  chipDot?: boolean;
  chipClass?: string;
  norm: string;
  title: string;
  summary: string;
  dn: string;
  pn: string;
  hm: { text: string; icon: string; className: string };
};

export type CatalogProduct = {
  id: string;
  sku?: string;
  category: CatalogCategory;
  family: FamilyId;
  name: string;
  summary: string;
  /** Normas mostradas / buscables. */
  standards: string[];
  /** Rango DN [mín, máx] en mm; omitido en piezas sin DN (marcos y tapas se miden por luz libre). */
  dn?: [number, number];
  pn?: number[];
  joint: JointId;
  homologation: HomologationId[];
  material: string;
  image: string;
  imageAlt: string;
  /** Imagen alternativa de la vista de resultados de búsqueda (object-contain en el diseño). */
  resultImage?: string;
  href: string;
  /** Slug para /cotizar?producto=… sólo si existe formulario precargado. */
  quoteSlug?: "valvula-compuerta" | "valvula-mariposa" | "tuberia-tyton" | "marco-tapa-d400";
  /** Tarjeta de catálogo (W02). */
  kicker: string;
  badges: [string, string];
  specs: [string, string][];
  /** Tarjeta de resultados (W22); si falta se deriva de los campos base. */
  result?: ResultView;
  demo: true;
};

export const FAMILY_LABEL: Record<FamilyId, string> = {
  compuerta: "Válvulas de compuerta",
  mariposa: "Válvulas mariposa",
  retencion: "Válvulas de retención",
  regulacion: "Regulación hidráulica y alivio",
  ventosa: "Aire y purga (ventosas)",
  tuberia: "Tuberías de hierro dúctil",
  "marco-tapa": "Marcos y tapas de calzada",
  rejilla: "Rejillas de sumidero",
};

export const CATEGORY_LABEL: Record<CatalogCategory, string> = {
  valvulas: "Válvulas de control y corte",
  tuberias: "Tuberías y juntas mecánicas",
  "marcos-y-tapas": "Marcos y tapas de calzada",
};

const V = "/productos/valvulas";
const T = "/productos/tuberias";
const M = "/productos/marcos-y-tapas";
const hmOk = "text-success font-bold flex items-center gap-1";

export const CATALOG_PRODUCTS: readonly CatalogProduct[] = [
  // ───────────── Válvulas ─────────────
  {
    id: "vcp-f4-01", sku: "VCP-F4-01", category: "valvulas", family: "compuerta",
    name: "Válvula Compuerta Bridada Vástago No Ascendente",
    summary: "Cuerpo corto en hierro dúctil GGG-50, vástago no ascendente en acero inoxidable AISI 420 y cuña vulcanizada en EPDM sanitario.",
    standards: ["EN 1171", "EN 1074", "NTP ISO 7259", "DIN 3202 F4"], dn: [50, 300], pn: [16, 25], joint: "bridada-f4",
    homologation: ["sedapal", "otass"], material: "GGG-50 (EN-GJS-500)",
    image: "/media/valvula-hd/v-01.webp", imageAlt: "Válvula de compuerta bridada de hierro dúctil con recubrimiento epóxico azul",
    resultImage: "/media/valvula-hd/v-01.webp", href: `${V}/valvula-compuerta`, quoteSlug: "valvula-compuerta",
    kicker: "Corte y Aislamiento", badges: ["EN 1171", "EN 1074"],
    specs: [["Rango de Diámetros", "DN 50 – DN 300"], ["Presión Nominal", "PN 16 / PN 25"], ["Material Cuerpo", "GGG-50 (EN-GJS-500)"], ["Recubrimiento", "Epoxi 250 µm RAL 5005"]],
    result: { tag: "SERIE F4 ISO", tagClass: "bg-primary text-brand-on", chip: "Stock Lurín", chipDot: true, chipClass: "bg-surface-container text-success", norm: "NTP ISO 7259", title: "Válvula Compuerta Bridada Serie F4 PN 16", summary: "Cuerpo corto en hierro dúctil GGG-50, vástago no ascendente en acero inoxidable AISI 420 y cuña vulcanizada en EPDM sanitario.", dn: 'DN 50 a DN 300 (2" - 12")', pn: "PN 16 (16 Bar / 232 PSI)", hm: { text: "SEDAPAL / OTASS", icon: "check_circle", className: hmOk } },
    demo: true,
  },
  {
    id: "vcp-f5-02", sku: "VCP-F5-02", category: "valvulas", family: "compuerta",
    name: "Válvula Compuerta Brida Serie F5 Larga PN 16 / PN 25",
    summary: "Longitud entre caras ampliada para reposición en matrices primarias. Doble retén O-Ring y cuña con guía autolubricada.",
    standards: ["DIN 3202 F5", "EN 1171"], dn: [50, 600], pn: [16, 25], joint: "bridada-f5",
    homologation: ["sedapal"], material: "Hierro dúctil GGG-50",
    image: "/media/valvula-hd/v-02.webp", imageAlt: "Válvula de compuerta bridada de serie larga F5",
    href: `${V}/valvula-compuerta`, quoteSlug: "valvula-compuerta",
    kicker: "Corte y Aislamiento", badges: ["DIN 3202 F5", "EN 1171"],
    specs: [["Rango de Diámetros", "DN 50 – DN 600"], ["Presión Nominal", "PN 16 / PN 25"], ["Longitud entre caras", "Serie F5 larga"], ["Sellado de vástago", "Doble retén O-Ring"]],
    result: { tag: "SERIE F5 LARGA", tagClass: "bg-secondary text-brand-on", chip: "Despacho 24h", chipDot: true, chipClass: "bg-surface-container text-success", norm: "DIN 3202 F5", title: "Válvula Compuerta Brida Serie F5 Larga PN 16 / PN 25", summary: "Longitud entre caras ampliada para reposición en matrices primarias. Doble retén O-Ring y cuña con guía autolubricada.", dn: 'DN 50 a DN 600 (2" - 24")', pn: "PN 16 y PN 25 Dual", hm: { text: "SEDAPAL / Gran Minería", icon: "check_circle", className: hmOk } },
    demo: true,
  },
  {
    id: "vcp-br-03", sku: "VCP-BR-03", category: "valvulas", family: "compuerta",
    name: "Válvula con Asiento Elástico y Bonete Roscado",
    summary: "Diseño estanco sin ranura inferior de retención de sedimentos. Paso integral 100% libre de pérdidas de carga hidráulica.",
    standards: ["EN 1074-2"], dn: [80, 200], pn: [16], joint: "bridada-f4",
    homologation: ["sedapal", "otass"], material: "Hierro dúctil",
    image: "/media/valvula-hd/v-03.webp", imageAlt: "Válvula de compuerta de asiento elástico con bonete roscado",
    href: V,
    kicker: "Corte y Aislamiento", badges: ["EN 1074-2", "PN 16"],
    specs: [["Rango de Diámetros", "DN 80 – DN 200"], ["Presión Nominal", "PN 16"], ["Diseño", "Estanco sin ranura inferior"], ["Bonete", "Roscado"]],
    result: { tag: "COMPACTA RED", tagClass: "bg-surface-container-highest text-on-surface-variant", chip: "Stock Lurín", chipDot: true, chipClass: "bg-surface-container text-success", norm: "EN 1074-2", title: "Válvula con Asiento Elástico y Bonete Roscado", summary: "Diseño estanco sin ranura inferior de retención de sedimentos. Paso integral 100% libre de pérdidas de carga hidráulica.", dn: 'DN 80 a DN 200 (3" - 8")', pn: "PN 16 Bar", hm: { text: "SEDAPAL / EPS Grau", icon: "check_circle", className: hmOk } },
    demo: true,
  },
  {
    id: "vcp-dom-04", sku: "VCP-DOM-04", category: "valvulas", family: "compuerta",
    name: "Válvula Compuerta Roscada para Acometida",
    summary: "Especializada para cajas de medidor en vereda y arranques domiciliares. Cuerpo compacto de alta resistencia al aplastamiento vehicular.",
    standards: ["ISO 7/1 BSP"], dn: [25, 50], pn: [16], joint: "roscada",
    homologation: ["sedapal", "otass"], material: "Hierro dúctil",
    image: "/media/valvula-hd/v-04.webp", imageAlt: "Válvula de compuerta roscada para acometida domiciliaria",
    href: V,
    kicker: "Acometidas", badges: ["ISO 7/1 BSP", "PN 16"],
    specs: [["Rango de Diámetros", "DN 25 – DN 50"], ["Presión Nominal", "PN 16"], ["Conexión", "Roscada ISO 7/1 BSP"], ["Aplicación", "Acometida domiciliaria"]],
    result: { tag: "ACOMETIDAS", tagClass: "bg-surface-container-highest text-on-surface-variant", chip: "Alta Rotación", chipDot: true, chipClass: "bg-surface-container text-success", norm: "ISO 7/1 BSP", title: "Válvula Compuerta Roscada para Acometida", summary: "Especializada para cajas de medidor en vereda y arranques domiciliares. Cuerpo compacto de alta resistencia al aplastamiento vehicular.", dn: 'DN 25 a DN 50 (1" - 2")', pn: "PN 16 Bar", hm: { text: "SEDAPAL / Todas EPS", icon: "check_circle", className: hmOk } },
    demo: true,
  },
  {
    id: "vcp-knf-05", sku: "VCP-KNF-05", category: "valvulas", family: "compuerta",
    name: "Válvula Compuerta Cuchilla Guillotina",
    summary: "Pala de corte en acero inoxidable AISI 304/316 para fluidos con sólidos en suspensión, pulpas mineras, relaves y aguas residuales.",
    standards: ["MSS SP-81"], dn: [100, 500], pn: [10, 16], joint: "ranurada",
    homologation: [], material: "Hierro dúctil / pala AISI 304-316",
    image: "/media/valvula-hd/v-05.webp", imageAlt: "Válvula de compuerta tipo cuchilla guillotina para minería y lodos",
    href: V,
    kicker: "Minería y Lodos", badges: ["MSS SP-81", "PN 10 / PN 16"],
    specs: [["Rango de Diámetros", "DN 100 – DN 500"], ["Presión Nominal", "PN 10 / PN 16"], ["Pala de corte", "Acero inox AISI 304/316"], ["Aplicación", "Pulpas, relaves y lodos"]],
    result: { tag: "MINERÍA / LODOS", tagClass: "bg-tertiary-container text-on-tertiary-container", chip: "Fabricación 72h", chipDot: false, chipClass: "bg-surface-container text-on-surface-variant", norm: "MSS SP-81", title: "Válvula Compuerta Cuchilla Guillotina", summary: "Pala de corte en acero inoxidable AISI 304/316 para fluidos con sólidos en suspensión, pulpas mineras, relaves y aguas residuales.", dn: 'DN 100 a DN 500 (4" - 20")', pn: "PN 10 / PN 16", hm: { text: "Minería / PTAR", icon: "military_tech", className: "text-primary font-bold flex items-center gap-1" } },
    demo: true,
  },
  {
    id: "vcp-tel-06", sku: "VCP-TEL-06", category: "valvulas", family: "compuerta",
    name: "Válvula con Extensión Telescópica y Cuadrante",
    summary: "Para enterramiento directo sin cámara de válvulas. Vástago telescópico regulable (1.20m a 2.50m) y dado de accionamiento superficial.",
    standards: ["NTP 350.085"], dn: [80, 400], pn: [16], joint: "bridada-f4",
    homologation: ["sedapal"], material: "Hierro dúctil",
    image: "/media/valvula-hd/v-01.webp", imageAlt: "Válvula de compuerta con extensión telescópica para enterramiento directo",
    href: V,
    kicker: "Enterramiento", badges: ["NTP 350.085", "PN 16"],
    specs: [["Rango de Diámetros", "DN 80 – DN 400"], ["Presión Nominal", "PN 16"], ["Extensión", "Telescópica 1.20 a 2.50 m"], ["Instalación", "Enterramiento directo"]],
    result: { tag: "ENTERRAMIENTO", tagClass: "bg-primary-container text-brand-on", chip: "Kit Completo", chipDot: true, chipClass: "bg-surface-container text-success", norm: "NTP 350.085", title: "Válvula con Extensión Telescópica y Cuadrante", summary: "Para enterramiento directo sin cámara de válvulas. Vástago telescópico regulable (1.20m a 2.50m) y dado de accionamiento superficial.", dn: 'DN 80 a DN 400 (3" - 16")', pn: "PN 16 Bar", hm: { text: "SEDAPAL / Vías Rápidas", icon: "check_circle", className: hmOk } },
    demo: true,
  },
  {
    id: "vma-wf-02", sku: "VMA-WF-02", category: "valvulas", family: "mariposa",
    name: "Válvula Mariposa Excéntrica con Reductor Manual",
    summary: "Válvula mariposa excéntrica bridada de hierro dúctil con caja reductora IP68 y asiento EPDM vulcanizado.",
    standards: ["ISO 5752", "EN 593"], dn: [80, 600], pn: [16, 25], joint: "bridada",
    homologation: [], material: "Hierro dúctil",
    image: "/images/stitch/8f2df4ffc2.jpg", imageAlt: "Válvula mariposa excéntrica con reductor manual y recubrimiento azul",
    href: `${V}/valvula-mariposa`, quoteSlug: "valvula-mariposa",
    kicker: "Regulación y Control", badges: ["ISO 5752", "EN 593"],
    specs: [["Rango de Diámetros", "DN 80 – DN 600"], ["Presión Nominal", "PN 16 (Opción PN 25)"], ["Accionamiento", "Caja reductora IP68"], ["Asiento de Cierre", "EPDM vulcanizado / Inox"]],
    demo: true,
  },
  {
    id: "vma-wafer", category: "valvulas", family: "mariposa",
    name: "Válvula Mariposa Tipo Wafer",
    summary: "Diseño de montaje entre bridas con reductor de tornillo sinfín de alto torque. Disco en fundición dúctil cromada y asiento vulcanizado en EPDM apto para agua potable.",
    standards: ["EN 593", "ISO 5752"], dn: [50, 1200], pn: [10, 16], joint: "bridada",
    homologation: [], material: "Hierro dúctil, disco cromado",
    image: "/images/stitch/c2800fd46b.jpg", imageAlt: "Válvula mariposa tipo wafer con reductor de tornillo sinfín",
    href: V,
    kicker: "Regulación y Control", badges: ["EN 593", "ISO 5752"],
    specs: [["Rango de Diámetros", "DN 50 – DN 1200"], ["Presión Nominal", "PN 10 / PN 16"], ["Instalación", "Wafer EN 1092-2 / ANSI"], ["Disco / Eje", "Dúctil cromado / SS 416"]],
    demo: true,
  },
  {
    id: "vch-sw-03", sku: "VCH-SW-03", category: "valvulas", family: "retencion",
    name: "Válvula Check Swing Antirretorno Bridada",
    summary: "Disco basculante totalmente engomado con cierre silencioso. Tapa de registro superior que permite inspección y mantenimiento sin desacoplar de la tubería matriz.",
    standards: ["EN 16767", "EN 1074-3", "DIN 3202"], dn: [50, 400], pn: [16, 25], joint: "bridada",
    homologation: [], material: "Fundición dúctil + EPDM",
    image: "/images/stitch/c28c3c28eb.jpg", imageAlt: "Válvula check swing bridada con brazo y contrapeso",
    href: V,
    kicker: "Protección de Impulsión", badges: ["EN 16767", "EN 1074-3"],
    specs: [["Rango de Diámetros", "DN 50 – DN 400"], ["Presión de Trabajo", "PN 16 / PN 25"], ["Disco / Obturador", "Fundición Dúctil + EPDM"], ["Tipo Contrapeso", "Brazo amortiguador opt."]],
    demo: true,
  },
  {
    id: "vch-dual", category: "valvulas", family: "retencion",
    name: "Válvula Check Flex Doble Clapeta",
    summary: "Retención de respuesta ultrarrápida con resorte central en acero inoxidable AISI 316. Mínima pérdida de carga hidrodinámica y prevención de golpe de ariete.",
    standards: ["API 594", "EN 1074-3"], dn: [50, 800], pn: [16, 25], joint: "bridada",
    homologation: [], material: "Hierro dúctil GGG-50, resorte AISI 316",
    image: "/images/stitch/4ffdfc51b2.jpg", imageAlt: "Válvula check wafer de doble clapeta",
    href: V,
    kicker: "Protección de Impulsión", badges: ["API 594", "EN 1074-3"],
    specs: [["Rango de Diámetros", "DN 50 – DN 800"], ["Presión de Trabajo", "PN 16 / PN 25"], ["Instalación", "Wafer EN 1092-2 / ANSI B16.1"], ["Resorte / Eje", "Inox AISI 316 / Bronce"]],
    demo: true,
  },
  {
    id: "vrp-pl-04", sku: "VRP-PL-04", category: "valvulas", family: "regulacion",
    name: "Válvula Reductora de Presión Piloto Hidráulico",
    summary: "Válvula de diafragma guiada hidrostáticamente que reduce una presión aguas arriba fluctuante a una presión aguas abajo constante preestablecida.",
    standards: ["AWWA C530", "EN 1074-5"], dn: [50, 300], pn: [25], joint: "bridada",
    homologation: [], material: "Hierro dúctil GGG-50, piloto bronce / inox 316",
    image: "/images/stitch/f15c5a8711.jpg", imageAlt: "Válvula reductora de presión con circuito piloto y manómetros",
    href: V,
    kicker: "Gestión Hidráulica", badges: ["AWWA C530", "EN 1074-5"],
    specs: [["Rango de Diámetros", "DN 50 – DN 300"], ["Presión Nominal", "PN 25 (Hasta 25 bar)"], ["Circuito Piloto", "Bronce / Acero Inox 316"], ["Ajuste de Salida", "1.0 a 16.0 bar regulable"]],
    demo: true,
  },
  // ───────────── Tuberías ─────────────
  {
    id: "tub-ty-05", sku: "TUB-TY-05", category: "tuberias", family: "tuberia",
    name: "Tubería Hierro Dúctil Campana Tyton",
    summary: "Tubería de hierro dúctil con junta flexible Tyton para conducción principal de redes de agua potable.",
    standards: ["ISO 2531", "EN 545"], dn: [80, 1000], pn: [40], joint: "tyton",
    homologation: ["wras"], material: "Hierro dúctil, revestimiento interior de mortero de cemento",
    image: "/images/stitch/c49bbc0276.jpg", imageAlt: "Tuberías de hierro dúctil con junta Tyton apiladas en patio",
    href: `${T}/tuberia-tyton`, quoteSlug: "tuberia-tyton",
    kicker: "Conducción Matriz", badges: ["ISO 2531", "EN 545"],
    specs: [["Rango Nominal", "DN 80 – DN 1000"], ["Clase de Presión", "Clase C40 / K9"], ["Revestimiento Int.", "Mortero cemento Portland"], ["Longitud Útil", "5.80 / 6.00 metros"]],
    demo: true,
  },
  {
    id: "tub-ac-06", sku: "TUB-AC-06", category: "tuberias", family: "tuberia",
    name: "Tubería Acerrojada Autoportante Vi",
    summary: "Incorpora insertos de acero inoxidable templado dentro de la junta de elastómero. Elimina la necesidad de dados de concreto para empujes hidráulicos.",
    standards: ["EN 545", "ISO 10804"], dn: [100, 600], pn: [16, 25], joint: "acerrojada",
    homologation: [], material: "Hierro dúctil, junta con insertos de acero inoxidable",
    image: "/images/stitch/8a067ff5f6.jpg", imageAlt: "Junta acerrojada de tubería de hierro dúctil con segmentos de bloqueo",
    href: T,
    kicker: "Unión Antideslizante", badges: ["EN 545", "ISO 10804"],
    specs: [["Rango Nominal", "DN 100 – DN 600"], ["Presión Admisible", "PN 16 / PN 25 sin dados"], ["Deflexión Angular", "Hasta 3° por enchufe"], ["Aplicación", "Terrenos inestables / Sismo"]],
    demo: true,
  },
  {
    id: "tub-k9", category: "tuberias", family: "tuberia",
    name: "Tubería Matriz Clase K9 de Gran Diámetro",
    summary: "Dimensionada con factor de espesor K9 para soportar altas cargas vivas de tránsito pesado, terraplenes profundos y sobrepresiones por golpe de ariete en estaciones de bombeo primario.",
    standards: ["ISO 2531", "EN 545"], dn: [700, 1200], joint: "tyton",
    homologation: [], material: "Hierro dúctil, clase K9",
    image: "/images/stitch/92121f0ce3.jpg", imageAlt: "Tuberías de hierro dúctil de gran diámetro apiladas en patio de obra",
    href: T,
    kicker: "Gran Diámetro", badges: ["ISO 2531", "EN 545"],
    specs: [["Rango Nominal", "DN 700 – DN 1200"], ["Clase de espesor", "K9"], ["Módulo de elasticidad", "170,000 MPa"], ["Aplicación", "Líneas de impulsión y túneles"]],
    demo: true,
  },
  {
    id: "tub-san", category: "tuberias", family: "tuberia",
    name: "Tubería para Alcantarillado e Impulsión",
    summary: "Especificada bajo norma europea EN 598 con revestimiento interior de cemento aluminoso (CAC) para colectores por gravedad y presión de aguas servidas.",
    standards: ["EN 598"], dn: [100, 1000], joint: "tyton",
    homologation: [], material: "Hierro dúctil, revestimiento interior de cemento aluminoso",
    image: "/images/stitch/87e8f763c6.jpg", imageAlt: "Tubería de hierro dúctil para saneamiento con revestimiento de cemento aluminoso",
    href: T,
    kicker: "Saneamiento EN 598", badges: ["EN 598", "CAC"],
    specs: [["Rango Nominal", "DN 100 – DN 1000"], ["Norma", "EN 598 (saneamiento)"], ["Revestimiento Int.", "Cemento aluminoso (CAC)"], ["Identificación exterior", "Epoxi marrón rojizo"]],
    demo: true,
  },
  // ───────────── Marcos y tapas ─────────────
  {
    id: "mar-d4-07", sku: "MAR-D4-07", category: "marcos-y-tapas", family: "marco-tapa",
    name: "Marco y Tapa Articulada D400 Ø 600 mm",
    summary: "Sistema estándar para buzones de alcantarillado: junta perimetral insonorizante y cerrojo elástico de seguridad.",
    standards: ["EN 124 D400", "NTP 350.085", "NTP-EN 124"], joint: "ninguna",
    homologation: [], material: "Hierro dúctil GGG-50 / GS 500-7",
    image: "/images/stitch/d7313151e5.jpg", imageAlt: "Marco y tapa circular articulada de hierro dúctil clase D400",
    href: `${M}/marco-tapa-d400`, quoteSlug: "marco-tapa-d400",
    kicker: "Infraestructura Vial", badges: ["EN 124 D400", "NTP 350.085"],
    specs: [["Capacidad de Carga", "400 kN (40 Toneladas)"], ["Apertura Segura", "Bisagra 110° con bloqueo"], ["Paso Libre", "Ø 600 mm circular"], ["Amortiguación", "Junta EPDM perimetral"]],
    demo: true,
  },
  {
    id: "mar-sq-800", category: "marcos-y-tapas", family: "marco-tapa",
    name: "Conjunto Marco y Tapa Cuadrada 800×800 mm D400",
    summary: "Dimensionada para cámaras de inspección y cajas de válvulas enterradas. Brida perimetral ancha para anclaje sobre losa de concreto armado.",
    standards: ["EN 124 D400", "NTP-EN 124"], joint: "ninguna",
    homologation: [], material: "Hierro dúctil, pintura asfáltica bituminosa",
    image: "/images/stitch/4a8f370f88.jpg", imageAlt: "Marco y tapa cuadrada de hierro dúctil de 800 por 800 mm clase D400",
    href: M,
    kicker: "Infraestructura Vial", badges: ["EN 124 D400", "NTP-EN 124"],
    specs: [["Paso Libre", "800 × 800 mm"], ["Carga de Ensayo", "400 kN (NTP-EN 124)"], ["Acabado", "Pintura asfáltica bituminosa"], ["Aplicación", "Cámaras y cajas de válvulas"]],
    demo: true,
  },
  {
    id: "mar-c250-estanca", category: "marcos-y-tapas", family: "marco-tapa",
    name: "Tapa de Registro Hermética Estanco C250",
    summary: "Pernos de acero inoxidable y junta tórica de neopreno continua. Previene la emanación de gases sulfhídricos (H₂S), olores cloacales y el ingreso de aguas superficiales.",
    standards: ["EN 124 C250", "NTP-EN 124"], joint: "ninguna",
    homologation: [], material: "Hierro dúctil, pernos AISI 316",
    image: "/images/stitch/dd14ede5c2.jpg", imageAlt: "Tapa de registro hermética de hierro dúctil clase C250 con pernos",
    href: M,
    kicker: "Registro Hermético", badges: ["EN 124 C250", "NTP-EN 124"],
    specs: [["Hermeticidad", "Líquidos y gases (1.0 bar)"], ["Fijación", "4 a 6 pernos AISI 316"], ["Clase de carga", "C 250 (250 kN)"], ["Aplicación", "PTAR y galerías subterráneas"]],
    demo: true,
  },
  {
    id: "rej-ab-08", sku: "REJ-AB-08", category: "marcos-y-tapas", family: "rejilla",
    name: "Rejilla de Sumidero Calzada Abatible",
    summary: "Perfil hidráulico con ranuras orientadas a favor de la pendiente de cuneta y bisagra antivandálica para mantenimiento y descolmatación.",
    standards: ["EN 124 D400", "SEDAPAL AP-02"], joint: "ninguna",
    homologation: ["sedapal"], material: "Hierro dúctil, pintura bituminosa negra",
    image: "/images/stitch/039f77948c.jpg", imageAlt: "Rejilla de sumidero abatible de hierro dúctil para calzada",
    href: M,
    kicker: "Drenaje Pluvial", badges: ["EN 124 D400", "SEDAPAL AP-02"],
    specs: [["Formato Geométrico", "500 x 400 mm exterior"], ["Área de Absorción", "880 cm² superficie libre"], ["Sistema de Cierre", "Abatimiento antirrobo"], ["Normativa", "Tráfico rodado pesado"]],
    demo: true,
  },
];

export const findCatalogProduct = (id: string) => CATALOG_PRODUCTS.find((p) => p.id === id);

/** Ficha oficial del producto en el sitio, si existe una página propia (no es la categoría). */
export const hasProductPage = (p: CatalogProduct) => p.href.split("/").length > 3;

export const quoteHref = (p: CatalogProduct) => (p.quoteSlug ? `/cotizar?producto=${p.quoteSlug}` : "/cotizar");

export const JOINT_LABEL: Record<JointId, string> = {
  bridada: "Bridada ISO 7005-2",
  "bridada-f4": "Bridada F4 (corta ISO 5752)",
  "bridada-f5": "Bridada F5 (larga DIN 3202)",
  ranurada: "Ranurada / Vitaulic",
  roscada: "Roscada NPT / BSP",
  tyton: "Enchufe campana Tyton",
  acerrojada: "Acerrojada Vi / Restrained",
  mecanica: "Mecánica Gibault / Universal",
  ninguna: "—",
};

export const HOMOLOGATION_LABEL: Record<HomologationId, string> = {
  sedapal: "SEDAPAL (Conforme NT-002)",
  otass: "OTASS / EPS Provincias",
  wras: "Certificación WRAS / ACS Agua Potable",
};
