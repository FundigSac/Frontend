/** Textos propios de la portada. Lo compartido con la cabecera y el pie sigue en `landing-prefs` y `home-copy`. */
export const PAGE = {
  es: {
    hero: {
      title: "Válvulas, tapas y tuberías de hierro dúctil para redes de agua.",
      lead: "FUNDIGSAC abastece obras de riego, saneamiento y minería en todo el Perú. Elige tus productos, envía la lista y te cotizamos.",
      sheetLabel: "Resumen de FUNDIGSAC",
      whatLabel: "Qué vendemos",
      sectorsLabel: "Para qué obras",
      quoteLabel: "Cómo cotizar",
      steps: ["Agrega productos a tu cotización.", "Envía la solicitud con tus datos.", "Te respondemos con precio, disponibilidad y plazo."],
    },
    valve: { actuation: "Accionamiento", group: "Elegir accionamiento de la válvula", caption: "Válvula compuerta FUNDIGSAC" },
    families: {
      all: "Ver catálogo completo",
      notes: ["Compuerta, mariposa, retención, regulación y aire.", "Tapas circulares, marcos y rejillas.", "Se piden por cotización.", "Acoples, adaptadores, uniones y juntas.", "Hierro dúctil, acero SCH-40 y HDPE."],
    },
  },
  en: {
    hero: {
      title: "Ductile iron valves, covers and pipes for water networks.",
      lead: "FUNDIGSAC supplies sanitation, irrigation and mining projects across Peru. Pick your products, send the list and we'll quote it.",
      sheetLabel: "FUNDIGSAC at a glance",
      whatLabel: "What we sell",
      sectorsLabel: "Which projects",
      quoteLabel: "How to get a quote",
      steps: ["Add products to your quote.", "Send the request with your details.", "We reply with price, availability and lead time."],
    },
    valve: { actuation: "Actuation", group: "Choose the valve actuation", caption: "FUNDIGSAC gate valve" },
    families: {
      all: "View full catalog",
      notes: ["Gate, butterfly, check, regulating and air valves.", "Round covers, frames and grates.", "Available through a quote.", "Couplings, adapters and joints.", "Ductile iron, SCH-40 steel and HDPE."],
    },
  },
} as const;
