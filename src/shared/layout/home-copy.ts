"use client";

import { useLang } from "./landing-prefs";

export const HOME = {
  es: {
    components: {
      eyebrow: "Componentes y accesorios",
      title: "Todo para la continuidad de tu proyecto.",
      group: "Desplazar componentes",
      prev: "Anterior",
      next: "Siguiente",
      pause: "Pausar desplazamiento automático",
      resume: "Reanudar desplazamiento automático",
      items: [
        { title: "Válvulas", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil" },
        { title: "Marcos y tapas", alt: "Marco y tapa de hierro dúctil instalada en pavimento de adoquín" },
        { title: "Grifos", alt: "Grifo de bronce con palanca azul" },
        { title: "Acoples", alt: "Acople de hierro dúctil con pernos de acero inoxidable" },
        { title: "Tuberías", alt: "Tuberías azules apiladas" },
      ],
    },
    sectors: {
      title: "Soluciones para cada sector.",
      lead: "Componentes para los desafíos de cada proyecto.",
      group: "Recorrer sectores",
      prev: "Sector anterior",
      next: "Sector siguiente",
      cta: "Ver soluciones",
      dots: "Elegir sector",
      goTo: (name: string) => `Ver ${name}`,
      items: [
        { title: "Saneamiento", text: ["Agua potable y", "alcantarillado."] },
        { title: "Agricultura", text: ["Soluciones para", "sistemas de riego."] },
        { title: "Minería", text: ["Componentes para", "operaciones exigentes."] },
      ],
    },
    backing: {
      eyebrow: "Nuestro respaldo",
      title: "Respaldo técnico y comercial para tus proyectos.",
      lead: "Más que productos, brindamos información, asesoría y acompañamiento en cada etapa de tu proyecto.",
      alt: "Ingeniero de FUNDIGSAC revisando planos técnicos en una planta industrial",
      items: [
        { title: "Catálogo por sectores", text: "Encuentra rápidamente las soluciones para tu industria." },
        { title: "Documentación técnica", text: "Fichas, planos y especificaciones actualizadas." },
        { title: "Atención comercial directa", text: "Asesoría especializada para tu proyecto." },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Documentación técnica para tus proyectos.",
      lead: "Consulta productos, especificaciones y fichas en un solo lugar.",
      cta: "Explorar recursos técnicos",
      campaigns: "Campañas y sobrestock",
      mediaLabel: "Ver fichas técnicas y planos",
      alt: "Ficha técnica FUNDIGSAC de válvula compuerta de hierro dúctil junto a su plano con dimensiones",
    },
    location: {
      eyebrow: "Nuestra ubicación",
      title: "Visítanos en Lima.",
      lead: "Acércate para atención comercial y recojo de productos.",
      addressLabel: "Dirección",
      address: ["Jirón Pacasmayo Mz. E Lt. 12", "Cercado de Lima, Lima, Perú"],
      emailLabel: "Correo",
      phoneLabel: "Teléfono y WhatsApp",
      hoursLabel: "Horario",
      hours: "Todos los días, de 08:00 a 19:00",
      directions: "Cómo llegar",
      mapTitle: "Mapa de la ubicación de FUNDIGSAC en Cercado de Lima",
      pin: ["Jr. Pacasmayo Mz. E Lt. 12", "Cercado de Lima"],
    },
    footer: {
      about: "Soluciones en hierro dúctil para agua, alcantarillado e infraestructura urbana. Impulsando el desarrollo del país.",
      products: "Productos",
      sectors: "Sectores",
      resources: "Recursos",
      contact: "Contacto",
      place: "Lima, Perú",
      form: "Formulario de contacto",
      rights: "Todos los derechos reservados.",
      terms: "Términos de uso",
      privacy: "Política de privacidad",
      deletion: "Eliminar cuenta",
      complaints: "Libro de reclamaciones",
      cookies: "Política de cookies",
      cookiePrefs: "Preferencias de cookies",
    },
  },
  en: {
    components: {
      eyebrow: "Components & accessories",
      title: "Everything for your project's continuity.",
      group: "Scroll components",
      prev: "Previous",
      next: "Next",
      pause: "Pause auto-scroll",
      resume: "Resume auto-scroll",
      items: [
        { title: "Valves", alt: "FUNDIGSAC ductile iron gate valve" },
        { title: "Frames & covers", alt: "Ductile iron frame and cover installed on cobblestone paving" },
        { title: "Hydrants", alt: "Brass hydrant with a blue handle" },
        { title: "Couplings", alt: "Ductile iron coupling with stainless steel bolts" },
        { title: "Pipes", alt: "Stacked blue pipes" },
      ],
    },
    sectors: {
      title: "Solutions for every industry.",
      lead: "Components for the challenges of every project.",
      group: "Browse industries",
      prev: "Previous industry",
      next: "Next industry",
      cta: "View solutions",
      dots: "Choose an industry",
      goTo: (name: string) => `Show ${name}`,
      items: [
        { title: "Sanitation", text: ["Drinking water and", "sewerage."] },
        { title: "Agriculture", text: ["Solutions for", "irrigation systems."] },
        { title: "Mining", text: ["Components for", "demanding operations."] },
      ],
    },
    backing: {
      eyebrow: "Our support",
      title: "Technical and commercial support for your projects.",
      lead: "More than products, we provide information, advice and guidance at every stage of your project.",
      alt: "FUNDIGSAC engineer reviewing technical drawings at an industrial plant",
      items: [
        { title: "Catalog by industry", text: "Quickly find the solutions for your industry." },
        { title: "Technical documentation", text: "Up-to-date data sheets, drawings and specifications." },
        { title: "Direct sales support", text: "Specialized advice for your project." },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Technical documentation for your projects.",
      lead: "Browse products, specifications and data sheets in one place.",
      cta: "Explore technical resources",
      campaigns: "Campaigns & overstock",
      mediaLabel: "View data sheets and drawings",
      alt: "FUNDIGSAC ductile iron gate valve data sheet next to its dimensioned drawing",
    },
    location: {
      eyebrow: "Our location",
      title: "Visit us in Lima.",
      lead: "Come by for sales support and product pickup.",
      addressLabel: "Address",
      address: ["Jirón Pacasmayo, Block E, Lot 12", "Cercado de Lima, Lima, Peru"],
      emailLabel: "Email",
      phoneLabel: "Phone and WhatsApp",
      hoursLabel: "Hours",
      hours: "Every day, 8:00 a.m. to 7:00 p.m.",
      directions: "Get directions",
      mapTitle: "Map showing the FUNDIGSAC location in Cercado de Lima",
      pin: ["Jr. Pacasmayo Mz. E Lt. 12", "Cercado de Lima"],
    },
    footer: {
      about: "Ductile iron solutions for water, sewerage and urban infrastructure. Driving the country's development.",
      products: "Products",
      sectors: "Industries",
      resources: "Resources",
      contact: "Contact",
      place: "Lima, Peru",
      form: "Contact form",
      rights: "All rights reserved.",
      terms: "Terms of use",
      privacy: "Privacy policy",
      deletion: "Delete account",
      complaints: "Complaints book",
      cookies: "Cookie policy",
      cookiePrefs: "Cookie preferences",
    },
  },
};

export function useHome() {
  const [lang] = useLang();
  return HOME[lang];
}

export const FLOAT = {
  es: { whatsapp: "Escríbenos por WhatsApp", top: "Volver arriba", message: "Hola FUNDIGSAC, quisiera información sobre sus productos." },
  en: { whatsapp: "Chat with us on WhatsApp", top: "Back to top", message: "Hello FUNDIGSAC, I would like information about your products." },
};

export function useFloat() {
  const [lang] = useLang();
  return FLOAT[lang];
}
