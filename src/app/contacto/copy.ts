import type { Pair } from "@/app/_legal/copy";

/** Textos de la pantalla Contáctanos en español e inglés (el idioma lo elige el selector del sitio). */
export type ReasonId = "documentacion" | "reunion";

export type FieldName = "fullName" | "companyName" | "position" | "email" | "phone" | "message";

export const CONTACT: Pair<{
  home: string;
  crumb: string;
  title: string;
  lead: string;
  channels: {
    aria: string;
    title: string;
    call: { title: string; text: string };
    mail: { title: string; text: string };
    whatsapp: { title: string; text: string; message: string };
    quote: { title: string; main: string; text: string };
  };
  form: {
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
    sending: string;
    privacyPre: string;
    privacyLink: string;
    privacyPost: string;
    documentMessage: string;
    errors: {
      summary: string;
      required: Partial<Record<FieldName, string>>;
      email: string;
      phone: string;
      tooShort: string;
    };
  };
  ready: { title: string; text: string; mail: string; whatsapp: string; copy: string; copied: string; preview: string; note: string; edit: string };
  saved: { title: string; text: string; folio: string; again: string; invalid: string; limited: string };
  offices: {
    title: string;
    lead: string;
    addressTitle: string;
    hoursTitle: string;
    hours: string[];
    arriveTitle: string;
    arrive: string;
    viewMap: string;
  };
  cta: { title: string; text: string; cta: string };
}> = {
  es: {
    home: "Inicio",
    crumb: "Contacto",
    title: "Contáctanos",
    lead: "Déjanos tus datos y tu consulta en el formulario, y el equipo de FUNDIGSAC te responde por correo o teléfono. Si tienes prisa, llama o escribe por WhatsApp.",
    channels: {
      aria: "Canales de contacto",
      title: "Otras formas de contactarnos",
      call: { title: "Llámanos", text: "Todos los días, de 08:00 a 19:00." },
      mail: { title: "Escríbenos", text: "Para consultas y cotizaciones." },
      whatsapp: { title: "WhatsApp", text: "Chat directo con el equipo comercial.", message: "Hola FUNDIGSAC, quisiera información sobre sus productos." },
      quote: { title: "Solicita una cotización", main: "Cuéntanos tu proyecto", text: "Arma la lista de productos que necesitas." },
    },
    form: {
      title: "Cuéntanos qué necesitas",
      intro: "Los campos con * son obligatorios.",
      aria: "Formulario de contacto",
      name: ["Nombre completo", "Ingresa tu nombre"],
      company: ["Empresa", "Nombre de tu empresa"],
      position: ["Cargo", "Tu cargo"],
      email: ["Correo electrónico", "ejemplo@empresa.com"],
      phone: ["Teléfono", "Tu número de teléfono"],
      message: ["Mensaje", "Producto, medida, cantidad o la consulta que tengas"],
      reasonLabel: "Motivo",
      reasons: { documentacion: "Solicitud de documentación", reunion: "Solicitud de reunión" },
      submit: "Enviar mensaje",
      sending: "Enviando…",
      privacyPre: "Usamos tus datos solo para responder esta consulta. Revisa nuestra ",
      privacyLink: "Política de Privacidad",
      privacyPost: ".",
      documentMessage: "Solicito el documento: {document}",
      errors: {
        summary: "Revisa estos campos antes de enviar:",
        required: {
          fullName: "Escribe tu nombre completo.",
          companyName: "Escribe el nombre de tu empresa.",
          email: "Escribe tu correo electrónico.",
          phone: "Escribe tu número de teléfono.",
          message: "Escribe tu consulta.",
        },
        email: "El correo no parece válido. Revisa que tenga @ y dominio.",
        phone: "El teléfono debe tener entre 7 y 20 dígitos.",
        tooShort: "El mensaje debe tener al menos 10 caracteres.",
      },
    },
    ready: {
      title: "Tu mensaje está listo para enviar",
      text: "Armamos el texto de tu consulta. Elige cómo enviarlo al equipo de FUNDIGSAC y te responderemos por correo o teléfono.",
      mail: "Enviar por correo",
      whatsapp: "Enviar por WhatsApp",
      copy: "Copiar texto",
      copied: "Texto copiado",
      preview: "Ver el texto que se enviará",
      note: "Tu consulta queda registrada cuando recibimos el mensaje en {email} o por WhatsApp. Si no se abre tu aplicación de correo, usa “Copiar texto” y pégalo en un correo nuevo.",
      edit: "Editar mis datos",
    },
    saved: {
      title: "Recibimos tu consulta",
      text: "Quedó registrada y te enviamos una constancia a tu correo. El equipo de FUNDIGSAC te responderá a la brevedad.",
      folio: "Folio de tu consulta",
      again: "Enviar otra consulta",
      invalid: "El sistema no aceptó algunos datos. Revisa el correo, el celular y que el mensaje tenga al menos 10 caracteres.",
      limited: "Enviaste varias consultas seguidas. Espera unos minutos y vuelve a intentarlo.",
    },
    offices: {
      title: "Encuéntranos en Lima",
      lead: "Escríbenos antes de visitarnos y coordinamos tu atención.",
      addressTitle: "Dirección",
      hoursTitle: "Horario de atención",
      hours: ["Todos los días", "8:00 a.m. a 7:00 p.m."],
      arriveTitle: "Cómo llegar",
      arrive: "Estamos en el Cercado de Lima.",
      viewMap: "Ver en Google Maps",
    },
    cta: {
      title: "Hablemos de tu próximo proyecto",
      text: "Si ya tienes la lista de materiales, envíanosla y preparamos tu cotización.",
      cta: "Solicitar una cotización",
    },
  },
  en: {
    home: "Home",
    crumb: "Contact",
    title: "Contact us",
    lead: "Leave your details and your question in the form, and the FUNDIGSAC team will reply by email or phone. If you are in a hurry, call or message us on WhatsApp.",
    channels: {
      aria: "Contact channels",
      title: "Other ways to reach us",
      call: { title: "Call us", text: "Every day, 8:00 a.m. to 7:00 p.m." },
      mail: { title: "Email us", text: "For inquiries and quotes." },
      whatsapp: { title: "WhatsApp", text: "Direct chat with the sales team.", message: "Hello FUNDIGSAC, I would like information about your products." },
      quote: { title: "Request a quote", main: "Tell us about your project", text: "Put together the list of products you need." },
    },
    form: {
      title: "Tell us what you need",
      intro: "Fields marked with * are required.",
      aria: "Contact form",
      name: ["Full name", "Enter your name"],
      company: ["Company", "Your company name"],
      position: ["Job title", "Your job title"],
      email: ["Email address", "example@company.com"],
      phone: ["Phone", "Your phone number"],
      message: ["Message", "Product, size, quantity or the question you have"],
      reasonLabel: "Reason",
      reasons: { documentacion: "Documentation request", reunion: "Meeting request" },
      submit: "Send message",
      sending: "Sending…",
      privacyPre: "We use your details only to answer this inquiry. Read our ",
      privacyLink: "Privacy Policy",
      privacyPost: ".",
      documentMessage: "I am requesting the document: {document}",
      errors: {
        summary: "Check these fields before sending:",
        required: {
          fullName: "Enter your full name.",
          companyName: "Enter your company name.",
          email: "Enter your email address.",
          phone: "Enter your phone number.",
          message: "Enter your question.",
        },
        email: "That email does not look valid. Check it has an @ and a domain.",
        phone: "The phone number must have 7 to 20 digits.",
        tooShort: "The message must be at least 10 characters long.",
      },
    },
    ready: {
      title: "Your message is ready to send",
      text: "We prepared the text of your inquiry. Choose how to send it to the FUNDIGSAC team and we will reply by email or phone.",
      mail: "Send by email",
      whatsapp: "Send by WhatsApp",
      copy: "Copy text",
      copied: "Text copied",
      preview: "See the text that will be sent",
      note: "Your inquiry is registered when we receive the message at {email} or on WhatsApp. If your email app does not open, use “Copy text” and paste it into a new email.",
      edit: "Edit my details",
    },
    saved: {
      title: "We received your inquiry",
      text: "It is registered and we sent a confirmation to your email. The FUNDIGSAC team will reply shortly.",
      folio: "Inquiry reference",
      again: "Send another inquiry",
      invalid: "The system didn’t accept some details. Check the email, the mobile number and that the message has at least 10 characters.",
      limited: "You sent several inquiries in a row. Wait a few minutes and try again.",
    },
    offices: {
      title: "Find us in Lima",
      lead: "Write to us before visiting and we will arrange your appointment.",
      addressTitle: "Address",
      hoursTitle: "Opening hours",
      hours: ["Every day", "8:00 a.m. to 7:00 p.m."],
      arriveTitle: "How to get here",
      arrive: "We are in Cercado de Lima.",
      viewMap: "View on Google Maps",
    },
    cta: {
      title: "Let’s talk about your next project",
      text: "If you already have your bill of materials, send it to us and we will prepare your quote.",
      cta: "Request a quote",
    },
  },
};
