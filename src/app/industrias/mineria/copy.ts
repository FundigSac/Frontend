"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { FeaturedText } from "../_sector/sector-kit";

type Row = { need: string; pieces: string; link: string };

export const MINING: Record<"es" | "en", {
  crumbs: { home: string; section: string; current: string };
  hero: { title: string; lead: string; explore: string; alt: string };
  usos: { title: string; lead: string; items: readonly { title: string; text: string; alt: string }[] };
  tabla: { title: string; lead: string; columns: readonly [string, string, string]; rows: readonly Row[] };
  featured: FeaturedText;
  cta: { title: string; text: string; quote: string };
}> = {
  es: {
    crumbs: { home: "Inicio", section: "Industrias", current: "Minería" },
    hero: {
      title: "Tubería HDPE, válvulas y acoples para operaciones mineras",
      lead: "Componentes para conducir, controlar y aislar fluidos en procesos mineros, desde la extracción hasta el procesamiento de minerales.",
      explore: "Ver productos del sector",
      alt: "Válvula de compuerta azul FUNDIGSAC frente a una planta de procesamiento de minerales",
    },
    usos: {
      title: "Dónde se usan",
      lead: "En sistemas de agua de proceso, pulpas, recirculación y servicios auxiliares.",
      items: [
        { title: "Conducción de pulpas y agua de proceso", text: "Componentes para líneas de transporte, recirculación y distribución en plantas concentradoras.", alt: "Descarga de agua desde tuberías de proceso en una planta minera" },
        { title: "Aislamiento y control de procesos", text: "Válvulas y accesorios para aislar tramos y controlar el flujo en la operación.", alt: "Estanque de agua de proceso con pasarelas y una planta minera al fondo" },
      ],
    },
    tabla: {
      title: "Qué se instala en una línea minera",
      lead: "Medidas, material y clase de presión se confirman al cotizar, según las condiciones de tu línea.",
      columns: ["Necesidad", "Qué ofrecemos", "Catálogo"],
      rows: [
        { need: "Tubería HDPE y accesorios de termofusión", pieces: "Codos, tees, reducciones, tapones y flanges de termofusión SDR11.", link: "Ver accesorios HDPE" },
        { need: "Equipos de termofusión", pieces: "Máquinas serie HDC para rangos de 40 a 630 mm, modelos HDL, HDT y HDY, y electrofusión HDM.", link: "Ver equipos" },
        { need: "Acoples y uniones para reparación rápida", pieces: "Acople gran rango AGR, adaptador brida ABGR y acople acerrojado para tubo HDPE.", link: "Ver acoples" },
        { need: "Válvulas y juntas para líneas de proceso", pieces: "Válvulas de compuerta bridadas y acerrojadas, válvula guillotina y juntas flexibles.", link: "Ver válvulas" },
      ],
    },
    featured: {
      title: "Válvula de compuerta FUNDIGSAC",
      lead: "De asiento resiliente y extremos bridados, para aislar y cortar el flujo en líneas de agua.",
      facts: [["Rango nominal", "DN50 a DN600"], ["Presión nominal", "PN10 / PN16"], ["Diseño", "DIN 3352 F4"], ["Cuerpo y tapa", "Hierro dúctil GGG50"]],
      product: "Ver producto",
      datasheet: "Descargar ficha técnica",
      alt: "Válvula de compuerta bridada FUNDIGSAC frente a las tuberías y pasarelas de una planta minera",
    },
    cta: {
      title: "¿Qué línea necesitas abastecer?",
      text: "Cuéntanos qué fluido conduces y en qué tramo, y te orientamos hacia la referencia adecuada.",
      quote: "Solicitar cotización",
    },
  },
  en: {
    crumbs: { home: "Home", section: "Industries", current: "Mining" },
    hero: {
      title: "HDPE pipe, valves and couplings for mining operations",
      lead: "Components to convey, control and isolate fluids in mining processes, from extraction to mineral processing.",
      explore: "See products for this sector",
      alt: "Blue FUNDIGSAC gate valve in front of a mineral processing plant",
    },
    usos: {
      title: "Where they are used",
      lead: "In process water, slurry, recirculation and auxiliary service systems.",
      items: [
        { title: "Slurry and process water conveyance", text: "Components for transport, recirculation and distribution lines in concentrator plants.", alt: "Water discharged from process pipes at a mining plant" },
        { title: "Process isolation and control", text: "Valves and fittings to isolate sections and control flow in the operation.", alt: "Process water basin with walkways and a mining plant behind it" },
      ],
    },
    tabla: {
      title: "What goes on a mining line",
      lead: "Sizes, material and pressure class are confirmed when you request a quote, based on your line's conditions.",
      columns: ["Need", "What we offer", "Catalog"],
      rows: [
        { need: "HDPE pipe and butt-fusion fittings", pieces: "SDR11 butt-fusion elbows, tees, reducers, end caps and flanges.", link: "See HDPE fittings" },
        { need: "Butt-fusion equipment", pieces: "HDC series machines for 40 to 630 mm, HDL, HDT and HDY models, and HDM electrofusion.", link: "See equipment" },
        { need: "Couplings and joints for quick repairs", pieces: "AGR wide-range coupling, ABGR flange adapter and restrained coupling for HDPE pipe.", link: "See couplings" },
        { need: "Valves and joints for process lines", pieces: "Flanged and restrained gate valves, knife gate valve and flexible joints.", link: "See valves" },
      ],
    },
    featured: {
      title: "FUNDIGSAC gate valve",
      lead: "Resilient seat and flanged ends, to isolate and shut off flow in water lines.",
      facts: [["Nominal range", "DN50 to DN600"], ["Nominal pressure", "PN10 / PN16"], ["Design", "DIN 3352 F4"], ["Body and bonnet", "Ductile iron GGG50"]],
      product: "View product",
      datasheet: "Download data sheet",
      alt: "FUNDIGSAC flanged gate valve in front of pipes and walkways at a mining plant",
    },
    cta: {
      title: "Which line do you need to supply?",
      text: "Tell us what fluid you convey and on which section, and we will point you to the right reference.",
      quote: "Request a quote",
    },
  },
};

export function useMining() {
  const [lang] = useLang();
  return MINING[lang];
}
