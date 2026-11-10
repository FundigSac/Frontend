"use client";

import { useLang } from "./landing-prefs";

export const HOME = {
  es: {
    components: {
      eyebrow: "Componentes y accesorios",
      title: "Lo que necesita tu obra, de la válvula a la tubería.",
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
      title: "Elige tu sector.",
      lead: "Mira qué productos van en cada tipo de obra.",
      group: "Recorrer sectores",
      prev: "Sector anterior",
      next: "Sector siguiente",
      cta: "Ver productos",
      dots: "Elegir sector",
      goTo: (name: string) => `Ver ${name}`,
      items: [
        { title: "Saneamiento", text: ["Agua potable y", "alcantarillado."] },
        { title: "Agricultura", text: ["Sistemas de", "riego tecnificado."] },
        { title: "Minería", text: ["Redes de agua para", "operaciones mineras."] },
      ],
    },
    backing: {
      eyebrow: "Nuestro respaldo",
      title: "Te acompañamos de la cotización a la obra.",
      lead: "Nuestro equipo técnico y comercial te ayuda a elegir la pieza correcta, con fichas y planos a la mano.",
      alt: "Ingeniero de FUNDIGSAC revisando planos técnicos en una planta industrial",
      items: [
        { title: "Catálogo por sector", text: "Busca por tipo de obra y llega directo a lo que te sirve." },
        { title: "Documentación técnica", text: "Fichas y planos con medidas para revisar antes de comprar." },
        { title: "Habla con un asesor", text: "Te respondemos por WhatsApp, teléfono o correo." },
      ],
    },
    docs: {
      eyebrow: "Recursos técnicos",
      title: "Fichas y planos antes de comprar.",
      lead: "Pide la ficha técnica o el plano que necesites y te lo enviamos.",
      cta: "Pedir documentación",
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
      about: "Válvulas, tapas y tuberías de hierro dúctil para agua, alcantarillado y obras urbanas en todo el Perú.",
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
      title: "What your project needs, from valve to pipe.",
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
      title: "Choose your industry.",
      lead: "See which products go into each kind of project.",
      group: "Browse industries",
      prev: "Previous industry",
      next: "Next industry",
      cta: "View products",
      dots: "Choose an industry",
      goTo: (name: string) => `Show ${name}`,
      items: [
        { title: "Sanitation", text: ["Drinking water and", "sewerage."] },
        { title: "Agriculture", text: ["Modern irrigation", "systems."] },
        { title: "Mining", text: ["Water networks for", "mining operations."] },
      ],
    },
    backing: {
      eyebrow: "Our support",
      title: "We stay with you from quote to job site.",
      lead: "Our technical and sales team helps you pick the right part, with data sheets and drawings at hand.",
      alt: "FUNDIGSAC engineer reviewing technical drawings at an industrial plant",
      items: [
        { title: "Catalog by industry", text: "Search by type of project and go straight to what fits." },
        { title: "Technical documentation", text: "Data sheets and dimensioned drawings to check before you buy." },
        { title: "Talk to an advisor", text: "We answer on WhatsApp, by phone or by email." },
      ],
    },
    docs: {
      eyebrow: "Technical resources",
      title: "Data sheets and drawings before you buy.",
      lead: "Ask for the data sheet or drawing you need and we'll send it.",
      cta: "Request documentation",
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
      about: "Ductile iron valves, covers and pipes for water, sewerage and urban works across Peru.",
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
