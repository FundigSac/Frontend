import type { Lang } from "@/shared/layout/landing-prefs";

/**
 * Textos en inglés de las categorías y de los productos que el sitio muestra en tarjetas (el catálogo base
 * está en español). Lo que no figura aquí se muestra en español.
 */
export const CATEGORY_EN: Record<string, string> = {
  valvulas: "Industrial valves",
  hdpe: "HDPE accessories",
  equipos: "Butt-fusion equipment",
  acoples: "Couplings and joints",
  "hierro-ductil": "Ductile iron",
  medidores: "Meters",
};

export const PRODUCT_NAME_EN: Record<string, string> = {
  "tuberia-hierro-ductil-c40-k9-k7-thd": "Ductile iron pipe C40 · K9 · K7 THD",
  "valvula-compuerta-bridada-vbbh": "Flanged gate valve VBBH",
  "marco-y-tapa-pesada-2seg": "Heavy-duty frame and cover 2SEG",
  "codo-hdpe-termofusion-90-sdr11": "HDPE butt-fusion 90° elbow SDR11",
  "acople-gran-rango-agr": "Wide-range coupling AGR",
  "maquina-termofusion-serie-hdc": "HDC series butt-fusion welding machine",
  "valvula-de-aire-roscada-vdar": "Threaded air valve VDAR",
  "filtro-tipo-y-bridado-fyb": "Flanged Y-strainer FYB",
  "tee-hdpe-termofusion-sdr11": "HDPE butt-fusion tee SDR11",
  "brida-iso-2351-pn16-biso": "ISO 2351 PN16 flange BISO",
  "junta-flexible-din-jfdin": "DIN flexible joint JFDIN",
  "valvula-mariposa-wafer-timon-vmtwt": "Wafer butterfly valve with handwheel VMTWT",
};

export const categoryLabel = (lang: Lang, slug: string, fallback: string) => (lang === "en" ? CATEGORY_EN[slug] ?? fallback : fallback);
export const productLabel = (lang: Lang, slug: string, fallback: string) => (lang === "en" ? PRODUCT_NAME_EN[slug] ?? fallback : fallback);
