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
    ["marcos y tapas de buzón", "/shop/"], ["marcos y tapas hd", "/shop/"], ["tuberías hd", "/shop/"],
    ["nosotros", "/nosotros/"], ["productos", "/shop/"], ["libro de reclamos", "/libro-de-reclamos/"],
    ["all products", "/shop/"], ["brands", "/shop/"], ["special offers", "/shop/"],
    ["about us", "/nosotros/"], ["contact", "/contactanos/"],
  ]);
  html = html.replace(/(<footer\b[^>]*>[\s\S]*?<\/footer>)/gi, (footer) => footer.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attributes: string, contents: string) => {
    const label = contents.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim().toLowerCase();
    const destination = footerPaths.get(label);
    if (!destination) return anchor;
    const cleanAttributes = attributes.replace(/\s+href\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/i, "");
    return '<a' + cleanAttributes + ' href="' + destination + '">' + contents + "</a>";
  }));
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
