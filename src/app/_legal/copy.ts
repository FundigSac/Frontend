/** Textos de las páginas legales y la 404 en español e inglés (el idioma lo elige el selector del sitio). */
export type Pair<T> = { es: T; en: T };

export const UPDATED: Pair<string> = { es: "14 de octubre de 2026", en: "October 14, 2026" };

export const COMMON = {
  home: { es: "Inicio", en: "Home" },
  updatedLabel: { es: "Última actualización:", en: "Last updated:" },
} satisfies Record<string, Pair<string>>;

/* ---------- Términos y condiciones ---------- */
type Cta = { eyebrow: string; title: string; text: string; cta: string };

export const TERMS: Pair<{
  crumb: string;
  title: string;
  lead: string;
  tocLabel: string;
  sections: readonly { id: string; label: string; text: string | null }[];
  privacy: { pre: string; link: string; post: string };
  cta: Cta;
}> = {
  es: {
    crumb: "Términos y condiciones",
    title: "Términos y condiciones",
    lead: "A continuación, te presentamos los términos y condiciones que rigen el uso de nuestro sitio web y la información que ponemos a tu disposición.",
    tocLabel: "Contenido de los términos",
    sections: [
      { id: "aceptacion", label: "Aceptación de los términos", text: "Al acceder y utilizar este sitio web, usted acepta cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, le recomendamos no utilizar este sitio." },
      { id: "uso", label: "Uso del sitio web", text: "Este sitio web tiene como finalidad proporcionar información sobre nuestros productos, soluciones y servicios. Usted se compromete a utilizarlo de manera lícita, responsable y de acuerdo con los presentes términos, sin realizar actividades que puedan afectar su funcionamiento, seguridad o disponibilidad." },
      { id: "productos", label: "Información de productos", text: "Nos esforzamos por mantener la información de productos, especificaciones técnicas y demás contenidos actualizada y precisa. Sin embargo, esta información tiene carácter referencial y puede ser modificada sin previo aviso. Para detalles específicos, le recomendamos contactar a nuestro equipo comercial." },
      { id: "propiedad", label: "Propiedad intelectual", text: "Todos los contenidos de este sitio web, incluyendo textos, imágenes, logotipos, gráficos, fichas técnicas, íconos, diseños y demás materiales, son propiedad de FUNDIGSAC o de sus licenciantes, y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado." },
      { id: "enlaces", label: "Enlaces a terceros", text: "Este sitio puede contener enlaces a sitios web de terceros con fines informativos. FUNDIGSAC no se responsabiliza por el contenido, políticas o prácticas de dichos sitios, los cuales están fuera de nuestro control." },
      { id: "responsabilidad", label: "Limitación de responsabilidad", text: "FUNDIGSAC no será responsable por daños directos, indirectos, incidentales o consecuentes que puedan derivarse del uso de este sitio web, de la imposibilidad de acceder al mismo o del uso de la información contenida en él." },
      { id: "privacidad", label: "Privacidad de la información", text: null },
      { id: "modificaciones", label: "Modificaciones", text: "Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigencia desde su publicación en este sitio web. Le recomendamos revisar esta sección periódicamente." },
      { id: "legislacion", label: "Legislación aplicable", text: "Estos Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia relacionada con el uso de este sitio será resuelta en las instancias competentes de Lima, Perú." },
      { id: "contacto", label: "Contacto", text: "Si tienes alguna consulta sobre estos Términos y Condiciones, puedes comunicarte con nosotros a través de nuestros canales de contacto." },
    ],
    privacy: { pre: "El uso de este sitio también se rige por nuestra ", link: "Política de Privacidad", post: ", donde se detalla cómo recopilamos, utilizamos y protegemos la información personal de los usuarios." },
    cta: { eyebrow: "¿Tienes consultas?", title: "Estamos para ayudarte.", text: "Si tienes alguna pregunta sobre nuestros términos y condiciones o sobre el uso de nuestro sitio web, nuestro equipo está listo para atenderte.", cta: "Contactar con nosotros" },
  },
  en: {
    crumb: "Terms and conditions",
    title: "Terms and conditions",
    lead: "Below you will find the terms and conditions that govern the use of our website and the information we make available to you.",
    tocLabel: "Terms contents",
    sections: [
      { id: "aceptacion", label: "Acceptance of the terms", text: "By accessing and using this website, you agree to comply with these Terms and Conditions. If you do not agree with any of them, we recommend that you do not use this site." },
      { id: "uso", label: "Use of the website", text: "The purpose of this website is to provide information about our products, solutions and services. You agree to use it lawfully and responsibly, in accordance with these terms, and not to carry out activities that may affect its operation, security or availability." },
      { id: "productos", label: "Product information", text: "We strive to keep product information, technical specifications and other content up to date and accurate. However, this information is for reference only and may be changed without prior notice. For specific details, we recommend contacting our sales team." },
      { id: "propiedad", label: "Intellectual property", text: "All content on this website, including text, images, logos, graphics, datasheets, icons, designs and other materials, is the property of FUNDIGSAC or its licensors and is protected by intellectual property laws. Any unauthorized reproduction, distribution or use is prohibited." },
      { id: "enlaces", label: "Third-party links", text: "This site may contain links to third-party websites for informational purposes. FUNDIGSAC is not responsible for the content, policies or practices of those sites, which are beyond our control." },
      { id: "responsabilidad", label: "Limitation of liability", text: "FUNDIGSAC shall not be liable for any direct, indirect, incidental or consequential damages that may arise from the use of this website, from the inability to access it, or from the use of the information it contains." },
      { id: "privacidad", label: "Privacy of information", text: null },
      { id: "modificaciones", label: "Changes", text: "We reserve the right to modify these Terms and Conditions at any time. Changes take effect upon publication on this website. We recommend reviewing this section periodically." },
      { id: "legislacion", label: "Governing law", text: "These Terms and Conditions are governed by the laws of the Republic of Peru. Any dispute related to the use of this site will be resolved by the competent courts of Lima, Peru." },
      { id: "contacto", label: "Contact", text: "If you have any questions about these Terms and Conditions, you can reach us through our contact channels." },
    ],
    privacy: { pre: "Use of this site is also governed by our ", link: "Privacy Policy", post: ", which explains how we collect, use and protect users’ personal information." },
    cta: { eyebrow: "Have questions?", title: "We are here to help.", text: "If you have any question about our terms and conditions or the use of our website, our team is ready to assist you.", cta: "Contact us" },
  },
};

/* ---------- Política de privacidad ---------- */
export const PRIVACY: Pair<{
  crumb: string;
  title: string;
  lead: string;
  introTitle: string;
  intro: string;
  callout: { small: string; title: string; text: string; label: string };
  pillars: readonly { title: string; text: string }[];
  steps: readonly { title: string; text: string }[];
  aside: { alt: string; title: string; text: string; button: string; also: string; mail: string; request: string; requestText: string; updated: string };
  cta: Cta;
}> = {
  es: {
    crumb: "Política de privacidad",
    title: "Política de privacidad",
    lead: "En FUNDIGSAC protegemos la información personal que nos confías, con un trato responsable, seguro y transparente.",
    introTitle: "Nuestro compromiso con tu privacidad",
    intro: "En FUNDIGSAC valoramos la confianza de nuestros clientes, proveedores y visitantes. Esta Política de Privacidad explica cómo recopilamos, usamos, protegemos y tratamos tus datos personales, de acuerdo con la normativa vigente en materia de protección de datos en el Perú.",
    callout: { small: "Tratamiento responsable", title: "Tu información, protegida", text: "Aplicamos medidas técnicas y organizativas para garantizar la seguridad y confidencialidad de tus datos personales.", label: "Resumen" },
    pillars: [
      { title: "Legalidad", text: "Tratamos tus datos de forma lícita y transparente." },
      { title: "Finalidad", text: "Usamos tus datos solo para fines específicos y legítimos." },
      { title: "Seguridad", text: "Implementamos medidas para proteger tu información." },
      { title: "Transparencia", text: "Te informamos de manera clara sobre el tratamiento de tus datos." },
    ],
    steps: [
      { title: "Información que recopilamos", text: "Podemos recopilar datos personales que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono, cargo, empresa y cualquier otra información que nos compartas a través de nuestros formularios, correos o canales de contacto." },
      { title: "Uso de la información", text: "Utilizamos tus datos personales para: (i) atender tus consultas y solicitudes, (ii) brindarte información sobre nuestros productos y servicios, (iii) gestionar relaciones comerciales, (iv) enviarte comunicaciones relevantes y (v) mejorar nuestra atención y experiencia de usuario." },
      { title: "Base legal para el tratamiento", text: "Tratamos tus datos personales con tu consentimiento, cuando corresponda, o en base a nuestro interés legítimo para desarrollar actividades comerciales, de comunicación y atención de consultas, conforme a la normativa aplicable de protección de datos personales." },
      { title: "Conservación de los datos", text: "Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades descritas en esta política, o mientras exista una relación comercial activa. Posteriormente, serán eliminados o anonimizados de forma segura." },
      { title: "Derechos del titular", text: "Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO), así como cualquier otro derecho reconocido por la normativa vigente, escribiéndonos a través de nuestros canales de contacto indicados en esta página." },
      { title: "Seguridad de la información", text: "Implementamos medidas técnicas, administrativas y organizativas para proteger tus datos personales contra el acceso no autorizado, pérdida, alteración o divulgación indebida." },
      { title: "Cambios en esta política", text: "Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o en la normativa aplicable. Te recomendamos revisarla periódicamente. Cualquier modificación será publicada en esta misma página." },
    ],
    aside: { alt: "Profesional de FUNDIGSAC revisando documentación técnica", title: "¿Tienes preguntas sobre tu privacidad?", text: "Si tienes consultas sobre el tratamiento de tus datos personales o deseas ejercer tus derechos, puedes contactarnos a través de nuestros canales oficiales.", button: "Ir al formulario de contacto", also: "También puedes", mail: "Escríbenos por correo", request: "Envía tu solicitud", requestText: "Indica el tipo de solicitud y tus datos de contacto.", updated: "Última actualización" },
    cta: { eyebrow: "Trabajamos con confianza", title: "Construyamos proyectos de agua de forma segura y transparente.", text: "Estamos a tu disposición para resolver cualquier consulta y brindarte la información que necesites.", cta: "Solicitar cotización" },
  },
  en: {
    crumb: "Privacy policy",
    title: "Privacy policy",
    lead: "At FUNDIGSAC we protect the personal information you entrust to us, with responsible, secure and transparent handling.",
    introTitle: "Our commitment to your privacy",
    intro: "At FUNDIGSAC we value the trust of our customers, suppliers and visitors. This Privacy Policy explains how we collect, use, protect and process your personal data, in accordance with the data protection regulations in force in Peru.",
    callout: { small: "Responsible processing", title: "Your information, protected", text: "We apply technical and organizational measures to ensure the security and confidentiality of your personal data.", label: "Summary" },
    pillars: [
      { title: "Lawfulness", text: "We process your data lawfully and transparently." },
      { title: "Purpose", text: "We use your data only for specific, legitimate purposes." },
      { title: "Security", text: "We implement measures to protect your information." },
      { title: "Transparency", text: "We clearly inform you about how your data is processed." },
    ],
    steps: [
      { title: "Information we collect", text: "We may collect personal data that you provide directly, such as your name, email address, phone number, job title, company and any other information you share through our forms, emails or contact channels." },
      { title: "How we use information", text: "We use your personal data to: (i) answer your questions and requests, (ii) provide information about our products and services, (iii) manage business relationships, (iv) send you relevant communications and (v) improve our service and user experience." },
      { title: "Legal basis for processing", text: "We process your personal data with your consent, where applicable, or on the basis of our legitimate interest in carrying out business, communication and customer-service activities, in accordance with applicable personal data protection regulations." },
      { title: "Data retention", text: "We keep your personal data for as long as necessary to fulfill the purposes described in this policy, or while an active business relationship exists. Afterwards, it will be securely deleted or anonymized." },
      { title: "Data subject rights", text: "You may exercise your rights of access, rectification, cancellation and opposition (ARCO), as well as any other right recognized by current regulations, by writing to us through the contact channels listed on this page." },
      { title: "Information security", text: "We implement technical, administrative and organizational measures to protect your personal data against unauthorized access, loss, alteration or improper disclosure." },
      { title: "Changes to this policy", text: "We may update this Privacy Policy to reflect changes in our practices or in applicable regulations. We recommend reviewing it periodically. Any change will be published on this same page." },
    ],
    aside: { alt: "FUNDIGSAC professional reviewing technical documentation", title: "Questions about your privacy?", text: "If you have questions about how your personal data is processed or wish to exercise your rights, you can contact us through our official channels.", button: "Go to the contact form", also: "You can also", mail: "Email us", request: "Send your request", requestText: "State the type of request and your contact details.", updated: "Last updated" },
    cta: { eyebrow: "We work with trust", title: "Let’s build water projects safely and transparently.", text: "We are at your disposal to answer any question and provide the information you need.", cta: "Request a quote" },
  },
};

/* ---------- Política de cookies ---------- */
export const COOKIES: Pair<{
  crumb: string;
  title: string;
  lead: string;
  prefs: {
    eyebrow: string;
    title: string;
    text: string;
    cards: readonly { title: string; text: string }[];
    always: string;
    unused: string;
    on: string;
    off: string;
    acceptAll: string;
    rejectOptional: string;
    save: string;
    statusAll: string;
    statusNecessary: string;
    statusSaved: string;
    note: string;
    gpc: string;
    saved: string;
    until: string;
  };
  info: readonly { title: string; alt: string; text: string }[];
  inventory: { eyebrow: string; title: string; lead: string; head: readonly string[]; rows: readonly (readonly string[])[]; note: string };
  legal: { eyebrow: string; title: string; lead: string; items: readonly { title: string; text: string }[] };
  faq: { eyebrow: string; title: string; lead: string; items: readonly { q: string; a: string }[] };
}> = {
  es: {
    crumb: "Política de cookies",
    title: "Política de cookies",
    lead: "En FUNDIGSAC guardamos solo lo necesario para que el sitio funcione y pedimos tu permiso antes de cargar contenido de terceros.",
    prefs: {
      eyebrow: "Gestiona tus preferencias",
      title: "Preferencias de cookies",
      text: "Puedes aceptar, rechazar o elegir. Rechazar es tan fácil como aceptar y no afecta el uso del sitio. En cualquier momento puedes cambiar tu decisión aquí o desde «Preferencias de cookies», al pie de cada página.",
      cards: [
        { title: "Almacenamiento necesario", text: "Recuerda tu elección de cookies, tu idioma y tema, los productos de tu cotización y la conversación con el asistente. Es indispensable para el funcionamiento del sitio y no se puede desactivar." },
        { title: "Contenido de terceros", text: "Muestra el mapa de Google Maps. Google puede instalar sus propias cookies y recibir tu dirección IP, por eso solo se carga si lo autorizas." },
        { title: "Analítica y publicidad", text: "No utilizamos cookies de medición de audiencia, de publicidad ni de seguimiento. Si algún día las incorporamos, te pediremos permiso antes." },
      ],
      always: "Siempre activo",
      unused: "No utilizadas",
      on: "Activado",
      off: "Desactivado",
      acceptAll: "Aceptar todas",
      rejectOptional: "Rechazar opcionales",
      save: "Guardar preferencias",
      statusAll: "Aceptaste el contenido de terceros.",
      statusNecessary: "Solo se usará el almacenamiento necesario.",
      statusSaved: "Preferencias guardadas.",
      note: "Tu decisión se guarda en tu navegador durante 180 días y después te volveremos a preguntar. Si borras las cookies, también se borra tu decisión.",
      gpc: "Tu navegador envía la señal Global Privacy Control: no activamos nada opcional hasta que tú lo autorices.",
      saved: "Decisión guardada el",
      until: "Vale hasta el",
    },
    info: [
      { title: "¿Qué son las cookies?", alt: "Tanques circulares de una planta de tratamiento de agua", text: "Las cookies son pequeños archivos de texto que se guardan en tu dispositivo cuando visitas un sitio web. Junto con tecnologías parecidas, como el almacenamiento local del navegador, permiten recordar tu información y preferencias durante un tiempo." },
      { title: "¿Cómo las usamos?", alt: "Acople bridado de hierro dúctil", text: "Usamos solo lo imprescindible: recordar tu elección de cookies, tu idioma y tema, los productos de tu cotización y el asistente. El mapa de Google Maps es contenido de terceros y únicamente se carga con tu consentimiento." },
      { title: "Duración de las cookies", alt: "Cascada de agua en una planta de tratamiento", text: "Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o persistentes (permanecen un tiempo en tu dispositivo). La tabla de abajo indica la duración de cada una." },
    ],
    inventory: {
      eyebrow: "Transparencia",
      title: "Qué guardamos en tu dispositivo",
      lead: "Esta es la lista completa de lo que el sitio almacena o puede almacenar, quién lo coloca, para qué y por cuánto tiempo.",
      head: ["Nombre", "Quién", "Para qué", "Duración", "Tipo"],
      rows: [
        ["fundigsac-consent", "FUNDIGSAC (propia)", "Recordar tu elección sobre cookies, con fecha y versión de esta política.", "180 días", "Necesaria · cookie"],
        ["fundigsac-lang · fundigsac-theme", "FUNDIGSAC (propia)", "Recordar el idioma y el tema (claro u oscuro) que tú eliges.", "Hasta que los borres", "Necesaria · almacenamiento local"],
        ["fundigsac-quote", "FUNDIGSAC (propia)", "Conservar en tu equipo los productos de tu cotización.", "Hasta que envíes o borres la cotización", "Necesaria · almacenamiento local"],
        ["fundigsac-assistant-v1 · fundigsac-assistant-teaser", "FUNDIGSAC (propia)", "Mantener la conversación con el asistente virtual mientras navegas.", "Hasta cerrar la pestaña", "Necesaria · almacenamiento de sesión"],
        ["Cookies de Google Maps", "Google LLC (tercero)", "Mostrar el mapa interactivo de nuestra ubicación. Google puede instalar sus propias cookies y recibir tu dirección IP.", "Según Google", "Contenido de terceros · solo con tu permiso"],
      ],
      note: "No usamos cookies de analítica, de publicidad ni de seguimiento entre sitios.",
    },
    legal: {
      eyebrow: "Marco legal",
      title: "Tu consentimiento y tus derechos",
      lead: "Aplicamos la normativa peruana de protección de datos personales y, además, criterios internacionales para atender a visitantes de otros países.",
      items: [
        { title: "Normativa peruana", text: "Ley N.º 29733, Ley de Protección de Datos Personales, y su Reglamento (D. S. N.º 016-2024-JUS, vigente desde el 30 de marzo de 2025): el consentimiento debe ser libre, previo, expreso, inequívoco e informado. Por eso lo opcional está desactivado hasta que lo aceptes." },
        { title: "Criterios internacionales", text: "Seguimos también el Reglamento General de Protección de Datos y la Directiva ePrivacy de la Unión Europea: consentimiento previo y por finalidades, sin casillas premarcadas, con la misma facilidad para rechazar que para aceptar y con posibilidad de retirarlo cuando quieras." },
        { title: "Cómo retirar tu consentimiento", text: "Usa «Preferencias de cookies» al pie de cualquier página o el panel de esta misma página. Retirarlo es tan sencillo como darlo y no afecta el uso del sitio." },
        { title: "Tus derechos", text: "Puedes ejercer tus derechos de información, acceso, rectificación, cancelación y oposición escribiéndonos desde el formulario de contacto. Si consideras que no atendimos tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales, del Ministerio de Justicia y Derechos Humanos." },
        { title: "Señales del navegador", text: "Si tu navegador envía la señal Global Privacy Control, no activamos contenido de terceros por defecto: solo se carga si tú lo autorizas." },
      ],
    },
    faq: {
      eyebrow: "Información adicional",
      title: "Preguntas frecuentes",
      lead: "Resolvemos las dudas más comunes sobre el uso de cookies en nuestro sitio web.",
      items: [
        { q: "¿Qué tipos de cookies utiliza FUNDIGSAC?", a: "Solo almacenamiento necesario (tu elección de cookies, idioma, tema, cotización y asistente) y, si lo autorizas, contenido de terceros: el mapa de Google Maps. No usamos cookies de analítica ni de publicidad." },
        { q: "¿Puedo cambiar mis preferencias de cookies más adelante?", a: "Sí. Puedes volver a esta página o usar el enlace «Preferencias de cookies» del pie de página cuando quieras para modificar tu elección." },
        { q: "¿Cómo puedo gestionar o eliminar las cookies desde mi navegador?", a: "Todos los navegadores permiten bloquear o eliminar cookies desde su configuración de privacidad. Ten en cuenta que, si bloqueas el almacenamiento necesario, algunas funciones del sitio, como tu cotización, podrían dejar de estar disponibles." },
        { q: "¿Las cookies recopilan información personal?", a: "El almacenamiento necesario no se usa para seguimiento. Al cargar el mapa, Google puede recibir tu dirección IP y datos de tu navegador según su propia política; por eso solo se carga con tu permiso. Para más detalle consulta nuestra Política de Privacidad." },
        { q: "¿Qué sucede si rechazo las cookies opcionales?", a: "Podrás seguir navegando con normalidad. En lugar del mapa verás un botón para cargarlo cuando quieras y un enlace para abrirlo en Google Maps." },
      ],
    },
  },
  en: {
    crumb: "Cookie policy",
    title: "Cookie policy",
    lead: "At FUNDIGSAC we only store what the site needs to work and we ask for your permission before loading third-party content.",
    prefs: {
      eyebrow: "Manage your preferences",
      title: "Cookie preferences",
      text: "You can accept, reject or choose. Rejecting is as easy as accepting and does not affect how you use the site. You can change your decision here or from “Cookie preferences” at the bottom of every page at any time.",
      cards: [
        { title: "Necessary storage", text: "It remembers your cookie choice, your language and theme, the products in your quote and your conversation with the assistant. It is essential for the site to work and cannot be turned off." },
        { title: "Third-party content", text: "It shows the Google Maps map. Google may set its own cookies and receive your IP address, so it only loads if you allow it." },
        { title: "Analytics and advertising", text: "We do not use audience measurement, advertising or tracking cookies. If we ever add them, we will ask for your permission first." },
      ],
      always: "Always active",
      unused: "Not used",
      on: "Enabled",
      off: "Disabled",
      acceptAll: "Accept all",
      rejectOptional: "Reject optional",
      save: "Save preferences",
      statusAll: "You accepted third-party content.",
      statusNecessary: "Only necessary storage will be used.",
      statusSaved: "Preferences saved.",
      note: "Your decision is kept in your browser for 180 days and then we will ask you again. If you clear your cookies, your decision is cleared too.",
      gpc: "Your browser sends the Global Privacy Control signal: we do not enable anything optional until you allow it.",
      saved: "Decision saved on",
      until: "Valid until",
    },
    info: [
      { title: "What are cookies?", alt: "Circular tanks at a water treatment plant", text: "Cookies are small text files stored on your device when you visit a website. Together with similar technologies, such as the browser’s local storage, they let a site remember your information and preferences for a period of time." },
      { title: "How do we use them?", alt: "Ductile iron flange coupling", text: "We only use what is essential: remembering your cookie choice, your language and theme, the products in your quote and the assistant. The Google Maps map is third-party content and only loads with your consent." },
      { title: "Cookie duration", alt: "Water cascade at a treatment plant", text: "Cookies can be session cookies (deleted when you close the browser) or persistent cookies (kept on your device for a set period). The table below shows how long each one lasts." },
    ],
    inventory: {
      eyebrow: "Transparency",
      title: "What we store on your device",
      lead: "This is the complete list of what the site stores or may store, who sets it, what for and for how long.",
      head: ["Name", "Who", "Purpose", "Duration", "Type"],
      rows: [
        ["fundigsac-consent", "FUNDIGSAC (first party)", "Remember your cookie choice, with the date and the version of this policy.", "180 days", "Necessary · cookie"],
        ["fundigsac-lang · fundigsac-theme", "FUNDIGSAC (first party)", "Remember the language and theme (light or dark) you choose.", "Until you clear them", "Necessary · local storage"],
        ["fundigsac-quote", "FUNDIGSAC (first party)", "Keep the products in your quote on your device.", "Until you send or clear the quote", "Necessary · local storage"],
        ["fundigsac-assistant-v1 · fundigsac-assistant-teaser", "FUNDIGSAC (first party)", "Keep your conversation with the virtual assistant while you browse.", "Until you close the tab", "Necessary · session storage"],
        ["Google Maps cookies", "Google LLC (third party)", "Show the interactive map of our location. Google may set its own cookies and receive your IP address.", "As set by Google", "Third-party content · only with your permission"],
      ],
      note: "We do not use analytics, advertising or cross-site tracking cookies.",
    },
    legal: {
      eyebrow: "Legal framework",
      title: "Your consent and your rights",
      lead: "We apply Peruvian personal data protection law and, in addition, international criteria to serve visitors from other countries.",
      items: [
        { title: "Peruvian law", text: "Law No. 29733, the Personal Data Protection Law, and its Regulation (Supreme Decree No. 016-2024-JUS, in force since 30 March 2025): consent must be free, prior, express, unequivocal and informed. That is why anything optional stays off until you accept it." },
        { title: "International criteria", text: "We also follow the EU General Data Protection Regulation and the ePrivacy Directive: prior, purpose-specific consent, no pre-ticked boxes, rejecting as easy as accepting, and the ability to withdraw whenever you want." },
        { title: "How to withdraw your consent", text: "Use “Cookie preferences” at the bottom of any page or the panel on this page. Withdrawing is as easy as giving it and does not affect how you use the site." },
        { title: "Your rights", text: "You can exercise your rights of information, access, rectification, cancellation and objection by writing to us through the contact form. If you believe we did not handle your request, you can go to the National Authority for Personal Data Protection, part of the Ministry of Justice and Human Rights." },
        { title: "Browser signals", text: "If your browser sends the Global Privacy Control signal, we do not enable third-party content by default: it only loads if you allow it." },
      ],
    },
    faq: {
      eyebrow: "Additional information",
      title: "Frequently asked questions",
      lead: "We answer the most common questions about the use of cookies on our website.",
      items: [
        { q: "What types of cookies does FUNDIGSAC use?", a: "Only necessary storage (your cookie choice, language, theme, quote and assistant) and, if you allow it, third-party content: the Google Maps map. We do not use analytics or advertising cookies." },
        { q: "Can I change my cookie preferences later?", a: "Yes. You can return to this page or use the “Cookie preferences” link in the footer at any time to change your choice." },
        { q: "How can I manage or delete cookies from my browser?", a: "All browsers let you block or delete cookies from their privacy settings. Keep in mind that, if you block necessary storage, some site features, such as your quote, may stop working." },
        { q: "Do cookies collect personal information?", a: "Necessary storage is not used for tracking. When the map loads, Google may receive your IP address and browser data under its own policy, which is why it only loads with your permission. For more detail, see our Privacy Policy." },
        { q: "What happens if I reject optional cookies?", a: "You can keep browsing normally. Instead of the map you will see a button to load it whenever you want and a link to open it in Google Maps." },
      ],
    },
  },
};

/* ---------- Libro de reclamaciones ---------- */
type ClaimOption = { value: string; label: string };

export const CLAIMS: Pair<{
  crumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  heroAlt: string;
  formTitle: string;
  formIntro: string;
  formAria: string;
  legends: readonly [string, string, string, string, string, string];
  /** Tercer apartado según el tipo: bien contratado (reclamo) o atención recibida (queja). */
  goodLegend: { reclamo: string; queja: string };
  detailLegend: { reclamo: string; queja: string };
  provider: { title: string; name: string; ruc: string; address: string; sheet: string; sheetValue: string };
  notices: { filing: string; deadline: string; copy: string; indecopi: string };
  kinds: { reclamo: { title: string; text: string }; queja: { title: string; text: string } };
  fields: {
    name: [string, string];
    docType: string;
    docSelect: string;
    docs: readonly ClaimOption[];
    docNumber: [string, string];
    email: [string, string];
    phone: [string, string];
    address: [string, string];
    docHints: { DNI: string; RUC: string; CE: string; PASAPORTE: string };
    minor: string;
    minorHint: string;
    repName: [string, string];
    repDoc: [string, string];
    goodType: string;
    goodTypes: readonly ClaimOption[];
    amount: [string, string];
    amountHint: string;
    currency: string;
    currencies: readonly ClaimOption[];
    place: string;
    placeSelect: string;
    places: readonly ClaimOption[];
    product: string;
    productSelect: string;
    products: readonly ClaimOption[];
    date: string;
    order: [string, string];
    facts: [string, string, string];
    request: [string, string];
    mediumHint: string;
    mediums: readonly ClaimOption[];
  };
  consent: { pre: string; link: string };
  clear: string;
  submit: { reclamo: string; queja: string };
  sending: string;
  success: { title: string; text: string; again: string };
  offline: { title: string; text: string; mail: string; whatsapp: string; copy: string; copied: string; preview: string; note: string; edit: string };
  side: {
    blue: { title: string; text: string };
    how: { title: string; items: readonly { title: string; text: string }[] };
    important: { title: string; items: readonly string[] };
    help: { title: string; text: string; call: [string, string]; write: string; whatsapp: [string, string]; whatsappMsg: string };
    pledge: { title: string; text: string };
    aria: string;
  };
  cta: Cta;
}> = {
  es: {
    crumb: "Libro de reclamaciones",
    eyebrow: "Atención al cliente",
    title: "Libro de Reclamaciones",
    lead: "Tu opinión nos ayuda a seguir mejorando. Registra aquí tu reclamo o queja de manera rápida, segura y transparente.",
    heroAlt: "Asesora de FUNDIGSAC atendiendo a un cliente en la oficina",
    formTitle: "Formulario de reclamos y quejas",
    formIntro: "Completa la siguiente información. Todos los campos marcados con * son obligatorios.",
    formAria: "Formulario de reclamos y quejas",
    legends: ["Tipo de solicitud", "Identificación del consumidor", "Identificación del bien contratado", "Detalle del", "Pedido del consumidor", "Medio de respuesta"],
    goodLegend: { reclamo: "Identificación del bien contratado", queja: "Atención recibida" },
    detailLegend: { reclamo: "Detalle del reclamo", queja: "Detalle de la queja" },
    provider: { title: "Datos del proveedor", name: "Razón social", ruc: "RUC", address: "Domicilio", sheet: "N.° de hoja de reclamación", sheetValue: "Se asigna al registrar tu solicitud" },
    notices: {
      filing: "La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.",
      deadline: "El proveedor atiende y responde por escrito, por el medio que elijas, en un plazo no mayor a quince (15) días hábiles improrrogables (Ley N.° 31435 y D.S. N.° 101-2022-PCM).",
      copy: "Recibirás una copia de tu hoja de reclamación en el correo que indiques.",
      indecopi: "Si no recibes respuesta en el plazo, puedes acudir al INDECOPI (Reclama Virtual, sacreclamo@indecopi.gob.pe o 224 7777 en Lima).",
    },
    kinds: {
      reclamo: { title: "Reclamo", text: "Disconformidad relacionada con los productos o servicios." },
      queja: { title: "Queja", text: "Malestar o descontento respecto a la atención al público." },
    },
    fields: {
      name: ["Nombres y apellidos / razón social", "Ej. María Pérez Rojas…"],
      docType: "Tipo de documento",
      docSelect: "Selecciona",
      docs: [{ value: "DNI", label: "DNI" }, { value: "RUC", label: "RUC" }, { value: "CE", label: "Carné de extranjería" }, { value: "PASAPORTE", label: "Pasaporte" }],
      docNumber: ["Número de documento", "Ej. 12345678…"],
      email: ["Correo electrónico", "ejemplo@correo.com…"],
      phone: ["Teléfono de contacto", "Ej. 987 654 321…"],
      address: ["Domicilio", "Ej. Av. Los Pinos 123, Lima…"],
      docHints: { DNI: "El DNI tiene 8 dígitos.", RUC: "El RUC tiene 11 dígitos.", CE: "Ingresa de 6 a 12 letras o números.", PASAPORTE: "Ingresa de 6 a 12 letras o números." },
      minor: "Soy menor de edad y presento este registro con mi padre, madre o representante",
      minorHint: "Indica los datos de tu padre, madre o representante legal.",
      repName: ["Nombres y apellidos del padre, madre o representante", "Ej. Luis Pérez Soto…"],
      repDoc: ["DNI o documento del padre, madre o representante", "Ej. 12345678…"],
      goodType: "El reclamo es sobre un",
      goodTypes: [{ value: "PRODUCTO", label: "Producto" }, { value: "SERVICIO", label: "Servicio" }],
      amount: ["Monto reclamado (opcional)", "Ej. 1500.00…"],
      amountHint: "Si el reclamo no tiene un monto, déjalo vacío.",
      currency: "Moneda",
      currencies: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares (US$)" }],
      place: "¿Dónde ocurrió?",
      placeSelect: "Selecciona una opción",
      places: [
        { value: "Atención presencial", label: "Atención presencial" }, { value: "Atención telefónica", label: "Atención telefónica" }, { value: "WhatsApp", label: "WhatsApp" },
        { value: "Correo electrónico", label: "Correo electrónico" }, { value: "Sitio web", label: "Sitio web" }, { value: "Entrega o despacho", label: "Entrega o despacho" }, { value: "Otro", label: "Otro" },
      ],
      product: "Producto o servicio",
      productSelect: "Selecciona una opción",
      products: [
        { value: "Válvulas", label: "Válvulas" }, { value: "Tuberías", label: "Tuberías" }, { value: "Marcos y tapas", label: "Marcos y tapas" }, { value: "Grifos", label: "Grifos" },
        { value: "Acoples", label: "Acoples" }, { value: "Entrega o despacho", label: "Entrega o despacho" }, { value: "Otro", label: "Otro" },
      ],
      date: "Fecha del suceso",
      order: ["N° de orden de compra, factura u otro (opcional)", "Ej. F001-000123…"],
      facts: ["Describe lo ocurrido", "Explica de manera clara y detallada tu reclamo…", "Explica de manera clara y detallada tu queja…"],
      request: ["¿Qué solución solicitas?", "Indica de manera clara tu pedido o expectativa…"],
      mediumHint: "La respuesta se te enviará por escrito. Elige el medio.",
      mediums: [{ value: "Correo electrónico", label: "Correo electrónico" }, { value: "Carta al domicilio", label: "Carta al domicilio" }],
    },
    consent: { pre: "Declaro que la información registrada es veraz y acepto que sea tratada para la gestión de mi {kind}, de acuerdo con la ", link: "Política de privacidad" },
    clear: "Limpiar formulario",
    submit: { reclamo: "Enviar reclamo", queja: "Enviar queja" },
    sending: "Enviando…",
    success: { title: "Recibimos tu {kind}", text: "Guarda tu código de registro. Te contactaremos por el medio que elegiste para darte una respuesta.", again: "Registrar otra solicitud" },
    offline: {
      title: "Tu solicitud está lista para enviar",
      text: "Revisamos tus datos y armamos el texto de tu reclamo o queja. Elige cómo enviarlo al equipo de FUNDIGSAC; te responderemos por el medio que indicaste.",
      mail: "Enviar por correo",
      whatsapp: "Enviar por WhatsApp",
      copy: "Copiar texto",
      copied: "Texto copiado",
      preview: "Ver el texto que se enviará",
      note: "Tu solicitud queda registrada cuando recibimos el mensaje en {email} o por WhatsApp. Si no se abre tu aplicación de correo, usa “Copiar texto” y pégalo en un correo nuevo.",
      edit: "Editar mis datos",
    },
    side: {
      blue: { title: "Tu voz nos importa", text: "En FUNDIGSAC, cada reclamo o queja es una oportunidad para mejorar nuestros productos y servicios." },
      how: {
        title: "¿Cómo funciona?",
        items: [
          { title: "1. Completa el formulario", text: "Registra tu reclamo o queja con toda la información solicitada." },
          { title: "2. Recibimos tu solicitud", text: "Te enviamos la copia de tu hoja de reclamación por correo." },
          { title: "3. Evaluamos tu caso", text: "Nuestro equipo analiza la información y, si hace falta, se pone en contacto contigo." },
          { title: "4. Te respondemos por escrito", text: "Dentro de 15 días hábiles, por el medio que elijas: correo electrónico o carta." },
        ],
      },
      important: {
        title: "Información importante",
        items: [
          "Reclamo: disconformidad con productos o servicios. Queja: malestar por la atención al público.",
          "Si registras una queja que en realidad es un reclamo, se tramita como reclamo.",
          "Respuesta por escrito en un plazo no mayor a 15 días hábiles, improrrogables.",
          "Presentar un reclamo no te impide acudir al INDECOPI ni es requisito previo para denunciar.",
        ],
      },
      help: { title: "¿Necesitas ayuda?", text: "Si tienes consultas adicionales, puedes comunicarte con nuestro equipo de atención al cliente.", call: ["Llámanos", "Nuestro equipo te orientará."], write: "Escríbenos", whatsapp: ["WhatsApp", "Contáctanos por WhatsApp."], whatsappMsg: "Hola FUNDIGSAC. Necesito ayuda con mi reclamo o queja." },
      pledge: { title: "Nuestro compromiso", text: "Gestionamos cada reclamo o queja con responsabilidad, transparencia y respeto, para seguir construyendo relaciones de confianza." },
      aria: "Información sobre el libro de reclamaciones",
    },
    cta: { eyebrow: "¿Prefieres hablar directamente?", title: "Estamos para ayudarte.", text: "Nuestro equipo de atención al cliente puede orientarte sobre el estado de tu reclamo o resolver tus consultas.", cta: "Contactar ahora" },
  },
  en: {
    crumb: "Complaints book",
    eyebrow: "Customer service",
    title: "Complaints Book",
    lead: "Your feedback helps us keep improving. Register your claim or complaint here quickly, securely and transparently.",
    heroAlt: "FUNDIGSAC advisor assisting a customer in the office",
    formTitle: "Claims and complaints form",
    formIntro: "Please complete the information below. All fields marked with * are required.",
    formAria: "Claims and complaints form",
    legends: ["Request type", "Consumer identification", "Contracted good identification", "Details of the", "Consumer request", "Response method"],
    goodLegend: { reclamo: "Contracted good identification", queja: "Service received" },
    detailLegend: { reclamo: "Claim details", queja: "Complaint details" },
    provider: { title: "Supplier details", name: "Company name", ruc: "Tax ID (RUC)", address: "Address", sheet: "Complaint sheet no.", sheetValue: "Assigned when your request is registered" },
    notices: {
      filing: "Filing a claim does not prevent you from using other dispute resolution channels, nor is it a prerequisite to filing a complaint with INDECOPI.",
      deadline: "The supplier handles and answers in writing, through the method you choose, within fifteen (15) business days at most, without extension (Law No. 31435 and Supreme Decree No. 101-2022-PCM).",
      copy: "You will receive a copy of your complaint sheet at the email you provide.",
      indecopi: "If you do not get an answer on time, you can go to INDECOPI (Reclama Virtual, sacreclamo@indecopi.gob.pe or +51 1 224 7777 in Lima).",
    },
    kinds: {
      reclamo: { title: "Claim", text: "Disagreement related to products or services." },
      queja: { title: "Complaint", text: "Discomfort or dissatisfaction with the customer service received." },
    },
    fields: {
      name: ["Full name / company name", "E.g. Maria Perez Rojas…"],
      docType: "Document type",
      docSelect: "Select",
      docs: [{ value: "DNI", label: "National ID (DNI)" }, { value: "RUC", label: "Tax ID (RUC)" }, { value: "CE", label: "Foreigner card" }, { value: "PASAPORTE", label: "Passport" }],
      docNumber: ["Document number", "E.g. 12345678…"],
      email: ["Email address", "example@email.com…"],
      phone: ["Contact phone", "E.g. 987 654 321…"],
      address: ["Home address", "E.g. 123 Los Pinos Ave, Lima…"],
      docHints: { DNI: "The DNI has 8 digits.", RUC: "The RUC has 11 digits.", CE: "Enter 6 to 12 letters or numbers.", PASAPORTE: "Enter 6 to 12 letters or numbers." },
      minor: "I am a minor and I am filing this with my parent or representative",
      minorHint: "Enter the details of your parent or legal representative.",
      repName: ["Parent or representative full name", "E.g. Luis Perez Soto…"],
      repDoc: ["Parent or representative ID", "E.g. 12345678…"],
      goodType: "The claim is about a",
      goodTypes: [{ value: "PRODUCTO", label: "Product" }, { value: "SERVICIO", label: "Service" }],
      amount: ["Amount claimed (optional)", "E.g. 1500.00…"],
      amountHint: "If the claim has no amount, leave it empty.",
      currency: "Currency",
      currencies: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "US dollars (US$)" }],
      place: "Where did it happen?",
      placeSelect: "Select an option",
      places: [
        { value: "Atención presencial", label: "In-person service" }, { value: "Atención telefónica", label: "Phone service" }, { value: "WhatsApp", label: "WhatsApp" },
        { value: "Correo electrónico", label: "Email" }, { value: "Sitio web", label: "Website" }, { value: "Entrega o despacho", label: "Delivery or dispatch" }, { value: "Otro", label: "Other" },
      ],
      product: "Product or service",
      productSelect: "Select an option",
      products: [
        { value: "Válvulas", label: "Valves" }, { value: "Tuberías", label: "Pipes" }, { value: "Marcos y tapas", label: "Frames and covers" }, { value: "Grifos", label: "Hydrants" },
        { value: "Acoples", label: "Couplings" }, { value: "Entrega o despacho", label: "Delivery or dispatch" }, { value: "Otro", label: "Other" },
      ],
      date: "Date of the event",
      order: ["Purchase order, invoice or other no. (optional)", "E.g. F001-000123…"],
      facts: ["Describe what happened", "Explain your claim clearly and in detail…", "Explain your complaint clearly and in detail…"],
      request: ["What solution are you requesting?", "State your request or expectation clearly…"],
      mediumHint: "The answer will be sent to you in writing. Choose the method.",
      mediums: [{ value: "Correo electrónico", label: "Email" }, { value: "Carta al domicilio", label: "Letter to your home address" }],
    },
    consent: { pre: "I declare that the information provided is true and I agree to it being processed to handle my {kind}, in accordance with the ", link: "Privacy policy" },
    clear: "Clear form",
    submit: { reclamo: "Submit claim", queja: "Submit complaint" },
    sending: "Sending…",
    success: { title: "We received your {kind}", text: "Keep your registration code. We will contact you through the channel you chose to give you a response.", again: "Submit another request" },
    offline: {
      title: "Your request is ready to send",
      text: "We checked your details and prepared the text of your claim or complaint. Choose how to send it to the FUNDIGSAC team; we will reply through the channel you selected.",
      mail: "Send by email",
      whatsapp: "Send by WhatsApp",
      copy: "Copy text",
      copied: "Text copied",
      preview: "See the text that will be sent",
      note: "Your request is registered when we receive the message at {email} or on WhatsApp. If your email app does not open, use “Copy text” and paste it into a new email.",
      edit: "Edit my details",
    },
    side: {
      blue: { title: "Your voice matters", text: "At FUNDIGSAC, every claim or complaint is an opportunity to improve our products and services." },
      how: {
        title: "How does it work?",
        items: [
          { title: "1. Complete the form", text: "Register your claim or complaint with all the requested information." },
          { title: "2. We receive your request", text: "We email you a copy of your complaint sheet." },
          { title: "3. We assess your case", text: "Our team analyzes the information and, if needed, contacts you." },
          { title: "4. We answer in writing", text: "Within 15 business days, through the method you choose: email or letter." },
        ],
      },
      important: {
        title: "Important information",
        items: [
          "Claim: disagreement with products or services. Complaint: discomfort with the customer service.",
          "If you file a complaint that is really a claim, it is handled as a claim.",
          "Written answer within 15 business days at most, without extension.",
          "Filing a claim does not prevent you from going to INDECOPI nor is it a prerequisite.",
        ],
      },
      help: { title: "Need help?", text: "If you have further questions, you can contact our customer service team.", call: ["Call us", "Our team will guide you."], write: "Email us", whatsapp: ["WhatsApp", "Contact us on WhatsApp."], whatsappMsg: "Hello FUNDIGSAC. I need help with my claim or complaint." },
      pledge: { title: "Our commitment", text: "We handle every claim or complaint with responsibility, transparency and respect, to keep building relationships of trust." },
      aria: "Information about the complaints book",
    },
    cta: { eyebrow: "Prefer to talk directly?", title: "We are here to help.", text: "Our customer service team can guide you on the status of your claim or answer your questions.", cta: "Contact now" },
  },
};

/* ---------- 404 ---------- */
export const NOT_FOUND: Pair<{
  eyebrow: string;
  srError: string;
  title: string;
  lead: string;
  home: string;
  products: string;
  cards: readonly { title: string; text: string; alt: string }[];
}> = {
  es: {
    eyebrow: "Página no encontrada",
    srError: "Error 404. ",
    title: "Ups, esta página no se encuentra.",
    lead: "Parece que la dirección que buscaste no existe o ha sido movida. Pero no te preocupes, te ayudamos a continuar.",
    home: "Volver al inicio",
    products: "Explorar productos",
    cards: [
      { title: "Conoce nuestros productos", text: "Soluciones en válvulas, acoples, tuberías y más.", alt: "Válvula compuerta de hierro dúctil" },
      { title: "Explora por sectores", text: "Saneamiento, agricultura, minería e industria.", alt: "Tuberías para proyectos de infraestructura" },
      { title: "Recursos técnicos", text: "Fichas, catálogos y documentación.", alt: "Ficha técnica de válvula compuerta" },
    ],
  },
  en: {
    eyebrow: "Page not found",
    srError: "Error 404. ",
    title: "Oops, this page can’t be found.",
    lead: "It looks like the address you were looking for doesn’t exist or has been moved. Don’t worry, we’ll help you move on.",
    home: "Back to home",
    products: "Explore products",
    cards: [
      { title: "Discover our products", text: "Solutions in valves, couplings, pipes and more.", alt: "Ductile iron gate valve" },
      { title: "Explore by industry", text: "Sanitation, agriculture, mining and industry.", alt: "Pipes for infrastructure projects" },
      { title: "Technical resources", text: "Datasheets, catalogs and documentation.", alt: "Gate valve datasheet" },
    ],
  },
};
