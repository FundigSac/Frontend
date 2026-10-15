/**
 * Datos técnicos de las fichas de válvula de compuerta, por variante.
 * - base: H-ITALY, ficha FT-HI-100 Rev. 13.
 * - fundigsac: FUNDIGSAC con volante, ficha técnica FUNDIGSAC (H-ITALY, DIN 3352 F4, 1 año).
 * - extendida: FUNDIGSAC con garantía extendida, ficha FT-HD N° 002-2024.
 * Medidas en milímetros. Los valores se transcriben de cada ficha; "-" indica un dato ausente o ilegible.
 */

export type Cell = string | number | null;
export type DimTable = { note: string; head: string[]; rows: { dn: string; cells: Cell[] }[] };
export type PnTable = { title: string; note: string; head: string[]; rows: (dn: string) => { pn: string; cells: Cell[] }[] };
export type Doc = { title: string; meta: string; href: string; pages: { src: string; alt: string }[] };
export type Feature = { icon: "shield" | "settings" | "layers" | "nut"; title: string; text: string };

export type Datasheet = {
  lead: string;
  /** Párrafo de la sección Descripción; si falta, se usa el texto general de válvulas de compuerta. */
  description?: string;
  facts: [string, string][];
  sizes: string[];
  sizeRange: string;
  specs: [string, string][];
  specsNote: string;
  dims: DimTable;
  flange: PnTable;
  stem?: PnTable;
  features: Feature[];
  doc: Doc | null;
  badges: string[];
  model3d: { src: string; alt: string };
};

const dash = (v: Cell) => (v === null || v === undefined ? "-" : v);

// ---------- Base H-ITALY · FT-HI-100 Rev. 13 (idénticos a FT-HD N° 002-2024 salvo DN60/65 y BS5163) ----------
const DN14 = ["DN40", "DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN500", "DN600"];
const L_F4 = [140, 150, 170, 180, 190, 200, 210, 230, 250, 270, 290, 310, 350, 390];
const L_F5 = [240, 250, 270, 280, 300, 325, 350, 400, 450, 500, null, 600, 700, 800];
const L_BS5163 = [null, 178, 190, 203, 229, 254, 267, 292, 330, 356, 381, 406, 457, 608];
const H = [220, 230, 265, 290, 335, 380, 415, 510, 600, 690, 790, 855, 1020, 1180];
const HANDWHEEL = [180, 180, 200, 200, 250, 250, 300, 300, 500, 500, 600, 600, 600, 600];
const FLANGE = {
  PN10: {
    A: [150, 165, 185, 200, 220, 250, 285, 340, 400, 455, 505, 565, 670, 780],
    B: ["110", "125", "135/145", "160", "180", "210", "240", "295", "350", "400", "460", "515", "620", "725"],
    C: [84, 99, 118, 132, 156, 184, 211, 266, 319, 370, 429, 480, 582, 682],
    E: [16, 16, 16, 16, 16, 16, 16, 17, 19, 20.5, 20.5, 20.5, 22.5, 25],
    S: [3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5],
    n: [4, 4, 4, 8, 8, 8, 8, 8, 12, 12, 16, 16, 20, 20],
    b: [19, 19, 19, 19, 19, 19, 23, 23, 23, 23, 23, 28, 28, 31],
  },
  PN16: {
    A: [150, 165, 185, 200, 220, 250, 285, 340, 400, 455, 520, 580, 715, 840],
    B: ["110", "125", "135/145", "160", "180", "210", "240", "295", "355", "410", "470", "525", "650", "770"],
    C: [84, 99, 118, 132, 156, 184, 211, 266, 319, 370, 429, 480, 609, 720],
    E: [16, 16, 16, 16, 16, 16, 16, 17, 19, 20.5, 22.5, 24, 27.5, 31],
    S: [3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5],
    n: [4, 4, 4, 4, 8, 8, 8, 12, 12, 12, 16, 16, 20, 20],
    b: [19, 19, 19, 19, 19, 19, 23, 25, 28, 28, 28, 31, 34, 37],
  },
} as const;
// Extremo del vástago (FT-HD N° 002-2024): Ød base, K×K cuadrado, M×h rosca y profundidad, T altura.
// K de DN60/65 figura como "123" en la ficha (dato imposible para un cuadrado de vástago): se muestra "-".
const STEM_D = [20, 20, 24, 24, 28, 28, 28, 30, 36, 36, 38, 38, 40, 42];
const STEM_K = [14.3, 14.3, null, 17.3, 19.3, 19.3, 19.3, 24.3, 27.3, 27.3, 27.3, 27.3, 32.3, 32.3];
const STEM_M = [8, 8, 10, 10, 10, 10, 10, 10, 12, 12, 12, 12, 12, 12];
const STEM_h = [20, 20, 20, 20, 20, 20, 20, 20, 25, 25, 25, 25, 25, 25];
const STEM_T = [9, 29, 33, 33, 38, 38, 38, 42, 47, 47, 47, 47, 47, 47];

const flangeEn1092 = (list: string[], withS: boolean): PnTable => ({
  title: "Bridas",
  note: "Conexión según EN1092-2, doble perforación PN10 / PN16. Medidas en mm. Selecciona otro diámetro arriba para actualizar.",
  head: withS ? ["PN", "ØA", "ØB", "ØC", "E", "S", "n × Øb"] : ["PN", "ØA", "ØB", "ØC", "E", "n × Øb"],
  rows: (dn) => {
    const i = list.indexOf(dn);
    return (["PN10", "PN16"] as const).map((pn) => {
      const F = FLANGE[pn];
      const cells: Cell[] = withS ? [F.A[i], F.B[i], F.C[i], F.E[i], F.S[i], `${F.n[i]} × ${F.b[i]}`] : [F.A[i], F.B[i], F.C[i], F.E[i], `${F.n[i]} × ${F.b[i]}`];
      return { pn, cells };
    });
  },
});

const BASE_SPECS: [string, string][] = [
  ["Marca", "H-ITALY"],
  ["Tipo", "Compuerta de cierre elástico, extremos bridados"],
  ["Cuerpo y tapa", "GJS-500-7 (GGG-50), hierro dúctil"],
  ["Cuña", "Núcleo GJS-500-7 con recubrimiento EPDM"],
  ["Vástago", "Inox. 1.4021 (2Cr13 / SS420)"],
  ["Tuerca del vástago", "Latón"],
  ["Sellos", "EPDM · NBR · PTFE"],
  ["Tornillería", "Inoxidable A2 / SS304"],
  ["Revestimiento", "Epoxi azul RAL 5005, mín. 250 micras"],
  ["Diseño", "ISO 7259 · AWWA C509 / C515"],
  ["Brida", "ISO 7005-2 · EN 1092-2, doble perforación PN10/PN16"],
  ["Longitud entre caras", "ISO 5752 series 14 y 15 · DIN3202 F4 / F5"],
  ["Prueba", "EN 1171 y EN 1074"],
  ["Norma de producto", "EN 1074-2"],
  ["Presión máxima de trabajo", "16 bar"],
  ["Temperatura máxima", "110 °C"],
  ["Medio", "Agua"],
  ["Rango dimensional", "DN40 a DN600"],
];

const EN1074_LEAD = "Válvula de compuerta de cierre elástico con extremos bridados, F4 serie 14 / F5 serie 15, según EN1074-2. Paso completo sin obstrucciones cuando está abierta: menor resistencia al flujo y menos pérdidas de presión.";
const EN1074_FACTS: [string, string][] = [["Presión máx.", "16 bar"], ["Temp. máx.", "110 °C"], ["Medio", "Agua"], ["Norma", "EN1074-2"]];

const BASE: Datasheet = {
  lead: EN1074_LEAD,
  facts: EN1074_FACTS,
  sizes: DN14,
  sizeRange: "DN40 – DN600",
  specs: BASE_SPECS,
  specsNote: "Valores de referencia de la ficha FT-HI-100 Rev. 13; verificar con H-ITALY según la variante.",
  dims: {
    note: "Medidas en milímetros (mm). Longitud entre caras L según DIN3202.",
    head: ["DN", "L (F4)", "L (F5)", "H", "ØD"],
    rows: DN14.map((dn, i) => ({ dn, cells: [L_F4[i], dash(L_F5[i]), H[i], HANDWHEEL[i]] })),
  },
  flange: flangeEn1092(DN14, false),
  features: [
    { icon: "shield", title: "Mantenimiento bajo presión", text: "Con la válvula completamente abierta; 3 juntas tóricas protegen el husillo de las impurezas del agua." },
    { icon: "settings", title: "Bajo par de cierre", text: "La rosca del vástago se forma por compresión de rodillos, con bordes redondeados." },
    { icon: "layers", title: "Epoxi azul RAL 5005, mín. 250 micras", text: "Revestimientos y gomas aptos para agua potable." },
  ],
  doc: {
    title: "Ficha técnica FT-HI-100 · Rev. 13",
    meta: "PDF · 5.4 MB · 3 páginas",
    href: "/docs/ficha-tecnica-valvula-compuerta-bridada.pdf",
    pages: [1, 2, 3].map((n) => ({ src: `/media/valvula-ficha/ficha-p${n}.webp`, alt: `Ficha técnica FT-HI-100 Rev. 13, página ${n} de 3` })),
  },
  badges: ["Cierre elástico", "PN10 / PN16", "Epoxi 250 µm"],
  model3d: { src: "/models/valvula-hitaly.glb", alt: "Modelo 3D de la válvula de compuerta bridada H-ITALY con volante" },
};

// ---------- FUNDIGSAC con volante · ficha técnica FUNDIGSAC (válvula compuerta bridada, 1 año) ----------
const DN_F1 = ["DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"];
const F1_IN = ["2", "2-1/2", "3", "4", "5", "6", "8", "10", "12", "14", "16", "18", "20", "24"];
const F1_L = [150, 170, 180, 190, 200, 210, 230, 250, 270, 290, 310, 330, 350, 390];
const F1_D = { PN10: [165, 185, 200, 220, 250, 285, 340, 400, 455, 505, 565, 615, 670, 780], PN16: [165, 185, 200, 220, 250, 285, 340, 400, 455, 520, 580, 640, 715, 840] };
const F1_HOLES = { PN10: [4, 4, 8, 8, 8, 8, 8, 12, 12, 16, 16, 20, 20, 20], PN16: [4, 4, 8, 8, 8, 8, 12, 12, 12, 16, 16, 20, 20, 20] };
// Pernos: un valor común o PN10 / PN16 según la tabla de la ficha.
const F1_BOLTS = ["M16", "M16", "M16", "M16", "M16 / M20", "M20", "M20", "M20 / M24", "M20 / M24", "M20 / M24", "M24 / M27", "M24 / M27", "M24 / M30", "M27 / M33"];
const pair = (a: number, b: number) => (a === b ? a : `${a} / ${b}`);
const boltFor = (i: number, pn: "PN10" | "PN16") => { const [p10, p16] = F1_BOLTS[i].split(" / "); return pn === "PN10" ? p10 : (p16 ?? p10); };

const FUNDIGSAC: Datasheet = {
  lead: "Válvula compuerta bridada de asiento resiliente, diseño DIN 3352 F4, para aislamiento y corte del flujo en redes de agua potable, riego, estaciones de bombeo e instalaciones hidráulicas.",
  description: "Su paso recto reduce la pérdida de carga cuando está totalmente abierta y el asiento elastomérico favorece el cierre hermético. Cuerpo, tapa, compuerta y volante en hierro dúctil GGG50 con recubrimiento epoxi de 250 micras o más, vástago de acero inoxidable SS420 y juntas de EPDM.",
  facts: [["Presión", "PN10 / PN16"], ["Temp. máx.", "120 °C"], ["Diseño", "DIN 3352 F4"], ["Epoxi", "≥ 250 µm"]],
  sizes: DN_F1,
  sizeRange: "DN50 – DN600",
  specs: [
    ["Marca", "FUNDIGSAC"],
    ["Fabricante", "H-ITALY"],
    ["Tipo", "Compuerta bridada de asiento resiliente"],
    ["Rango nominal", "DN50 a DN600"],
    ["Presión nominal", "PN10 / PN16"],
    ["Diseño", "DIN 3352 F4"],
    ["Cara a cara", "EN 558 / ISO 5752"],
    ["Bridas", "DIN, según PN"],
    ["Cuerpo y tapa", "Hierro dúctil GGG50"],
    ["Compuerta", "Hierro dúctil GGG50 + EPDM"],
    ["Vástago", "Acero inoxidable SS420"],
    ["Tuerca del vástago", "Latón / hierro dúctil GGG50"],
    ["Pernos del cuerpo", "Acero al carbono"],
    ["Junta y anillos tóricos", "EPDM"],
    ["Tuerca de bloqueo de la tapa", "Latón"],
    ["Arandelas", "PTFE y arandela de empuje de latón"],
    ["Guardapolvo", "NBR"],
    ["Volante", "Hierro dúctil GGG50, perno de acero inoxidable SS304"],
    ["Recubrimiento", "Epoxi ≥ 250 micras"],
    ["Temperatura máxima", "120 °C"],
    ["Pruebas", "Estanqueidad de fábrica según ISO 5208 o API 598"],
    ["Presiones de prueba", "Cuerpo 1,5 × PN y asiento 1,1 × PN (24 y 17,6 bar en PN16)"],
  ],
  specsNote: "Valores de la ficha técnica FUNDIGSAC de la válvula compuerta bridada. Confirmar PN, perforación y pernos antes del suministro.",
  dims: {
    note: "Medidas en milímetros (mm). L longitud entre caras; D diámetro de brida (PN10 / PN16).",
    head: ["DN", "Pulg.", "L", "D brida"],
    rows: DN_F1.map((dn, i) => ({ dn, cells: [F1_IN[i], F1_L[i], pair(F1_D.PN10[i], F1_D.PN16[i])] })),
  },
  flange: {
    title: "Bridas",
    note: "Bridas DIN según PN: diámetro exterior, número de agujeros y pernos. Medidas en mm. Confirmar antes del suministro.",
    head: ["PN", "D brida", "Agujeros", "Pernos"],
    rows: (dn) => {
      const i = DN_F1.indexOf(dn);
      return (["PN10", "PN16"] as const).map((pn) => ({ pn, cells: [F1_D[pn][i], F1_HOLES[pn][i], boltFor(i, pn)] }));
    },
  },
  features: [
    { icon: "shield", title: "Asiento resiliente", text: "Compuerta de hierro dúctil GGG50 encapsulada en EPDM: cierre hermético en redes de agua." },
    { icon: "settings", title: "Paso recto", text: "Menor pérdida de carga con la válvula totalmente abierta; diseño DIN 3352 F4." },
    { icon: "nut", title: "Probada en fábrica", text: "Estanqueidad según ISO 5208 o API 598: cuerpo a 1,5 × PN y asiento a 1,1 × PN." },
    { icon: "layers", title: "Epoxi de 250 micras o más", text: "Protección anticorrosiva del cuerpo, la tapa y el volante de hierro dúctil GGG50." },
  ],
  doc: {
    title: "Ficha técnica FUNDIGSAC · Válvula compuerta bridada",
    meta: "PDF · 4.2 MB · 3 páginas",
    href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf",
    pages: [1, 2, 3].map((n) => ({ src: `/media/valvula-ficha/ft-fundigsac-p${n}.webp`, alt: `Ficha técnica FUNDIGSAC de la válvula compuerta bridada, página ${n} de 3` })),
  },
  badges: ["Asiento resiliente", "PN10 / PN16", "Epoxi ≥ 250 µm"],
  model3d: { src: "/models/valvula-fundigsac.glb", alt: "Modelo 3D de la válvula de compuerta bridada FUNDIGSAC con volante" },
};

// ---------- FUNDIGSAC con garantía extendida · FT-HD N° 002-2024 ----------
const DN_FTHD = ["DN40", "DN50", "DN60/65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN500", "DN600"];

const EXTENDIDA: Datasheet = {
  lead: EN1074_LEAD,
  facts: EN1074_FACTS,
  sizes: DN_FTHD,
  sizeRange: "DN40 – DN600",
  specs: [
    ["Marca", "FUNDIGSAC"],
    ["Garantía", "Extendida, respaldada por FUNDIGSAC"],
    ["Ficha técnica", "FT-HD N° 002-2024 · Procedencia China"],
    ["Tipo", "Compuerta de cierre elástico, extremos bridados"],
    ["Accionamiento", "Cuadrante de maniobra; volante GGG50 con epoxi RAL 5005"],
    ["Cuerpo y tapa", "GJS500-7 (GGG-50), hierro dúctil"],
    ["Cuña", "GJS500-7 encapsulada en EPDM"],
    ["Vástago", "2Cr13 (SS420)"],
    ["Tuerca del vástago", "Latón"],
    ["Tuerca de sellado", "Latón"],
    ["Juntas tóricas", "EPDM y NBR, 3 sobre el husillo"],
    ["Junta del vástago", "PTFE"],
    ["Junta de la tapa", "EPDM"],
    ["Anillo y cubierta antipolvo", "NBR"],
    ["Pernos", "Hexagonales SS304 y 2Cr13 (SS420), arandela 2Cr13"],
    ["Tornillo de fijación", "Acero inoxidable"],
    ["Revestimiento", "Epoxi azul RAL 5005, mín. 250 micras, apto para agua potable"],
    ["Brida", "EN1092-2, doble perforación PN10/PN16"],
    ["Longitud entre caras", "DIN3202 F4 / F5 y BS5163"],
    ["Prueba", "EN1171 y EN1074"],
    ["Presiones de prueba", "Cuerpo 1,5 × PN y asiento 1,1 × PN según EN 12266-1 (24 y 17,6 bar en PN16)"],
    ["Conformidad", "WRAS"],
    ["Presión máxima de trabajo", "16 bar"],
    ["Temperatura máxima", "110 °C"],
    ["Medio", "Agua"],
    ["Rango dimensional", "DN40 a DN600"],
    ["Marcado", "Lado A: DN, PN y EN1074-2 · Lado B: logotipo, GJS500-7 y fecha · etiqueta con código de barras y número de serie"],
  ],
  specsNote: "Valores de la ficha FT-HD N° 002-2024. En DN60/65 el cuerpo es el mismo y los agujeros de la brida son elípticos.",
  dims: {
    note: "Medidas en milímetros (mm). Longitud entre caras L según DIN3202 F4 / F5 y BS5163; H altura; ØD volante.",
    head: ["DN", "L (F4)", "L (F5)", "L (BS5163)", "H", "ØD"],
    rows: DN_FTHD.map((dn, i) => ({ dn, cells: [L_F4[i], dash(L_F5[i]), dash(L_BS5163[i]), H[i], HANDWHEEL[i]] })),
  },
  flange: flangeEn1092(DN_FTHD, true),
  stem: {
    title: "Extremo del vástago",
    note: "Ød diámetro, K × K cuadrado de maniobra, M × h rosca y profundidad, T altura del cuadrado (conicidad 3°).",
    head: ["Ød", "K × K", "M × h", "T"],
    rows: (dn) => {
      const i = DN_FTHD.indexOf(dn), k = STEM_K[i];
      return [{ pn: dn, cells: [STEM_D[i], k === null ? null : `${k} × ${k}`, `M${STEM_M[i]} × ${STEM_h[i]}`, STEM_T[i]] }];
    },
  },
  features: [
    { icon: "shield", title: "Mantenimiento bajo presión", text: "Con la válvula completamente abierta; 3 juntas tóricas protegen el husillo de las impurezas del agua." },
    { icon: "settings", title: "Bajo par de cierre", text: "La rosca del vástago se forma por compresión de rodillos, con bordes redondeados." },
    { icon: "nut", title: "Tuerca del vástago reforzada", text: "De latón y de gran tamaño, asegura que no se desprenda de la cuña; el diseño mejorado del disco evita daños." },
    { icon: "layers", title: "Epoxi azul RAL 5005, mín. 250 micras", text: "Revestimientos EPDM y piezas de goma aptos para agua potable, en conformidad con WRAS." },
  ],
  doc: {
    title: "Ficha técnica FT-HD N° 002-2024",
    meta: "PDF · 0.5 MB · 4 páginas",
    href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac-ft-hd-002-2024.pdf",
    pages: [1, 2, 3, 4].map((n) => ({ src: `/media/valvula-ficha/fthd-002-2024-p${n}.webp`, alt: `Ficha técnica FT-HD N° 002-2024, página ${n} de 4` })),
  },
  badges: ["Cierre elástico", "PN10 / PN16", "Epoxi 250 µm"],
  model3d: { src: "/models/valvula-fundigsac-cuadrante.glb", alt: "Modelo 3D de la válvula de compuerta bridada FUNDIGSAC con cuadrante de maniobra" },
};

export const DATASHEETS = { base: BASE, fundigsac: FUNDIGSAC, extendida: EXTENDIDA } as const;
