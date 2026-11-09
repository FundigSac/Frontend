"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { FeaturedText } from "../_sector/sector-kit";

type Piece = { name: string; use: string; href: string };

export const SANEA: Record<"es" | "en", {
  crumbs: { home: string; section: string; current: string };
  hero: { title: string; lead: string; explore: string; alt: string };
  featured: FeaturedText;
  redes: { title: string; lead: string; items: readonly { title: string; text: string; alt: string; pieces: readonly Piece[] }[] };
  line: { title: string; all: string; items: readonly { name: string; note: string; alt: string }[] };
  cta: { title: string; text: string; quote: string };
}> = {
  es: {
    crumbs: { home: "Inicio", section: "Industrias", current: "Saneamiento" },
    hero: {
      title: "Válvulas, tuberías y tapas para redes de agua y desagüe",
      lead: "Componentes de hierro dúctil para agua potable, alcantarillado y plantas de tratamiento.",
      explore: "Ver productos del sector",
      alt: "Válvula de compuerta FUNDIGSAC sobre el muro de una planta de tratamiento de agua",
    },
    featured: {
      title: "Válvula de compuerta FUNDIGSAC",
      lead: "De asiento resiliente y extremos bridados, para aislar y cortar el flujo en redes de agua potable.",
      facts: [["Rango nominal", "DN50 a DN600"], ["Presión nominal", "PN10 / PN16"], ["Diseño", "DIN 3352 F4"], ["Cuerpo y tapa", "Hierro dúctil GGG50"]],
      product: "Ver producto",
      datasheet: "Descargar ficha técnica",
      alt: "Válvula de compuerta bridada FUNDIGSAC instalada junto a tuberías de acero en una planta de tratamiento",
    },
    redes: {
      title: "Qué va en cada frente de la red",
      lead: "Las piezas que suelen pedirse en cada caso. Cada fila abre su ficha o su familia del catálogo.",
      items: [
        {
          title: "Agua potable",
          text: "Redes de distribución, tanques y reservorios.",
          alt: "Reservorio de agua tratada en una planta potabilizadora",
          pieces: [
            { name: "Válvula de compuerta FUNDIGSAC", use: "Aísla y corta el flujo en la red.", href: "/productos/valvulas/valvula-compuerta-fundigsac" },
            { name: "Válvula reductora de presión", use: "Mantiene estable la presión aguas abajo.", href: "/productos/valvulas/valvula-reductora-de-presion" },
            { name: "Válvula flotadora bridada", use: "Evita que el tanque rebose o se vacíe.", href: "/productos/valvulas/valvula-flotadora-bridada" },
            { name: "Tubería de hierro dúctil", use: "Clases C40, K9 y K7.", href: "/productos/tuberias/tuberia-hierro-ductil-c40-k9-k7-thd" },
          ],
        },
        {
          title: "Alcantarillado sanitario",
          text: "Conducción de aguas residuales y acceso a buzones.",
          alt: "Canal de aguas residuales en una planta de tratamiento",
          pieces: [
            { name: "Marco y tapa pesada 2SEG", use: "Para buzones, con dos seguros.", href: "/productos/marcos-y-tapas/marco-y-tapa-pesada-2seg" },
            { name: "Marco y tapa liviana 1SEG", use: "Para buzones, con un seguro.", href: "/productos/marcos-y-tapas/marco-y-tapa-liviana-1seg" },
            { name: "Válvula de embone tipo Luflex", use: "Se une a la tubería sin bridas ni pernos.", href: "/productos/valvulas/valvula-embone-tipo-luflex" },
            { name: "Acoples y uniones", use: "Para empalmar y reparar tramos.", href: "/productos/conexiones-y-fittings" },
          ],
        },
        {
          title: "Plantas de tratamiento",
          text: "Líneas de bombeo y presión dentro de la planta.",
          alt: "Válvula de compuerta azul junto a una línea de tuberías en una planta de tratamiento",
          pieces: [
            { name: "Válvula check swing", use: "Cierra sola cuando el flujo se invierte.", href: "/productos/valvulas/valvula-check-swing" },
            { name: "Válvula check flex", use: "Un disco de caucho corta el retorno del agua.", href: "/productos/valvulas/valvula-check-flex" },
            { name: "Medidor electromagnético", use: "Mide el caudal, con transmisor y cable de señal.", href: "/productos/medidores/medidor-electromagnetico-melec" },
          ],
        },
      ],
    },
    line: {
      title: "Línea para saneamiento",
      all: "Ver todo el catálogo",
      items: [
        { name: "Tubería de hierro dúctil C40 · K9 · K7", note: "Para redes de agua.", alt: "Tubería de hierro dúctil THD" },
        { name: "Válvula compuerta bridada VBBH", note: "Con extremos bridados.", alt: "Válvula compuerta bridada VBBH" },
        { name: "Marco y tapa pesada 2SEG", note: "Para buzones, con dos seguros.", alt: "Marco y tapa de hierro para buzón" },
        { name: "Acople gran rango AGR", note: "Para uniones de tuberías.", alt: "Acople gran rango AGR" },
      ],
    },
    cta: {
      title: "¿Qué red vas a construir o renovar?",
      text: "Envíanos tu lista de materiales y confirmamos contigo medidas, clase de presión y compatibilidad.",
      quote: "Solicitar cotización",
    },
  },
  en: {
    crumbs: { home: "Home", section: "Industries", current: "Sanitation" },
    hero: {
      title: "Valves, pipes and covers for water and sewer networks",
      lead: "Ductile iron components for drinking water, sewers and treatment plants.",
      explore: "See products for this sector",
      alt: "FUNDIGSAC gate valve on the wall of a water treatment plant",
    },
    featured: {
      title: "FUNDIGSAC gate valve",
      lead: "Resilient seat and flanged ends, to isolate and shut off flow in drinking water networks.",
      facts: [["Nominal range", "DN50 to DN600"], ["Nominal pressure", "PN10 / PN16"], ["Design", "DIN 3352 F4"], ["Body and bonnet", "Ductile iron GGG50"]],
      product: "View product",
      datasheet: "Download data sheet",
      alt: "FUNDIGSAC flanged gate valve installed next to steel pipes in a treatment plant",
    },
    redes: {
      title: "What goes on each part of the network",
      lead: "The parts usually requested in each case. Each row opens its data sheet or catalog family.",
      items: [
        {
          title: "Drinking water",
          text: "Distribution networks, tanks and reservoirs.",
          alt: "Treated water reservoir in a water treatment plant",
          pieces: [
            { name: "FUNDIGSAC gate valve", use: "Isolates and shuts off flow in the network.", href: "/productos/valvulas/valvula-compuerta-fundigsac" },
            { name: "Pressure-reducing valve", use: "Keeps downstream pressure steady.", href: "/productos/valvulas/valvula-reductora-de-presion" },
            { name: "Flanged float valve", use: "Stops the tank from overflowing or running dry.", href: "/productos/valvulas/valvula-flotadora-bridada" },
            { name: "Ductile iron pipe", use: "Classes C40, K9 and K7.", href: "/productos/tuberias/tuberia-hierro-ductil-c40-k9-k7-thd" },
          ],
        },
        {
          title: "Sanitary sewer",
          text: "Wastewater conveyance and manhole access.",
          alt: "Wastewater channel in a treatment plant",
          pieces: [
            { name: "Heavy-duty frame and cover 2SEG", use: "For manholes, with two locks.", href: "/productos/marcos-y-tapas/marco-y-tapa-pesada-2seg" },
            { name: "Light-duty frame and cover 1SEG", use: "For manholes, with one lock.", href: "/productos/marcos-y-tapas/marco-y-tapa-liviana-1seg" },
            { name: "Luflex push-on gate valve", use: "Joins the pipe with no flanges or bolts.", href: "/productos/valvulas/valvula-embone-tipo-luflex" },
            { name: "Couplings and joints", use: "To connect and repair sections.", href: "/productos/conexiones-y-fittings" },
          ],
        },
        {
          title: "Treatment plants",
          text: "Pumping and pressure lines inside the plant.",
          alt: "Blue gate valve next to a pipe line at a treatment plant",
          pieces: [
            { name: "Swing check valve", use: "Closes by itself when the flow reverses.", href: "/productos/valvulas/valvula-check-swing" },
            { name: "Flex check valve", use: "A rubber disc stops backflow.", href: "/productos/valvulas/valvula-check-flex" },
            { name: "Electromagnetic meter", use: "Measures flow, with transmitter and signal cable.", href: "/productos/medidores/medidor-electromagnetico-melec" },
          ],
        },
      ],
    },
    line: {
      title: "Sanitation line",
      all: "See the full catalog",
      items: [
        { name: "Ductile iron pipe C40 · K9 · K7", note: "For water networks.", alt: "THD ductile iron pipe" },
        { name: "Flanged gate valve VBBH", note: "With flanged ends.", alt: "VBBH flanged gate valve" },
        { name: "Heavy-duty frame and cover 2SEG", note: "For manholes, with two locks.", alt: "Iron manhole frame and cover" },
        { name: "Wide-range coupling AGR", note: "For pipe joints.", alt: "AGR wide-range coupling" },
      ],
    },
    cta: {
      title: "Which network are you building or renewing?",
      text: "Send us your bill of materials and we will confirm sizes, pressure class and compatibility with you.",
      quote: "Request a quote",
    },
  },
};

export function useSanea() {
  const [lang] = useLang();
  return SANEA[lang];
}
