"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { SectorCopy } from "../_sector/sector-page";

export const MINING: Record<"es" | "en", SectorCopy> = {
  es: {
    crumbs: { home: "Inicio", current: "Minería" },
    hero: {
      eyebrow: "Sector minería",
      title: "Soluciones para\nminería que resisten\noperaciones exigentes.",
      lead: "Componentes en hierro dúctil para la conducción, control y aislamiento de fluidos en procesos mineros, desde la extracción hasta el procesamiento de minerales.",
      explore: "Explorar productos",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta azul FUNDIGSAC frente a una planta de procesamiento de minerales",
    },
    featured: {
      eyebrow: "Producto destacado",
      title: "Válvula de compuerta\nFUNDIGSAC para minería",
      lead: ["Diseñada para un control de flujo confiable en sistemas de agua de proceso, pulpas y líneas de conducción en entornos mineros de ", "alta exigencia", "."],
      features: [
        { title: "Alta resistencia", text: "para condiciones abrasivas y exigentes." },
        { title: "Control confiable", text: "operación segura y de larga vida útil." },
        { title: "Desempeño en entornos exigentes", text: "minería a gran escala." },
      ],
      datasheet: "Ver ficha técnica",
      product: "Ver producto",
      quote: "Solicitar cotización",
      alt: "Válvula de compuerta bridada FUNDIGSAC frente a las tuberías y pasarelas de una planta minera",
    },
    apps: {
      eyebrow: "Nuestras soluciones en minería",
      title: "Aplicaciones en procesos mineros\nque mantienen la operación en movimiento.",
      lead: "Nuestros componentes están presentes en sistemas de conducción de agua de proceso, pulpas, recirculación y servicios auxiliares, contribuyendo a una operación minera más segura y confiable.",
      more: "Ver soluciones",
      items: [
        { title: "Conducción de pulpas y agua de proceso", text: "Componentes para líneas de transporte, recirculación y distribución en plantas concentradoras.", alt: "Descarga de agua desde tuberías de proceso en una planta minera" },
        { title: "Aislamiento y control de procesos", text: "Válvulas y accesorios para una operación segura y continua en entornos mineros.", alt: "Estanque de agua de proceso con pasarelas y una planta minera al fondo" },
      ],
    },
    line: {
      eyebrow: "Nuestra línea para minería",
      title: "",
      all: "",
      items: [
        { title: "Válvulas", alt: "Válvula de compuerta bridada FUNDIGSAC de hierro dúctil" },
        { title: "Tuberías", alt: "Tuberías negras y azules para conducción de agua" },
        { title: "Acoples", alt: "Acople bridado azul con junta interior negra y pernos metálicos" },
        { title: "Válvulas de aire", alt: "Válvula azul con volante y conexiones bridadas en una planta minera" },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Documentación técnica para tus proyectos mineros.",
      lead: "Consulta fichas técnicas, especificaciones y catálogos en un solo lugar.",
      cta: "Explorar recursos técnicos",
      campaigns: "Campañas y sobrestock",
      alt: "Vista referencial del catálogo FUNDIGSAC de válvulas para minería con planos y tablas técnicas",
    },
    cta: {
      eyebrow: "Trabajamos juntos",
      title: "Impulsamos infraestructura\npara una minería más segura y eficiente.",
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
      alt: "Blue FUNDIGSAC gate valve in front of a mineral processing plant",
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
      alt: "FUNDIGSAC flanged gate valve in front of pipes and walkways at a mining plant",
    },
    apps: {
      eyebrow: "Our mining solutions",
      title: "Mining process applications that keep operations moving.",
      lead: "Our components are part of process water, slurry, recirculation and auxiliary service systems, supporting safer and more reliable mining operations.",
      more: "View solutions",
      items: [
        { title: "Slurry and process water conveyance", text: "Components for transport, recirculation and distribution lines in concentrator plants.", alt: "Water discharged from process pipes at a mining plant" },
        { title: "Process isolation and control", text: "Valves and fittings for safe, continuous operation in mining environments.", alt: "Process water basin with walkways and a mining plant behind it" },
      ],
    },
    line: {
      eyebrow: "Our mining line",
      title: "",
      all: "",
      items: [
        { title: "Valves", alt: "FUNDIGSAC flanged ductile iron gate valve" },
        { title: "Pipes", alt: "Black and blue pipes for water conveyance" },
        { title: "Couplings", alt: "Blue flanged coupling with a black inner seal and metal bolts" },
        { title: "Air valves", alt: "Blue valve with a handwheel and flanged connections at a mining plant" },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Technical documentation for your mining projects.",
      lead: "Data sheets, specifications and catalogs in one place.",
      cta: "Explore technical resources",
      campaigns: "Campaigns and overstock",
      alt: "Illustrative FUNDIGSAC mining valve catalog with technical drawings and tables",
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
