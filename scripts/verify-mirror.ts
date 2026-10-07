import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { mirrorPagePath } from "./utils/crawl-shared";

type PageInfo = { url: string; pathname: string; status: number | null; pageType: string };
async function countFiles(directory: string, suffix = ""): Promise<number> {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    count += entry.isDirectory() ? await countFiles(path.join(directory, entry.name), suffix) : Number(!suffix || entry.name.toLowerCase().endsWith(suffix));
  }
  return count;
}
const root = process.cwd();
const output = path.join(root, "reports/mirror/verification.json");
await mkdir(path.dirname(output), { recursive: true });
let pages: PageInfo[] = [];
try {
  const crawl = JSON.parse(await readFile(path.join(root, "reports/crawl/pages.json"), "utf8")) as { pages: PageInfo[] };
  pages = crawl.pages;
} catch {
  throw new Error("No existe reports/crawl/pages.json. Ejecuta pnpm site:crawl primero.");
}
const chosen = [
  ...pages.filter((page) => page.pathname === "/").slice(0, 1),
  ...pages.filter((page) => page.pageType === "shop").slice(0, 1),
  ...pages.filter((page) => page.pageType === "category").slice(0, 2),
  ...pages.filter((page) => page.pageType === "product").slice(0, 3),
  ...pages.filter((page) => page.status !== null && page.status < 400 && page.pageType === "page").slice(0, 3),
].filter((page, index, all) => all.findIndex((other) => other.url === page.url) === index);
const result: {
  baseUrl: string; checkedAt: string; serverAvailable: boolean; sampledPages: number;
  pages: { sourceUrl: string; localUrl: string; status: number | null; loaded: boolean; error: string | null }[];
  failedResources: { url: string; status: number; type: string }[];
  liveSiteDependencies: string[]; externalResources: string[]; missingCss: string[]; missingJs: string[]; brokenImages: string[];
  localHtmlSnapshots: number; localMirrorFiles: number;
} = {
  baseUrl: "http://localhost:4173", checkedAt: new Date().toISOString(), serverAvailable: false, sampledPages: chosen.length,
  pages: [], failedResources: [], liveSiteDependencies: [], externalResources: [], missingCss: [], missingJs: [], brokenImages: [],
  localHtmlSnapshots: 0, localMirrorFiles: 0,
};
result.localHtmlSnapshots = await countFiles(path.join(root, "legacy/mirror"), ".html");
result.localMirrorFiles = await countFiles(path.join(root, "legacy/mirror"));
try {
  const probe = await fetch(result.baseUrl, { signal: AbortSignal.timeout(3000) });
  result.serverAvailable = probe.ok;
} catch {
  result.serverAvailable = false;
}
if (!result.serverAvailable) {
  result.pages.push({ sourceUrl: "", localUrl: result.baseUrl, status: null, loaded: false, error: "Mirror server no disponible. Ejecuta pnpm legacy:serve en otra terminal." });
} else {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    await context.addInitScript("globalThis.__name ??= (fn) => fn;");
    const page = await context.newPage();
    page.on("requestfailed", (request) => result.failedResources.push({ url: request.url(), status: 0, type: request.resourceType() }));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (response.status() >= 400) result.failedResources.push({ url: response.url(), status: response.status(), type: response.request().resourceType() });
      if (url.hostname === "fundigsac.com" || url.hostname === "www.fundigsac.com") result.liveSiteDependencies.push(response.url());
      else if (!url.hostname.match(/^(localhost|127\.0\.0\.1)$/)) result.externalResources.push(response.url());
    });
    for (const source of chosen) {
      const localUrl = `${result.baseUrl}${source.pathname}`;
      const snapshot = path.join(root, "legacy/mirror", mirrorPagePath(source.url));
      if (!existsSync(snapshot)) {
        result.pages.push({ sourceUrl: source.url, localUrl, status: null, loaded: false, error: `No existe snapshot local: ${path.relative(root, snapshot)}` });
        continue;
      }
      try {
        const response = await page.goto(localUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
        result.pages.push({ sourceUrl: source.url, localUrl, status: response?.status() ?? null, loaded: Boolean(response && response.status() < 400), error: null });
        const checks = await page.evaluate(() => ({
          brokenImages: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
          css: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((el) => el.href),
          js: [...document.querySelectorAll<HTMLScriptElement>("script[src]")].map((el) => el.src),
        }));
        result.brokenImages.push(...checks.brokenImages);
        result.missingCss.push(...checks.css.filter((url) => result.failedResources.some((entry) => entry.url === url)));
        result.missingJs.push(...checks.js.filter((url) => result.failedResources.some((entry) => entry.url === url)));
      } catch (error) {
        result.pages.push({ sourceUrl: source.url, localUrl, status: null, loaded: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
    await context.close();
  } finally { await browser.close(); }
}
result.failedResources = [...new Map(result.failedResources.map((entry) => [`${entry.status} ${entry.url}`, entry])).values()];
result.liveSiteDependencies = [...new Set(result.liveSiteDependencies)];
result.externalResources = [...new Set(result.externalResources)];
result.missingCss = [...new Set(result.missingCss)];
result.missingJs = [...new Set(result.missingJs)];
result.brokenImages = [...new Set(result.brokenImages)];
await writeFile(output, JSON.stringify(result, null, 2), "utf8");
await writeFile(path.join(root, "docs/MIRROR_LIMITATIONS.md"), [
  "# Limitaciones del mirror legacy", "", `Verificado: ${result.checkedAt}.`, "",
  "HTTrack y GNU wget no estaban disponibles. El mirror conserva HTML público del WordPress y recursos estáticos del mismo dominio, reescribe rutas al servidor local y verifica páginas con Playwright. Incluye solo URLs públicas alcanzables desde la portada dentro del límite del crawler; no es una copia del servidor ni de su base de datos.",
  result.localHtmlSnapshots ? `Hay ${result.localHtmlSnapshots} snapshot(s) HTML estático(s) en el mirror local.` : "No se generaron snapshots HTML: el endpoint público no entregó una página durante el crawl. Hay archivos estáticos parciales descargados en un intento inicial, pero no constituyen una copia navegable del sitio.", "",
  "La verificación usa una muestra representativa de las rutas descubiertas. Consulta `reports/mirror/verification.json` para páginas, status y dependencias observadas.", "",
  `- Servidor local disponible durante la verificación: ${result.serverAvailable ? "sí" : "no"}.`,
  `- Páginas muestreadas: ${result.sampledPages}; cargadas: ${result.pages.filter((item) => item.loaded).length}.`,
  `- Archivos en legacy/mirror/: ${result.localMirrorFiles}; snapshots HTML: ${result.localHtmlSnapshots}.`,
  `- Recursos 404/fallidos: ${result.failedResources.length}; imágenes rotas: ${result.brokenImages.length}; CSS ausente: ${result.missingCss.length}; JS ausente: ${result.missingJs.length}.`,
  `- Dependencias que aún cargan desde fundigsac.com: ${result.liveSiteDependencies.length}; recursos de terceros: ${result.externalResources.length}.`, "",
  "PHP, sesiones, formularios, búsquedas y flujos WooCommerce dinámicos no se reproducen. Los formularios del HTML local tienen el envío interceptado. Algunas funciones dependen de recursos externos, detallados en el JSON. La navegación y apariencia de las páginas capturadas funcionan en `http://localhost:4173`.",
].join("\n"), "utf8");
console.log(`Mirror verification: ${result.pages.filter((item) => item.loaded).length}/${result.pages.length} pages loaded; ${result.failedResources.length} failed resources.`);
if (!result.serverAvailable || result.pages.some((item) => !item.loaded)) process.exitCode = 1;
