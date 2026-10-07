import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Response } from "@playwright/test";
import { ALLOWED_HOSTS, ORIGIN, mirrorAssetPath, mirrorPagePath, normalizeUrl, safeStem, writeArtifact } from "./utils/crawl-shared";

type PageRecord = {
  url: string; pathname: string; status: number | null; title: string; metaDescription: string;
  canonical: string; robots: string; headings: { h1: string[]; h2: string[]; h3: string[] };
  mainText: string; internalAnchors: { href: string; text: string; rel: string }[];
  externalAnchors: { href: string; text: string; rel: string }[];
  images: { src: string; currentSrc: string; srcset: string; alt: string; complete: boolean; naturalWidth: number }[];
  buttons: { text: string; type: string }[]; forms: { action: string; method: string; fields: { name: string; type: string; label: string }[] }[];
  jsonLd: string[]; openGraph: Record<string, string>; twitter: Record<string, string>;
  breadcrumbs: string[]; pageType: string; htmlFile: string; htmlLang?: string; platformIndicators?: string[]; error?: string;
};

const root = process.cwd();
const crawlDir = path.join(root, "reports", "crawl");
const mirrorDir = path.join(root, "legacy", "mirror");
const htmlDir = path.join(root, "legacy", "html");
const assetsDir = path.join(root, "legacy", "assets");
const maxPages = Math.min(250, Math.max(1, Number(process.env.CRAWL_MAX_PAGES ?? 100)));
const delayMs = Math.min(10_000, Math.max(500, Number(process.env.CRAWL_DELAY_MS ?? 1200)));
const queue = [ORIGIN + "/"];
const queued = new Set(queue);
const pages: PageRecord[] = [];
const discoveredImages = new Map<string, { url: string; alt: Set<string>; pages: Set<string>; status: number | null }>();
const allLinks: { from: string; href: string; text: string; rel: string; internal: boolean }[] = [];
const networkErrors: { url: string; status: number; contentType: string }[] = [];
const savedAssets = new Set<string>();

function guessType(url: string, text: string): string {
  const p = new URL(url).pathname.toLowerCase();
  if (p === "/" || p === "") return "home";
  if (/\/product\/|\/producto\//.test(p)) return "product";
  if (/\"@type\"\s*:\s*\"product\"/i.test(text)) return "product";
  if (/\/product-category\//.test(p)) return "category";
  if (/\/shop\/?$/.test(p)) return "shop";
  if (/\/category\//.test(p)) return "category";
  if (/\/\d{4}\/\d{2}\//.test(p)) return "post";
  if (/privacidad|legal|terminos|cookies|reclam/.test(p)) return "legal";
  if (/woocommerce|product-category/i.test(text)) return "category";
  return "page";
}
function mimeIsAsset(type: string): boolean {
  return /^(text\/css|text\/javascript|application\/(javascript|x-javascript|font-woff|font-woff2)|image\/|font\/|application\/font|application\/vnd\.ms-fontobject)/i.test(type);
}

await mkdir(crawlDir, { recursive: true });
await mkdir(htmlDir, { recursive: true });
await mkdir(mirrorDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: false, serviceWorkers: "block" });
await context.addInitScript("globalThis.__name ??= (fn) => fn;");
await context.route("**/*", async (route) => {
  const req = route.request();
  const u = new URL(req.url());
  if (req.method() !== "GET" && req.method() !== "HEAD") return route.abort("blockedbyclient");
  if (ALLOWED_HOSTS.has(u.hostname.toLowerCase()) && (/\/(wp-admin|wp-login\.php)(\/|$)/i.test(u.pathname) || u.pathname.includes("admin-ajax.php") || ["add-to-cart", "remove_item", "undo_item", "wc-ajax", "logout"].some((key) => u.searchParams.has(key)))) return route.abort("blockedbyclient");
  await route.continue();
});

try {
  const page = await context.newPage();
  const currentResponses: Response[] = [];
  page.on("response", (response) => currentResponses.push(response));
  page.on("requestfailed", (request) => networkErrors.push({ url: request.url(), status: 0, contentType: request.failure()?.errorText ?? "request-failed" }));

  while (queue.length && pages.length < maxPages) {
    const target = queue.shift()!;
    currentResponses.length = 0;
    let observedStatus: number | null = null;
    let record: PageRecord;
    try {
      const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20_000 });
      observedStatus = response?.status() ?? null;
      await page.waitForLoadState("networkidle", { timeout: 1_000 }).catch(() => undefined);
      const data = await page.evaluate(() => {
        const clean = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();
        const meta = (selector: string) => clean(document.querySelector<HTMLMetaElement>(selector)?.content);
        const anchors = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((a) => ({
          href: a.href, text: clean(a.innerText || a.getAttribute("aria-label")), rel: clean(a.rel),
        }));
        const forms = [...document.forms].map((form) => ({
          action: form.action, method: (form.method || "get").toUpperCase(),
          fields: [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea")].map((field) => ({
            name: field.name, type: field instanceof HTMLInputElement ? field.type : field.tagName.toLowerCase(),
            label: clean(field.labels?.[0]?.innerText || field.getAttribute("aria-label") || (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.placeholder : "")),
          })),
        }));
        const metas = (prefix: string) => Object.fromEntries([...document.querySelectorAll<HTMLMetaElement>(`meta[${prefix}]`)].map((el) => [el.getAttribute(prefix) ?? "", clean(el.content)]));
        return {
          title: clean(document.title), metaDescription: meta('meta[name="description"]'),
          htmlLang: document.documentElement.lang,
          platformIndicators: [
            document.querySelector('meta[name="generator"]')?.getAttribute("content") ?? "",
            document.querySelector(".elementor") ? "DOM contiene .elementor" : "",
            document.querySelector(".woocommerce, body.woocommerce") ? "DOM contiene clases WooCommerce" : "",
            [...document.scripts].some((script) => /wp-content|wp-includes/.test(script.src)) ? "Scripts servidos desde wp-content/wp-includes" : "",
          ].filter(Boolean),
          canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? "",
          robots: meta('meta[name="robots"]'),
          headings: { h1: [...document.querySelectorAll("h1")].map((e) => clean(e.textContent)), h2: [...document.querySelectorAll("h2")].map((e) => clean(e.textContent)), h3: [...document.querySelectorAll("h3")].map((e) => clean(e.textContent)) },
          mainText: clean((document.querySelector("main") ?? document.querySelector("article") ?? document.body)?.innerText).slice(0, 50_000),
          anchors, images: [...document.images].map((img) => ({ src: img.getAttribute("src") ?? "", currentSrc: img.currentSrc, srcset: img.getAttribute("srcset") ?? "", alt: img.alt, complete: img.complete, naturalWidth: img.naturalWidth })),
          buttons: [...document.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input[type=button],input[type=submit]")].map((b) => ({ text: clean(b.innerText || (b instanceof HTMLInputElement ? b.value : "")), type: b instanceof HTMLInputElement ? b.type : b.type })),
          forms, jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
          openGraph: metas("property"), twitter: metas("name"),
          breadcrumbs: [...document.querySelectorAll('[aria-label*="breadcrumb" i],.breadcrumb,.breadcrumbs,[itemtype*="BreadcrumbList"]')].map((e) => clean(e.textContent)).filter(Boolean),
        };
      });
      const finalUrl = normalizeUrl(page.url()) ?? target;
      const internalAnchors = data.anchors.filter((a) => normalizeUrl(a.href, finalUrl));
      const externalAnchors = data.anchors.filter((a) => !normalizeUrl(a.href, finalUrl));
      record = {
        url: finalUrl, pathname: new URL(finalUrl).pathname, status: response?.status() ?? null,
        title: data.title, metaDescription: data.metaDescription, canonical: data.canonical, robots: data.robots, htmlLang: data.htmlLang, platformIndicators: data.platformIndicators,
        headings: data.headings, mainText: data.mainText, internalAnchors, externalAnchors,
        images: data.images, buttons: data.buttons, forms: data.forms, jsonLd: data.jsonLd,
        openGraph: data.openGraph, twitter: data.twitter, breadcrumbs: data.breadcrumbs,
        pageType: guessType(finalUrl, `${data.mainText} ${data.jsonLd.join(" ")}`), htmlFile: `${safeStem(finalUrl)}.html`,
      };

      const rawHtml = await page.content();
      await writeArtifact(htmlDir, record.htmlFile, rawHtml);
      const mirrorHtml = await page.evaluate((sourceUrl) => {
        const base = sourceUrl;
        const local = (raw: string) => {
          try {
            const u = new URL(raw, base);
            if (!["fundigsac.com", "www.fundigsac.com"].includes(u.hostname.toLowerCase())) return raw;
            if (/\/(wp-admin|wp-login\.php)(\/|$)/i.test(u.pathname)) return raw;
            u.hostname = "localhost"; u.protocol = "http:"; u.port = "4173";
            u.hash = "";
            return `${u.pathname}${u.search}`;
          } catch { return raw; }
        };
        for (const el of document.querySelectorAll<HTMLAnchorElement>('a[href]')) el.href = local(el.href);
        for (const el of document.querySelectorAll<HTMLImageElement>('img[src]')) el.src = local(el.getAttribute("src") ?? "");
        for (const el of document.querySelectorAll<HTMLSourceElement>('source[src],source[srcset]')) {
          if (el.hasAttribute("src")) el.src = local(el.getAttribute("src") ?? "");
          if (el.hasAttribute("srcset")) el.srcset = el.srcset.split(",").map((entry) => { const [src, ...rest] = entry.trim().split(/\s+/); return `${local(src)} ${rest.join(" ")}`.trim(); }).join(", ");
        }
        for (const el of document.querySelectorAll<HTMLLinkElement>('link[href]')) el.href = local(el.href);
        for (const el of document.querySelectorAll<HTMLScriptElement>('script[src]')) el.src = local(el.src);
        for (const el of document.querySelectorAll<HTMLVideoElement>('video[poster]')) el.poster = local(el.poster);
        for (const form of document.forms) {
          form.setAttribute("action", "#"); form.setAttribute("method", "get");
          form.addEventListener("submit", (event) => event.preventDefault());
        }
        return `<!doctype html>\n${document.documentElement.outerHTML}`;
      }, finalUrl);
      await writeArtifact(mirrorDir, mirrorPagePath(finalUrl), mirrorHtml);

      for (const a of [...internalAnchors, ...externalAnchors]) allLinks.push({ from: finalUrl, href: a.href, text: a.text, rel: a.rel, internal: !!normalizeUrl(a.href, finalUrl) });
      for (const image of data.images) {
        const imageUrl = normalizeUrl(image.currentSrc || image.src, finalUrl) ?? (image.currentSrc || image.src);
        if (!imageUrl) continue;
        const item = discoveredImages.get(imageUrl) ?? { url: imageUrl, alt: new Set<string>(), pages: new Set<string>(), status: image.complete && image.naturalWidth ? 200 : image.complete ? 404 : null };
        if (image.alt) item.alt.add(image.alt);
        item.pages.add(finalUrl);
        discoveredImages.set(imageUrl, item);
      }

      for (const anchor of internalAnchors) {
        const next = normalizeUrl(anchor.href, finalUrl);
        if (next && !queued.has(next) && !pages.some((p) => p.url === next) && queue.length + pages.length < maxPages * 3) {
          queued.add(next); queue.push(next);
        }
      }
      pages.push(record);
      console.log(`[${pages.length}/${maxPages}] ${record.status ?? "?"} ${record.url}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      record = { url: target, pathname: new URL(target).pathname, status: observedStatus, title: "", metaDescription: "", canonical: "", robots: "", headings: { h1: [], h2: [], h3: [] }, mainText: "", internalAnchors: [], externalAnchors: [], images: [], buttons: [], forms: [], jsonLd: [], openGraph: {}, twitter: {}, breadcrumbs: [], pageType: "unknown", htmlFile: "", error: message };
      pages.push(record);
      networkErrors.push({ url: target, status: 0, contentType: message });
      console.warn(`Failed ${target}: ${message}`);
    }

    const responseJobs = currentResponses.map(async (response) => {
      try {
        const url = new URL(response.url());
        if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase()) || ![200, 203, 206].includes(response.status())) return;
        const type = response.headers()["content-type"] ?? "";
        if (!mimeIsAsset(type) || savedAssets.has(url.href)) return;
        const body = await Promise.race([
          response.body(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Asset response exceeded 4 seconds")), 4_000)),
        ]);
        if (body.byteLength > 15 * 1024 * 1024) return;
        const rel = mirrorAssetPath(url.href);
        await writeArtifact(mirrorDir, rel, body);
        const assetRel = path.join("images", ...url.pathname.split("/").filter(Boolean));
        if (/^image\//i.test(type)) await writeArtifact(assetsDir, assetRel, body);
        savedAssets.add(url.href);
      } catch { /* Some streamed or cross-origin resources cannot be saved from the browser response. */ }
    });
    await Promise.allSettled(responseJobs);
    if (queue.length && pages.length < maxPages) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const images = [...discoveredImages.values()].map((item) => ({ url: item.url, alt: [...item.alt], pages: [...item.pages], status: item.status }));
  const links = allLinks.map((link) => ({ ...link, targetStatus: pages.find((p) => p.url === normalizeUrl(link.href, link.from))?.status ?? null }));
  await writeFile(path.join(crawlDir, "pages.json"), JSON.stringify({ generatedAt: new Date().toISOString(), startUrl: ORIGIN + "/", maxPages, delayMs, pages }, null, 2), "utf8");
  await writeFile(path.join(crawlDir, "urls.csv"), ["url,pathname,status,page_type,title", ...pages.map((p) => [p.url, p.pathname, p.status, p.pageType, p.title].map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))].join("\n"), "utf8");
  await writeFile(path.join(crawlDir, "images.json"), JSON.stringify({ count: images.length, images }, null, 2), "utf8");
  await writeFile(path.join(crawlDir, "links.json"), JSON.stringify({ count: links.length, links }, null, 2), "utf8");
  await writeFile(path.join(root, "reports", "network", "crawl-errors.json"), JSON.stringify({ count: networkErrors.length, errors: networkErrors, sameOriginAssetsSaved: savedAssets.size }, null, 2), "utf8");
  console.log(`Crawl complete: ${pages.length} pages, ${images.length} images, ${links.length} links, ${savedAssets.size} local resources.`);
  if (queue.length) console.warn(`Page limit reached with ${queue.length} queued URLs.`);
} finally {
  await context.close();
  await browser.close();
}
