"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { FeaturedText } from "../_sector/sector-kit";

type Station = { fn: string; name: string; text: string };

export const AGRI: Record<"es" | "en", {
  crumbs: { home: string; section: string; current: string };
  hero: { title: string; lead: string; explore: string; alt: string };
  linea: { title: string; lead: string; stations: readonly Station[]; pipe: string; pipeLink: string; note: string };
  featured: FeaturedText;
  cta: { title: string; text: string; quote: string };
}> = {
  es: {
    crumbs: { home: "Inicio", section: "Industrias", current: "Agricultura" },
    hero: {
      title: "Válvulas, filtros y tubería HDPE para sistemas de riego",
      lead: "Componentes para riego y distribución de agua en campo, con control de aire, presión y filtrado.",
      explore: "Ver productos del sector",
      alt: "Campo de cultivo con riego por aspersión y montañas al fondo",
    },
    linea: {
      title: "Qué hace cada pieza en la línea de riego",
      lead: "Cada pieza resuelve una función. Abre la que necesites para ver su ficha o su familia.",
      stations: [
        { fn: "Filtrado", name: "Filtro tipo Y bridado", text: "Protege válvulas y equipos de la red." },
        { fn: "Corte", name: "Válvula de compuerta acerrojada", text: "Se une directamente a la tubería HDPE, sin bridas." },
        { fn: "Presión", name: "Válvula reductora de presión", text: "Mantiene estable la presión aguas abajo." },
        { fn: "Aire", name: "Válvula de aire de 3 funciones", text: "Ventosa para el control de aire en la línea." },
        { fn: "Retención", name: "Válvula check swing", text: "Cierra sola cuando el flujo se invierte." },
      ],
      pipe: "Tubería y accesorios HDPE",
      pipeLink: "Ver accesorios HDPE",
      note: "Esquema referencial. La posición de cada pieza depende del diseño hidráulico de tu proyecto.",
    },
    featured: {
      title: "Válvula de compuerta FUNDIGSAC",
      lead: "De asiento resiliente y extremos bridados, para aislar y cortar el flujo en sistemas de riego.",
      facts: [["Rango nominal", "DN50 a DN600"], ["Presión nominal", "PN10 / PN16"], ["Diseño", "DIN 3352 F4"], ["Cuerpo y tapa", "Hierro dúctil GGG50"]],
      product: "Ver producto",
      datasheet: "Descargar ficha técnica",
      alt: "Válvula de compuerta bridada FUNDIGSAC de hierro dúctil junto a una línea de riego",
    },
    cta: {
      title: "¿Estás armando o ampliando un sistema de riego?",
      text: "Cuéntanos cómo es tu línea y te orientamos hacia la referencia adecuada.",
      quote: "Solicitar cotización",
    },
  },
  en: {
    crumbs: { home: "Home", section: "Industries", current: "Agriculture" },
    hero: {
      title: "Valves, strainers and HDPE pipe for irrigation systems",
      lead: "Components for irrigation and field water distribution, with air, pressure and filtration control.",
      explore: "See products for this sector",
      alt: "Crop field with sprinkler irrigation and mountains in the background",
    },
    linea: {
      title: "What each part does on the irrigation line",
      lead: "Each part handles one function. Open the one you need to see its data sheet or family.",
      stations: [
        { fn: "Filtration", name: "Flanged Y-strainer", text: "Protects valves and equipment on the network." },
        { fn: "Shut-off", name: "Restrained-joint gate valve", text: "Joins HDPE pipe directly, with no flanges." },
        { fn: "Pressure", name: "Pressure-reducing valve", text: "Keeps downstream pressure steady." },
        { fn: "Air", name: "3-function air valve", text: "Air valve for air control along the line." },
        { fn: "Backflow", name: "Swing check valve", text: "Closes by itself when the flow reverses." },
      ],
      pipe: "HDPE pipe and fittings",
      pipeLink: "See HDPE fittings",
      note: "Reference diagram. The position of each part depends on the hydraulic design of your project.",
    },
    featured: {
      title: "FUNDIGSAC gate valve",
      lead: "Resilient seat and flanged ends, to isolate and shut off flow in irrigation systems.",
      facts: [["Nominal range", "DN50 to DN600"], ["Nominal pressure", "PN10 / PN16"], ["Design", "DIN 3352 F4"], ["Body and bonnet", "Ductile iron GGG50"]],
      product: "View product",
      datasheet: "Download data sheet",
      alt: "FUNDIGSAC flanged ductile iron gate valve next to an irrigation line",
    },
    cta: {
      title: "Are you building or expanding an irrigation system?",
      text: "Tell us about your line and we will point you to the right reference.",
      quote: "Request a quote",
    },
  },
};

export function useAgri() {
  const [lang] = useLang();
  return AGRI[lang];
}
