import type { Pair } from "./copy";

/**
 * Textos de /eliminar-cuenta (instrucciones de eliminación de cuenta y datos, también exigidas por Meta para
 * el inicio de sesión con Facebook). Base legal verificada en el texto oficial:
 * - Ley N.° 29733, art. 20 (supresión) · Reglamento D.S. N.° 016-2024-JUS (vigente desde el 30/03/2025):
 *   art. 2.8 (días = hábiles), 63 y 65 (identidad), 64 (requisitos), 66 (recepción y subsanación: 5 + 5 días),
 *   67.3 (gratuidad), 68.4 (prueba de la respuesta), 69.3 (10 días), 71 (ampliación única por igual plazo),
 *   82 (supresión total o parcial; bloqueo al presentar la solicitud), 83 (constancia y transferencias),
 *   84–85 (improcedencia y anonimización), 26.5 (publicidad: 10 días), 88.3 (Autoridad Nacional).
 * - Libro de Reclamaciones: D.S. N.° 011-2011-PCM, art. 12 (mod. D.S. N.° 006-2014-PCM): 2 años como mínimo.
 * - Código Tributario, art. 87 num. 7: conservación de comprobantes y registros por el plazo de ley.
 */
export const DELETION_UPDATED: Pair<string> = { es: "16 de octubre de 2026", en: "October 16, 2026" };

type Fact = { value: string; label: string; text: string; law: string };
type Row = { title: string; text: string; tag: string };
type Path = { name: string; steps: readonly string[]; cta: string };
type Choice = { title: string; text: string };

export type DeletionCopy = {
  crumb: string;
  title: string;
  lead: string;
  heroAlt: string;
  status: { label: string; sample: string; steps: readonly string[]; done: string; aria: string };
  summary: { eyebrow: string; title: string; facts: readonly Fact[] };
  ways: {
    eyebrow: string;
    title: string;
    text: string;
    recommended: string;
    form: { title: string; text: string; cta: string };
    mail: { title: string; text: string; cta: string; subject: string; body: string };
    social: { title: string; text: string; facebook: Path; google: Path; note: string };
  };
  data: {
    eyebrow: string;
    title: string;
    text: string;
    deletedTitle: string;
    deleted: readonly Row[];
    keptTitle: string;
    keptText: string;
    kept: readonly Row[];
    controller: { title: string; name: string; ruc: string; address: string; email: string };
  };
  device: {
    eyebrow: string;
    title: string;
    text: string;
    session: { title: string; on: string; off: string };
    quote: { title: string; on: string; one: string; off: string };
    chat: { title: string; on: string; one: string; off: string };
    cta: string;
    confirmTitle: string;
    confirm: string;
    cancel: string;
    working: string;
    error: string;
    doneTitle: string;
    doneText: string;
    doneCta: string;
    nothing: string;
    note: string;
  };
  process: {
    eyebrow: string;
    title: string;
    text: string;
    steps: readonly { when: string; title: string; text: string; law: string }[];
    extension: string;
    authority: string;
  };
  form: {
    eyebrow: string;
    title: string;
    intro: string;
    aria: string;
    signedAs: string;
    legends: { who: string; method: string; scope: string; extra: string };
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    emailHint: string;
    methods: { google: string; facebook: string; email: string; none: string };
    scopes: { all: Choice; account: Choice; marketing: Choice };
    doc: string;
    docPh: string;
    docHint: string;
    details: string;
    detailsPh: string;
    confirm: string;
    privacy: { pre: string; link: string; post: string };
    submit: string;
    ready: { title: string; text: string; mail: string; whatsapp: string; copy: string; copied: string; preview: string; note: string; edit: string };
  };
  side: {
    aria: string;
    safe: { title: string; items: readonly string[] };
    help: { title: string; text: string; call: readonly [string, string]; write: string; whatsapp: readonly [string, string]; whatsappMsg: string };
    legal: { title: string; text: string; link: string };
  };
  faq: { eyebrow: string; title: string; lead: string; items: readonly { q: string; a: string }[] };
  cta: { eyebrow: string; title: string; text: string; cta: string };
  updated: string;
};

export const DELETION: Pair<DeletionCopy> = {
  es: {
    crumb: "Eliminar cuenta",
    title: "Eliminar tu cuenta y tus datos",
    lead: "Te explicamos cómo solicitar la eliminación de tu cuenta de FUNDIGSAC, qué datos se borran y cómo gestionamos tu solicitud, conforme a la Ley N.° 29733 de Protección de Datos Personales.",
    heroAlt: "Persona usando una laptop en una oficina",
    status: {
      label: "Seguimiento de la solicitud",
      sample: "Ejemplo",
      steps: ["Solicitud recibida", "Datos bloqueados", "Identidad verificada", "Datos eliminados"],
      done: "Constancia enviada a tu correo",
      aria: "Ejemplo del avance de una solicitud de eliminación de datos",
    },
    summary: {
      eyebrow: "En resumen",
      title: "Lo que te garantizamos",
      facts: [
        { value: "10", label: "días hábiles como máximo", text: "Para responder tu solicitud, contados desde el día siguiente a su presentación.", law: "Art. 69.3 · D.S. 016-2024-JUS" },
        { value: "S/ 0", label: "sin costo", text: "Ejercer tus derechos sobre tus datos personales es gratuito.", law: "Art. 67.3 · D.S. 016-2024-JUS" },
        { value: "Día 1", label: "datos bloqueados", text: "Dejamos de usar tus datos apenas recibimos la solicitud.", law: "Art. 82.3 · D.S. 016-2024-JUS" },
        { value: "100 %", label: "por escrito", text: "Te enviamos una constancia con lo que eliminamos y a quién se lo comunicamos.", law: "Art. 83 · D.S. 016-2024-JUS" },
      ],
    },
    ways: {
      eyebrow: "Cómo solicitarla",
      title: "Tres formas de pedir la eliminación",
      text: "Elige la que te resulte más cómoda: todas llegan al mismo equipo y siguen el mismo procedimiento.",
      recommended: "Recomendada",
      form: { title: "Con el formulario de esta página", text: "Completa tus datos y te preparamos la solicitud con un código de seguimiento, lista para enviarla por correo o WhatsApp.", cta: "Ir al formulario" },
      mail: {
        title: "Por correo electrónico",
        text: "Escríbenos desde el correo asociado a tu cuenta con el asunto «Eliminar mi cuenta y mis datos». Indica tu nombre completo y qué deseas eliminar.",
        cta: "Escribir un correo",
        subject: "Eliminar mi cuenta y mis datos",
        body: "Hola, FUNDIGSAC:\n\nSolicito la eliminación de mi cuenta y de mis datos personales, conforme a la Ley N.° 29733.\n\nNombres y apellidos:\nCorreo asociado a mi cuenta:\nQué deseo eliminar:\n\nGracias.",
      },
      social: {
        title: "Desde Facebook o Google",
        text: "Si iniciaste sesión con Facebook o Google, puedes quitar el acceso de FUNDIGSAC desde la configuración de tu cuenta:",
        facebook: { name: "Facebook", steps: ["Configuración y privacidad", "Configuración", "Apps y sitios web", "FUNDIGSAC", "Eliminar"], cta: "Abrir en Facebook" },
        google: { name: "Google", steps: ["Cuenta de Google", "Seguridad", "Conexiones con apps de terceros", "FUNDIGSAC", "Eliminar todas las conexiones"], cta: "Abrir en Google" },
        note: "Quitar el acceso impide nuevos inicios de sesión, pero no borra lo que ya nos enviaste: para eso, envíanos también tu solicitud.",
      },
    },
    data: {
      eyebrow: "Qué datos se eliminan",
      title: "Lo que borramos y lo que la ley nos obliga a conservar",
      text: "Puedes pedir la eliminación de todos tus datos o solo de una parte. Esto es lo que tratamos hoy y lo que ocurre con cada uno.",
      deletedTitle: "Se eliminan",
      deleted: [
        { title: "Perfil de acceso", text: "Nombre, correo y foto de perfil que recibimos de Google o Facebook al iniciar sesión.", tag: "Cookie protegida en tu navegador · hasta 30 días" },
        { title: "Cotizaciones y solicitudes", text: "Productos, cantidades, notas y datos de contacto de las cotizaciones que nos enviaste.", tag: "Correo y herramientas comerciales" },
        { title: "Mensajes de contacto", text: "Lo que nos escribiste por formularios, correo o WhatsApp, con tu empresa y cargo.", tag: "Correo y WhatsApp corporativo" },
        { title: "Conversaciones con FundigIA", text: "Se procesan con nuestro proveedor de IA solo para responderte; no las guardamos en nuestros servidores.", tag: "Solo en esta pestaña del navegador" },
        { title: "Comunicaciones comerciales", text: "Tu correo y teléfono en nuestras listas de novedades y seguimiento comercial.", tag: "Baja en máx. 10 días hábiles · art. 26.5" },
      ],
      keptTitle: "Se conservan solo si la ley lo exige",
      keptText: "Estos datos quedan bloqueados: no se usan para nada más y se eliminan al vencer el plazo legal. Cuando es posible, se anonimizan (arts. 84 y 85 del Reglamento).",
      kept: [
        { title: "Libro de Reclamaciones", text: "Las hojas de reclamo o queja y la constancia de su respuesta.", tag: "Mínimo 2 años · art. 12, D.S. 011-2011-PCM" },
        { title: "Comprobantes y documentos tributarios", text: "Facturas, boletas y registros de las compras que realizaste.", tag: "Plazo de ley · art. 87, Código Tributario" },
        { title: "Pedidos y garantías vigentes", text: "Solo lo necesario para cumplir una entrega o garantía en curso, hasta que termine.", tag: "Relación contractual · art. 84" },
        { title: "Constancia de tu solicitud", text: "Fecha, código y respuesta, para acreditar que atendimos tu pedido.", tag: "Prueba de respuesta · art. 68.4" },
      ],
      controller: { title: "Responsable del tratamiento", name: "Razón social", ruc: "RUC", address: "Domicilio", email: "Correo para solicitudes" },
    },
    device: {
      eyebrow: "Al instante",
      title: "Borra ahora lo guardado en este dispositivo",
      text: "Parte de tu información vive solo en este navegador. Puedes borrarla tú mismo, sin esperar: cerramos tu sesión, vaciamos tu cotización y eliminamos tu conversación con FundigIA.",
      session: { title: "Sesión iniciada", on: "Activa como {email}", off: "No hay sesión iniciada" },
      quote: { title: "Cotización en curso", on: "{n} productos", one: "1 producto", off: "Vacía" },
      chat: { title: "Conversación con FundigIA", on: "{n} mensajes", one: "1 mensaje", off: "Sin mensajes" },
      cta: "Borrar datos de este dispositivo",
      confirmTitle: "¿Confirmas? Esta acción no se puede deshacer.",
      confirm: "Sí, borrar ahora",
      cancel: "Cancelar",
      working: "Borrando…",
      error: "No pudimos cerrar tu sesión. Revisa tu conexión e inténtalo de nuevo.",
      doneTitle: "Listo: este dispositivo quedó limpio",
      doneText: "Para eliminar también lo que tenemos en nuestros sistemas, envíanos tu solicitud.",
      doneCta: "Completar mi solicitud",
      nothing: "No hay datos personales guardados en este dispositivo.",
      note: "Tus preferencias de idioma, tema y cookies se mantienen: no son datos personales.",
    },
    process: {
      eyebrow: "Cómo la gestionamos",
      title: "Tu solicitud, paso a paso",
      text: "Seguimos el procedimiento del Reglamento de la Ley de Protección de Datos Personales (D.S. N.° 016-2024-JUS). Los plazos se cuentan en días hábiles.",
      steps: [
        { when: "Día 1", title: "Recibimos y bloqueamos", text: "Te confirmamos la recepción con tu código de seguimiento y dejamos de usar tus datos desde ese momento.", law: "Arts. 66.1 y 82.3" },
        { when: "Hasta el día 5", title: "Verificamos tu identidad", text: "Si escribes desde el correo de tu cuenta, ese correo te identifica. Si falta algún dato, te lo pedimos y tienes 5 días para enviarlo.", law: "Arts. 63, 65 y 66.2" },
        { when: "Hasta el día 10", title: "Eliminamos tus datos", text: "Borramos tu información de nuestro correo, WhatsApp y herramientas, y pedimos lo mismo a los proveedores que la tratan por encargo.", law: "Arts. 69.3 y 82" },
        { when: "Al terminar", title: "Te enviamos la constancia", text: "Te confirmamos por escrito qué eliminamos, qué se conserva por ley y a quién comunicamos la supresión.", law: "Art. 83" },
      ],
      extension: "Si el caso lo justifica, el plazo puede ampliarse una sola vez por un periodo igual; te lo comunicaremos antes de que venza (art. 71).",
      authority: "Si no respondemos a tiempo o no estás conforme con la respuesta, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos (art. 88.3).",
    },
    form: {
      eyebrow: "Solicitud",
      title: "Solicita la eliminación de tu cuenta",
      intro: "Completa el formulario y te preparamos la solicitud con un código de seguimiento para que la envíes por correo o WhatsApp. No necesitas iniciar sesión.",
      aria: "Formulario de solicitud de eliminación de cuenta y datos",
      signedAs: "Sesión iniciada como {email}: completamos tus datos.",
      legends: { who: "Tus datos", method: "¿Cómo ingresas a FUNDIGSAC?", scope: "¿Qué deseas eliminar?", extra: "Información adicional" },
      name: "Nombres y apellidos",
      namePh: "Como figuran en tu documento",
      email: "Correo asociado a tu cuenta",
      emailPh: "nombre@empresa.com",
      emailHint: "Te responderemos a este correo.",
      methods: { google: "Google", facebook: "Facebook", email: "Correo y contraseña", none: "No tengo cuenta" },
      scopes: {
        all: { title: "Mi cuenta y todos mis datos", text: "Perfil, cotizaciones, mensajes y comunicaciones." },
        account: { title: "Solo mi cuenta", text: "Perfil de acceso y sesión; conservamos tus cotizaciones." },
        marketing: { title: "Solo las comunicaciones", text: "Dejas de recibir novedades y seguimiento comercial." },
      },
      doc: "Documento de identidad (opcional)",
      docPh: "Ej.: DNI 12345678",
      docHint: "Solo si escribirás desde un correo distinto al de tu cuenta: adjunta una copia al enviarnos la solicitud (art. 63).",
      details: "Detalles (opcional)",
      detailsPh: "Ej.: números de cotización, otro correo o teléfono que usaste con nosotros…",
      confirm: "Entiendo que la eliminación es definitiva: no podré recuperar mi cuenta ni su historial.",
      privacy: { pre: "Usaremos estos datos solo para atender tu solicitud, como indica nuestra ", link: "Política de privacidad", post: "." },
      submit: "Preparar mi solicitud",
      ready: {
        title: "Tu solicitud está lista",
        text: "Envíala por el medio que prefieras. Guarda tu código de seguimiento:",
        mail: "Enviar por correo",
        whatsapp: "Enviar por WhatsApp",
        copy: "Copiar texto",
        copied: "Texto copiado",
        preview: "Ver el texto de la solicitud",
        note: "Si tu programa de correo no se abre, copia el texto y envíalo a {email}.",
        edit: "Editar la solicitud",
      },
    },
    side: {
      aria: "Información sobre la solicitud",
      safe: { title: "Tu solicitud es segura", items: ["Nunca te pediremos tu contraseña ni datos bancarios.", "Solo usamos tus datos para atender esta solicitud.", "Te respondemos en el correo que indiques."] },
      help: { title: "¿Necesitas ayuda?", text: "Nuestro equipo te acompaña en todo el proceso.", call: ["Llámanos", "+51 908 849 664"], write: "Escríbenos", whatsapp: ["WhatsApp", "Atención rápida"], whatsappMsg: "Hola, quiero solicitar la eliminación de mi cuenta y mis datos en FUNDIGSAC." },
      legal: { title: "Base legal", text: "Ley N.° 29733, Ley de Protección de Datos Personales (art. 20), y su Reglamento, aprobado por D.S. N.° 016-2024-JUS (arts. 63 a 71 y 82 a 85).", link: "Ver Política de privacidad" },
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Resolvemos tus dudas",
      lead: "Si tu pregunta no está aquí, escríbenos: te respondemos personalmente.",
      items: [
        { q: "¿Cuánto tarda la eliminación?", a: "Te respondemos en un máximo de 10 días hábiles, contados desde el día siguiente a tu solicitud. Si el caso lo justifica, el plazo puede ampliarse una sola vez por igual periodo y te avisaremos antes de que venza." },
        { q: "¿Puedo recuperar mi cuenta después?", a: "No. La eliminación es definitiva. Si más adelante quieres volver, puedes crear una cuenta nueva, que empezará sin historial." },
        { q: "¿Basta con quitar FUNDIGSAC de Facebook o Google?", a: "Quitar el acceso impide que vuelvas a iniciar sesión con esa cuenta, pero no borra la información que ya nos enviaste, como cotizaciones o mensajes. Para eliminarla, envíanos tu solicitud." },
        { q: "¿Qué pasa con mis cotizaciones o pedidos en curso?", a: "Las cotizaciones abiertas se cierran. Si tienes un pedido, entrega o garantía vigente, conservamos solo lo necesario para cumplirlo y lo eliminamos al terminar." },
        { q: "¿Puedo pedirlo si no tengo cuenta?", a: "Sí. Si nos contactaste por formulario, correo o WhatsApp, puedes solicitar que eliminemos tus datos de contacto con este mismo formulario: elige «No tengo cuenta»." },
        { q: "¿Tiene algún costo?", a: "No. El ejercicio de tus derechos sobre tus datos personales es gratuito." },
        { q: "¿Puedo cancelar mi solicitud?", a: "Sí, mientras no la hayamos completado. Responde a nuestro correo de confirmación indicando que deseas cancelarla." },
        { q: "¿Puede pedirlo otra persona por mí?", a: "Sí: tu representante legal o una persona con poder que la faculte expresamente, adjuntando copia de su documento de identidad y del documento que acredita la representación (art. 63 del Reglamento)." },
      ],
    },
    cta: { eyebrow: "¿Prefieres hablar con alguien?", title: "Te ayudamos con tu solicitud.", text: "Si tienes dudas sobre tus datos personales o sobre este proceso, nuestro equipo te atiende por correo, teléfono o WhatsApp.", cta: "Contactar con nosotros" },
    updated: "Última actualización",
  },
  en: {
    crumb: "Delete account",
    title: "Delete your account and your data",
    lead: "Here is how to request the deletion of your FUNDIGSAC account, which data is erased and how we handle your request, under Peru's Personal Data Protection Law No. 29733.",
    heroAlt: "Person using a laptop in an office",
    status: {
      label: "Request tracking",
      sample: "Example",
      steps: ["Request received", "Data blocked", "Identity verified", "Data deleted"],
      done: "Confirmation sent to your email",
      aria: "Example of how a data deletion request progresses",
    },
    summary: {
      eyebrow: "At a glance",
      title: "What we guarantee",
      facts: [
        { value: "10", label: "business days at most", text: "To answer your request, counted from the day after it is submitted.", law: "Art. 69.3 · S.D. 016-2024-JUS" },
        { value: "S/ 0", label: "free of charge", text: "Exercising your rights over your personal data is free.", law: "Art. 67.3 · S.D. 016-2024-JUS" },
        { value: "Day 1", label: "data blocked", text: "We stop using your data as soon as we receive the request.", law: "Art. 82.3 · S.D. 016-2024-JUS" },
        { value: "100%", label: "in writing", text: "We send you a record of what we deleted and who we notified.", law: "Art. 83 · S.D. 016-2024-JUS" },
      ],
    },
    ways: {
      eyebrow: "How to request it",
      title: "Three ways to ask for deletion",
      text: "Choose the one that suits you best: they all reach the same team and follow the same procedure.",
      recommended: "Recommended",
      form: { title: "With the form on this page", text: "Fill in your details and we prepare your request with a tracking code, ready to send by email or WhatsApp.", cta: "Go to the form" },
      mail: {
        title: "By email",
        text: "Write to us from the email linked to your account with the subject “Delete my account and my data”. Include your full name and what you want deleted.",
        cta: "Write an email",
        subject: "Delete my account and my data",
        body: "Hello FUNDIGSAC,\n\nI request the deletion of my account and my personal data, under Law No. 29733.\n\nFull name:\nEmail linked to my account:\nWhat I want deleted:\n\nThank you.",
      },
      social: {
        title: "From Facebook or Google",
        text: "If you signed in with Facebook or Google, you can remove FUNDIGSAC’s access from your account settings:",
        facebook: { name: "Facebook", steps: ["Settings & privacy", "Settings", "Apps and websites", "FUNDIGSAC", "Remove"], cta: "Open in Facebook" },
        google: { name: "Google", steps: ["Google Account", "Security", "Third-party connections", "FUNDIGSAC", "Delete all connections"], cta: "Open in Google" },
        note: "Removing access prevents new sign-ins, but it does not erase what you already sent us: for that, also send us your request.",
      },
    },
    data: {
      eyebrow: "Which data is deleted",
      title: "What we erase and what the law requires us to keep",
      text: "You can ask us to delete all of your data or only part of it. This is what we process today and what happens to each item.",
      deletedTitle: "Deleted",
      deleted: [
        { title: "Sign-in profile", text: "The name, email and profile photo we receive from Google or Facebook when you sign in.", tag: "Protected cookie in your browser · up to 30 days" },
        { title: "Quotes and requests", text: "Products, quantities, notes and contact details from the quotes you sent us.", tag: "Email and sales tools" },
        { title: "Contact messages", text: "What you wrote to us through forms, email or WhatsApp, with your company and role.", tag: "Corporate email and WhatsApp" },
        { title: "Conversations with FundigIA", text: "Processed by our AI provider only to answer you; we do not store them on our servers.", tag: "Only in this browser tab" },
        { title: "Marketing communications", text: "Your email and phone in our news and sales follow-up lists.", tag: "Removed within 10 business days · art. 26.5" },
      ],
      keptTitle: "Kept only when the law requires it",
      keptText: "This data is blocked: it is not used for anything else and is deleted when the legal period ends. When possible, it is anonymized (arts. 84 and 85 of the Regulation).",
      kept: [
        { title: "Complaints book", text: "Claim or complaint forms and the record of our reply.", tag: "At least 2 years · art. 12, S.D. 011-2011-PCM" },
        { title: "Receipts and tax records", text: "Invoices, receipts and records of the purchases you made.", tag: "Legal period · art. 87, Tax Code" },
        { title: "Active orders and warranties", text: "Only what is needed to complete an ongoing delivery or warranty, until it ends.", tag: "Contractual relationship · art. 84" },
        { title: "Record of your request", text: "Date, code and reply, to prove that we handled your request.", tag: "Proof of reply · art. 68.4" },
      ],
      controller: { title: "Data controller", name: "Legal name", ruc: "Tax ID (RUC)", address: "Address", email: "Email for requests" },
    },
    device: {
      eyebrow: "Instantly",
      title: "Erase what is stored on this device now",
      text: "Part of your information lives only in this browser. You can erase it yourself, right away: we sign you out, empty your quote and delete your conversation with FundigIA.",
      session: { title: "Signed-in session", on: "Active as {email}", off: "Not signed in" },
      quote: { title: "Quote in progress", on: "{n} products", one: "1 product", off: "Empty" },
      chat: { title: "Conversation with FundigIA", on: "{n} messages", one: "1 message", off: "No messages" },
      cta: "Erase data from this device",
      confirmTitle: "Are you sure? This cannot be undone.",
      confirm: "Yes, erase now",
      cancel: "Cancel",
      working: "Erasing…",
      error: "We could not sign you out. Check your connection and try again.",
      doneTitle: "Done: this device is clean",
      doneText: "To also delete what we hold in our systems, send us your request.",
      doneCta: "Complete my request",
      nothing: "There is no personal data stored on this device.",
      note: "Your language, theme and cookie preferences are kept: they are not personal data.",
    },
    process: {
      eyebrow: "How we handle it",
      title: "Your request, step by step",
      text: "We follow the procedure in the Regulation of the Personal Data Protection Law (S.D. No. 016-2024-JUS). Deadlines are counted in business days.",
      steps: [
        { when: "Day 1", title: "We receive and block", text: "We confirm receipt with your tracking code and stop using your data from that moment.", law: "Arts. 66.1 and 82.3" },
        { when: "By day 5", title: "We verify your identity", text: "If you write from your account email, that email identifies you. If anything is missing, we ask for it and you have 5 days to send it.", law: "Arts. 63, 65 and 66.2" },
        { when: "By day 10", title: "We delete your data", text: "We erase your information from our email, WhatsApp and tools, and ask the providers that process it on our behalf to do the same.", law: "Arts. 69.3 and 82" },
        { when: "When finished", title: "We send you the record", text: "We confirm in writing what we deleted, what the law requires us to keep and who we notified.", law: "Art. 83" },
      ],
      extension: "If the case justifies it, the deadline may be extended once for an equal period; we will tell you before it expires (art. 71).",
      authority: "If we do not reply on time or you disagree with our answer, you can go to the National Personal Data Protection Authority of the Ministry of Justice and Human Rights (art. 88.3).",
    },
    form: {
      eyebrow: "Request",
      title: "Request the deletion of your account",
      intro: "Fill in the form and we prepare your request with a tracking code so you can send it by email or WhatsApp. You do not need to sign in.",
      aria: "Account and data deletion request form",
      signedAs: "Signed in as {email}: we filled in your details.",
      legends: { who: "Your details", method: "How do you sign in to FUNDIGSAC?", scope: "What do you want deleted?", extra: "Additional information" },
      name: "Full name",
      namePh: "As shown on your ID",
      email: "Email linked to your account",
      emailPh: "name@company.com",
      emailHint: "We will reply to this email.",
      methods: { google: "Google", facebook: "Facebook", email: "Email and password", none: "I have no account" },
      scopes: {
        all: { title: "My account and all my data", text: "Profile, quotes, messages and communications." },
        account: { title: "Only my account", text: "Sign-in profile and session; we keep your quotes." },
        marketing: { title: "Only communications", text: "You stop receiving news and sales follow-ups." },
      },
      doc: "ID document (optional)",
      docPh: "E.g.: DNI 12345678",
      docHint: "Only if you will write from an email other than your account’s: attach a copy when you send us the request (art. 63).",
      details: "Details (optional)",
      detailsPh: "E.g.: quote numbers, another email or phone you used with us…",
      confirm: "I understand that deletion is permanent: I will not be able to recover my account or its history.",
      privacy: { pre: "We will use this data only to handle your request, as stated in our ", link: "Privacy policy", post: "." },
      submit: "Prepare my request",
      ready: {
        title: "Your request is ready",
        text: "Send it the way you prefer. Keep your tracking code:",
        mail: "Send by email",
        whatsapp: "Send by WhatsApp",
        copy: "Copy text",
        copied: "Text copied",
        preview: "View the request text",
        note: "If your email app does not open, copy the text and send it to {email}.",
        edit: "Edit the request",
      },
    },
    side: {
      aria: "Information about the request",
      safe: { title: "Your request is safe", items: ["We will never ask for your password or bank details.", "We use your data only to handle this request.", "We reply to the email you provide."] },
      help: { title: "Need help?", text: "Our team supports you throughout the process.", call: ["Call us", "+51 908 849 664"], write: "Write to us", whatsapp: ["WhatsApp", "Quick support"], whatsappMsg: "Hello, I would like to request the deletion of my FUNDIGSAC account and data." },
      legal: { title: "Legal basis", text: "Law No. 29733, Personal Data Protection Law (art. 20), and its Regulation, approved by S.D. No. 016-2024-JUS (arts. 63 to 71 and 82 to 85).", link: "See Privacy policy" },
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "We answer your questions",
      lead: "If your question is not here, write to us: we reply personally.",
      items: [
        { q: "How long does deletion take?", a: "We reply within 10 business days at most, counted from the day after your request. If the case justifies it, the deadline may be extended once for an equal period and we will let you know before it expires." },
        { q: "Can I recover my account afterwards?", a: "No. Deletion is permanent. If you want to come back later, you can create a new account, which will start with no history." },
        { q: "Is removing FUNDIGSAC from Facebook or Google enough?", a: "Removing access prevents you from signing in again with that account, but it does not erase the information you already sent us, such as quotes or messages. To delete it, send us your request." },
        { q: "What happens to my quotes or orders in progress?", a: "Open quotes are closed. If you have an active order, delivery or warranty, we keep only what is needed to complete it and delete it afterwards." },
        { q: "Can I ask even if I have no account?", a: "Yes. If you contacted us through a form, email or WhatsApp, you can ask us to delete your contact details with this same form: choose “I have no account”." },
        { q: "Does it cost anything?", a: "No. Exercising your rights over your personal data is free." },
        { q: "Can I cancel my request?", a: "Yes, as long as we have not completed it. Reply to our confirmation email saying you want to cancel it." },
        { q: "Can someone else request it for me?", a: "Yes: your legal representative or a person with a power of attorney that expressly authorizes it, attaching a copy of their ID and of the document that proves the representation (art. 63 of the Regulation)." },
      ],
    },
    cta: { eyebrow: "Prefer to talk to someone?", title: "We help you with your request.", text: "If you have questions about your personal data or this process, our team can help you by email, phone or WhatsApp.", cta: "Contact us" },
    updated: "Last updated",
  },
};
