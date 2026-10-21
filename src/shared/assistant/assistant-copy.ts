import type { Lang } from "@/shared/layout/landing-prefs";

/** Evento global para abrir el asistente desde cualquier botón: `openAssistant("¿Qué DN necesito?")`. */
export const ASSISTANT_EVENT = "fundigsac:assistant";

export function openAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT, { detail: { prompt } }));
}

const WHATSAPP_NUMBER = "51908849664";

/** WhatsApp con la consulta del visitante, para que el equipo continúe la conversación sin repetir preguntas. */
export function whatsappHref(lang: Lang, question?: string): string {
  const base = lang === "en" ? "Hello FUNDIGSAC, I come from the website assistant" : "Hola FUNDIGSAC, vengo del asistente del sitio web";
  const text = question ? `${base}. ${lang === "en" ? "My question" : "Mi consulta"}: ${question.slice(0, 300)}` : `${base}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type Notice = "not_configured" | "rate_limited" | "busy" | "network" | "error" | "refusal" | "too_long" | "attachment";

export const ASSISTANT_COPY = {
  es: {
    open: "Abrir FundigIA, asistente con IA",
    close: "Cerrar FundigIA",
    teaser: "¡Hola! Soy FundigIA. ¿Te ayudo a elegir tu válvula?",
    unread: "Nueva respuesta de FundigIA",
    teaserDismiss: "Ocultar mensaje",
    title: "FundigIA",
    dialog: "FundigIA, asistente de FUNDIGSAC",
    status: { idle: "En línea · responde al instante", thinking: "Pensando…", talking: "Escribiendo…" },
    reset: "Nueva conversación",
    expand: "Ampliar",
    shrink: "Reducir",
    welcomeTitle: "¡Hola! Soy FundigIA",
    welcomeLead: "El asistente de FUNDIGSAC. Pregúntame por válvulas, medidas de bridas, normas o tu proyecto: respondo con los datos de nuestras fichas técnicas oficiales.",
    capabilities: "Puedo ayudarte a",
    suggestions: "Preguntas frecuentes",
    cards: [
      { icon: "gauge", title: "Elegir la válvula", text: "DN, PN y modelo según tu red", prompt: "Necesito una válvula de compuerta para una red de agua potable. ¿Cuál me recomiendas y qué datos necesitas de mi proyecto?" },
      { icon: "file", title: "Fichas técnicas", text: "Medidas, bridas y materiales", prompt: "¿Qué fichas técnicas tienen disponibles y qué datos incluye cada una?" },
      { icon: "shield", title: "Normas y garantía", text: "ISO, EN, AWWA, NTP", prompt: "¿Qué normas cumplen sus válvulas de compuerta y qué garantía ofrece cada modelo?" },
      { icon: "quote", title: "Cotizar", text: "Arma tu pedido con el equipo", prompt: "Quiero cotizar productos para mi proyecto. ¿Cómo lo hago y qué información debo enviar?" },
    ],
    placeholder: "Escribe tu consulta…",
    attach: "Adjuntar imagen, PDF o texto",
    attachRemove: "Quitar adjunto",
    attachDefault: "Analiza este archivo y dime qué producto o dato de FUNDIGSAC se relaciona.",
    attachPlaceholder: "Pregunta sobre el archivo…",
    attachErrors: { unsupported: "Formato no admitido. Usa imagen (JPG, PNG, WebP), PDF o texto (TXT, CSV, MD, JSON).", too_big: "Archivo demasiado pesado (PDF hasta 2,5 MB).", read: "No pude leer ese archivo. Prueba con otro." },
    fileCard: "Descargar PDF",
    fileKind: "PDF · ficha técnica",
    inputLabel: "Tu consulta para FundigIA",
    send: "Enviar",
    stop: "Detener respuesta",
    copy: "Copiar respuesta",
    copied: "Copiado",
    retry: "Reintentar",
    whatsapp: "WhatsApp",
    quote: "Cotizar",
    newChat: "Nueva conversación",
    stopped: "Respuesta detenida.",
    you: "Tú",
    footer: "FundigIA puede equivocarse: confirma especificaciones al cotizar.",
    footerHuman: "Hablar con un asesor",
    thinking: ["Pensando…", "Revisando fichas técnicas…", "Preparando la respuesta…"],
    notices: {
      not_configured: "FundigIA no está disponible en este momento. Nuestro equipo te atiende al instante por WhatsApp o puedes enviar tu cotización.",
      rate_limited: "Recibí muchas consultas seguidas. Espera unos segundos y vuelve a intentarlo.",
      busy: "El servicio de IA tiene alta demanda en este momento. Inténtalo de nuevo en unos segundos.",
      network: "Se perdió la conexión con el asistente. Revisa tu internet e inténtalo de nuevo.",
      error: "No pude completar la respuesta. Inténtalo de nuevo.",
      refusal: "No puedo ayudarte con esa consulta. ¿Te ayudo con productos, fichas técnicas o tu proyecto?",
      too_long: "La conversación ya es muy larga. Empieza una nueva para seguir.",
      attachment: "El archivo es demasiado pesado. Prueba con uno más liviano (imagen o PDF de hasta 2,5 MB).",
    } satisfies Record<Notice, string>,
    charsLeft: (n: number) => `${n} caracteres disponibles`,
    helpful: "Me sirvió",
    notHelpful: "No me sirvió",
    thanks: "¡Gracias por tu opinión!",
    sorry: "Lo siento. ¿Prefieres que te atienda un asesor?",
    guide: "Guía rápida",
    guideHint: "Respuesta con los datos oficiales del sitio",
    followUps: "Sigue preguntando",
    options: "Opciones principales",
    quick: [
      { kind: "prompt", icon: "file", label: "Fichas técnicas", prompt: "¿Qué fichas técnicas tienen disponibles y qué datos incluye cada una?" },
      { kind: "prompt", icon: "gauge", label: "Comparar válvulas", prompt: "Compara las 3 válvulas de compuerta" },
      { kind: "link", icon: "quote", label: "Cotizar", href: "/cotizar" },
      { kind: "whatsapp", icon: "chat", label: "WhatsApp" },
      { kind: "call", icon: "phone", label: "Llamar", href: "tel:+51908849664" },
    ],
  },
  en: {
    open: "Open FundigIA, AI assistant",
    close: "Close FundigIA",
    teaser: "Hi! I'm FundigIA. Can I help you choose a valve?",
    unread: "New answer from FundigIA",
    teaserDismiss: "Hide message",
    title: "FundigIA",
    dialog: "FundigIA, FUNDIGSAC assistant",
    status: { idle: "Online · instant answers", thinking: "Thinking…", talking: "Typing…" },
    reset: "New conversation",
    expand: "Expand",
    shrink: "Shrink",
    welcomeTitle: "Hi! I'm FundigIA",
    welcomeLead: "FUNDIGSAC's assistant. Ask me about valves, flange dimensions, standards or your project: I answer with data from our official datasheets.",
    capabilities: "I can help you",
    suggestions: "Popular questions",
    cards: [
      { icon: "gauge", title: "Choose a valve", text: "DN, PN and model for your network", prompt: "I need a gate valve for a drinking water network. Which one do you recommend and what project data do you need?" },
      { icon: "file", title: "Datasheets", text: "Dimensions, flanges, materials", prompt: "Which datasheets do you have and what data does each one include?" },
      { icon: "shield", title: "Standards & warranty", text: "ISO, EN, AWWA, NTP", prompt: "Which standards do your gate valves meet and what warranty does each model have?" },
      { icon: "quote", title: "Get a quote", text: "Build your order with our team", prompt: "I want a quote for my project. How do I request it and what information should I send?" },
    ],
    placeholder: "Type your question…",
    attach: "Attach an image, PDF or text file",
    attachRemove: "Remove attachment",
    attachDefault: "Analyze this file and tell me which FUNDIGSAC product or data it relates to.",
    attachPlaceholder: "Ask about the file…",
    attachErrors: { unsupported: "Unsupported format. Use an image (JPG, PNG, WebP), PDF or text (TXT, CSV, MD, JSON).", too_big: "File too large (PDF up to 2.5 MB).", read: "I couldn't read that file. Try another one." },
    fileCard: "Download PDF",
    fileKind: "PDF · datasheet",
    inputLabel: "Your question for FundigIA",
    send: "Send",
    stop: "Stop answer",
    copy: "Copy answer",
    copied: "Copied",
    retry: "Try again",
    whatsapp: "WhatsApp",
    quote: "Get a quote",
    newChat: "New conversation",
    stopped: "Answer stopped.",
    you: "You",
    footer: "FundigIA can make mistakes: confirm specifications when quoting.",
    footerHuman: "Talk to an advisor",
    thinking: ["Thinking…", "Checking datasheets…", "Preparing the answer…"],
    notices: {
      not_configured: "FundigIA is not available right now. Our team answers right away on WhatsApp, or you can send your quote request.",
      rate_limited: "I received many questions in a row. Wait a few seconds and try again.",
      busy: "The AI service is under heavy demand right now. Try again in a few seconds.",
      network: "The connection to the assistant was lost. Check your internet and try again.",
      error: "I couldn't finish the answer. Please try again.",
      refusal: "I can't help with that request. Can I help you with products, datasheets or your project?",
      too_long: "This conversation is too long. Start a new one to continue.",
      attachment: "The file is too large. Try a lighter one (image or PDF up to 2.5 MB).",
    } satisfies Record<Notice, string>,
    charsLeft: (n: number) => `${n} characters left`,
    helpful: "Helpful",
    notHelpful: "Not helpful",
    thanks: "Thanks for your feedback!",
    sorry: "Sorry about that. Would you like to talk to an advisor?",
    guide: "Quick guide",
    guideHint: "Answer built from the site's official data",
    followUps: "Keep asking",
    options: "Main options",
    quick: [
      { kind: "prompt", icon: "file", label: "Datasheets", prompt: "Which datasheets do you have and what data does each one include?" },
      { kind: "prompt", icon: "gauge", label: "Compare valves", prompt: "Compare the 3 gate valves" },
      { kind: "link", icon: "quote", label: "Get a quote", href: "/cotizar" },
      { kind: "whatsapp", icon: "chat", label: "WhatsApp" },
      { kind: "call", icon: "phone", label: "Call", href: "tel:+51908849664" },
    ],
  },
} as const;

type Suggestion = { match: (path: string) => boolean; es: string[]; en: string[] };

const VALVES = "/productos/valvulas";

/** Preguntas sugeridas según la página: la primera regla que coincide gana. */
const SUGGESTIONS: Suggestion[] = [
  {
    match: (p) => p.startsWith(`${VALVES}/valvula-compuerta-fundigsac-garantia-extendida`),
    es: ["Resume la ficha técnica de esta válvula", "¿Qué es el cuadrante de maniobra y cuándo conviene?", "¿En qué se diferencia de la válvula de 1 año?"],
    en: ["Summarize this valve's datasheet", "What is the operating cap and when is it used?", "How is it different from the 1-year valve?"],
  },
  {
    match: (p) => p.startsWith(`${VALVES}/valvula-compuerta-fundigsac`),
    es: ["Resume la ficha técnica de esta válvula", "Medidas de brida en DN150 PN16", "¿Qué pruebas de presión se le hacen?"],
    en: ["Summarize this valve's datasheet", "Flange dimensions for DN150 PN16", "Which pressure tests does it pass?"],
  },
  {
    match: (p) => p.startsWith(`${VALVES}/valvula-compuerta`),
    es: ["Resume la ficha técnica H-ITALY", "¿Qué significa DIN 3352 F4?", "Compárala con la válvula FUNDIGSAC"],
    en: ["Summarize the H-ITALY datasheet", "What does DIN 3352 F4 mean?", "Compare it with the FUNDIGSAC valve"],
  },
  {
    match: (p) => p.startsWith(VALVES),
    es: ["Compara las 3 válvulas de compuerta", "¿Qué válvula uso para aire en tuberías?", "¿Qué presión nominal necesito?"],
    en: ["Compare the 3 gate valves", "Which valve releases air from pipelines?", "Which nominal pressure do I need?"],
  },
  {
    match: (p) => p.startsWith("/productos/tuberias"),
    es: ["¿Qué SDR necesito para PN10?", "Diferencias entre HDPE y hierro dúctil", "¿Qué tuberías venden?"],
    en: ["Which SDR do I need for PN10?", "HDPE vs ductile iron", "Which pipes do you sell?"],
  },
  {
    match: (p) => p.startsWith("/productos/marcos"),
    es: ["¿Qué clase de carga necesito para una pista?", "¿Qué significa EN 124 D400?", "¿Qué marcos y tapas tienen?"],
    en: ["Which load class do I need for a road?", "What does EN 124 D400 mean?", "Which frames and covers do you have?"],
  },
  {
    match: (p) => p.startsWith("/industrias/mineria"),
    es: ["¿Qué productos recomiendan para minería?", "¿Qué tuberías resisten abrasión?", "¿Cómo cotizo para un proyecto minero?"],
    en: ["Which products do you recommend for mining?", "Which pipes resist abrasion?", "How do I get a quote for a mining project?"],
  },
  {
    match: (p) => p.startsWith("/industrias/agricultura"),
    es: ["¿Qué necesito para un sistema de riego?", "¿Qué válvulas usan en riego?", "¿Qué tuberías HDPE tienen?"],
    en: ["What do I need for an irrigation system?", "Which valves are used for irrigation?", "Which HDPE pipes do you have?"],
  },
  {
    match: (p) => p.startsWith("/industrias/saneamiento"),
    es: ["¿Qué productos usan en agua potable?", "¿Qué válvula va en una red de distribución?", "¿Qué normas aplican en saneamiento?"],
    en: ["Which products are used for drinking water?", "Which valve goes in a distribution network?", "Which standards apply to sanitation?"],
  },
  {
    match: (p) => p.startsWith("/cotizar"),
    es: ["¿Qué información necesito para cotizar?", "¿Puedo cotizar por WhatsApp?", "¿Atienden a todo el Perú?"],
    en: ["What information do I need for a quote?", "Can I request a quote on WhatsApp?", "Do you serve all of Peru?"],
  },
  {
    match: (p) => p.startsWith("/contacto") || p.startsWith("/nosotros"),
    es: ["¿Cuál es el horario de atención?", "¿Dónde están ubicados?", "¿Qué experiencia tiene FUNDIGSAC?"],
    en: ["What are your business hours?", "Where are you located?", "What experience does FUNDIGSAC have?"],
  },
  {
    match: () => true,
    es: ["Compara las 3 válvulas de compuerta", "¿Qué productos tienen para minería?", "¿Dónde están ubicados?"],
    en: ["Compare the 3 gate valves", "Which products do you have for mining?", "Where are you located?"],
  },
];

export function suggestionsFor(path: string, lang: Lang): string[] {
  const rule = SUGGESTIONS.find((s) => s.match(path)) ?? SUGGESTIONS[SUGGESTIONS.length - 1];
  return rule[lang];
}
