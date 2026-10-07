import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
const mirror = path.join(process.cwd(), "legacy/mirror");
const localizeHost = (text: string) => text
  .replace(/https?:\/\/(?:www\.)?fundigsac\.com(?=\/)/gi, "")
  .replace(/https?:\\\/\\\/(?:www\.)?fundigsac\.com(?=\\\/)/gi, "");
async function htmlFiles(dir: string): Promise<string[]> {
  const found: string[] = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) found.push(...await htmlFiles(full));
    else if (item.name.toLowerCase().endsWith(".html")) found.push(full);
  }
  return found;
}
async function filesWithExtension(dir: string, extension: string): Promise<string[]> {
  const found: string[] = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) found.push(...await filesWithExtension(full, extension));
    else if (item.name.toLowerCase().endsWith(extension)) found.push(full);
  }
  return found;
}
const files = await htmlFiles(mirror);
for (const file of files) {
  let html = await readFile(file, "utf8");
  html = localizeHost(html);
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
    /wp-emoji-settings|wp-emoji-release|wp-emoji-loader|sourceURL=.*wp-includes\/js\/wp-emoji/i.test(script) ? "" : script,
  );
  html = html.replace(/<img\b(?=[^>]*\bclass=["'][^"']*\bemoji\b)[^>]*>/gi, (image) => image.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "");
  html = html.replace(/<iframe\b([^>]*\bsrc=["']https?:\/\/maps\.google\.com\/maps\?[^"']*["'][^>]*)>[\s\S]*?<\/iframe>/gi, (_tag, attrs: string) => {
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "https://maps.google.com/";
    const title = attrs.match(/\btitle=["']([^"']+)["']/i)?.[1] ?? "ubicación";
    return '<div class="mirror-map-fallback" role="group" aria-label="Mapa no disponible sin conexión"><p>El mapa interactivo requiere conexión.</p><a href="' + src + '" target="_blank" rel="noopener noreferrer">Abrir ' + title + ' en Google Maps</a></div>';
  });
  const relative = path.relative(mirror, file).replace(/\\/g, "/");
  const route = relative === "index.html" ? "/" : "/" + relative.replace(/\/index\.html$/i, "").replace(/\.html$/i, "") + "/";
  html = html.replaceAll('Válvulas Hierro Dúctil', 'Válvulas de hierro dúctil').replaceAll('Válvulas Hierro dúctil', 'Válvulas de hierro dúctil');
  const verifiedProductCopy: Record<string, { description: string; facts: string[]; meta: string; summary?: string }> = {
    "/product/valvula-check-flex/": {
      description: "Válvula de retención tipo flex para líneas en las que el agua debe circular en un solo sentido. Al elegirla, verifica el diámetro nominal, la clase de presión y el tipo de unión con la tubería.",
      facts: ["Referencia: VCFLEX", "Clase de la lista: ISO PN16; también figura una variante DN200 PN10", "Medidas listadas: DN50 a DN300"],
      meta: "Válvula Check Flex VCFLEX para evitar el retorno del flujo. Referencias DN50 a DN300; confirma clase y conexión antes de cotizar.",
    },
    "/product/valvula-check-swing/": {
      description: "El disco oscilante de una Check Swing permite el paso del agua y cierra ante el flujo inverso. Indica la posición de instalación y la clase requerida para identificar la variante correcta.",
      summary: "Retención tipo paleta VCSW en referencias DN50–DN300; confirma la clase nominal del modelo.",
      facts: ["Referencia: VCSW, tipo paleta", "Medidas listadas: DN50 a DN300", "La tabla señala ISO PN16 y una variante DN200 PN10"],
      meta: "Válvula Check Swing VCSW de retención tipo paleta. Referencias DN50 a DN300; consulta la clase nominal de la variante requerida.",
    },
    "/product/valvula-compuerta-acerrojada/": {
      description: "Compuerta acerrojada para tubería HDPE. Esta familia se selecciona por dos medidas: el DN de la válvula y el diámetro exterior del tubo. Envíanos ambas para comprobar el acople.",
      facts: ["Referencia: VACER", "Clase de la lista: ISO PN16", "Correspondencias listadas: DN50–DN300 y tubo de 63–315 mm"],
      meta: "Compuerta acerrojada VACER para HDPE. Indica DN y diámetro exterior del tubo; la lista registra ISO PN16 y DN50–DN300.",
    },
    "/product/valvula-compuerta-bridada/": {
      description: "Compuerta con extremos bridados para abrir o aislar una línea. La unión debe coincidir con las bridas existentes; por eso conviene precisar DN, clase nominal y patrón de perforación antes de pedirla.",
      facts: ["Define el diámetro y la clase de presión de la instalación", "Confirma norma de brida y ficha técnica del modelo ofertado"],
      meta: "Válvula compuerta bridada para cierre de líneas. Comparte DN, clase nominal y patrón de brida para solicitar el modelo compatible.",
    },
    "/product/valvula-de-alivio-bridada/": {
      description: "Una válvula de alivio permite descargar presión cuando se alcanza el valor de apertura definido para el sistema. Para seleccionar la variante, comparte presión normal de trabajo, ajuste requerido y diámetro de la línea.",
      facts: ["Familias comerciales: VDA y VDAINOX", "Medidas listadas: DN50 a DN300", "Presión de apertura y materiales: según ficha del modelo"],
      meta: "Válvula de alivio bridada VDA o VDAINOX, con referencias DN50 a DN300. Indica presión de trabajo y ajuste de apertura.",
    },
    "/product/valvula-embone-tipo-luflex/": {
      description: "Compuerta con unión de campana tipo Luflex. Para incorporarla a una red, comprueba la medida del tubo y el extremo de conexión; la correspondencia entre DN y milímetros figura en el tarifario.",
      facts: ["Referencia: VEMBO", "Clase de la lista: ISO PN16", "Medidas listadas: DN50–DN300, para tubos de 63–315 mm"],
      meta: "Compuerta de embone Luflex VEMBO. Referencias ISO PN16 de DN50 a DN300; verifica la medida del tubo antes de cotizar.",
    },
    "/product/valvula-flotadora-bridada/": {
      description: "Válvula de altitud tipo flotador para regular la entrada de agua según el nivel del depósito. La configuración depende del tanque, el diámetro de la línea y las condiciones de operación.",
      facts: ["Familias comerciales: VFLOT y VFLOTINOX", "Medidas con referencia: DN50 a DN300", "Para DN350 o DN400, solicita confirmación de la variante"],
      meta: "Válvula de altitud tipo flotador VFLOT o VFLOTINOX para control de nivel. Referencias DN50 a DN300; consulta configuración.",
    },
    "/product/valvula-guillotina/": {
      description: "Válvula tipo cuchilla para cortar el paso en procesos donde el fluido puede contener sólidos. La selección depende del material transportado, la presión, el diámetro y el accionamiento requerido.",
      facts: ["El tarifario menciona una válvula tipo cuchilla VTCU; confirma si corresponde a esta ficha", "Solicita ficha técnica antes de definir material y cierre"],
      meta: "Válvula tipo guillotina para corte de flujo. Consulta compatibilidad con el fluido, presión, diámetro y accionamiento.",
    },
    "/product/valvula-mariposa-excentrica/": {
      description: "La mariposa excéntrica se consulta según las condiciones de la línea y la frecuencia de operación. Indica diámetro, presión, tipo de fluido y accionamiento para revisar el modelo correspondiente.",
      summary: "Para seleccionar una mariposa excéntrica, indica DN, presión y accionamiento requerido.",
      facts: ["La lista disponible muestra otras familias de mariposa, sin identificar la variante excéntrica", "Medidas y materiales de esta ficha: requieren confirmación del modelo"],
      meta: "Válvula mariposa excéntrica. Indica DN, presión, fluido y accionamiento para confirmar el modelo y su ficha técnica.",
    },
    "/product/valvula-reductora-de-presion/": {
      description: "Diseñada para controlar la presión aguas abajo de una red hidráulica. La presión de entrada, el valor de salida buscado y el caudal de operación son los datos principales para escoger la configuración.",
      facts: ["Familias comerciales: VRDP hasta DN350 y VRDPINOX hasta DN400", "El rango de regulación se confirma con la ficha del modelo"],
      meta: "Válvula reductora de presión VRDP o VRDPINOX. Para seleccionar el modelo, indica DN y presiones de entrada y salida.",
    },
  };
  const productCopy = verifiedProductCopy[route];
  if (productCopy) {
    const body = '<h2>Descripción</h2>\n<p>' + productCopy.description + '</p>\n<h3>Referencias para cotizar</h3>\n<ul>' + productCopy.facts.map((fact) => '<li>' + fact + '</li>').join("\n") + '</ul>\n<p><small>Medidas de referencia: lista comercial de marzo de 2026. Confirma especificaciones, precio y disponibilidad al cotizar.</small></p>\n';
    html = html.replace(/(<div\b(?=[^>]*\bid=["']tab-description["'])[^>]*>)[\s\S]*?(?=<div\b(?=[^>]*\bid=["']tab-reviews["']))/i, (_panel, opening: string) => opening + body + '\t\t\t\t</div>\n\t\t\t\t');
    html = html.replace(/(<div\b(?=[^>]*\bclass=["'][^"']*woocommerce-product-details__short-description[^"']*["'])[^>]*>)[\s\S]*?(<\/div>)/i, (_summary, opening: string, closing: string) => opening + (productCopy.summary ? '<p>' + productCopy.summary + '</p>' : '') + closing);
    html = html.replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i, '<meta name="description" content="' + productCopy.meta.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '">');
    html = html.replace(/("excerpt":)"(?:\\.|[^"\\])*"(?=,"featuredImage")/i, (_excerpt, key: string) => key + JSON.stringify(productCopy.summary ?? productCopy.meta));
  }
  const oldBrandParagraph = '<p>En <strong>FUNDIGSAC</strong> somos especialistas en v<strong>álvulas, tuberías y piezas de hierro dúctil</strong>. Fabricamos e importamos productos certificados, ideales para obras civiles, minería y proyectos industriales que exigen precisión, resistencia y calidad inmediata.</p>';
  const commonCatalogCopy: Array<[string, string]> = [
    ["Descubre nuestras válvulas de compuerta, mariposa, reductoras y más.", "Consulta válvulas de retención, compuerta, alivio y control de presión."],
    ["Alta resistencia y durabilidad para proyectos exigentes.", "Tubería de hierro dúctil: indica DN, clase y tipo de unión para cotizar."],
    ["Fabricadas en hierro dúctil. Alta carga, seguridad y precisión.", "Marcos y tapas de 600 mm en versiones ligera y pesada según la lista comercial."],
    ["Tuberías HD", "Tubería de hierro dúctil"],
    ["Marcos y Tapas HD", "Marcos y tapas de buzón"],
  ];
  if (route === "/" || route === "/shop/") {
    for (const [before, after] of commonCatalogCopy) html = html.replaceAll(before, after);
    html = html.replace(/(>\s*)Ver Tuberías(\s*<\/a>)/i, '$1Consultar tubería$2');
    html = html.replace(/(>\s*)Ver Catálogo(\s*<\/a>)/i, '$1Consultar marcos y tapas$2');
    html = html.replace(/(<a\b[^>]*href=")[^"]*("[^>]*>\s*Consultar tubería\s*<\/a>)/i, "$1/contactanos/$2");
    html = html.replace(/(<a\b[^>]*href=")[^"]*("[^>]*>\s*Consultar marcos y tapas\s*<\/a>)/i, "$1/contactanos/$2");
    html = html.replace(/(<a\b[^>]*href=")[^"]*("[^>]*>\s*Ver Productos\s*<\/a>)/i, "$1/product-category/valvulas-hierro-ductil/$2");
  }
  if (route === "/") {
    html = html.replace('Válvulas, tuberías marcos y tapas Hierro Dúctil', 'Válvulas, tuberías, marcos y tapas de hierro dúctil');
    html = html.replace('Ideales para sistemas de alta presión. Stock disponible, calidad garantizada y envíos a nivel nacional. <strong>Importadores directos.</strong>', 'Válvulas para control de flujo, tubería de hierro dúctil y conexiones HDPE. Comparte las medidas de tu proyecto para recibir una cotización precisa.');
    html = html.replace(oldBrandParagraph, '<p>El catálogo reúne válvulas de retención, compuerta, alivio y control de presión, además de tubería de hierro dúctil, marcos, tapas y conexiones HDPE. La selección de cada pieza depende del diámetro, la clase de presión y el tipo de unión.</p>');
    html = html.replace('Somos más que un proveedor: en FUNDIGSAC combinamos experiencia, calidad certificada y respuesta inmediata. Acompañamos tus proyectos con productos duraderos, soporte técnico y un compromiso total con tu satisfacción.', 'Para cotizar una válvula o accesorio, comparte la medida, la presión nominal, la conexión y la cantidad. Con esos datos podemos identificar la referencia y confirmar las condiciones vigentes.');
    html = html.replaceAll('Productos certificados y de alta calidad', 'Referencias organizadas por familia y medida');
    html = html.replaceAll('Fabricación a medida', 'Consulta de compatibilidad entre piezas');
    html = html.replaceAll('Stock permanente y entregas inmediatas', 'Precio y disponibilidad confirmados al cotizar');
    html = html.replaceAll('Asesoría técnica especializada', 'Información técnica según modelo');
    html = html.replaceAll('Compromiso, seriedad y respaldo postventa', 'Atención comercial para cada proyecto');
    html = html.replace('Grandes <span>OFERTAS</span>', 'Productos <span>destacados</span>');
    html = html.replace('Aprovecha ofertas por tiempo limitado en válvulas, tuberías y accesorios industriales.', 'Explora las válvulas publicadas en el catálogo y consulta la variante adecuada para tu instalación.');
    html = html.replace('Componentes industriales que superan tus expectativas', 'Piezas para redes hidráulicas y saneamiento');
    html = html.replace('Más de 15 años ofreciendo productos industriales certificados con asesoría técnica personalizada y entrega inmediata a nivel nacional.', 'Válvulas, tubería de hierro dúctil y conexiones HDPE para distintas configuraciones de red. Revisa medidas y uniones antes de elegir.');
    html = html.replace('Nuevas Llegadas en Piezas Industriales', 'Válvulas del catálogo');
    html = html.replace('Fabricación de piezas especiales a medida', 'Consulta por piezas especiales');
    html = html.replace('Diseñamos y producimos componentes personalizados según especificaciones técnicas o planos. Adaptamos nuestras soluciones a cada requerimiento industrial o de obra.', 'Si tu proyecto necesita una medida o configuración que no aparece aquí, envíanos la especificación o el plano para revisar opciones.');
    html = html.replace('Importadores directos con stock permanente', 'Disponibilidad según referencia');
    html = html.replace('Ofrecemos entrega inmediata de válvulas, tuberías y marcos de buzón en hierro dúctil. Optimizamos los tiempos de tus proyectos con inventario garantizado y soporte técnico continuo.', 'Confirma existencias, plazo y destino de entrega al solicitar una cotización. La disponibilidad depende del modelo y la medida.');
    html = html.replace('Importadores Directos de Marcas Reconocidas', 'Consulta marcas y modelos');
    html = html.replace('Despachos Diarios', 'Condiciones de despacho');
    html = html.replace('Hacemos envíos a nivel nacional e internacional.', 'Confirma destino, costo y fecha de entrega durante la cotización.');
    html = html.replace('Compra Segura', 'Opciones de pago');
    html = html.replace('Aceptamos todos los medios ed pago.', 'Consulta los medios de pago disponibles antes de confirmar tu pedido.');
    html = html.replace('Productos Certificados', 'Especificaciones por modelo');
    html = html.replace('Garantizamos la calidad de cada uno de nuestros productos', 'Solicita la ficha técnica para verificar materiales y normas del producto.');
    html = html.replace('Asesores Técnicos', 'Atención para tu proyecto');
    html = html.replace('Brindamos la asesoría permanente para optimizar recursos para tu proyecto', 'Comparte la referencia, medida y uso previsto para revisar compatibilidad.');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Válvulas de control</div>', '<div class="elementor-heading-title elementor-size-default">Productos en Stock</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Conexiones y bridas</div>', '<div class="elementor-heading-title elementor-size-default">Clientes Satisfechos</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Tubería de hierro dúctil</div>', '<div class="elementor-heading-title elementor-size-default">Proyectos Atendidos</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Marcos y tapas</div>', '<div class="elementor-heading-title elementor-size-default">Profesionales Especializados</div>');
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>FUNDIGSAC | Válvulas, tuberías y conexiones para redes hidráulicas</title>');
  }
  if (route === "/nosotros/") {
    html = html.replace(oldBrandParagraph, '<p>FUNDIGSAC trabaja con referencias para redes hidráulicas, saneamiento e infraestructura. Las listas comerciales incluyen válvulas, conexiones bridadas, tubería de hierro dúctil y accesorios HDPE. Al atender una consulta revisamos dimensiones, clase de presión y compatibilidad de la unión.</p>');
    html = html.replace('Fabricación de piezas especiales a medida', 'Piezas especiales según plano');
    html = html.replace('Diseñamos y producimos componentes personalizados según especificaciones técnicas o planos. Adaptamos nuestras soluciones a cada requerimiento industrial o de obra.', 'Comparte el plano y las medidas de la pieza requerida para evaluar su fabricación y condiciones de entrega.');
    html = html.replace('Importadores directos con stock permanente', 'Disponibilidad según referencia');
    html = html.replace('Ofrecemos entrega inmediata de válvulas, tuberías y marcos de buzón en hierro dúctil. Optimizamos los tiempos de tus proyectos con inventario garantizado y soporte técnico continuo.', 'Consulta la existencia de cada modelo y medida. El plazo de entrega se confirma junto con la cotización.');
    html = html.replace('Ser líderes en el sector industrial y minero a nivel nacional, reconocidos por nuestra innovación, compromiso y capacidad de respuesta a las necesidades del mercado.', 'Ser una referencia en componentes para redes e infraestructura, con información técnica clara y atención que responda a las necesidades de cada proyecto.');
    html = html.replace('Desde nuestros inicios nos guiamos por la integridad, responsabilidad y excelencia. Crecimos gracias al trabajo en equipo y la confianza de nuestros clientes.', 'La integridad y la responsabilidad orientan nuestro trabajo. Buscamos que cada consulta identifique la referencia correcta y sus condiciones comerciales.');
    html = html.replace('Brindar soluciones eficientes en productos industriales y saneamiento, garantizando calidad, disponibilidad inmediata y atención personalizada a cada cliente.', 'Suministrar componentes para redes e infraestructura con especificaciones por modelo, cotizaciones claras y disponibilidad confirmada.');
    html = html.replace('Fabricamos lo que otros no tienen', 'Consulta por piezas especiales');
    html = html.replace('Piezas especiales a medida, stock permanente y entrega rápida. ¡Haz tu pedido hoy mismo!', 'Envíanos el plano o las medidas para evaluar una pieza especial. Confirmaremos la fabricación, el precio y el plazo antes del pedido.');
    html = html.replace('Importadores Directos de Marcas Reconocidas', 'Consulta marcas y modelos');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Válvulas y conexiones</div>', '<div class="elementor-heading-title elementor-size-default">Brand Product</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Tubería de hierro dúctil</div>', '<div class="elementor-heading-title elementor-size-default">Customer Satisfaction</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Accesorios HDPE</div>', '<div class="elementor-heading-title elementor-size-default">Offline Store</div>');
    html = html.replace('<div class="elementor-heading-title elementor-size-default">Marcos y tapas</div>', '<div class="elementor-heading-title elementor-size-default">Professional Team</div>');
  }
  if (route === "/" || route === "/nosotros/") {
    const metricValues = new Map([["2500", "2,500"], ["96", "96"], ["120", "120"], ["75", "75"], ["12", "12"]]);
    html = html.replace(/<span class="elementor-counter-number"[^>]*data-to-value="(2500|96|120|75|12)"[^>]*>[^<]*<\/span>/g, (_counter, value: string) => '<span class="mirror-metric-value">' + metricValues.get(value) + '</span>');
    for (const [index, value] of [["01", "2,500"], ["02", "96"], ["03", "120"], ["04", "75"]]) {
      html = html.replaceAll('<span class="mirror-category-index">' + index + '</span>', '<span class="mirror-metric-value">' + value + '</span>');
    }
    html = html.replaceAll('<span class="mirror-static-count">12</span>', '<span class="mirror-metric-value">12</span>');
  }
  if (route === "/contactanos/") {
    html = html.replace('¡Ponerse en contacto es fácil!', 'Cotiza con los datos de tu proyecto');
    html = html.replace('Cotizaciones y asesoría técnica para proyectos de infraestructura y saneamiento en todo el Perú.', 'Indica el producto o código, DN o diámetro exterior, clase de presión, cantidad y ciudad de entrega. Así podremos revisar compatibilidad, precio y disponibilidad.');
    html = html.replace('Rellena nuestro formulario', 'Cuéntanos qué pieza necesitas');
    html = html.replace('Estamos listos para asesorarte. Déjanos tu mensaje y te responderemos en breve.', 'Incluye medidas y tipo de conexión. También puedes escribir a ventas@fundigsac.com o llamar al +51 908 849 664.');
  }
  if (route === "/shop/") {
    html = html.replace(/<title>Shop\s*[–-]/i, '<title>Productos –');
    const note = '<aside class="mirror-catalog-note"><h2>Otras familias para consultar</h2><p>Las listas comerciales también incluyen codos, tees, reducciones, tapones y bridas para conexiones HDPE, además de tubería de hierro dúctil y marcos y tapas. Estas familias aún no tienen fichas individuales en este catálogo.</p><a href="/contactanos/">Consultar una referencia</a></aside>';
    if (!html.includes('mirror-catalog-note')) html = html.replace(/(<div\b[^>]*class="[^"]*elementor-product-loop-item[^"]*"[^>]*>)/i, note + '$1');
  }
  const routeHeadings: Record<string, string> = {
    "/shop/": "Productos", "/nosotros/": "Nosotros", "/contactanos/": "Contáctanos",
    "/libro-de-reclamos/": "Libro de reclamaciones", "/product-category/valvulas-hierro-ductil/": "Válvulas de hierro dúctil",
  };
  if (routeHeadings[route]) {
    let movedTitle = "";
    html = html.replace(/(<header\b[^>]*>[\s\S]*?<\/header>)/i, (header) => header.replace(/<h1\b[^>]*class=["'][^"']*\bmirror-accessible-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i, (_tag, title: string) => {
      movedTitle = title.replace(/<[^>]+>/g, "").trim();
      return "";
    }));
    if (!/<h1\b/i.test(html)) {
      const title = movedTitle || routeHeadings[route];
      const heading = '<h1 class="mirror-accessible-title mirror-accessible-title--sr-only">' + title + "</h1>";
      const pageRoot = /<div\b(?=[^>]*\bclass=["'][^"']*\belementor(?:\s|["'])[^"']*["'])(?=[^>]*\bdata-elementor-type=["'](?:wp-page|product-archive|product-single)["'])[^>]*>/i;
      if (pageRoot.test(html)) html = html.replace(pageRoot, (openingTag) => openingTag + heading);
      else if (/<main\b/i.test(html)) html = html.replace(/<main\b[^>]*>/i, (openingTag) => openingTag + heading);
    }
  }
  const footerPaths = new Map([
    ["válvulas hierro dúctil", "/product-category/valvulas-hierro-ductil/"],
    ["marcos y tapas de buzón", "/contactanos/"], ["marcos y tapas hd", "/contactanos/"], ["tuberías hd", "/contactanos/"], ["tubería de hierro dúctil", "/contactanos/"],
    ["nosotros", "/nosotros/"], ["productos", "/shop/"], ["libro de reclamos", "/libro-de-reclamos/"],
    ["all products", "/shop/"], ["brands", "/contactanos/"], ["special offers", "/contactanos/"],
    ["cotizaciones", "/contactanos/"], ["accesorios hdpe", "/contactanos/"],
    ["about us", "/nosotros/"], ["contact", "/contactanos/"], ["contacto", "/contactanos/"],
  ]);
  html = html.replace(/(<footer\b[^>]*>[\s\S]*?<\/footer>)/gi, (footer) => {
    const linked = footer.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attributes: string, contents: string) => {
    const label = contents.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim().toLowerCase();
    const destination = footerPaths.get(label);
    if (!destination) return anchor;
    const cleanAttributes = attributes.replace(/\s+href\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/i, "");
    return '<a' + cleanAttributes + ' href="' + destination + '">' + contents + "</a>";
    });
    return linked
      .replaceAll('es una importadora líder de fundición, tuberías y conexiones para minería, agricultura, saneamiento e industria en Perú.', 'presenta válvulas, tuberías y conexiones para proyectos de agua, saneamiento e industria en Perú.')
      .replaceAll('Enlaces de interes', 'Enlaces de interés')
      .replaceAll('7 Days a week from 10 am to 6 pm', 'Horario de atención: consultar por teléfono')
      .replaceAll('All Products', 'Productos')
      .replaceAll('Brands', 'Cotizaciones')
      .replaceAll('Special Offers', 'Accesorios HDPE')
      .replaceAll('About Us', 'Nosotros')
      .replace(/\bContact\b/g, 'Contacto')
      .replaceAll('All Rights Reserved.', 'Todos los derechos reservados.');
  });
  html = html.replace(/<(input|select|textarea)\b([^>]*)>/gi, (tag, _name: string, attrs: string) => {
    if (/\baria-label\s*=|\baria-labelledby\s*=|\btype\s*=\s*["']hidden/i.test(attrs)) return tag;
    const placeholder = attrs.match(/\bplaceholder\s*=\s*(["'])(.*?)\1/i)?.[2];
    const id = attrs.match(/\bid\s*=\s*(["'])(.*?)\1/i)?.[2];
    const label = placeholder || (id && id !== "g-recaptcha-response" ? id.replace(/^form-field-/, "").replace(/[_-]+/g, " ") : "");
    return label ? "<" + _name + attrs + ' aria-label="' + label.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '">' : tag;
  });
  html = html.replace(/<form\b([^>]*)>/gi, (_tag, attrs: string) => {
    const safe = attrs.replace(/\s+(?:action|method|onsubmit|target|data-mirror-form)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
    return '<form' + safe + ' action="#" method="get" data-mirror-form="true">';
  });
  if (!html.includes("/fundigsac-fixes.css")) html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="/fundigsac-fixes.css">\n</head>');
  if (!html.includes("/fundigsac-fixes.js")) html = html.replace(/<\/body>/i, '  <script defer src="/fundigsac-fixes.js"></script>\n</body>');
  await writeFile(file, html, "utf8");
}
const assets = [...await filesWithExtension(mirror, ".css"), ...await filesWithExtension(mirror, ".js")];
for (const file of assets) {
  const content = localizeHost(await readFile(file, "utf8"));
  await writeFile(file, content, "utf8");
}
console.log("Patched " + files.length + " local HTML pages and " + assets.length + " CSS/JS assets; forms stay local and disabled.");
