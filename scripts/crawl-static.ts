import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALLOWED_HOSTS, ORIGIN, mirrorAssetPath, mirrorPagePath, normalizeUrl, safeStem, writeArtifact } from "./utils/crawl-shared";

// Some public pages reject headless browser navigations but accept ordinary GETs.
// Fetch only public HTML/assets; Playwright remains responsible for rendered capture/verification.
const root = process.cwd();
type Anchor = { href: string; text: string; rel: string };
type CrawlImage = { src: string; currentSrc: string; srcset: string; alt: string; complete: boolean; naturalWidth: number };
type PageRecord = {
  url: string; pathname: string; status: number | null; title: string; metaDescription: string; canonical: string; robots: string;
  headings: { h1: string[]; h2: string[]; h3: string[] }; mainText: string; internalAnchors: Anchor[]; externalAnchors: Anchor[];
  images: CrawlImage[]; buttons: { text: string; type: string }[];
  forms: { action: string; method: string; fields: { name: string; type: string; label: string }[] }[];
  jsonLd: string[]; openGraph: Record<string, string>; twitter: Record<string, string>; breadcrumbs: string[];
  pageType: string; htmlFile: string; error?: string; htmlLang?: string; platformIndicators?: string[];
};
type CrawlLink = { from: string; href: string; text: string; rel: string; internal: boolean };
type CrawlImageIndex = { url: string; alt: string[]; pages: string[]; status: number | null };
const maxPages = Math.min(250, Math.max(1, Number(process.env.CRAWL_MAX_PAGES ?? 100)));
const delayMs = Math.min(10_000, Math.max(1_000, Number(process.env.CRAWL_DELAY_MS ?? 1200)));
const queue = [ORIGIN + "/"];
const queued = new Set(queue);
const pages: PageRecord[] = [];
const links: CrawlLink[] = [];
const images = new Map<string, CrawlImageIndex>();
const errors: { url: string; status: number; contentType: string }[] = [];
const assetStatuses = new Map<string, number>();
const htmlDir = path.join(root, "legacy/html");
const mirrorDir = path.join(root, "legacy/mirror");
const assetsDir = path.join(root, "legacy/assets");
const headers = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36", accept: "text/html,application/xhtml+xml,image/avif,image/webp,*/*;q=0.8" };
const isPublicPage = (url: string) => {
  const parsed = new URL(url);
  return !/\.(?:xml|json|pdf|jpg|jpeg|png|gif|webp|svg|css|js|zip|woff2?|ttf|mp4)$/i.test(parsed.pathname)
    && !/\/(?:feed|comments\/feed|wp-json|wp-admin|wp-login\.php)(?:\/|$)/i.test(parsed.pathname);
};
const entity = (text: string) => text.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const textOnly = (text: string) => entity(text.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
const attr = (tag: string, name: string) => entity(tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "");
const localUrl = (raw: string, base: string) => {
  const value = entity(raw).trim();
  if (!value || value.startsWith("#") || /^(data:|blob:|javascript:|mailto:|tel:)/i.test(value)) return raw;
  try {
    const url = new URL(value, base);
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return raw;
    url.hash = "";
    return `http://localhost:4173${url.pathname}${url.search}`;
  } catch { return raw; }
};
const refs = (html: string, base: string) => {
  const found = new Set<string>();
  const add = (raw: string) => { const target = raw.trim().split(/\s+/)[0]; try { const url = new URL(entity(target), base); if (ALLOWED_HOSTS.has(url.hostname.toLowerCase()) && /^https?:$/.test(url.protocol)) { url.hash = ""; found.add(url.href); } } catch { /* non-URL attributes */ } };
  for (const tag of html.matchAll(/<(?:link|script|img|source|video|audio)\b[^>]*>/gi)) {
    for (const match of tag[0].matchAll(/\b(?:href|src|poster|data-src)\s*=\s*["']([^"']+)["']/gi)) add(match[1]);
    for (const match of tag[0].matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) for (const entry of match[1].split(/,\s*(?=(?:https?:|\/|\.\/|\.\.\/))/i)) add(entry);
  }
  const cssText = [
    ...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]),
    ...[...html.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/gi)].map(match => match[1]),
  ];
  for (const block of cssText) for (const match of block.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)) add(match[1]);
  return [...found];
};
const fetchAsset = async (input: string, depth = 0): Promise<void> => {
  const url = new URL(input);
  if (assetStatuses.has(url.href) || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return;
  if (existsSync(path.join(mirrorDir, mirrorAssetPath(url.href)))) { assetStatuses.set(url.href, 200); return; }
  assetStatuses.set(url.href, 0);
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(5_000) });
    assetStatuses.set(url.href, response.status);
    if (!response.ok) { errors.push({ url: url.href, status: response.status, contentType: "asset" }); return; }
    const type = response.headers.get("content-type") ?? "";
    if (!/^(text\/css|text\/javascript|application\/(javascript|x-javascript)|image\/|font\/|application\/(font|vnd\.ms-fontobject))/i.test(type)) return;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > 15 * 1024 * 1024) return;
    const isCss = /text\/css/i.test(type) || url.pathname.endsWith(".css");
    const body = isCss ? new TextDecoder().decode(bytes).replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi, (_all, quote, raw) => `url("${localUrl(raw, url.href)}")`).replace(/@import\s+(["'])([^"']+)\1/gi, (_all, _q, raw) => `@import "${localUrl(raw, url.href)}"`) : bytes;
    await writeArtifact(mirrorDir, mirrorAssetPath(url.href), body);
    if (/^image\//i.test(type)) await writeArtifact(assetsDir, path.join("images", ...url.pathname.split("/").filter(Boolean)), bytes);
    if (isCss && depth < 2) for (const ref of refs(new TextDecoder().decode(bytes), url.href)) await fetchAsset(ref, depth + 1);
  } catch (error) { errors.push({ url: url.href, status: 0, contentType: error instanceof Error ? error.message : String(error) }); }
};

await Promise.all([mkdir(htmlDir, { recursive: true }), mkdir(mirrorDir, { recursive: true }), mkdir(assetsDir, { recursive: true }), mkdir(path.join(root, "reports/crawl"), { recursive: true }), mkdir(path.join(root, "reports/network"), { recursive: true })]);
while (queue.length && pages.length < maxPages) {
  const target = queue.shift()!;
  const record: PageRecord = { url: target, pathname: new URL(target).pathname, status: null, title: "", metaDescription: "", canonical: "", robots: "", headings: { h1: [], h2: [], h3: [] }, mainText: "", internalAnchors: [], externalAnchors: [], images: [], buttons: [], forms: [], jsonLd: [], openGraph: {}, twitter: {}, breadcrumbs: [], pageType: "unknown", htmlFile: "", error: "" };
  try {
    const response = await fetch(target, { headers, signal: AbortSignal.timeout(20_000), redirect: "follow" });
    const html = await response.text();
    record.status = response.status;
    record.url = normalizeUrl(response.url) ?? target;
    record.pathname = new URL(record.url).pathname;
    record.title = textOnly(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    record.metaDescription = entity(html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i)?.[1] ?? html.match(/<meta\b(?=[^>]*\bcontent=["'][^"']*["'])[^>]*\bname=["']description["'][^>]*>/i)?.[0]?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? "");
    record.canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
    record.robots = html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*\bcontent=["']([^"']*)["']/i)?.[1] ?? "";
    record.htmlLang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? "";
    record.headings = { h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => textOnly(m[1])), h2: [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => textOnly(m[1])), h3: [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => textOnly(m[1])) };
    record.mainText = textOnly(html.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? html).slice(0, 50_000);
    record.jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    record.openGraph = Object.fromEntries([...html.matchAll(/<meta\b(?=[^>]*\bproperty=["'](og:[^"']+)["'])[^>]*\bcontent=["']([^"']*)["']/gi)].map(m => [m[1], entity(m[2])]));
    record.twitter = Object.fromEntries([...html.matchAll(/<meta\b(?=[^>]*\bname=["'](twitter:[^"']+)["'])[^>]*\bcontent=["']([^"']*)["']/gi)].map(m => [m[1], entity(m[2])]));
    const anchorTags = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: entity(m[1]), text: textOnly(m[2]), rel: "" }));
    record.internalAnchors = anchorTags.filter(a => normalizeUrl(a.href, record.url));
    record.externalAnchors = anchorTags.filter(a => !normalizeUrl(a.href, record.url));
    record.images = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => ({ src: attr(m[0], "src") || attr(m[0], "data-src"), currentSrc: "", srcset: attr(m[0], "srcset"), alt: attr(m[0], "alt"), complete: false, naturalWidth: 0 }));
    record.buttons = [...html.matchAll(/<(button|input)\b[^>]*>([\s\S]*?)<\/button>/gi)].map(m => ({ text: textOnly(m[2]), type: attr(m[0], "type") }));
    record.forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(m => ({ action: attr(m[0].slice(0, m[0].indexOf(">") + 1), "action"), method: attr(m[0].slice(0, m[0].indexOf(">") + 1), "method").toUpperCase() || "GET", fields: [...m[0].matchAll(/<(input|select|textarea)\b[^>]*>/gi)].map(f => ({ name: attr(f[0], "name"), type: attr(f[0], "type") || f[1].toLowerCase(), label: attr(f[0], "aria-label") || attr(f[0], "placeholder") })) }));
    record.breadcrumbs = [...html.matchAll(/(?:breadcrumb|breadcrumbs)[^>]*>([\s\S]*?)<\//gi)].map(m => textOnly(m[1])).filter(Boolean);
    record.platformIndicators = [html.match(/<meta\b[^>]*\bname=["']generator["'][^>]*\bcontent=["']([^"']+)/i)?.[1], /class=["'][^"']*elementor/.test(html) ? "DOM contiene Elementor" : "", /wp-content|wp-includes/.test(html) ? "Recursos WordPress detectados" : ""].filter((indicator): indicator is string => Boolean(indicator));
    record.pageType = record.pathname === "/" ? "home" : /\/product\//i.test(record.pathname) ? "product" : /product-category|\/category\//i.test(record.pathname) ? "category" : /\/shop\/?$/i.test(record.pathname) ? "shop" : /reclam|privacidad|legal|terminos/i.test(record.pathname) ? "legal" : "page";
    record.htmlFile = `${safeStem(record.url)}.html`;
    const mirrorHtml = html.replace(/<base\b[^>]*>/gi, "")
      .replace(/\b(href|src|poster|data-src|data-lazy-src|data-original)\s*=\s*(["'])(.*?)\2/gi, (_all, name, quote, value) => `${name}=${quote}${localUrl(value, record.url)}${quote}`)
      .replace(/\b(srcset|data-srcset|data-lazy-srcset)\s*=\s*(["'])(.*?)\2/gi, (_all, name, quote, value) => `${name}=${quote}${value.split(",").map((entry: string) => { const [u, ...rest] = entry.trim().split(/\s+/); return `${localUrl(u, record.url)} ${rest.join(" ")}`.trim(); }).join(", ")}${quote}`)
      .replace(/\bstyle\s*=\s*(["'])(.*?)\1/gi, (_all, quote: string, value: string) => `style=${quote}${value.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi, (_css: string, q: string, raw: string) => `url(${q}${localUrl(raw, record.url)}${q})`)}${quote}`)
      .replace(/<form\b([^>]*)>/gi, (_tag, attrs: string) => `<form${attrs.replace(/\s+(?:action|method|onsubmit|target)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")} action="#" method="get" data-mirror-form="true">`)
      .replace(/<\/head>/i, '  <link rel="stylesheet" href="/fundigsac-fixes.css">\n</head>')
      .replace(/<\/body>/i, '  <script defer src="/fundigsac-fixes.js"></script>\n</body>');
    await writeArtifact(htmlDir, record.htmlFile, html);
    const localPath = mirrorPagePath(record.url);
    if (!existsSync(path.join(mirrorDir, localPath))) await writeArtifact(mirrorDir, localPath, `<!doctype html>\n${mirrorHtml}`);
    const pageLinks = [...record.internalAnchors, ...record.externalAnchors];
    for (const a of pageLinks) links.push({ from: record.url, href: a.href, text: a.text, rel: a.rel, internal: Boolean(normalizeUrl(a.href, record.url)) });
    for (const a of record.internalAnchors) { const next = normalizeUrl(a.href, record.url); if (next && isPublicPage(next) && !queued.has(next) && !pages.some(p => p.url === next) && queue.length + pages.length < maxPages * 3) { queued.add(next); queue.push(next); } }
    for (const image of record.images) {
      const src = normalizeUrl(image.src, record.url); if (!src) continue;
      const item = images.get(src) ?? { url: src, alt: [], pages: [], status: null };
      if (image.alt && !item.alt.includes(image.alt)) item.alt.push(image.alt); if (!item.pages.includes(record.url)) item.pages.push(record.url); images.set(src, item);
    }
    const assetQueue = refs(html, record.url);
    for (let i = 0; i < assetQueue.length; i += 4) await Promise.all(assetQueue.slice(i, i + 4).map(ref => fetchAsset(ref)));
    if (record.status >= 400) errors.push({ url: record.url, status: record.status, contentType: "page" });
  } catch (error) {
    record.error = error instanceof Error ? error.message : String(error);
    errors.push({ url: record.url, status: 0, contentType: record.error });
  }
  pages.push(record);
  console.log(`[${pages.length}/${maxPages}] ${record.status ?? "ERR"} ${record.url}`);
  if (queue.length && pages.length < maxPages) await new Promise(resolve => setTimeout(resolve, delayMs));
}
const imagesList = [...images.values()];
for (const item of imagesList) item.status = assetStatuses.get(item.url) ?? null;
const linkResults = links.map(link => ({ ...link, targetStatus: pages.find(p => p.url === normalizeUrl(link.href, link.from))?.status ?? null }));
await Promise.all([
  writeFile(path.join(root, "reports/crawl/pages.json"), JSON.stringify({ generatedAt: new Date().toISOString(), startUrl: ORIGIN + "/", maxPages, delayMs, pages }, null, 2), "utf8"),
  writeFile(path.join(root, "reports/crawl/urls.csv"), ["url,pathname,status,page_type,title", ...pages.map(p => [p.url, p.pathname, p.status, p.pageType, p.title].map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))].join("\n"), "utf8"),
  writeFile(path.join(root, "reports/crawl/images.json"), JSON.stringify({ count: imagesList.length, images: imagesList }, null, 2), "utf8"),
  writeFile(path.join(root, "reports/crawl/links.json"), JSON.stringify({ count: linkResults.length, links: linkResults }, null, 2), "utf8"),
  writeFile(path.join(root, "reports/network/crawl-errors.json"), JSON.stringify({ count: errors.length, errors, sameOriginAssetsSaved: [...assetStatuses.values()].filter(s => s >= 200 && s < 400).length }, null, 2), "utf8"),
]);
console.log(`Crawl complete: ${pages.length} pages, ${imagesList.length} images, ${linkResults.length} links, ${assetStatuses.size} assets; ${errors.length} errors.`);
