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
  };
  info: readonly { title: string; alt: string; text: string }[];
  faq: { eyebrow: string; title: string; lead: string; items: readonly { q: string; a: string }[] };
}> = {
  es: {
    crumb: "Política de cookies",
    title: "Política de cookies",
    lead: "En FUNDIGSAC utilizamos cookies para mejorar tu experiencia de navegación, analizar el uso del sitio y ofrecer contenidos relevantes.",
    prefs: {
      eyebrow: "Gestiona tus preferencias",
      title: "Preferencias de cookies",
      text: "Puedes aceptar todas las cookies, rechazar las opcionales o personalizar tus preferencias. En cualquier momento podrás cambiar tu selección desde la configuración de tu navegador.",
      cards: [
        { title: "Cookies necesarias", text: "Son esenciales para el funcionamiento del sitio web. Permiten la navegación segura, el acceso a áreas protegidas y el correcto funcionamiento de sus funcionalidades." },
        { title: "Cookies analíticas", text: "Nos ayudan a entender cómo los visitantes utilizan el sitio web, mediante la recopilación de información anónima. Nos permite mejorar su rendimiento y contenido." },
        { title: "Cookies funcionales", text: "Permiten recordar tus preferencias de navegación, como el idioma o la región, para ofrecerte una experiencia más personalizada." },
        { title: "Cookies publicitarias", text: "Se utilizan para mostrarte contenidos y anuncios relevantes en función de tus intereses. Actualmente este sitio no las utiliza." },
      ],
      always: "Siempre activas",
      unused: "No utilizadas",
      on: "Activadas",
      off: "Desactivadas",
      acceptAll: "Aceptar todas",
      rejectOptional: "Rechazar opcionales",
      save: "Guardar preferencias",
      statusAll: "Aceptaste todas las cookies.",
      statusNecessary: "Solo se usarán las cookies necesarias.",
      statusSaved: "Preferencias guardadas.",
      note: "Al hacer clic en “Aceptar todas”, consientes el uso de todas las cookies. Puedes cambiar tus preferencias en cualquier momento.",
    },
    info: [
      { title: "¿Qué son las cookies?", alt: "Tanques circulares de una planta de tratamiento de agua", text: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tu información y preferencias durante un tiempo, facilitando tu próxima visita." },
      { title: "¿Cómo las usamos?", alt: "Acople bridado de hierro dúctil", text: "En FUNDIGSAC utilizamos cookies para garantizar el funcionamiento del sitio, analizar su uso, mejorar nuestros contenidos y, con tu consentimiento, mostrarte información relevante sobre nuestros productos y soluciones." },
      { title: "Duración de las cookies", alt: "Cascada de agua en una planta de tratamiento", text: "Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o persistentes (permanecen durante un tiempo determinado en tu dispositivo). La duración varía según el tipo de cookie y su finalidad." },
    ],
    faq: {
      eyebrow: "Información adicional",
      title: "Preguntas frecuentes",
      lead: "Resolvemos las dudas más comunes sobre el uso de cookies en nuestro sitio web.",
      items: [
        { q: "¿Qué tipos de cookies utiliza FUNDIGSAC?", a: "Utilizamos cookies necesarias para el funcionamiento del sitio y la seguridad de los formularios, y —solo si las aceptas— cookies analíticas y funcionales. Hoy no instalamos cookies publicitarias." },
        { q: "¿Puedo cambiar mis preferencias de cookies más adelante?", a: "Sí. Puedes volver a esta página o usar el enlace «Preferencias de cookies» del pie de página cuando quieras para modificar tu elección." },
        { q: "¿Cómo puedo gestionar o eliminar las cookies desde mi navegador?", a: "Todos los navegadores permiten bloquear o eliminar cookies desde su configuración de privacidad. Ten en cuenta que, si bloqueas las necesarias, algunas funciones del sitio podrían dejar de estar disponibles." },
        { q: "¿Las cookies recopilan información personal?", a: "Las cookies necesarias no recopilan datos para seguimiento. Las analíticas, si las activas, recopilan información agregada y anónima sobre el uso del sitio. Para más detalle consulta nuestra Política de Privacidad." },
        { q: "¿Qué sucede si rechazo las cookies opcionales?", a: "Podrás seguir navegando con normalidad. Solo dejaremos de recoger información de uso y de recordar preferencias opcionales, como la personalización de la experiencia." },
      ],
    },
  },
  en: {
    crumb: "Cookie policy",
    title: "Cookie policy",
    lead: "At FUNDIGSAC we use cookies to improve your browsing experience, analyze how the site is used and offer relevant content.",
    prefs: {
      eyebrow: "Manage your preferences",
      title: "Cookie preferences",
      text: "You can accept all cookies, reject the optional ones or customize your preferences. You can change your selection at any time from your browser settings.",
      cards: [
        { title: "Necessary cookies", text: "They are essential for the website to work. They enable secure browsing, access to protected areas and the correct operation of its features." },
        { title: "Analytics cookies", text: "They help us understand how visitors use the website by collecting anonymous information. This allows us to improve its performance and content." },
        { title: "Functional cookies", text: "They remember your browsing preferences, such as language or region, to offer you a more personalized experience." },
        { title: "Advertising cookies", text: "They are used to show you relevant content and ads based on your interests. This site does not currently use them." },
      ],
      always: "Always active",
      unused: "Not used",
      on: "Enabled",
      off: "Disabled",
      acceptAll: "Accept all",
      rejectOptional: "Reject optional",
      save: "Save preferences",
      statusAll: "You accepted all cookies.",
      statusNecessary: "Only necessary cookies will be used.",
      statusSaved: "Preferences saved.",
      note: "By clicking “Accept all”, you consent to the use of all cookies. You can change your preferences at any time.",
    },
    info: [
      { title: "What are cookies?", alt: "Circular tanks at a water treatment plant", text: "Cookies are small text files stored on your device when you visit a website. They let the site remember your information and preferences for a period of time, making your next visit easier." },
      { title: "How do we use them?", alt: "Ductile iron flange coupling", text: "At FUNDIGSAC we use cookies to ensure the site works, analyze its use, improve our content and, with your consent, show you relevant information about our products and solutions." },
      { title: "Cookie duration", alt: "Water cascade at a treatment plant", text: "Cookies can be session cookies (deleted when you close the browser) or persistent cookies (kept on your device for a set period). Duration varies by cookie type and purpose." },
    ],
    faq: {
      eyebrow: "Additional information",
      title: "Frequently asked questions",
      lead: "We answer the most common questions about the use of cookies on our website.",
      items: [
        { q: "What types of cookies does FUNDIGSAC use?", a: "We use cookies that are necessary for the site to work and for form security and—only if you accept them—analytics and functional cookies. We do not install advertising cookies today." },
        { q: "Can I change my cookie preferences later?", a: "Yes. You can return to this page or use the “Cookie preferences” link in the footer at any time to change your choice." },
        { q: "How can I manage or delete cookies from my browser?", a: "All browsers let you block or delete cookies from their privacy settings. Keep in mind that, if you block the necessary ones, some site features may stop working." },
        { q: "Do cookies collect personal information?", a: "Necessary cookies do not collect data for tracking. Analytics cookies, if you enable them, collect aggregated, anonymous information about how the site is used. For more detail, see our Privacy Policy." },
        { q: "What happens if I reject optional cookies?", a: "You can keep browsing normally. We will only stop collecting usage information and remembering optional preferences, such as experience personalization." },
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
  detailLegend: { reclamo: string; queja: string };
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
    product: string;
    productSelect: string;
    products: readonly ClaimOption[];
    date: string;
    order: [string, string];
    facts: [string, string, string];
    request: [string, string];
    channelsHint: string;
    channels: readonly ClaimOption[];
  };
  consent: { pre: string; link: string };
  clear: string;
  submit: { reclamo: string; queja: string };
  sending: string;
  success: { title: string; text: string; again: string };
  fallback: { title: string; text: string; mail: string; phone: string; whatsapp: string; whatsappText: string; mailSubject: string };
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
    legends: ["Tipo de solicitud", "Datos del consumidor", "Identificación del bien o servicio", "Detalle del", "Pedido del consumidor", "Canales de respuesta"],
    detailLegend: { reclamo: "Detalle del reclamo", queja: "Detalle de la queja" },
    kinds: {
      reclamo: { title: "Reclamo", text: "Disconformidad relacionada con un bien o servicio que ha afectado tu experiencia." },
      queja: { title: "Queja", text: "Manifestación de insatisfacción sin que exista una afectación directa en el servicio." },
    },
    fields: {
      name: ["Nombres y apellidos / razón social", "Ej. María Pérez Rojas…"],
      docType: "Tipo de documento",
      docSelect: "Selecciona",
      docs: [{ value: "DNI", label: "DNI" }, { value: "RUC", label: "RUC" }, { value: "CE", label: "Carné de extranjería" }, { value: "PASAPORTE", label: "Pasaporte" }],
      docNumber: ["Número de documento", "Ej. 12345678…"],
      email: ["Correo electrónico", "ejemplo@correo.com…"],
      phone: ["Teléfono de contacto", "Ej. 987 654 321…"],
      address: ["Dirección", "Ej. Av. Los Pinos 123, Lima…"],
      product: "Producto o servicio relacionado",
      productSelect: "Selecciona una opción",
      products: [
        { value: "Válvulas", label: "Válvulas" }, { value: "Tuberías", label: "Tuberías" }, { value: "Marcos y tapas", label: "Marcos y tapas" }, { value: "Grifos", label: "Grifos" },
        { value: "Acoples", label: "Acoples" }, { value: "Atención o servicio al cliente", label: "Atención o servicio al cliente" }, { value: "Entrega o despacho", label: "Entrega o despacho" }, { value: "Otro", label: "Otro" },
      ],
      date: "Fecha del suceso",
      order: ["N° de orden de compra, factura u otro (opcional)", "Ej. F001-000123…"],
      facts: ["Describe lo ocurrido", "Explica de manera clara y detallada tu reclamo…", "Explica de manera clara y detallada tu queja…"],
      request: ["¿Qué solución solicitas?", "Indica de manera clara tu pedido o expectativa…"],
      channelsHint: "Selecciona el medio por el cual prefieres que nos comuniquemos contigo.",
      channels: [{ value: "Correo electrónico", label: "Correo electrónico" }, { value: "Teléfono", label: "Teléfono" }, { value: "WhatsApp", label: "WhatsApp" }],
    },
    consent: { pre: "Declaro que la información registrada es veraz y acepto que sea tratada para la gestión de mi {kind}, de acuerdo con la ", link: "Política de privacidad" },
    clear: "Limpiar formulario",
    submit: { reclamo: "Enviar reclamo", queja: "Enviar queja" },
    sending: "Enviando…",
    success: { title: "Recibimos tu {kind}", text: "Guarda tu código de registro. Te contactaremos por el medio que elegiste para darte una respuesta.", again: "Registrar otra solicitud" },
    fallback: {
      title: "Registro en línea en preparación",
      text: "Estamos habilitando el registro digital con código de seguimiento. Mientras tanto, puedes presentar tu reclamo o queja por estos canales y lo atenderemos.",
      mail: "Por correo",
      phone: "Por teléfono",
      whatsapp: "Por WhatsApp",
      whatsappText: "Indica que se trata de un reclamo o queja.",
      mailSubject: "Reclamo o queja FUNDIGSAC",
    },
    side: {
      blue: { title: "Tu voz nos importa", text: "En FUNDIGSAC, cada reclamo o queja es una oportunidad para mejorar nuestros productos y servicios." },
      how: {
        title: "¿Cómo funciona?",
        items: [
          { title: "1. Completa el formulario", text: "Registra tu reclamo o queja con toda la información solicitada." },
          { title: "2. Recibimos tu solicitud", text: "Te enviaremos un número de registro por correo electrónico." },
          { title: "3. Evaluamos tu caso", text: "Nuestro equipo analizará la información y se pondrá en contacto contigo." },
          { title: "4. Te brindamos una respuesta", text: "Recibirás una respuesta en el menor tiempo posible, por el medio que elijas." },
        ],
      },
      important: {
        title: "Información importante",
        items: [
          "Este formulario es únicamente para reclamos y quejas sobre nuestros productos y servicios.",
          "Completa la información de manera veraz y detallada.",
          "Nos comunicaremos contigo a través del medio seleccionado.",
          "El plazo de atención podrá variar según la naturaleza del caso.",
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
    legends: ["Request type", "Consumer details", "Product or service identification", "Details of the", "Consumer request", "Response channels"],
    detailLegend: { reclamo: "Claim details", queja: "Complaint details" },
    kinds: {
      reclamo: { title: "Claim", text: "Disagreement related to a product or service that has affected your experience." },
      queja: { title: "Complaint", text: "Expression of dissatisfaction with no direct impact on the service." },
    },
    fields: {
      name: ["Full name / company name", "E.g. Maria Perez Rojas…"],
      docType: "Document type",
      docSelect: "Select",
      docs: [{ value: "DNI", label: "National ID (DNI)" }, { value: "RUC", label: "Tax ID (RUC)" }, { value: "CE", label: "Foreigner card" }, { value: "PASAPORTE", label: "Passport" }],
      docNumber: ["Document number", "E.g. 12345678…"],
      email: ["Email address", "example@email.com…"],
      phone: ["Contact phone", "E.g. 987 654 321…"],
      address: ["Address", "E.g. 123 Los Pinos Ave, Lima…"],
      product: "Related product or service",
      productSelect: "Select an option",
      products: [
        { value: "Válvulas", label: "Valves" }, { value: "Tuberías", label: "Pipes" }, { value: "Marcos y tapas", label: "Frames and covers" }, { value: "Grifos", label: "Hydrants" },
        { value: "Acoples", label: "Couplings" }, { value: "Atención o servicio al cliente", label: "Customer service" }, { value: "Entrega o despacho", label: "Delivery or dispatch" }, { value: "Otro", label: "Other" },
      ],
      date: "Date of the event",
      order: ["Purchase order, invoice or other no. (optional)", "E.g. F001-000123…"],
      facts: ["Describe what happened", "Explain your claim clearly and in detail…", "Explain your complaint clearly and in detail…"],
      request: ["What solution are you requesting?", "State your request or expectation clearly…"],
      channelsHint: "Select how you prefer us to contact you.",
      channels: [{ value: "Correo electrónico", label: "Email" }, { value: "Teléfono", label: "Phone" }, { value: "WhatsApp", label: "WhatsApp" }],
    },
    consent: { pre: "I declare that the information provided is true and I agree to it being processed to handle my {kind}, in accordance with the ", link: "Privacy policy" },
    clear: "Clear form",
    submit: { reclamo: "Submit claim", queja: "Submit complaint" },
    sending: "Sending…",
    success: { title: "We received your {kind}", text: "Keep your registration code. We will contact you through the channel you chose to give you a response.", again: "Submit another request" },
    fallback: {
      title: "Online registration coming soon",
      text: "We are enabling digital registration with a tracking code. In the meantime, you can submit your claim or complaint through these channels and we will handle it.",
      mail: "By email",
      phone: "By phone",
      whatsapp: "By WhatsApp",
      whatsappText: "Mention that it is a claim or complaint.",
      mailSubject: "FUNDIGSAC claim or complaint",
    },
    side: {
      blue: { title: "Your voice matters", text: "At FUNDIGSAC, every claim or complaint is an opportunity to improve our products and services." },
      how: {
        title: "How does it work?",
        items: [
          { title: "1. Complete the form", text: "Register your claim or complaint with all the requested information." },
          { title: "2. We receive your request", text: "We will send you a registration number by email." },
          { title: "3. We assess your case", text: "Our team will analyze the information and get in touch with you." },
          { title: "4. We give you a response", text: "You will receive a response as soon as possible, through the channel you choose." },
        ],
      },
      important: {
        title: "Important information",
        items: [
          "This form is only for claims and complaints about our products and services.",
          "Please complete the information truthfully and in detail.",
          "We will contact you through the channel you selected.",
          "Response times may vary depending on the nature of the case.",
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
