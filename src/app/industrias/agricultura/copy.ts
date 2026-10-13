"use client";

import { useLang } from "@/shared/layout/landing-prefs";

export const AGRI = {
  es: {
    hero: {
      eyebrow: "Sector agricultura",
      title: "Soluciones para riego que trabajan con precisión.",
      lead: "Componentes confiables para una conducción y distribución de agua más eficiente.",
      explore: "Explorar productos",
      quote: "Solicitar cotización",
      alt: "Campo de cultivo con riego por aspersión y montañas al fondo",
    },
    featured: {
      eyebrow: "Producto destacado",
      title: "Válvula de compuerta FUNDIGSAC",
      lead: "Diseñada para un control de flujo confiable en sistemas de riego agrícola.",
      features: ["Alta resistencia", "Ideal para sistemas de riego", "Larga vida útil"],
      datasheet: "Ver ficha técnica",
      product: "Ver producto",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta bridada FUNDIGSAC de hierro dúctil junto a una línea de riego",
    },
    line: {
      eyebrow: "Nuestra línea para agricultura",
      title: "Componentes para un sistema de riego completo.",
      all: "Ver toda la línea agrícola",
      items: [
        { title: "Ventosas", alt: "Ventosa de hierro dúctil sobre una tubería de riego" },
        { title: "Filtros Y", alt: "Filtro tipo Y bridado de hierro dúctil" },
        { title: "Tuberías HDPE", alt: "Tuberías HDPE negras con franja azul apiladas" },
        { title: "Válvulas de retención", alt: "Válvula de retención bridada de hierro dúctil" },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Documentación para tus proyectos de riego.",
      lead: "Fichas técnicas, especificaciones y catálogos en un solo lugar.",
      cta: "Ver documentación",
      catalogAlt: "Catálogo FUNDIGSAC Válvulas para agricultura",
      drawingAlt: "Plano técnico de la válvula de compuerta con tabla de dimensiones",
    },
    cta: {
      title: "Hagamos más eficiente tu sistema de riego.",
      text: "Nuestro equipo te asesora para encontrar la mejor solución.",
      quote: "Solicitar cotización",
    },
    motion: { pause: "Pausar animación del fondo", play: "Reproducir animación del fondo" },
    crumbs: { home: "Inicio", sectors: "Sectores", current: "Agricultura" },
  },
  en: {
    hero: {
      eyebrow: "Agriculture sector",
      title: "Irrigation solutions that work with precision.",
      lead: "Reliable components for more efficient water conveyance and distribution.",
      explore: "Explore products",
      quote: "Request a quote",
      alt: "Crop field with sprinkler irrigation and mountains in the background",
    },
    featured: {
      eyebrow: "Featured product",
      title: "FUNDIGSAC gate valve",
      lead: "Designed for reliable flow control in agricultural irrigation systems.",
      features: ["High strength", "Ideal for irrigation systems", "Long service life"],
      datasheet: "View data sheet",
      product: "View product",
      quote: "Request a quote",
      alt: "FUNDIGSAC flanged ductile iron gate valve next to an irrigation line",
    },
    line: {
      eyebrow: "Our agriculture line",
      title: "Components for a complete irrigation system.",
      all: "See the full agricultural line",
      items: [
        { title: "Air valves", alt: "Ductile iron air valve on an irrigation pipe" },
        { title: "Y strainers", alt: "Flanged ductile iron Y strainer" },
        { title: "HDPE pipes", alt: "Stacked black HDPE pipes with a blue stripe" },
        { title: "Check valves", alt: "Flanged ductile iron check valve" },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Documentation for your irrigation projects.",
      lead: "Data sheets, specifications and catalogs in one place.",
      cta: "View documentation",
      catalogAlt: "FUNDIGSAC catalog: Valves for agriculture",
      drawingAlt: "Gate valve technical drawing with a dimensions table",
    },
    cta: {
      title: "Let's make your irrigation system more efficient.",
      text: "Our team advises you to find the best solution.",
      quote: "Request a quote",
    },
    motion: { pause: "Pause background animation", play: "Play background animation" },
    crumbs: { home: "Home", sectors: "Industries", current: "Agriculture" },
  },
};

export function useAgri() {
  const [lang] = useLang();
  return AGRI[lang];
}
