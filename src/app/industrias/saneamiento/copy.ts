"use client";

import { useLang } from "@/shared/layout/landing-prefs";

export const SANEA = {
  es: {
    crumbs: { home: "Inicio", current: "Saneamiento" },
    hero: {
      eyebrow: "Sector saneamiento",
      title: "Soluciones para agua y saneamiento que sostienen ciudades.",
      lead: "Componentes en hierro dúctil para redes de agua potable, infraestructura sanitaria y plantas de tratamiento.",
      explore: "Explorar productos",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta FUNDIGSAC sobre el muro de una planta de tratamiento de agua",
    },
    featured: {
      eyebrow: "Producto destacado",
      title: "Válvula de compuerta FUNDIGSAC",
      lead: ["Diseñada para un control de flujo confiable en redes de agua potable y sistemas de saneamiento. Fabricada en ", "hierro dúctil", " con alta resistencia y larga vida útil."],
      features: [
        { title: "Alta resistencia", text: "para operación continua." },
        { title: "Confiabilidad en redes", text: "de agua y saneamiento." },
        { title: "Larga vida útil", text: "en entornos exigentes." },
      ],
      datasheet: "Ver ficha técnica",
      product: "Ver producto",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta bridada FUNDIGSAC instalada junto a tuberías de acero en una planta de tratamiento",
    },
    apps: {
      eyebrow: "Nuestras soluciones en saneamiento",
      title: "Aplicaciones en infraestructura para ciudades más saludables.",
      lead: "Nuestros componentes están presentes en redes de distribución de agua potable, sistemas de alcantarillado sanitario y plantas de tratamiento, contribuyendo a un servicio eficiente y seguro.",
      more: "Ver soluciones",
      items: [
        { title: "Agua potable", text: "Componentes para redes de distribución que garantizan un servicio confiable y de calidad para la población.", alt: "Reservorio de agua tratada en una planta potabilizadora" },
        { title: "Alcantarillado sanitario", text: "Soluciones para la conducción de aguas residuales y sistemas de tratamiento.", alt: "Canal de aguas residuales en una planta de tratamiento" },
      ],
    },
    line: {
      eyebrow: "Nuestra línea para saneamiento",
      title: "Componentes para redes que no se detienen.",
      all: "Ver toda la línea",
      items: [
        { title: "Marcos y tapas", alt: "Marco y tapa circular de hierro dúctil instalada en adoquín" },
        { title: "Tuberías", alt: "Tuberías azules apiladas en una planta de tratamiento" },
        { title: "Acoples", alt: "Acople de hierro dúctil con pernos de acero inoxidable" },
        { title: "Válvulas", alt: "Válvula de compuerta FUNDIGSAC en una planta de tratamiento" },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Documentación técnica para tus proyectos.",
      lead: "Fichas técnicas, especificaciones, planos y catálogos en un solo lugar.",
      cta: "Explorar recursos técnicos",
      alt: "Catálogo FUNDIGSAC Válvulas para saneamiento junto a un plano técnico con tabla de dimensiones",
    },
    cta: {
      eyebrow: "Trabajamos juntos",
      title: "Impulsamos infraestructura para un mejor servicio de saneamiento.",
      text: "Nuestro equipo te asesorará para encontrar la mejor solución para tu proyecto.",
      quote: "Solicitar cotización",
    },
  },
  en: {
    crumbs: { home: "Home", current: "Sanitation" },
    hero: {
      eyebrow: "Water & sanitation sector",
      title: "Water and sanitation solutions that keep cities running.",
      lead: "Ductile iron components for drinking water networks, sanitation infrastructure and treatment plants.",
      explore: "Explore products",
      quote: "Request a quote",
      alt: "FUNDIGSAC gate valve on the wall of a water treatment plant",
    },
    featured: {
      eyebrow: "Featured product",
      title: "FUNDIGSAC gate valve",
      lead: ["Designed for reliable flow control in drinking water networks and sanitation systems. Made of ", "ductile iron", " for high strength and a long service life."],
      features: [
        { title: "High strength", text: "for continuous operation." },
        { title: "Network reliability", text: "for water and sanitation." },
        { title: "Long service life", text: "in demanding environments." },
      ],
      datasheet: "View data sheet",
      product: "View product",
      quote: "Request a quote",
      alt: "FUNDIGSAC flanged gate valve installed next to steel pipes in a treatment plant",
    },
    apps: {
      eyebrow: "Our sanitation solutions",
      title: "Infrastructure applications for healthier cities.",
      lead: "Our components are part of drinking water distribution networks, sanitary sewer systems and treatment plants, supporting an efficient and safe service.",
      more: "View solutions",
      items: [
        { title: "Drinking water", text: "Components for distribution networks that deliver a reliable, high-quality service.", alt: "Treated water reservoir in a water treatment plant" },
        { title: "Sanitary sewer", text: "Solutions for wastewater conveyance and treatment systems.", alt: "Wastewater channel in a treatment plant" },
      ],
    },
    line: {
      eyebrow: "Our sanitation line",
      title: "Components for networks that never stop.",
      all: "See the full line",
      items: [
        { title: "Frames and covers", alt: "Round ductile iron manhole frame and cover set in paving" },
        { title: "Pipes", alt: "Stacked blue pipes at a treatment plant" },
        { title: "Couplings", alt: "Ductile iron coupling with stainless steel bolts" },
        { title: "Valves", alt: "FUNDIGSAC gate valve at a treatment plant" },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Technical documentation for your projects.",
      lead: "Data sheets, specifications, drawings and catalogs in one place.",
      cta: "Explore technical resources",
      alt: "FUNDIGSAC catalog: Valves for sanitation next to a technical drawing with a dimensions table",
    },
    cta: {
      eyebrow: "Working together",
      title: "Building infrastructure for a better sanitation service.",
      text: "Our team will help you find the best solution for your project.",
      quote: "Request a quote",
    },
  },
};

export function useSanea() {
  const [lang] = useLang();
  return SANEA[lang];
}
