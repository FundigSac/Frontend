import type { Pair } from "../_legal/copy";

type About = {
  crumb: string;
  title: string;
  lead: string;
  highlightsLabel: string;
  highlights: readonly { title: string; text: string }[];
  history: { eyebrow: string; title: string; text: string; cta: string; since: { label: string; text: string } };
  timeline: readonly { year: string; title: string; text: string }[];
  essence: { eyebrow: string; title: string; photoAlt: string };
  mission: { title: string; text: string };
  vision: { title: string; text: string };
  values: { title: string; items: readonly string[] };
  cta: { eyebrow: string; title: string; text: string; cta: string };
};

export const ABOUT: Pair<About> = {
  es: {
    crumb: "Nosotros",
    title: "Quiénes somos",
    lead: "Somos FUNDIGSAC, una empresa peruana especializada en soluciones en hierro dúctil para agua, alcantarillado e infraestructura urbana, contribuyendo al desarrollo seguro y sostenible del país.",
    highlightsLabel: "Lo que nos distingue",
    highlights: [
      { title: "Experiencia", text: "Años de trayectoria en el mercado nacional." },
      { title: "Equipo especializado", text: "Profesionales con conocimiento técnico." },
      { title: "Soluciones confiables", text: "Productos de alta calidad para proyectos exigentes." },
      { title: "Compromiso en el Perú", text: "Contribuimos al desarrollo de infraestructura sostenible." },
    ],
    history: {
      eyebrow: "Nuestra historia",
      title: "Trayectoria que impulsa el desarrollo",
      text: "Desde nuestros inicios, hemos trabajado con el propósito de brindar soluciones confiables y de calidad para el sector saneamiento, agricultura, minería e industria, consolidándonos como un aliado estratégico en proyectos de infraestructura en todo el Perú.",
      cta: "Conoce nuestra historia",
      since: { label: "Desde", text: "Soluciones en hierro dúctil para el agua y la infraestructura del Perú." },
    },
    timeline: [
      { year: "2005", title: "Inicio de operaciones", text: "Comenzamos nuestras actividades con el objetivo de atender la creciente demanda de soluciones en agua e infraestructura." },
      { year: "2010", title: "Expansión de portafolio", text: "Incorporamos nuevas líneas de productos y marcas reconocidas a nivel internacional." },
      { year: "2015", title: "Mayor presencia en el mercado", text: "Participamos en proyectos de gran envergadura a nivel nacional." },
      { year: "2020", title: "Consolidación", text: "Fortalecimos nuestra infraestructura y procesos comerciales." },
      { year: "2024", title: "Seguimos avanzando", text: "Reafirmamos nuestro compromiso con la calidad, la innovación y el desarrollo sostenible del país." },
    ],
    essence: { eyebrow: "Nuestra esencia", title: "Misión, Visión y Valores", photoAlt: "Planta de FUNDIGSAC con tuberías de hierro dúctil azules en el patio" },
    mission: { title: "Misión", text: "Brindar soluciones en hierro dúctil de alta calidad que contribuyan al desarrollo de infraestructura segura, eficiente y sostenible en el Perú." },
    vision: { title: "Visión", text: "Ser reconocidos como la empresa líder en soluciones para agua e infraestructura en el Perú, destacando por nuestra calidad, innovación y compromiso con nuestros clientes." },
    values: { title: "Valores", items: ["Integridad", "Calidad", "Compromiso", "Trabajo en equipo", "Innovación", "Orientación al cliente"] },
    cta: { eyebrow: "Trabajamos por un mejor Perú", title: "Juntos construimos infraestructura para un futuro sostenible.", text: "Conoce más sobre nuestras soluciones y cómo podemos apoyar en tu próximo proyecto.", cta: "Solicitar cotización" },
  },
  en: {
    crumb: "About us",
    title: "Who we are",
    lead: "We are FUNDIGSAC, a Peruvian company specialized in ductile iron solutions for water, sewerage and urban infrastructure, contributing to the safe and sustainable development of the country.",
    highlightsLabel: "What sets us apart",
    highlights: [
      { title: "Experience", text: "Years of track record in the national market." },
      { title: "Specialized team", text: "Professionals with technical expertise." },
      { title: "Reliable solutions", text: "High-quality products for demanding projects." },
      { title: "Commitment to Peru", text: "We contribute to sustainable infrastructure development." },
    ],
    history: {
      eyebrow: "Our history",
      title: "A track record that drives development",
      text: "Since the beginning, we have worked to deliver reliable, quality solutions for the sanitation, agriculture, mining and industry sectors, becoming a strategic partner in infrastructure projects across Peru.",
      cta: "Discover our story",
      since: { label: "Since", text: "Ductile iron solutions for Peru’s water and infrastructure." },
    },
    timeline: [
      { year: "2005", title: "Start of operations", text: "We began operating to meet the growing demand for water and infrastructure solutions." },
      { year: "2010", title: "Portfolio expansion", text: "We added new product lines and internationally recognized brands." },
      { year: "2015", title: "Greater market presence", text: "We took part in large-scale projects across the country." },
      { year: "2020", title: "Consolidation", text: "We strengthened our infrastructure and commercial processes." },
      { year: "2024", title: "Moving forward", text: "We reaffirm our commitment to quality, innovation and the sustainable development of the country." },
    ],
    essence: { eyebrow: "Our essence", title: "Mission, Vision and Values", photoAlt: "FUNDIGSAC plant with blue ductile iron pipes in the yard" },
    mission: { title: "Mission", text: "To deliver high-quality ductile iron solutions that contribute to safe, efficient and sustainable infrastructure in Peru." },
    vision: { title: "Vision", text: "To be recognized as the leading company in water and infrastructure solutions in Peru, standing out for our quality, innovation and commitment to our clients." },
    values: { title: "Values", items: ["Integrity", "Quality", "Commitment", "Teamwork", "Innovation", "Customer focus"] },
    cta: { eyebrow: "Working for a better Peru", title: "Together we build infrastructure for a sustainable future.", text: "Learn more about our solutions and how we can support your next project.", cta: "Request a quote" },
  },
};
