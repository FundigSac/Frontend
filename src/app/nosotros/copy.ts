import type { Pair } from "../_legal/copy";

type About = {
  home: string;
  crumb: string;
  title: string;
  lead: string;
  heroAlt: string;
  heroAction: string;
  highlights: readonly { title: string; text: string }[];
  sectors: { title: string; items: readonly { name: string; text: string; href: string }[] };
  history: { title: string; text: string };
  timelineTitle: string;
  timeline: readonly { year: string; title: string; text: string }[];
  essence: { title: string; photoAlt: string };
  mission: { title: string; text: string };
  vision: { title: string; text: string };
  values: { title: string; items: readonly string[] };
  company: { title: string; labels: { name: string; ruc: string; address: string; phone: string; email: string; hours: string }; hours: string };
  cta: { title: string; text: string; cta: string };
};

export const ABOUT: Pair<About> = {
  es: {
    home: "Inicio",
    crumb: "Nosotros",
    title: "Quiénes somos",
    lead: "FUNDIGSAC es una empresa peruana especializada en soluciones de hierro dúctil para agua, alcantarillado e infraestructura urbana.",
    heroAlt: "Ingeniero de FUNDIGSAC observando una planta de tratamiento de agua con tuberías azules",
    heroAction: "Hablar con el equipo",
    highlights: [
      { title: "Experiencia", text: "Años de trayectoria en el mercado nacional." },
      { title: "Equipo especializado", text: "Profesionales con conocimiento técnico." },
      { title: "Soluciones confiables", text: "Productos de alta calidad para proyectos exigentes." },
      { title: "Compromiso en el Perú", text: "Contribuimos al desarrollo de infraestructura sostenible." },
    ],
    sectors: {
      title: "A quién atendemos",
      items: [
        { name: "Saneamiento", text: "Redes de agua potable y alcantarillado.", href: "/industrias/saneamiento" },
        { name: "Minería", text: "Agua de proceso, pulpas y recirculación.", href: "/industrias/mineria" },
        { name: "Agricultura", text: "Sistemas de riego y distribución en campo.", href: "/industrias/agricultura" },
        { name: "Industria", text: "Líneas de proceso y servicios de planta.", href: "/industrias#industria" },
      ],
    },
    history: {
      title: "Trabajamos en todo el Perú",
      text: "Abastecemos a los sectores de saneamiento, agricultura, minería e industria, y participamos en proyectos de infraestructura en todo el país.",
    },
    timelineTitle: "Nuestra historia",
    timeline: [
      { year: "2005", title: "Inicio de operaciones", text: "Empezamos a atender la demanda de soluciones para agua e infraestructura." },
      { year: "2010", title: "Más líneas de producto", text: "Sumamos nuevas líneas y marcas reconocidas a nivel internacional." },
      { year: "2015", title: "Proyectos a escala nacional", text: "Participamos en proyectos de gran envergadura en el país." },
      { year: "2020", title: "Consolidación", text: "Fortalecimos nuestra infraestructura y nuestros procesos comerciales." },
      { year: "2024", title: "Seguimos avanzando", text: "Mantenemos el compromiso con la calidad, la innovación y el desarrollo sostenible del país." },
    ],
    essence: { title: "Misión, visión y valores", photoAlt: "Planta de FUNDIGSAC con tuberías de hierro dúctil azules en el patio" },
    mission: { title: "Misión", text: "Brindar soluciones en hierro dúctil de alta calidad que contribuyan al desarrollo de infraestructura segura, eficiente y sostenible en el Perú." },
    vision: { title: "Visión", text: "Ser reconocidos como la empresa líder en soluciones para agua e infraestructura en el Perú, por nuestra calidad, innovación y compromiso con los clientes." },
    values: { title: "Valores", items: ["Integridad", "Calidad", "Compromiso", "Trabajo en equipo", "Innovación", "Orientación al cliente"] },
    company: {
      title: "Datos de la empresa",
      labels: { name: "Razón social", ruc: "RUC", address: "Dirección", phone: "Teléfono y WhatsApp", email: "Correo", hours: "Horario de atención" },
      hours: "Todos los días, de 08:00 a 19:00",
    },
    cta: { title: "¿Tienes una obra en marcha?", text: "Cuéntanos qué necesitas y te ayudamos a definir piezas, medidas y clase de presión.", cta: "Solicitar cotización" },
  },
  en: {
    home: "Home",
    crumb: "About us",
    title: "Who we are",
    lead: "FUNDIGSAC is a Peruvian company specialized in ductile iron solutions for water, sewerage and urban infrastructure.",
    heroAlt: "FUNDIGSAC engineer looking at a water treatment plant with blue pipes",
    heroAction: "Talk to the team",
    highlights: [
      { title: "Experience", text: "Years of track record in the national market." },
      { title: "Specialized team", text: "Professionals with technical expertise." },
      { title: "Reliable solutions", text: "High-quality products for demanding projects." },
      { title: "Commitment to Peru", text: "We contribute to sustainable infrastructure development." },
    ],
    sectors: {
      title: "Who we serve",
      items: [
        { name: "Sanitation", text: "Drinking water and sewer networks.", href: "/industrias/saneamiento" },
        { name: "Mining", text: "Process water, slurry and recirculation.", href: "/industrias/mineria" },
        { name: "Agriculture", text: "Irrigation and field distribution systems.", href: "/industrias/agricultura" },
        { name: "Industry", text: "Process lines and plant services.", href: "/industrias#industria" },
      ],
    },
    history: {
      title: "We work across Peru",
      text: "We supply the sanitation, agriculture, mining and industry sectors, and take part in infrastructure projects across the country.",
    },
    timelineTitle: "Our history",
    timeline: [
      { year: "2005", title: "Start of operations", text: "We began meeting the demand for water and infrastructure solutions." },
      { year: "2010", title: "More product lines", text: "We added new lines and internationally recognized brands." },
      { year: "2015", title: "Nationwide projects", text: "We took part in large-scale projects across the country." },
      { year: "2020", title: "Consolidation", text: "We strengthened our infrastructure and commercial processes." },
      { year: "2024", title: "Moving forward", text: "We keep our commitment to quality, innovation and the sustainable development of the country." },
    ],
    essence: { title: "Mission, vision and values", photoAlt: "FUNDIGSAC plant with blue ductile iron pipes in the yard" },
    mission: { title: "Mission", text: "To deliver high-quality ductile iron solutions that contribute to safe, efficient and sustainable infrastructure in Peru." },
    vision: { title: "Vision", text: "To be recognized as the leading company in water and infrastructure solutions in Peru, for our quality, innovation and commitment to our clients." },
    values: { title: "Values", items: ["Integrity", "Quality", "Commitment", "Teamwork", "Innovation", "Customer focus"] },
    company: {
      title: "Company details",
      labels: { name: "Registered name", ruc: "Tax ID (RUC)", address: "Address", phone: "Phone and WhatsApp", email: "Email", hours: "Opening hours" },
      hours: "Every day, 8:00 a.m. to 7:00 p.m.",
    },
    cta: { title: "Do you have a project under way?", text: "Tell us what you need and we will help you define parts, sizes and pressure class.", cta: "Request a quote" },
  },
};
