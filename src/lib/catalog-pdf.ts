import type { Product, Variant } from "./catalog";

/**
 * Referencias tomadas de los tres documentos de origen:
 *  - PRECIO MARZO2026.pdf (válvulas, acoples, bridas, hierro dúctil, medición)
 *  - PRECIOS HDPE TERMO.pdf (accesorios HDPE de termofusión)
 *  - PRECIO Y STOCK REAL - IMPORTACION 1511.pdf (equipos de termofusión y electrofusión)
 *
 * Solo se publican nombres, códigos, medidas y datos técnicos impresos. No se publican
 * importes ni existencias: precio y disponibilidad se confirman al cotizar.
 */

const MAR = "PRECIO MARZO2026.pdf";
const HDPE = "PRECIOS HDPE TERMO.pdf";
const MAQ = "PRECIO Y STOCK REAL - IMPORTACION 1511.pdf";
const img = (name: string) => `/media/catalog/${name}.webp`;

const INCH: Record<string, string> = {
  DN25: '1"', DN50: '2"', DN65: '2 1/2"', DN80: '3"', DN100: '4"', DN125: '5"', DN150: '6"', DN200: '8"',
  "DN200 PN10": '8"', DN250: '10"', DN300: '12"', DN350: '14"', DN400: '16"', DN450: '18"', DN500: '20"',
  DN600: '24"', DN700: '28"',
};
/** Etiquetas «DN100 · 4"» a partir de códigos DN. */
const dn = (...codes: string[]): Variant[] => codes.map(code => ({ label: `${code} · ${INCH[code]}` }));
const dnN = (from: number, to: number, ...extra: string[]) => {
  const all = ["DN25", "DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600", "DN700"];
  const a = all.indexOf(`DN${from}`), b = all.indexOf(`DN${to}`);
  return dn(...all.slice(a, b + 1), ...extra);
};
/** Medidas de tubo en mm; SDR17 desde 355 mm cuando el documento lo indica. */
const mm = (list: number[], sdr17From = 0): Variant[] => list.map(n => ({ label: `${n} mm`, ...(sdr17From && n >= sdr17From ? { sdr: "SDR17" } : {}) }));
const pairs = (list: string[], sdr17From = 0): Variant[] => list.map(p => ({ label: p.replace("*", " × ") + " mm", ...(sdr17From && Number(p.split("*")[0]) >= sdr17From ? { sdr: "SDR17" } : {}) }));
const model = (label: string): Variant => ({ label });

const base = { needsTechnicalReview: true } as const;
const valve = (slug: string, name: string, image: string, summary: string, source: string, variants: Variant[], specs: [string, string][]): Product =>
  ({ slug, name, category: "valvulas", image: img(image), summary, source: `${MAR}, ${source}`, variants, specs, ...base });
const union = (slug: string, name: string, image: string, summary: string, source: string, variants: Variant[], specs: [string, string][]): Product =>
  ({ slug, name, category: "acoples", image: img(image), summary, source: `${MAR}, ${source}`, variants, specs, ...base });
const hdpe = (slug: string, name: string, image: string, summary: string, source: string, variants: Variant[], specs: [string, string][]): Product =>
  ({ slug, name, category: "hdpe", image: img(image), summary, source: `${HDPE}, ${source}`, variants, specs, ...base });
const machine = (slug: string, name: string, image: string, summary: string, source: string, variants: Variant[], specs: [string, string][]): Product =>
  ({ slug, name, category: "equipos", image: img(image), summary, source: `${MAQ}, ${source}`, variants, specs, ...base });

const AGR_RANGES = [
  "DN50 · 57–74 mm", "DN65 · 68–86 mm", "DN80 · 88–103 mm", "DN100 · 105–125 mm", "DN125 · 132–146 mm", "DN150 · 155–175 mm",
  "DN200 · 192–210 mm", "DN200 · 198–225 mm", "DN250 · 242–262 mm", "DN250 · 250–274 mm", "DN300 · 315–332 mm", "DN350 · 351–378 mm",
  "DN400 · 390–410 mm", "DN400 · 398–430 mm", "DN450 · 450–480 mm", "DN500 · 500–533 mm", "DN600 · 608–636 mm",
].map(label => ({ label }));
const HDPE_MM_PIPE = ["DN50 · 63 mm", "DN65 · 75 mm", "DN80 · 90 mm", "DN100 · 110 mm", "DN150 · 160 mm", "DN200 · 200 mm", "DN250 · 250 mm", "DN300 · 315 mm"].map(label => ({ label }));
const DN50_300 = dnN(50, 300);
const ISO_PN16 = "ISO PN16";

/** Productos nuevos tomados de los documentos. */
export const extraProducts: Product[] = [
  // ───────────── Acoples, adaptadores, juntas y bridas ─────────────
  union("adaptador-brida-gran-rango-abgr", "Adaptador brida gran rango ABGR", "adaptador-brida-gran-rango",
    "Adaptador brida de gran rango: cada medida cubre un intervalo de diámetro exterior de tubería.", "página 1",
    AGR_RANGES, [["Código", "ABGR"], ["Rango nominal", "DN50 a DN600"], ["Dato publicado", "Intervalo de diámetro exterior por DN"]]),
  union("adaptador-brida-tubo-hdpe-abpth", "Adaptador brida para tubo HDPE ABPTH", "adaptador-brida-hdpe",
    "Adaptador con brida para conectar tubería HDPE a una red bridada.", "página 1",
    HDPE_MM_PIPE, [["Código", "ABPTH"], ["Tubería", "HDPE, 63 a 315 mm"], ["Rango nominal", "DN50 a DN300"]]),
  union("acople-acerrojado-tubo-hdpe-aapth", "Acople acerrojado para tubo HDPE AAPTH", "acople-acerrojado-hdpe",
    "Acople acerrojado para unir tubería HDPE.", "página 1",
    HDPE_MM_PIPE, [["Código", "AAPTH"], ["Tubería", "HDPE, 63 a 315 mm"], ["Rango nominal", "DN50 a DN300"]]),
  union("adaptador-rapido-polietileno-arpth", "Adaptador rápido para tubo de polietileno ARPTH", "adaptador-rapido-pe",
    "Adaptador rápido con brida para tubería de polietileno.", "página 2",
    [...HDPE_MM_PIPE, { label: "DN350 · 355 mm" }, { label: "DN400 · 400 mm" }], [["Código", "ARPTH"], ["Tubería", "Polietileno, 63 a 400 mm"], ["Rango nominal", "DN50 a DN400"]]),
  union("acople-995-tuberia-hdpe-a995pth", "Acople 995 para tubería HDPE A995PTH", "acople-995",
    "Acople tipo 995 para tubería HDPE.", "página 2",
    HDPE_MM_PIPE, [["Código", "A995PTH"], ["Tubería", "HDPE, 63 a 315 mm"], ["Rango nominal", "DN50 a DN300"]]),
  union("union-autoportante-desmontaje-uauto", "Unión autoportante tipo desmontaje UAUTO", "union-autoportante",
    "Unión autoportante de desmontaje para montaje y mantenimiento de redes bridadas.", "página 2",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    [["Código", "UAUTO"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN600"]]),
  union("union-desmontaje-autoportante-autop", "Unión de desmontaje autoportante AUTOP", "union-desmontaje-autop",
    "Unión de desmontaje autoportante de gran diámetro.", "página 12",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    [["Código", "AUTOP"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN600"]]),
  union("junta-flexible-din-jfdin", "Junta flexible DIN JFDIN", "junta-flexible-din",
    "Junta flexible de caucho con bridas para absorber movimiento y vibración en tuberías.", "página 2",
    DN50_300.filter(v => !v.label.startsWith("DN125")).map(v => v), [["Código", "JFDIN"], ["Norma de brida", "DIN / ISO"], ["Rango nominal", "DN50 a DN300"]]),
  union("junta-flexible-ansi-jfansi", "Junta flexible ANSI JFANSI", "junta-flexible-ansi",
    "Junta flexible de caucho con bridas ANSI.", "página 2",
    DN50_300.filter(v => !v.label.startsWith("DN125")), [["Código", "JFANSI"], ["Norma de brida", "ANSI"], ["Rango nominal", "DN50 a DN300"]]),
  union("brida-iso-2351-pn16-biso", "Brida ISO 2351 PN16 BISO", "brida-iso",
    "Brida plana ISO 2351 PN16 para conexiones bridadas.", "páginas 2 y 3",
    dn("DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN200 PN10", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600", "DN700"),
    [["Código", "BISO"], ["Norma", "ISO 2351 PN16"], ["Rango nominal", "DN50 a DN700"]]),
  union("brida-ciega-iso-2351-pn16-bciega", "Brida ciega ISO 2351 PN16 BCIEGA", "brida-ciega",
    "Brida ciega para cerrar el extremo de una línea bridada.", "página 3",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    [["Código", "BCIEGA"], ["Norma", "ISO 2351 PN16"], ["Rango nominal", "DN50 a DN600"]]),
  union("brida-ansi-pn10-bansi", "Brida ANSI PN10 BANSI", "brida-ansi",
    "Brida ANSI para conexiones bridadas.", "página 3",
    dn("DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300"), [["Código", "BANSI"], ["Norma", "ANSI PN10"], ["Rango nominal", "DN50 a DN300"]]),
  union("brida-roscada-din-iso-pn16-brosca", "Brida roscada DIN / ISO PN16 BROSCA", "brida-roscada",
    "Brida roscada para conexiones sin soldadura.", "página 3",
    dn("DN50", "DN65", "DN80", "DN100", "DN150"), [["Código", "BROSCA"], ["Norma", "DIN / ISO PN16"], ["Rango nominal", "DN50 a DN150"]]),
  union("anillo-acerrojado-aacer", "Anillo acerrojado AACER", "anillo-acerrojado",
    "Anillo acerrojado para tubería HDPE.", "página 12",
    [{ label: "DN50 · 63 mm" }, { label: "DN80 · 90 mm" }, { label: "DN100 · 110 mm" }, { label: "DN150 · 160 mm" }, { label: "DN200 · 200 mm" }, { label: "DN250 · 250 mm" }],
    [["Código", "AACER"], ["Clase", ISO_PN16], ["Tubería", "HDPE"]]),
  union("codo-sch40-90-csch90", "Codo SCH40 × 90° CSCH90", "codo-sch40-90",
    "Codo de 90° serie SCH40.", "página 4",
    dnN(50, 600).filter(v => !v.label.startsWith("DN125")), [["Código", "CSCH90"], ["Serie", "SCH40"], ["Ángulo", "90°"]]),
  union("codo-sch40-45-csch45", "Codo SCH40 × 45° CSCH45", "codo-sch40-45",
    "Codo de 45° serie SCH40.", "página 4",
    dnN(50, 600).filter(v => !v.label.startsWith("DN125")), [["Código", "CSCH45"], ["Serie", "SCH40"], ["Ángulo", "45°"]]),
  union("tuberia-sch40-tsch40", "Tubería SCH-40 TSCH40", "tuberia-sch40",
    "Tubería serie SCH-40.", "página 4",
    DN50_300.filter(v => !v.label.startsWith("DN125")), [["Código", "TSCH40"], ["Serie", "SCH-40"], ["Rango nominal", "DN50 a DN300"]]),

  // ───────────── Válvulas y control ─────────────
  valve("valvula-compuerta-bridada-vbbh", "Válvula compuerta bridada VBBH", "compuerta-bridada",
    "Válvula de compuerta con extremos bridados, listada en el tarifario como «Válvula bridada P».", "página 6",
    dn("DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200 PN10", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    [["Código", "VBBH"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN600"]]),
  valve("valvula-compuerta-bridada-premium-vbbl", "Válvula compuerta bridada premium VBBL", "compuerta-bridada-premium",
    "Válvula de compuerta bridada, línea premium del tarifario.", "página 6",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300"), [["Código", "VBBL"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN300"]]),
  valve("valvula-check-vertical-cierre-silencioso-vcver", "Válvula check vertical de cierre silencioso VCVER", "check-vertical",
    "Válvula de retención vertical de cierre silencioso.", "página 7",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300"), [["Código", "VCVER"], ["Rango nominal", "DN50 a DN300"]]),
  valve("valvula-duo-check-wafer-vdcw", "Válvula duo check wafer VDCW", "duo-check",
    "Válvula de retención de doble disco tipo wafer.", "página 8",
    dn("DN50", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400"), [["Código", "VDCW"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN400"]]),
  valve("valvula-de-aire-3-funciones-premium-vdap", "Válvula de aire 3 funciones premium VDAP", "ventosa-3-funciones",
    "Válvula de aire (ventosa) de tres funciones.", "página 7",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200"), [["Código", "VDAP"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN200"]]),
  valve("valvula-de-aire-roscada-vdar", "Válvula de aire roscada VDAR", "ventosa-roscada",
    "Válvula de aire (ventosa) con conexión roscada.", "página 7",
    dn("DN25", "DN50"), [["Código", "VDAR"], ["Clase", ISO_PN16], ["Conexión", "Roscada"]]),
  valve("valvula-mariposa-wafer-palanca-vmtwp", "Válvula mariposa wafer con palanca VMTWP", "mariposa-palanca",
    "Válvula mariposa tipo wafer de accionamiento manual con palanca.", "página 8",
    dn("DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300"), [["Código", "VMTWP"], ["Clase", ISO_PN16], ["Accionamiento", "Palanca"]]),
  valve("valvula-mariposa-wafer-timon-vmtwt", "Válvula mariposa wafer con timón VMTWT", "mariposa-timon",
    "Válvula mariposa tipo wafer con operador de timón.", "página 8",
    dn("DN50", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400"), [["Código", "VMTWT"], ["Clase", ISO_PN16], ["Accionamiento", "Timón"]]),
  valve("valvula-mariposa-wafer-bridada-vmbb", "Válvula mariposa wafer bridada VMBB", "mariposa-bridada",
    "Válvula mariposa con extremos bridados y operador de timón.", "página 8",
    dn("DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"), [["Código", "VMBB"], ["Clase", ISO_PN16], ["Rango nominal", "DN80 a DN600"]]),
  valve("valvula-mariposa-paleta-inox-minoxp", "Válvula mariposa paleta inox con palanca MINOXP", "mariposa-palanca",
    "Válvula mariposa con paleta inox y palanca.", "página 12",
    dn("DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300"), [["Código", "MINOXP"], ["Clase", ISO_PN16], ["Paleta", "Inox"]]),
  valve("valvula-mariposa-paleta-inox-timon-minoxt", "Válvula mariposa paleta inox con timón MINOXT", "mariposa-timon",
    "Válvula mariposa con paleta inox y operador de timón.", "página 12",
    dn("DN50", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400"), [["Código", "MINOXT"], ["Clase", ISO_PN16], ["Paleta", "Inox"]]),
  valve("valvula-mariposa-inox-actuador-neumatico-mcan", "Válvula mariposa inox con actuador neumático MCAN", "mariposa-neumatica",
    "Válvula mariposa inox con actuador neumático.", "página 12",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300"), [["Código", "MCAN"], ["Clase", ISO_PN16], ["Accionamiento", "Actuador neumático"]]),
  valve("filtro-tipo-y-bridado-fyb", "Filtro tipo Y bridado FYB", "filtro-y",
    "Filtro tipo Y con extremos bridados para proteger válvulas y equipos de la red.", "página 5",
    dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300", "DN350", "DN400"), [["Código", "FYB"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN400"]]),
  valve("pilotos-alivio-reductora-de-presion", "Pilotos de alivio y de reductora de presión", "piloto-alivio",
    "Pilotos de ½″ para válvulas de alivio y de reducción de presión.", "página 5",
    [{ label: "Piloto de alivio · 1/2\"" }, { label: "Piloto de reductora · 1/2\"" }], [["Medida", '1/2"'], ["Uso", "Piloto de válvula de alivio y de reductora"]]),

  // ───────────── Hierro dúctil ─────────────
  { slug: "tuberia-hierro-ductil-c40-k9-k7-thd", name: "Tubería de hierro dúctil C40 · K9 · K7 THD", category: "hierro-ductil", image: img("tuberia-hierro-ductil"),
    summary: "Tubería de hierro dúctil para redes de agua. El tarifario la lista bajo EN 545 PN16 e ISO 2531.", source: `${MAR}, página 11`,
    variants: dn("DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    specs: [["Código", "THD"], ["Clases", "C40 · K9 · K7"], ["Normas", "EN 545 PN16 · ISO 2531"], ["Rango publicado", "DN80 a DN600 (el documento lista también DN700 a DN1200 sin dato comercial)"]], ...base },
  { slug: "marco-y-tapa-pesada-2seg", name: "Marco y tapa pesada 2SEG", category: "hierro-ductil", image: img("marco-tapa-pesada"),
    summary: "Marco y tapa de hierro para buzones, versión pesada con dos seguros.", source: `${MAR}, página 11`,
    specs: [["Código", "2SEG"], ["Modelo", "D400"], ["Medida", "600 mm"], ["Peso", "60 kg"], ["Seguros", "2"]], ...base },
  { slug: "marco-y-tapa-liviana-1seg", name: "Marco y tapa liviana 1SEG", category: "hierro-ductil", image: img("marco-tapa-liviana"),
    summary: "Marco y tapa de hierro para buzones, versión liviana con un seguro.", source: `${MAR}, página 11`,
    specs: [["Código", "1SEG"], ["Modelo", "D400"], ["Medida", "600 mm"], ["Peso", "38 kg"], ["Seguros", "1"]], ...base },
  { slug: "tee-bridada-tbb", name: "Tee bridada TBB", category: "hierro-ductil", image: img("tee-bridada"),
    summary: "Tee de hierro dúctil con tres bridas, en versiones de igual diámetro y con derivación reducida.", source: `${MAR}, página 10`,
    variants: ["DN50 × DN50", "DN65 × DN65", "DN80 × DN50", "DN80 × DN80", "DN100 × DN50", "DN100 × DN80", "DN100 × DN100", "DN150 × DN50", "DN150 × DN80", "DN150 × DN100", "DN150 × DN150", "DN200 × DN50", "DN200 × DN80", "DN200 × DN100", "DN200 × DN150", "DN200 × DN200", "DN250 × DN50", "DN250 × DN80", "DN250 × DN100", "DN250 × DN150", "DN250 × DN200", "DN250 × DN250", "DN300 × DN50", "DN300 × DN80", "DN300 × DN100", "DN300 × DN150", "DN300 × DN200", "DN300 × DN250", "DN300 × DN300", "DN350 × DN350", "DN400 × DN400", "DN450 × DN450", "DN500 × DN500", "DN600 × DN600"].map(model),
    specs: [["Código", "TBB"], ["Clase", ISO_PN16], ["Medida", "Cabeza × derivación"]], ...base },
  { slug: "tee-luflex-brida-tlb", name: "Tee Luflex con brida TLB", category: "hierro-ductil", image: img("tee-luflex"),
    summary: "Tee con extremos de embone Luflex y derivación bridada.", source: `${MAR}, página 10`,
    variants: ["63 mm × DN50", "90 mm × DN50", "90 mm × DN80", "110 mm × DN50", "110 mm × DN100", "160 mm × DN50", "160 mm × DN100", "200 mm × DN50", "200 mm × DN100"].map(model),
    specs: [["Código", "TLB"], ["Medida", "Tubo (mm) × derivación bridada (DN)"]], ...base },
  { slug: "yee-bridado-ybb", name: "Yee bridado YBB", category: "hierro-ductil", image: img("yee-bridada"),
    summary: "Yee de hierro dúctil con tres bridas.", source: `${MAR}, página 10`,
    variants: dn("DN50", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300"), specs: [["Código", "YBB"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN300"]], ...base },

  // ───────────── Medición ─────────────
  { slug: "medidor-electromagnetico-melec", name: "Medidor electromagnético MELEC", category: "medidores", image: img("medidor-electromagnetico"),
    summary: "Medidor de caudal electromagnético con transmisor y cable de señal.", source: `${MAR}, página 11`,
    variants: dn("DN50", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN450", "DN500", "DN600"),
    specs: [["Código", "MELEC"], ["Rango nominal", "DN50 a DN600"]], ...base },
  { slug: "medidor-tipo-woltman-mwol", name: "Medidor tipo Woltman MWOL", category: "medidores", image: img("medidor-woltman"),
    summary: "Medidor de agua tipo Woltman con extremos bridados.", source: `${MAR}, páginas 11 y 12`,
    variants: DN50_300.filter(v => !v.label.startsWith("DN125")), specs: [["Código", "MWOL"], ["Rango nominal", "DN50 a DN300"]], ...base },

  // ───────────── Accesorios HDPE de termofusión ─────────────
  hdpe("codo-hdpe-termofusion-225-sdr11", "Codo HDPE termofusión 22.5° SDR11", "hdpe-codo-225", "Codo de 22.5° para unión por termofusión.", "página 1",
    mm([63, 75, 90, 110, 160, 200, 250, 315, 355, 400, 450, 500, 630], 355), [["Material", "HDPE"], ["Ángulo", "22.5°"], ["Unión", "Termofusión"], ["Serie", "SDR11 hasta 315 mm; SDR17 desde 355 mm"]]),
  hdpe("flange-hdpe-termofusion-sdr11", "Flange HDPE termofusión SDR11", "hdpe-flange", "Flange (porta brida) para unión por termofusión. Se acopla con brida tipo backing ring.", "página 1",
    mm([63, 75, 90, 110, 160, 200, 250, 315, 355, 400, 450, 500, 630], 355), [["Material", "HDPE"], ["Unión", "Termofusión"], ["Serie", "SDR11 hasta 315 mm; SDR17 desde 355 mm"]]),
  hdpe("tee-hdpe-termofusion-sdr11", "Tee HDPE termofusión SDR11", "hdpe-tee", "Tee de igual diámetro para unión por termofusión.", "página 2",
    mm([63, 75, 90, 110, 160, 200, 250, 315, 355, 400, 450, 500, 630], 355), [["Material", "HDPE"], ["Unión", "Termofusión"], ["Serie", "SDR11 hasta 315 mm; SDR17 desde 355 mm"]]),
  hdpe("tee-reducida-hdpe-termofusion-sdr11", "Tee reducida HDPE termofusión SDR11", "hdpe-tee", "Tee con derivación de menor diámetro para unión por termofusión.", "página 2",
    pairs(["75*63", "90*63", "90*75", "110*63", "110*75", "110*90", "160*63", "160*90", "160*110", "200*90", "200*110", "200*160", "250*90", "250*110", "250*160", "250*200", "315*90", "315*110", "315*160", "315*200", "315*250", "355*110", "355*160", "355*200", "355*250", "355*315", "400*110", "400*160", "400*200", "400*250", "400*315", "400*355", "450*110", "450*160", "450*200", "450*250", "450*315", "450*355", "450*400", "500*110", "500*160", "500*200", "500*250", "500*315", "500*355", "500*400", "500*450"], 315),
    [["Material", "HDPE"], ["Unión", "Termofusión"], ["Medida", "Cabeza × derivación (mm)"]]),
  hdpe("cruz-hdpe-termofusion-sdr11", "Cruz HDPE termofusión SDR11", "hdpe-cruz", "Cruz de cuatro salidas para unión por termofusión.", "página 3",
    mm([90, 110, 160, 200, 250, 315]), [["Material", "HDPE"], ["Unión", "Termofusión"], ["Serie", "SDR11"]]),
  hdpe("yee-hdpe-termofusion-sdr11", "Yee HDPE termofusión SDR11", "hdpe-yee", "Yee para derivaciones inclinadas por termofusión.", "página 3",
    mm([63, 90, 110, 160, 200, 250, 315]), [["Material", "HDPE"], ["Unión", "Termofusión"], ["Serie", "SDR11"]]),
  hdpe("reduccion-hdpe-termofusion-sdr11", "Reducción HDPE termofusión SDR11", "hdpe-reduccion", "Reducción concéntrica para cambiar de diámetro por termofusión.", "página 3",
    pairs(["75*63", "90*63", "90*75", "110*63", "110*75", "110*90", "160*63", "160*90", "160*110", "200*110", "200*160", "250*160", "250*200", "315*200", "315*250", "355*160", "355*200", "355*250", "355*315", "400*160", "400*200", "400*250", "400*315", "400*355"]),
    [["Material", "HDPE"], ["Unión", "Termofusión"], ["Medida", "Mayor × menor (mm)"]]),
  hdpe("tapon-hdpe-termofusion-sdr11", "Tapón HDPE termofusión SDR11", "hdpe-tapon", "Tapón para cerrar el extremo de una línea HDPE por termofusión.", "páginas 3 y 4",
    mm([63, 75, 90, 110, 160, 200, 250, 315, 355, 400, 450, 500]), [["Material", "HDPE"], ["Unión", "Termofusión"], ["Serie", "SDR11"]]),
  hdpe("brida-backing-ring-sdr17-pn16", "Brida tipo backing ring SDR17 PN16", "hdpe-brida-backing", "Brida suelta tipo backing ring para flange HDPE.", "página 4",
    mm([63, 75, 90, 110, 160, 200, 250, 315, 355, 400, 450, 500]), [["Serie", "SDR17"], ["Presión", "PN16"], ["Uso", "Con flange HDPE termofusión"]]),

  // ───────────── Equipos de termofusión y electrofusión ─────────────
  machine("maquina-termofusion-hdl-4-mordazas", "Máquina de termofusión HDL, 4 mordazas, timón", "maq-hdl-4m", "Máquina manual de soldar PE con cuatro mordazas y timón.", "página 1",
    [model("HDL 160-4M · 40–160 mm · 53 kg"), model("HDL 200-4M · 63–200 mm · 67 kg"), model("HDL 250-4M · 63–250 mm · 131 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "4"]]),
  machine("maquina-termofusion-hdt-palanca", "Máquina de termofusión HDT, 2 mordazas, palanca", "maq-hdt", "Máquina manual de soldar PE con dos mordazas y accionamiento por palanca.", "página 1",
    [model("HDT 160-2M · 40–160 mm · 38 kg"), model("HDT 200-2M · 63–200 mm · 43 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "2"]]),
  machine("maquina-termofusion-hdy-manivela", "Máquina de termofusión HDY, 4 mordazas, manivela", "maq-hdy", "Máquina manual de soldar PE con cuatro mordazas, manivela y tres bielas de fuerza.", "página 1",
    [model("HDY 160-4M · 40–160 mm · 45 kg"), model("HDY 200-4M · 63–200 mm · 50 kg"), model("HDY 250-4M · 63–250 mm · 80 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "4"]]),
  machine("maquina-termofusion-serie-hdc", "Máquina de termofusión serie HDC", "maq-hdc", "Serie de máquinas de soldar PE para rangos de 40 a 630 mm.", "página 2",
    [model("HDC 160 · 40–160 mm · 111 kg"), model("HDC 200 · 63–200 mm · 117 kg"), model("HDC 250 · 63–250 mm · 148 kg"), model("HDC 315 · 63–315 mm · 188 kg"), model("HDC 355 · 90–355 mm · 245 kg"), model("HDC 400 · 160–400 mm · 370 kg"), model("HDC 450 · 180–450 mm · 400 kg"), model("HDC 500 · 180–500 mm · 480 kg"), model("HDC 630 · 315–630 mm · 645 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Rango de operación", "40 a 630 mm según modelo"]]),
  machine("maquina-electrofusion-hdm", "Máquina de electrofusión HDM", "maq-hdm", "Equipo de electrofusión para accesorios con resistencia integrada.", "página 3",
    [model("HDM 200 · 20–200 mm · 20 kg"), model("HDM 315 · 20–315 mm · 20 kg"), model("HDM 500 · 20–500 mm · 25 kg")],
    [["Voltaje de entrada", "190–240 V"], ["Voltaje de salida", "10–48 V"]]),
  machine("maquina-termofusion-sud-sdp-4-mordazas", "Máquina de termofusión SUD / SDP, 4 mordazas", "maq-sdp-4m", "Máquinas manuales de soldar PE con cuatro mordazas, con manivela o palanca.", "página 3",
    [model("SUD 40-200M4 · manivela · 40–200 mm · 42,5 kg"), model("SDP40-200M4 · palanca · 40–200 mm · 45 kg"), model("SDP40-160M4 · palanca · 40–200 mm según documento · 45 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "4"]]),
  machine("maquina-termofusion-sdp-2-mordazas", "Máquina de termofusión SDP, 2 mordazas, palanca", "maq-sdp-2m", "Máquina manual de soldar PE con dos mordazas y palanca.", "página 3",
    [model("SDP40-160M2 · 40–160 mm · 53 kg"), model("SDP40-200M2 · 40–200 mm · 40 kg")],
    [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "2"]]),
];

/** Correcciones y ampliaciones de productos que ya existían en el catálogo. */
export const productOverrides: Record<string, Partial<Product>> = {
  "acople-gran-rango-agr": { image: img("acople-gran-rango"), variants: AGR_RANGES, specs: [["Código", "AGR"], ["Rango nominal", "DN50 a DN600"], ["Dato publicado", "Intervalo de diámetro exterior por DN"]], summary: "Acople de gran rango: cada medida cubre un intervalo de diámetro exterior de tubería." },
  "valvula-check-flex": { image: img("check-flex"), variants: dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300"), specs: [["Código", "VCFLEX"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN300"]] },
  "valvula-check-swing": { image: img("check-swing"), variants: dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN200 PN10", "DN250", "DN300"), specs: [["Código", "VCSW"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN300"]] },
  "valvula-compuerta-acerrojada": { image: img("compuerta-acerrojada"), variants: [...["DN50 · 63 mm", "DN65 · 75 mm", "DN80 · 90 mm", "DN100 · 110 mm", "DN125 · 140 mm", "DN150 · 160 mm", "DN200 · 200 mm", "DN250 · 250 mm", "DN300 · 315 mm"].map(label => ({ label }))], specs: [["Código", "VACER"], ["Clase", ISO_PN16], ["Tubería", "HDPE, 63 a 315 mm"]] },
  "valvula-de-alivio-bridada": { image: img("valvula-alivio"), variants: dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300"), specs: [["Código", "VDA"], ["Rango nominal", "DN50 a DN300"]] },
  "valvula-embone-tipo-luflex": { image: img("compuerta-luflex"), variants: HDPE_MM_PIPE, specs: [["Código", "VEMBO"], ["Clase", ISO_PN16], ["Rango nominal", "DN50 a DN300"]] },
  "valvula-flotadora-bridada": { image: img("valvula-flotadora"), variants: dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400"), specs: [["Código", "VFLOT"], ["Rango nominal", "DN50 a DN400"]] },
  "valvula-reductora-de-presion": { image: img("reductora-presion"), variants: dn("DN50", "DN65", "DN80", "DN100", "DN150", "DN200", "DN250", "DN300", "DN350"), specs: [["Código", "VRDP"], ["Rango nominal", "DN50 a DN350"]] },
  "codo-hdpe-termofusion-90-sdr11": { image: img("hdpe-codo-90"), imageIllustrative: false },
  "codo-hdpe-termofusion-45-sdr11": { image: img("hdpe-codo-45"), imageIllustrative: false },
  "maquina-termofusion-hdl-160-2m": {
    name: "Máquina de termofusión HDL, 2 mordazas, timón", image: img("maq-hdl-2m"),
    summary: "Máquina manual de soldar PE con dos mordazas y timón.",
    variants: [model("HDL 160-2M · 40–160 mm · 42,5 kg"), model("HDL 200-2M · 63–200 mm · 45 kg")],
    specs: [["Voltaje", "220 V"], ["Placa calefactora máxima", "270 °C"], ["Mordazas", "2"]],
  },
};
