// Auditoría de interfaz de todas las rutas en escritorio y móvil (claro y oscuro) con Playwright.
// Uso: node scripts/qa/ui-audit.mjs --base http://127.0.0.1:3300 [--out .perf/ui-audit] [--routes /,/contacto] [--shots]
// Revisa: desborde horizontal, elementos más anchos que la pantalla, imágenes rotas o sin alt, imágenes descargadas
// muy por encima de su tamaño en pantalla, errores de consola/CSP, peticiones fallidas, objetivos táctiles < 24 px
// (móvil), texto < 12 px, CLS y LCP. Con --shots guarda capturas completas en trozos de 1600 px (JPEG).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";
import sharp from "sharp";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const base = arg("base", "http://127.0.0.1:3300").replace(/\/$/, "");
const out = path.resolve(arg("out", ".perf/ui-audit"));
const shots = args.includes("--shots");
const themes = arg("themes", "light,dark").split(",");

export const ALL_ROUTES = [
  "/", "/industrias", "/industrias/agricultura", "/industrias/saneamiento", "/industrias/mineria",
  "/productos", "/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas",
  "/productos/valvulas/valvula-compuerta", "/productos/valvulas/valvula-compuerta-fundigsac",
  "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", "/productos/valvulas/valvula-mariposa",
  "/productos/tuberias/tuberia-tyton", "/productos/marcos-y-tapas/marco-tapa-d400",
  "/productos/valvulas/valvula-compuerta/visor-3d", "/soluciones", "/soluciones/redes-matrices", "/nosotros",
  "/recursos", "/recursos/detalle-tecnico", "/contacto", "/cotizar", "/cotizar/confirmacion", "/reclamaciones",
  "/terminos", "/terminos-b2b", "/privacidad", "/cookies", "/mapa-del-sitio", "/eliminar-cuenta", "/login",
  "/registro", "/recuperar", "/restablecer", "/carrito", "/buscar?q=valvula", "/ruta-inexistente",
];
const routes = arg("routes", "") ? arg("routes", "").split(",") : ALL_ROUTES;

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { ...devices["Pixel 7"], deviceScaleFactor: 1 },
};

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));
const slug = (route) => (route === "/" ? "inicio" : route.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "_"));

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const theme of themes) {
    const context = await browser.newContext({ ...vp, reducedMotion: "no-preference" });
    await context.addCookies([{ name: "fundigsac-consent", value: consent, url: base }]);
    await context.addInitScript((t) => {
      try { localStorage.setItem("fundigsac-theme", t); } catch {}
      window.__cls = 0;
      window.__lcp = 0;
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => { const e = list.getEntries().at(-1); if (e) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    }, theme);

    for (const route of routes) {
      const page = await context.newPage();
      const issues = { console: [], failed: [] };
      page.on("console", (m) => { if (["error", "warning"].includes(m.type())) issues.console.push(`${m.type()}: ${m.text().slice(0, 220)}`); });
      page.on("pageerror", (e) => issues.console.push(`pageerror: ${String(e).slice(0, 220)}`));
      page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/ruta-inexistente")) issues.failed.push(`${r.status()} ${r.url().replace(base, "")}`); });
      page.on("requestfailed", (r) => { const f = r.failure()?.errorText ?? ""; if (!/ERR_ABORTED/.test(f)) issues.failed.push(`FAIL ${f} ${r.url().replace(base, "").slice(0, 120)}`); });

      const t0 = Date.now();
      await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60_000 }).catch((e) => issues.console.push(`goto: ${e.message}`));
      const loadMs = Date.now() - t0;
      await page.waitForTimeout(600);
      const lcp = await page.evaluate(() => Math.round(window.__lcp));

      // Recorre la página para cargar imágenes diferidas y disparar animaciones de entrada.
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.7)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));
      });

      const metrics = await page.evaluate((isMobile) => {
        const vw = document.documentElement.clientWidth;
        const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05; };
        const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.classList.length ? `.${[...el.classList].slice(0, 2).join(".")}` : ""}`;
        const wide = [];
        for (const el of document.body.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== "fixed") {
            // Ignora hijos de contenedores con overflow oculto/scroll (carruseles).
            let p = el.parentElement, clipped = false;
            while (p && p !== document.body) { const o = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { clipped = true; break; } p = p.parentElement; }
            if (!clipped) wide.push(`${sel(el)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
          }
        }
        const imgs = [...document.images].filter(visible);
        const dpr = window.devicePixelRatio || 1;
        const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc.slice(-70));
        const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.currentSrc.slice(-70));
        const oversized = imgs
          .filter((i) => i.naturalWidth > 0 && i.getBoundingClientRect().width > 40 && i.naturalWidth > i.getBoundingClientRect().width * dpr * 2.2 && i.naturalWidth > 800)
          .map((i) => `${i.currentSrc.replace(location.origin, "").slice(-70)} (${i.naturalWidth}px → ${Math.round(i.getBoundingClientRect().width)}px)`);
        const smallTargets = isMobile
          ? [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button]")]
              .filter((el) => visible(el) && !el.closest("[aria-hidden=true], [inert]"))
              .filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 24 || r.height < 24) && getComputedStyle(el).display !== "inline"; })
              .map((el) => `${sel(el)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}"`)
          : [];
        const tinyText = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const n = walker.currentNode;
          if (!n.textContent.trim() || !n.parentElement || !visible(n.parentElement)) continue;
          const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
          if (fs < 12) tinyText.push(`${sel(n.parentElement)} ${fs}px "${n.textContent.trim().slice(0, 25)}"`);
        }
        const h1 = document.querySelectorAll("h1").length;
        return { overflow: document.documentElement.scrollWidth - vw, wide: [...new Set(wide)].slice(0, 8), broken, noAlt, oversized: [...new Set(oversized)], smallTargets: [...new Set(smallTargets)].slice(0, 15), tinyText: [...new Set(tinyText)].slice(0, 10), h1, cls: Number(window.__cls.toFixed(3)), height: document.documentElement.scrollHeight, title: document.title };
      }, vpName === "mobile");

      const entry = { route, viewport: vpName, theme, loadMs, lcp, ...metrics, console: [...new Set(issues.console)], failed: [...new Set(issues.failed)] };
      report.push(entry);
      const flags = [metrics.overflow > 1 && `overflow ${metrics.overflow}`, metrics.broken.length && `rotas ${metrics.broken.length}`, entry.console.length && `consola ${entry.console.length}`, entry.failed.length && `fallidas ${entry.failed.length}`, metrics.cls > 0.05 && `CLS ${metrics.cls}`].filter(Boolean);
      console.log(`${flags.length ? "✖" : "✔"} ${vpName}/${theme} ${route} ${flags.join(" · ")}`);

      if (shots) {
        const buf = await page.screenshot({ fullPage: true, type: "png", animations: "disabled" }).catch(() => null);
        if (buf) {
          const img = sharp(buf);
          const { width, height } = await img.metadata();
          const chunk = vpName === "mobile" ? 1500 : 1600;
          for (let y = 0, i = 0; y < height; y += chunk, i++) {
            await sharp(buf).extract({ left: 0, top: y, width, height: Math.min(chunk, height - y) }).jpeg({ quality: 70 }).toFile(path.join(out, `${slug(route)}-${vpName}-${theme}-${i}.jpg`));
          }
        }
      }
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(`\nReporte: ${path.join(out, "report.json")}`);
