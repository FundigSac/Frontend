/**
 * Fichas web de válvulas que antes solo tenían una tarjeta en /productos/valvulas (o una página en el WordPress anterior).
 *
 * Fuentes, ambas de FUNDIGSAC, cruzadas por producto:
 *  1. Lista de precios PRECIO MARZO2026.pdf (código, clase de brida y medidas en lista; ver src/lib/catalog-pdf.ts).
 *  2. Fichas publicadas en fundigsac.com/product/… (WordPress, 2025): materiales, funcionamiento y aplicaciones.
 * Si las fuentes no coinciden, se publica el dato de la lista de precios (lo que se vende hoy) y lo demás se consulta.
 * No hay precios, stock, certificaciones ni reseñas: se confirman al cotizar. Fotos: recortes de la lista de precios.
 *
 * Para agregar una ficha: sumar una entrada aquí (la ruta, el sitemap, el registro y los datos estructurados la toman
 * solos) y su tarjeta en src/screens/islands/w03-valvulas.tsx. La URL es el `slug`: no cambiarlo una vez publicado.
 */

export type SheetText = {
  /** Nombre comercial (h1). */
  name: string;
  /** Nombre técnico (antetítulo). */
  technicalName: string;
  /** Frase de entrada bajo el título. */
  lead: string;
  paragraphs: readonly string[];
  features: readonly string[];
  applications: readonly string[];
  specs: readonly (readonly [string, string])[];
  imageAlt: string;
};

export type ValveSheet = {
  slug: string;
  /** Código de la lista de precios. */
  code: string;
  image: string;
  /** Rango de medidas en lista (también se muestra en la tarjeta de /productos/valvulas). */
  range: string;
  /** Título para buscadores, sin la plantilla "| FUNDIGSAC". */
  title: string;
  /** Meta description (≤ 160 caracteres). */
  description: string;
  /** Fichas relacionadas para enlazar al pie. */
  related: readonly string[];
  es: SheetText;
  en: SheetText;
};

const img = (name: string) => `/media/catalog/${name}.webp`;

export const VALVE_SHEETS: readonly ValveSheet[] = [
  {
    slug: "valvula-check-swing",
    code: "VCSW",
    image: img("check-swing"),
    range: "DN50 – DN300",
    title: "Válvula check swing de hierro dúctil, DN50 a DN300",
    description: "Válvula de retención check swing de hierro dúctil con bridas ISO PN16, DN50 a DN300, para bombeo, líneas de impulsión y redes de agua. Cotiza en Lima.",
    related: ["valvula-check-flex", "valvula-de-alivio-bridada", "valvula-compuerta-fundigsac"],
    es: {
      name: "Válvula check swing",
      technicalName: "Válvula de retención de disco oscilante",
      lead: "Deja pasar el agua en un solo sentido y cierra sola cuando el flujo se invierte.",
      paragraphs: [
        "El disco de la válvula check swing cuelga de una bisagra. Mientras el agua avanza, el disco se mantiene abierto; si el flujo se detiene o se invierte, el disco vuelve a su asiento y cierra el paso sin que nadie tenga que operarla.",
        "Se instala a la salida de bombas y en líneas de impulsión para impedir el retorno del agua. El movimiento oscilante del disco abre y cierra de forma suave, lo que ayuda a reducir el golpe de ariete y el desgaste de la red.",
      ],
      features: [
        "Cuerpo de hierro dúctil GGG40 o GGG50",
        "Disco metálico o con revestimiento de EPDM, según el modelo",
        "Cierre automático por inversión del flujo, sin actuador",
        "Bridas ISO PN16; DN200 también disponible en PN10",
        "Instalación horizontal, o vertical solo con flujo ascendente",
      ],
      applications: ["Estaciones de bombeo", "Líneas de impulsión", "Redes de agua potable", "Plantas de tratamiento de agua"],
      specs: [
        ["Código", "VCSW"],
        ["Material del cuerpo", "Hierro dúctil GGG40 / GGG50"],
        ["Disco", "Metálico o revestido en EPDM (según modelo)"],
        ["Clase de brida", "ISO PN16 (DN200 también PN10)"],
        ["Medidas en lista", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 y DN300 (2″ a 12″)"],
        ["Operación", "Automática, por el propio flujo"],
        ["Posición de montaje", "Horizontal o vertical con flujo ascendente"],
      ],
      imageAlt: "Válvula check swing bridada de hierro dúctil con recubrimiento azul",
    },
    en: {
      name: "Swing check valve",
      technicalName: "Swing-disc check valve",
      lead: "It lets water flow in one direction only and closes by itself when the flow reverses.",
      paragraphs: [
        "The disc of a swing check valve hangs from a hinge. While water moves forward the disc stays open; when the flow stops or reverses, the disc drops back onto its seat and shuts off the line with no operator.",
        "It is installed at pump outlets and on rising mains to stop water from flowing back. The swinging disc opens and closes smoothly, which helps reduce water hammer and wear on the network.",
      ],
      features: [
        "Ductile iron body, GGG40 or GGG50",
        "Metal disc or EPDM-coated disc, depending on the model",
        "Closes automatically when the flow reverses, no actuator",
        "ISO PN16 flanges; DN200 also available in PN10",
        "Horizontal installation, or vertical with upward flow only",
      ],
      applications: ["Pumping stations", "Rising mains", "Drinking water networks", "Water treatment plants"],
      specs: [
        ["Code", "VCSW"],
        ["Body material", "Ductile iron GGG40 / GGG50"],
        ["Disc", "Metal or EPDM-coated (depending on model)"],
        ["Flange class", "ISO PN16 (DN200 also PN10)"],
        ["Listed sizes", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 and DN300 (2″ to 12″)"],
        ["Operation", "Automatic, driven by the flow"],
        ["Mounting", "Horizontal, or vertical with upward flow"],
      ],
      imageAlt: "Flanged ductile iron swing check valve with blue coating",
    },
  },
  {
    slug: "valvula-check-flex",
    code: "VCFLEX",
    image: img("check-flex"),
    range: "DN50 – DN300",
    title: "Válvula check flex de hierro dúctil, DN50 a DN300",
    description: "Válvula check flex de hierro dúctil con disco flexible de EPDM y bridas ISO PN16, DN50 a DN300: cierre automático y silencioso para bombeo y redes de agua.",
    related: ["valvula-check-swing", "valvula-reductora-de-presion", "valvula-compuerta-fundigsac"],
    es: {
      name: "Válvula check flex",
      technicalName: "Válvula de retención de disco flexible",
      lead: "Un disco flexible de caucho corta el retorno del agua de forma automática y silenciosa.",
      paragraphs: [
        "En la válvula check flex el cierre lo hace un disco flexible revestido de caucho EPDM. El agua lo abre al circular y, cuando la presión se invierte, el disco se apoya en su asiento y bloquea el retorno.",
        "Se usa en sistemas de bombeo, redes de agua potable, plantas de tratamiento y líneas de presión. Su cierre suave ayuda a reducir el golpe de ariete y mantiene el flujo en un solo sentido con poco mantenimiento.",
      ],
      features: [
        "Cuerpo y tapa de hierro dúctil GGG40 o GGG50",
        "Disco flexible recubierto de caucho EPDM",
        "Cierre automático por presión inversa, sin operador",
        "Bridas ISO PN16; DN200 también disponible en PN10",
        "Instalación horizontal o vertical",
      ],
      applications: ["Sistemas de bombeo", "Redes de agua potable", "Plantas de tratamiento", "Líneas de presión"],
      specs: [
        ["Código", "VCFLEX"],
        ["Cuerpo y tapa", "Hierro dúctil GGG40 / GGG50"],
        ["Disco", "Flexible, recubierto de EPDM"],
        ["Clase de brida", "ISO PN16 (DN200 también PN10)"],
        ["Medidas en lista", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 y DN300 (2″ a 12″)"],
        ["Operación", "Automática, por presión inversa"],
        ["Posición de montaje", "Horizontal o vertical"],
      ],
      imageAlt: "Válvula check flex bridada de hierro dúctil con recubrimiento azul",
    },
    en: {
      name: "Flex check valve",
      technicalName: "Flexible-disc check valve",
      lead: "A flexible rubber disc stops backflow automatically and quietly.",
      paragraphs: [
        "In a flex check valve the seal is a flexible disc coated with EPDM rubber. Flowing water opens it and, when the pressure reverses, the disc rests on its seat and blocks the backflow.",
        "It is used in pumping systems, drinking water networks, treatment plants and pressure lines. Its soft closing helps reduce water hammer and keeps the flow in one direction with little maintenance.",
      ],
      features: [
        "Ductile iron body and cover, GGG40 or GGG50",
        "Flexible disc coated with EPDM rubber",
        "Closes automatically under reverse pressure, no operator",
        "ISO PN16 flanges; DN200 also available in PN10",
        "Horizontal or vertical installation",
      ],
      applications: ["Pumping systems", "Drinking water networks", "Treatment plants", "Pressure lines"],
      specs: [
        ["Code", "VCFLEX"],
        ["Body and cover", "Ductile iron GGG40 / GGG50"],
        ["Disc", "Flexible, EPDM-coated"],
        ["Flange class", "ISO PN16 (DN200 also PN10)"],
        ["Listed sizes", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 and DN300 (2″ to 12″)"],
        ["Operation", "Automatic, under reverse pressure"],
        ["Mounting", "Horizontal or vertical"],
      ],
      imageAlt: "Flanged ductile iron flex check valve with blue coating",
    },
  },
  {
    slug: "valvula-reductora-de-presion",
    code: "VRDP",
    image: img("reductora-presion"),
    range: "DN50 – DN350",
    title: "Válvula reductora de presión, DN50 a DN350",
    description: "Válvula reductora de presión, DN50 a DN350: mantiene estable la presión aguas abajo en redes de agua potable, riego e industria. Cotiza en Lima.",
    related: ["valvula-de-alivio-bridada", "valvula-flotadora-bridada", "valvula-check-flex"],
    es: {
      name: "Válvula reductora de presión",
      technicalName: "Válvula reguladora de presión aguas abajo",
      lead: "Mantiene una presión estable aguas abajo, aunque cambie la presión de entrada.",
      paragraphs: [
        "La válvula reductora baja la presión de la red a un valor fijo y lo sostiene aunque la presión de entrada suba o baje. Así protege tuberías, accesorios y equipos de las sobrepresiones que provocan roturas y fugas.",
        "Según la configuración, la regulación es automática mediante un piloto hidráulico o mecánica con un resorte ajustable. La lista de precios también incluye pilotos de reductora de ½″ como repuesto.",
      ],
      features: [
        "Cuerpo de hierro dúctil GGG50; en algunos modelos, latón o bronce",
        "Presión de entrada de hasta 16 bar (PN16)",
        "Presión de salida ajustable entre 1,5 y 6 bar, según el modelo",
        "Control por piloto hidráulico o por resorte",
        "Recubrimiento epóxico o niquelado anticorrosivo",
      ],
      applications: ["Redes de agua potable y distribución", "Sistemas de riego", "Estaciones de bombeo", "Procesos industriales y climatización"],
      specs: [
        ["Código", "VRDP"],
        ["Medidas en lista", "DN50, DN65, DN80, DN100, DN150, DN200, DN250, DN300 y DN350 (2″ a 14″)"],
        ["Materiales", "Hierro dúctil GGG50 / latón / bronce (según modelo)"],
        ["Presión de entrada", "Hasta 16 bar"],
        ["Regulación", "1,5 a 6 bar, ajustable (según modelo)"],
        ["Control", "Piloto hidráulico o resorte"],
        ["Repuestos", "Piloto de reductora de ½″"],
      ],
      imageAlt: "Válvula reductora de presión bridada con piloto y manómetros",
    },
    en: {
      name: "Pressure-reducing valve",
      technicalName: "Downstream pressure-regulating valve",
      lead: "It keeps downstream pressure steady, even when the inlet pressure changes.",
      paragraphs: [
        "A pressure-reducing valve lowers the network pressure to a set value and holds it even when the inlet pressure rises or falls. This protects pipes, fittings and equipment from the overpressure that causes bursts and leaks.",
        "Depending on the configuration, regulation is automatic through a hydraulic pilot or mechanical with an adjustable spring. The price list also includes ½″ reducing pilots as spare parts.",
      ],
      features: [
        "Ductile iron GGG50 body; brass or bronze on some models",
        "Inlet pressure up to 16 bar (PN16)",
        "Outlet pressure adjustable between 1.5 and 6 bar, depending on the model",
        "Hydraulic pilot or spring control",
        "Epoxy or nickel-plated anti-corrosion coating",
      ],
      applications: ["Drinking water and distribution networks", "Irrigation systems", "Pumping stations", "Industrial processes and HVAC"],
      specs: [
        ["Code", "VRDP"],
        ["Listed sizes", "DN50, DN65, DN80, DN100, DN150, DN200, DN250, DN300 and DN350 (2″ to 14″)"],
        ["Materials", "Ductile iron GGG50 / brass / bronze (depending on model)"],
        ["Inlet pressure", "Up to 16 bar"],
        ["Regulation", "1.5 to 6 bar, adjustable (depending on model)"],
        ["Control", "Hydraulic pilot or spring"],
        ["Spare parts", "½″ reducing pilot"],
      ],
      imageAlt: "Flanged pressure-reducing valve with pilot and pressure gauges",
    },
  },
  {
    slug: "valvula-compuerta-acerrojada",
    code: "VACER",
    image: img("compuerta-acerrojada"),
    range: "DN50 – DN300",
    title: "Válvula de compuerta acerrojada para tubería HDPE",
    description: "Válvula de compuerta acerrojada de hierro dúctil con cuña de EPDM, clase ISO PN16, para tubería HDPE de 63 a 315 mm (DN50 a DN300). Cotiza en Lima.",
    related: ["valvula-embone-tipo-luflex", "valvula-compuerta-fundigsac", "valvula-compuerta"],
    es: {
      name: "Válvula de compuerta acerrojada",
      technicalName: "Válvula de compuerta con extremos de unión acerrojada para HDPE",
      lead: "Válvula de compuerta que se une directamente a la tubería HDPE, sin bridas.",
      paragraphs: [
        "La válvula de compuerta acerrojada se conecta a la tubería de polietileno (HDPE) mediante uniones acerrojadas en sus extremos, que sujetan el tubo y evitan que se desacople con la presión. Por eso se instala sin bridas ni portabridas.",
        "El cierre lo hace una cuña elástica recubierta de EPDM, que sella en ambos sentidos. Se usa en redes de agua potable, riego, líneas de impulsión y proyectos de saneamiento y minería, enterrada o dentro de cámaras.",
      ],
      features: [
        "Cuerpo y tapa de hierro dúctil GGG40 o GGG50",
        "Cuña elástica recubierta de EPDM vulcanizado",
        "Ejes de acero inoxidable",
        "Clase ISO PN16",
        "Extremos acerrojados para tubería HDPE de 63 a 315 mm",
      ],
      applications: ["Redes de agua potable en HDPE", "Riego agrícola", "Líneas de impulsión", "Saneamiento y minería"],
      specs: [
        ["Código", "VACER"],
        ["Cuerpo y tapa", "Hierro dúctil GGG40 / GGG50"],
        ["Cierre", "Cuña elástica recubierta de EPDM"],
        ["Clase", "ISO PN16"],
        ["Medidas en lista (DN · tubo HDPE)", "DN50 · 63 mm, DN65 · 75 mm, DN80 · 90 mm, DN100 · 110 mm, DN125 · 140 mm, DN150 · 160 mm, DN200 · 200 mm, DN250 · 250 mm, DN300 · 315 mm"],
        ["Instalación", "Enterrada o en cámara"],
      ],
      imageAlt: "Válvula de compuerta de hierro dúctil con uniones acerrojadas en ambos extremos",
    },
    en: {
      name: "Restrained-joint gate valve",
      technicalName: "Gate valve with restrained-joint ends for HDPE pipe",
      lead: "A gate valve that joins HDPE pipe directly, with no flanges.",
      paragraphs: [
        "The restrained-joint gate valve connects to polyethylene (HDPE) pipe through restrained joints on both ends, which grip the pipe and keep it from pulling out under pressure. It is installed without flanges or stub ends.",
        "Shut-off is done by a resilient wedge coated with EPDM that seals in both directions. It is used in drinking water and irrigation networks, rising mains and sanitation and mining projects, buried or inside valve chambers.",
      ],
      features: [
        "Ductile iron body and bonnet, GGG40 or GGG50",
        "Resilient wedge coated with vulcanized EPDM",
        "Stainless steel stems",
        "ISO PN16 class",
        "Restrained ends for 63 to 315 mm HDPE pipe",
      ],
      applications: ["HDPE drinking water networks", "Agricultural irrigation", "Rising mains", "Sanitation and mining"],
      specs: [
        ["Code", "VACER"],
        ["Body and bonnet", "Ductile iron GGG40 / GGG50"],
        ["Shut-off", "Resilient EPDM-coated wedge"],
        ["Class", "ISO PN16"],
        ["Listed sizes (DN · HDPE pipe)", "DN50 · 63 mm, DN65 · 75 mm, DN80 · 90 mm, DN100 · 110 mm, DN125 · 140 mm, DN150 · 160 mm, DN200 · 200 mm, DN250 · 250 mm, DN300 · 315 mm"],
        ["Installation", "Buried or in a chamber"],
      ],
      imageAlt: "Ductile iron gate valve with restrained joints on both ends",
    },
  },
  {
    slug: "valvula-embone-tipo-luflex",
    code: "VEMBO",
    image: img("compuerta-luflex"),
    range: "DN50 – DN300",
    title: "Válvula compuerta embone tipo Luflex, DN50 a DN300",
    description: "Válvula de compuerta de embone tipo Luflex (espiga-campana) en hierro dúctil, cuña de EPDM y clase ISO PN16, DN50 a DN300, para redes de agua y saneamiento.",
    related: ["valvula-compuerta-acerrojada", "valvula-compuerta-fundigsac", "valvula-compuerta"],
    es: {
      name: "Válvula de compuerta de embone tipo Luflex",
      technicalName: "Válvula de compuerta con conexión espiga-campana",
      lead: "Válvula de compuerta con extremos de embone para unir la tubería sin bridas ni pernos.",
      paragraphs: [
        "Esta válvula de compuerta tiene extremos de embone (espiga-campana) según el estándar Luflex. La tubería se inserta en la válvula y queda sellada, sin bridas ni pernos, lo que acorta el tiempo de instalación en obra.",
        "El cierre es una cuña elástica recubierta de EPDM y el cuerpo de hierro dúctil soporta la presión interna y los esfuerzos externos de una instalación enterrada. Está pensada para redes de agua potable, alcantarillado, riego y saneamiento urbano.",
      ],
      features: [
        "Cuerpo de hierro dúctil GGG50",
        "Conexión de embone (espiga-campana), estándar Luflex",
        "Cuña elástica recubierta de EPDM",
        "Recubrimiento epóxico interior y exterior",
        "Clase ISO PN16",
      ],
      applications: ["Redes de agua potable", "Alcantarillado", "Riego", "Saneamiento urbano"],
      specs: [
        ["Código", "VEMBO"],
        ["Material", "Hierro dúctil GGG50"],
        ["Conexión", "Embone (espiga-campana), estándar Luflex"],
        ["Cierre", "Cuña elástica recubierta de EPDM"],
        ["Clase", "ISO PN16"],
        ["Medidas en lista", "DN50 a DN300"],
      ],
      imageAlt: "Válvula de compuerta de hierro dúctil con extremos de embone tipo Luflex",
    },
    en: {
      name: "Luflex push-on gate valve",
      technicalName: "Gate valve with spigot-and-socket ends",
      lead: "A gate valve with push-on ends that joins the pipe with no flanges or bolts.",
      paragraphs: [
        "This gate valve has push-on (spigot-and-socket) ends to the Luflex standard. The pipe is inserted into the valve and sealed, with no flanges or bolts, which shortens installation time on site.",
        "Shut-off is a resilient EPDM-coated wedge, and the ductile iron body withstands internal pressure and the external loads of a buried installation. It is meant for drinking water, sewerage, irrigation and urban sanitation networks.",
      ],
      features: [
        "Ductile iron GGG50 body",
        "Push-on (spigot-and-socket) connection, Luflex standard",
        "Resilient EPDM-coated wedge",
        "Epoxy coating inside and outside",
        "ISO PN16 class",
      ],
      applications: ["Drinking water networks", "Sewerage", "Irrigation", "Urban sanitation"],
      specs: [
        ["Code", "VEMBO"],
        ["Material", "Ductile iron GGG50"],
        ["Connection", "Push-on (spigot-and-socket), Luflex standard"],
        ["Shut-off", "Resilient EPDM-coated wedge"],
        ["Class", "ISO PN16"],
        ["Listed sizes", "DN50 to DN300"],
      ],
      imageAlt: "Ductile iron gate valve with Luflex push-on ends",
    },
  },
  {
    slug: "valvula-de-alivio-bridada",
    code: "VDA",
    image: img("valvula-alivio"),
    range: "DN50 – DN300",
    title: "Válvula de alivio bridada, DN50 a DN300",
    description: "Válvula de alivio bridada de hierro dúctil, DN50 a DN300, hasta 16 bar: protege la red de sobrepresiones y golpes de ariete en bombeo y agua potable.",
    related: ["valvula-reductora-de-presion", "valvula-flotadora-bridada", "valvula-check-swing"],
    es: {
      name: "Válvula de alivio bridada",
      technicalName: "Válvula de alivio de presión con extremos bridados",
      lead: "Descarga el exceso de presión de la red y vuelve a cerrar cuando la presión se normaliza.",
      paragraphs: [
        "La válvula de alivio abre automáticamente cuando la presión del sistema supera el valor calibrado y libera el exceso. Cuando la presión vuelve a la normalidad, cierra de nuevo.",
        "Protege tuberías, válvulas y bombas de sobrepresiones, golpes de ariete y fallas de operación. Se usa en estaciones de bombeo, líneas de impulsión, redes de agua potable, sistemas contra incendio, riego presurizado y minería.",
      ],
      features: [
        "Cuerpo de hierro dúctil GGG50 o acero inoxidable",
        "Conexión bridada DIN PN10 / PN16",
        "Presión de trabajo de hasta 16 bar",
        "Mecanismo de pistón o diafragma, según el modelo",
        "Recubrimiento interior epóxico no tóxico",
      ],
      applications: ["Estaciones de bombeo", "Líneas de impulsión", "Redes de agua potable", "Redes contra incendio y riego presurizado"],
      specs: [
        ["Código", "VDA"],
        ["Material", "Hierro dúctil GGG50 / acero inoxidable"],
        ["Conexión", "Bridada DIN PN10 / PN16"],
        ["Presión de trabajo", "Hasta 16 bar"],
        ["Medidas en lista", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 y DN300 (2″ a 12″)"],
        ["Mecanismo", "Pistón o diafragma (según modelo)"],
        ["Ajuste", "Manual o calibrada de fábrica"],
        ["Repuestos", "Piloto de alivio de ½″"],
      ],
      imageAlt: "Válvula de alivio bridada de hierro dúctil con piloto y manómetro",
    },
    en: {
      name: "Flanged relief valve",
      technicalName: "Flanged pressure relief valve",
      lead: "It discharges excess pressure from the network and closes again once pressure is back to normal.",
      paragraphs: [
        "The relief valve opens automatically when system pressure exceeds the set value and releases the excess. When the pressure returns to normal, it closes again.",
        "It protects pipes, valves and pumps from overpressure, water hammer and operating faults. It is used in pumping stations, rising mains, drinking water networks, fire protection systems, pressurized irrigation and mining.",
      ],
      features: [
        "Ductile iron GGG50 or stainless steel body",
        "DIN PN10 / PN16 flanged connection",
        "Working pressure up to 16 bar",
        "Piston or diaphragm mechanism, depending on the model",
        "Non-toxic epoxy internal coating",
      ],
      applications: ["Pumping stations", "Rising mains", "Drinking water networks", "Fire protection and pressurized irrigation"],
      specs: [
        ["Code", "VDA"],
        ["Material", "Ductile iron GGG50 / stainless steel"],
        ["Connection", "Flanged DIN PN10 / PN16"],
        ["Working pressure", "Up to 16 bar"],
        ["Listed sizes", "DN50, DN65, DN80, DN100, DN150, DN200, DN250 and DN300 (2″ to 12″)"],
        ["Mechanism", "Piston or diaphragm (depending on model)"],
        ["Setting", "Manual or factory-set"],
        ["Spare parts", "½″ relief pilot"],
      ],
      imageAlt: "Flanged ductile iron relief valve with pilot and pressure gauge",
    },
  },
  {
    slug: "valvula-flotadora-bridada",
    code: "VFLOT",
    image: img("valvula-flotadora"),
    range: "DN50 – DN400",
    title: "Válvula flotadora bridada, DN50 a DN400",
    description: "Válvula flotadora bridada de hierro dúctil, DN50 a DN400, PN10/PN16: controla el nivel de tanques, cisternas y reservorios sin reboses. Cotiza en Lima.",
    related: ["valvula-reductora-de-presion", "valvula-de-alivio-bridada", "valvula-check-flex"],
    es: {
      name: "Válvula flotadora bridada",
      technicalName: "Válvula de control de nivel por flotador",
      lead: "Abre y cierra según el nivel del agua para que el tanque no rebose ni se vacíe.",
      paragraphs: [
        "La válvula flotadora regula sola el nivel de agua en tanques, cisternas y reservorios. Un flotador sigue el nivel: cuando el agua baja, la válvula abre para llenar; cuando llega al nivel fijado, cierra.",
        "Su cuerpo bridado admite caudales altos y el recubrimiento interior epóxico permite usarla en agua potable. Requiere poco mantenimiento y evita reboses y vaciados en sistemas de almacenamiento.",
      ],
      features: [
        "Cuerpo de hierro dúctil GGG50",
        "Conexión bridada DIN o ANSI",
        "Presión PN10 / PN16",
        "Flotador de acero inoxidable o de plástico de alta densidad",
        "Recubrimiento interior epóxico apto para agua potable",
      ],
      applications: ["Tanques elevados", "Cisternas", "Reservorios", "Plantas industriales y redes de agua potable"],
      specs: [
        ["Código", "VFLOT"],
        ["Material", "Hierro dúctil GGG50"],
        ["Conexión", "Bridada DIN o ANSI"],
        ["Presión", "PN10 / PN16"],
        ["Medidas en lista", "DN50, DN65, DN80, DN100, DN150, DN200, DN250, DN300, DN350 y DN400 (2″ a 16″)"],
        ["Flotador", "Acero inoxidable o plástico de alta densidad"],
      ],
      imageAlt: "Válvula flotadora bridada de hierro dúctil con flotador esférico de acero inoxidable",
    },
    en: {
      name: "Flanged float valve",
      technicalName: "Float-operated level control valve",
      lead: "It opens and closes with the water level so the tank neither overflows nor runs dry.",
      paragraphs: [
        "The float valve controls the water level in tanks, cisterns and reservoirs on its own. A float follows the level: when the water drops the valve opens to refill; when it reaches the set level, it closes.",
        "Its flanged body handles high flow rates and the epoxy internal coating allows use with drinking water. It needs little maintenance and prevents overflows and empty tanks in storage systems.",
      ],
      features: [
        "Ductile iron GGG50 body",
        "DIN or ANSI flanged connection",
        "PN10 / PN16 pressure",
        "Stainless steel or high-density plastic float",
        "Epoxy internal coating suitable for drinking water",
      ],
      applications: ["Elevated tanks", "Cisterns", "Reservoirs", "Industrial plants and drinking water networks"],
      specs: [
        ["Code", "VFLOT"],
        ["Material", "Ductile iron GGG50"],
        ["Connection", "Flanged DIN or ANSI"],
        ["Pressure", "PN10 / PN16"],
        ["Listed sizes", "DN50, DN65, DN80, DN100, DN150, DN200, DN250, DN300, DN350 and DN400 (2″ to 16″)"],
        ["Float", "Stainless steel or high-density plastic"],
      ],
      imageAlt: "Flanged ductile iron float valve with stainless steel ball float",
    },
  },
];

export const findValveSheet = (slug: string) => VALVE_SHEETS.find((s) => s.slug === slug);
