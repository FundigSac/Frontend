import type { Pair } from "@/app/_legal/copy";

/** Textos de la pantalla Contáctanos en español e inglés (el idioma lo elige el selector del sitio). */
export type ReasonId = "documentacion" | "reunion";

export const CONTACT: Pair<{
  crumb: string;
  title: string;
  lead: string;
  heroAlt: string;
  channels: {
    aria: string;
    call: { title: string; text: string };
    mail: { title: string; text: string };
    whatsapp: { title: string; text: string; message: string };
    quote: { title: string; main: string; text: string };
  };
  form: {
    eyebrow: string;
    title: string;
    intro: string;
    aria: string;
    name: [string, string];
    company: [string, string];
    position: [string, string];
    email: [string, string];
    phone: [string, string];
    message: [string, string];
    reasonLabel: string;
    reasons: Record<ReasonId, string>;
    submit: string;
    privacyPre: string;
    privacyLink: string;
    privacyPost: string;
    documentMessage: string;
  };
  ready: { title: string; text: string; mail: string; whatsapp: string; copy: string; copied: string; preview: string; note: string; edit: string };
  offices: {
    eyebrow: string;
    title: string;
    lead: string;
    hoursTitle: string;
    hours: string[];
    arriveTitle: string;
    arrive: string;
    viewMap: string;
  };
  cta: { eyebrow: string; title: string; text: string; cta: string };
}> = {
  es: {
    crumb: "Contacto",
    title: "Contáctanos",
    lead: "Estamos listos para atender tus consultas, cotizaciones y requerimientos técnicos. Nuestro equipo te brindará una respuesta rápida y personalizada.",
    heroAlt: "Sede de FUNDIGSAC con el logotipo en la fachada",
    channels: {
      aria: "Canales de contacto",
      call: { title: "Llámanos", text: "Todos los días, de 08:00 a 19:00." },
      mail: { title: "Escríbenos", text: "Te responderemos en el menor tiempo posible." },
      whatsapp: { title: "WhatsApp", text: "Atención directa y rápida.", message: "Hola FUNDIGSAC, quisiera información sobre sus productos." },
      quote: { title: "Solicita una cotización", main: "Cuéntanos tu proyecto", text: "Te asesoramos según tu necesidad." },
    },
    form: {
      eyebrow: "Envíanos un mensaje",
      title: "Formulario de contacto",
      intro: "Completa tus datos y nos comunicaremos contigo.",
      aria: "Formulario de contacto",
      name: ["Nombre completo", "Ingresa tu nombre"],
      company: ["Empresa", "Ingresa el nombre de tu empresa"],
      position: ["Cargo", "Tu cargo"],
      email: ["Correo electrónico", "ejemplo@empresa.com"],
      phone: ["Teléfono", "Ingresa tu número de teléfono"],
      message: ["Mensaje", "Cuéntanos tu consulta, proyecto o requerimiento…"],
      reasonLabel: "Motivo",
      reasons: { documentacion: "Solicitud de documentación", reunion: "Solicitud de reunión" },
      submit: "Enviar mensaje",
      privacyPre: "Tu información está protegida. Revisa nuestra ",
      privacyLink: "Política de Privacidad",
      privacyPost: ".",
      documentMessage: "Solicito el documento: {document}",
    },
    ready: {
      title: "Tu mensaje está listo para enviar",
      text: "Revisamos tus datos y armamos el texto de tu consulta. Elige cómo enviarlo al equipo de FUNDIGSAC; te responderemos por correo o teléfono.",
      mail: "Enviar por correo",
      whatsapp: "Enviar por WhatsApp",
      copy: "Copiar texto",
      copied: "Texto copiado",
      preview: "Ver el texto que se enviará",
      note: "Tu consulta queda registrada cuando recibimos el mensaje en {email} o por WhatsApp. Si no se abre tu aplicación de correo, usa “Copiar texto” y pégalo en un correo nuevo.",
      edit: "Editar mis datos",
    },
    offices: {
      eyebrow: "Nuestras oficinas",
      title: "Encuéntranos en Lima",
      lead: "Visítanos en nuestras instalaciones. Estaremos encantados de atenderte y brindarte asesoría personalizada.",
      hoursTitle: "Horario de atención",
      hours: ["Todos los días", "8:00 a.m. a 7:00 p.m."],
      arriveTitle: "Cómo llegar",
      arrive: "Estamos en el Cercado de Lima. Escríbenos antes de visitarnos y coordinamos tu atención.",
      viewMap: "Ver en Google Maps",
    },
    cta: {
      eyebrow: "¿Tienes un proyecto?",
      title: "Hablemos de tu próximo proyecto",
      text: "Nuestro equipo técnico y comercial está listo para brindarte soluciones a medida para tus necesidades en agua e infraestructura.",
      cta: "Solicitar una cotización",
    },
  },
  en: {
    crumb: "Contact",
    title: "Contact us",
    lead: "We are ready to help with your questions, quotes and technical requirements. Our team will give you a fast, personalized answer.",
    heroAlt: "FUNDIGSAC headquarters with the logo on the facade",
    channels: {
      aria: "Contact channels",
      call: { title: "Call us", text: "Every day, 8:00 a.m. to 7:00 p.m." },
      mail: { title: "Email us", text: "We will answer as soon as possible." },
      whatsapp: { title: "WhatsApp", text: "Direct and fast support.", message: "Hello FUNDIGSAC, I would like information about your products." },
      quote: { title: "Request a quote", main: "Tell us about your project", text: "We advise you according to your needs." },
    },
    form: {
      eyebrow: "Send us a message",
      title: "Contact form",
      intro: "Fill in your details and we will get back to you.",
      aria: "Contact form",
      name: ["Full name", "Enter your name"],
      company: ["Company", "Enter your company name"],
      position: ["Job title", "Your job title"],
      email: ["Email address", "example@company.com"],
      phone: ["Phone", "Enter your phone number"],
      message: ["Message", "Tell us about your inquiry, project or requirement…"],
      reasonLabel: "Reason",
      reasons: { documentacion: "Documentation request", reunion: "Meeting request" },
      submit: "Send message",
      privacyPre: "Your information is protected. Read our ",
      privacyLink: "Privacy Policy",
      privacyPost: ".",
      documentMessage: "I am requesting the document: {document}",
    },
    ready: {
      title: "Your message is ready to send",
      text: "We checked your details and prepared the text of your inquiry. Choose how to send it to the FUNDIGSAC team; we will reply by email or phone.",
      mail: "Send by email",
      whatsapp: "Send by WhatsApp",
      copy: "Copy text",
      copied: "Text copied",
      preview: "See the text that will be sent",
      note: "Your inquiry is registered when we receive the message at {email} or on WhatsApp. If your email app does not open, use “Copy text” and paste it into a new email.",
      edit: "Edit my details",
    },
    offices: {
      eyebrow: "Our offices",
      title: "Find us in Lima",
      lead: "Visit us at our facilities. We will be glad to help you and give you personalized advice.",
      hoursTitle: "Opening hours",
      hours: ["Every day", "8:00 a.m. to 7:00 p.m."],
      arriveTitle: "How to get here",
      arrive: "We are in Cercado de Lima. Write to us before visiting and we will arrange your appointment.",
      viewMap: "View on Google Maps",
    },
    cta: {
      eyebrow: "Have a project?",
      title: "Let’s talk about your next project",
      text: "Our technical and commercial team is ready to offer tailor-made solutions for your water and infrastructure needs.",
      cta: "Request a quote",
    },
  },
};
