"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { SectorCopy } from "../_sector/sector-page";

export const MINING: Record<"es" | "en", SectorCopy> = {
  es: {
    crumbs: { home: "Inicio", current: "Minería" },
    hero: {
      eyebrow: "Sector minería",
      title: "Soluciones para minería que resisten operaciones exigentes.",
      lead: "Componentes en hierro dúctil para la conducción, control y aislamiento de fluidos en procesos mineros, desde la extracción hasta el procesamiento de minerales.",
      explore: "Explorar productos",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta FUNDIGSAC en una línea de tubería de una operación minera a tajo abierto al atardecer",
    },
    featured: {
      eyebrow: "Producto destacado",
      title: "Válvula de compuerta FUNDIGSAC para minería",
      lead: ["Diseñada para un control de flujo confiable en sistemas de agua de proceso, pulpas y líneas de conducción en entornos mineros de ", "alta exigencia", "."],
      features: [
        { title: "Alta resistencia", text: "para condiciones abrasivas y exigentes." },
        { title: "Control confiable", text: "operación segura y de larga vida útil." },
        { title: "Desempeño en entornos exigentes", text: "minería a gran escala." },
      ],
      datasheet: "Ver ficha técnica",
      product: "Ver producto",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta bridada FUNDIGSAC sobre terreno rocoso con una mina a tajo abierto al fondo",
    },
    apps: {
      eyebrow: "Nuestras soluciones en minería",
      title: "Aplicaciones en procesos mineros que mantienen la operación en movimiento.",
      lead: "Nuestros componentes están presentes en sistemas de conducción de agua de proceso, pulpas, recirculación y servicios auxiliares, contribuyendo a una operación minera más segura y confiable.",
      more: "Ver soluciones",
      items: [
        { title: "Conducción de pulpas y agua de proceso", text: "Componentes para líneas de transporte, recirculación y distribución en plantas concentradoras.", alt: "Línea de tubería con válvulas de compuerta FUNDIGSAC en una planta concentradora" },
        { title: "Aislamiento y control de procesos", text: "Válvulas y accesorios para una operación segura y continua en entornos mineros.", alt: "Espesador circular de una planta minera rodeado de montañas" },
      ],
    },
    line: {
      eyebrow: "Nuestra línea para minería",
      title: "Componentes que soportan la operación.",
      all: "Ver toda la línea",
      items: [
        { title: "Válvulas", alt: "Válvula de compuerta bridada FUNDIGSAC de hierro dúctil" },
        { title: "Acoples", alt: "Acoples de hierro dúctil con pernos de acero inoxidable" },
        { title: "Tuberías", alt: "Tuberías HDPE negras con franja azul" },
        { title: "Bridas y accesorios", alt: "Bridas negras con pernos, tuercas y arandelas" },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Documentación técnica para tus proyectos mineros.",
      lead: "Consulta fichas técnicas, especificaciones y catálogos en un solo lugar.",
      cta: "Explorar recursos técnicos",
      campaigns: "Campañas y sobrestock",
      alt: "Catálogo FUNDIGSAC Soluciones para minería abierto en una página de planos y tablas técnicas",
    },
    cta: {
      eyebrow: "Trabajamos juntos",
      title: "Impulsamos infraestructura para una minería más segura y eficiente.",
      text: "Nuestro equipo te asesora para encontrar la mejor solución para tu proyecto minero.",
      quote: "Solicitar cotización",
    },
  },
  en: {
    crumbs: { home: "Home", current: "Mining" },
    hero: {
      eyebrow: "Mining sector",
      title: "Mining solutions built for demanding operations.",
      lead: "Ductile iron components to convey, control and isolate fluids in mining processes, from extraction to mineral processing.",
      explore: "Explore products",
      quote: "Request a quote",
      alt: "FUNDIGSAC gate valve on a pipeline at an open-pit mine at sunset",
    },
    featured: {
      eyebrow: "Featured product",
      title: "FUNDIGSAC gate valve for mining",
      lead: ["Designed for reliable flow control in process water, slurry and conveyance lines in ", "highly demanding", " mining environments."],
      features: [
        { title: "High strength", text: "for abrasive, demanding conditions." },
        { title: "Reliable control", text: "safe operation and long service life." },
        { title: "Built for tough sites", text: "large-scale mining." },
      ],
      datasheet: "View data sheet",
      product: "View product",
      quote: "Request a quote",
      alt: "FUNDIGSAC flanged gate valve on rocky ground with an open-pit mine behind",
    },
    apps: {
      eyebrow: "Our mining solutions",
      title: "Mining process applications that keep operations moving.",
      lead: "Our components are part of process water, slurry, recirculation and auxiliary service systems, supporting safer and more reliable mining operations.",
      more: "View solutions",
      items: [
        { title: "Slurry and process water conveyance", text: "Components for transport, recirculation and distribution lines in concentrator plants.", alt: "Pipeline with FUNDIGSAC gate valves at a concentrator plant" },
        { title: "Process isolation and control", text: "Valves and fittings for safe, continuous operation in mining environments.", alt: "Circular thickener at a mining plant surrounded by mountains" },
      ],
    },
    line: {
      eyebrow: "Our mining line",
      title: "Components that keep operations running.",
      all: "See the full line",
      items: [
        { title: "Valves", alt: "FUNDIGSAC flanged ductile iron gate valve" },
        { title: "Couplings", alt: "Ductile iron couplings with stainless steel bolts" },
        { title: "Pipes", alt: "Black HDPE pipes with a blue stripe" },
        { title: "Flanges and fittings", alt: "Black flanges with bolts, nuts and washers" },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Technical documentation for your mining projects.",
      lead: "Data sheets, specifications and catalogs in one place.",
      cta: "Explore technical resources",
      campaigns: "Campaigns and overstock",
      alt: "FUNDIGSAC Mining solutions catalog open on a page of drawings and technical tables",
    },
    cta: {
      eyebrow: "Working together",
      title: "Building infrastructure for safer, more efficient mining.",
      text: "Our team will help you find the best solution for your mining project.",
      quote: "Request a quote",
    },
  },
};

export function useMining() {
  const [lang] = useLang();
  return MINING[lang];
}
