import type { Lang } from "@/shared/layout/landing-prefs";

/** Textos de los formularios públicos (estado "lista para enviar", errores) en español e inglés. */
export const LEAD_UI = {
  es: {
    honeypot: "No completar este campo",
    connectionError: "No pudimos procesar la solicitud. Revisa tu conexión e inténtalo de nuevo.",
    readyTitle: "Tu solicitud está lista para enviar",
    readyText: "El envío en línea aún no está conectado, así que todavía no se registró. Envíala por correo o WhatsApp: el mensaje ya incluye todos los datos del formulario.",
    byEmail: "Enviar por correo",
    byWhatsapp: "Enviar por WhatsApp",
    copied: "Texto copiado",
    copy: "Copiar texto",
    viewMessage: "Ver el mensaje",
    destination: "Correo de destino:",
    resend: "Si cambias algún dato, vuelve a enviar el formulario para actualizar el mensaje.",
  },
  en: {
    honeypot: "Do not fill in this field",
    connectionError: "We couldn’t process the request. Check your connection and try again.",
    readyTitle: "Your request is ready to send",
    readyText: "Online submission is not connected yet, so it has not been registered. Send it by email or WhatsApp: the message already includes all the form data.",
    byEmail: "Send by email",
    byWhatsapp: "Send by WhatsApp",
    copied: "Text copied",
    copy: "Copy text",
    viewMessage: "View the message",
    destination: "Destination email:",
    resend: "If you change any detail, submit the form again to update the message.",
  },
} as const;

/** Mensajes que devuelve el servidor (siempre en español) y su versión en inglés. */
const MESSAGES_EN: Record<string, string> = {
  "Formulario no reconocido.": "Form not recognized.",
  "Formulario inválido.": "Invalid form.",
  "Revise los campos marcados.": "Please review the highlighted fields.",
  "Este campo es obligatorio.": "This field is required.",
  "Ingrese un correo electrónico válido.": "Enter a valid email address.",
  "El RUC debe tener 11 dígitos.": "The RUC (tax ID) must have 11 digits.",
  "Ingrese un teléfono válido.": "Enter a valid phone number.",
};

export const localizeLeadMessage = (lang: Lang, message: string) => (lang === "en" ? MESSAGES_EN[message] ?? message : message);
