// Auditoría del movimiento de todas las rutas con Playwright, en varios anchos y con/sin "reducir movimiento".
// Uso: node scripts/qa/motion-audit.mjs --base http://127.0.0.1:3301 [--routes /,/contacto] [--widths 390,1440]
//        [--out .perf/motion] [--shots] [--reduced] [--height 390]
// Por ruta y ancho revisa:
//  · entrada: cuántas animaciones corren en el primer segundo (document.getAnimations) y cuántos elementos
//    usan el sistema de movimiento ([data-reveal], [data-enter], [data-results]);
//  · contenido atascado: tras recorrer la página entera, elementos visibles del contenido con opacidad < 0,1
//    (un revelado que nunca terminó);
//  · desborde horizontal y elementos que salen de la pantalla (fuera de carruseles con overflow);
//  · errores de consola y excepciones;
//  · con --reduced: animaciones de desplazamiento/escala que sigan corriendo (deberían ser 0).
// Con --shots guarda la primera pantalla (JPEG) de cada ruta y ancho.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const base = arg("base", "http://127.0.0.1:3301").replace(/\/$/, "");
const out = path.resolve(arg("out", ".perf/motion"));
const shots = args.includes("--shots");
const reduced = args.includes("--reduced");

const ALL_ROUTES = [
  "/", "/industrias", "/industrias/agricultura", "/industrias/saneamiento", "/industrias/mineria",
  "/productos", "/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas",
  "/productos/valvulas/valvula-compuerta", "/productos/valvulas/valvula-compuerta-fundigsac",
  "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", "/productos/valvulas/valvula-mariposa",
  "/productos/tuberias/tuberia-tyton", "/productos/marcos-y-tapas/marco-tapa-d400", "/nosotros",
  "/contacto", "/cotizar", "/cotizar/confirmacion", "/reclamaciones", "/terminos", "/privacidad", "/cookies",
  "/mapa-del-sitio", "/eliminar-cuenta", "/login", "/registro", "/recuperar", "/restablecer", "/carrito", "/ruta-inexistente",
];
const routes = arg("routes", "") ? arg("routes", "").split(",") : ALL_ROUTES;
const widths = arg("widths", "320,360,375,390,430,768,1024,1280,1440,1920,2560").split(",").map(Number);
// --height fija el alto para todos los anchos (horizontal en móvil, laptops bajas); si no, uno típico por ancho.
const fixedHeight = Number(arg("height", "0"));
const heightFor = (w) => fixedHeight || (w < 768 ? 800 : w < 1280 ? 1024 : w >= 2560 ? 1440 : 900);

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));
const slug = (route) => (route === "/" ? "inicio" : route.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "_"));

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const width of widths) {
  const mobile = width < 768 || (fixedHeight > 0 && fixedHeight < 500);
  const context = await browser.newContext({
    viewport: { width, height: heightFor(width) },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await context.addCookies([{ name: "fundigsac-consent", value: consent, url: base }]);

  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));

    await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90_000 }).catch((e) => errors.push(`goto: ${e.message}`));
    // Animaciones de entrada vivas en el primer segundo (las infinitas del fondo cuentan aparte).
    await page.waitForTimeout(250);
    const entry = await page.evaluate(() => {
      const all = document.getAnimations();
      const infinite = all.filter((a) => a.effect?.getTiming().iterations === Infinity).length;
      return { running: all.length - infinite, infinite, motionNodes: document.querySelectorAll("[data-reveal], [data-enter], [data-results]").length };
    });
    if (shots) {
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(out, `${slug(route)}-${width}${reduced ? "-rm" : ""}.jpg`), type: "jpeg", quality: 70 }).catch(() => {});
    }

    // Recorre la página como una persona (sin saltos) para disparar los revelados.
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const step = Math.round(innerHeight * 0.6);
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      await new Promise((r) => setTimeout(r, 1100));
    });

    const result = await page.evaluate((isReduced) => {
      const vw = document.documentElement.clientWidth;
      const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.classList.length ? `.${[...el.classList].slice(0, 2).join(".")}` : ""}`;
      const root = document.getElementById("contenido") ?? document.body;
      const stuck = [];
      for (const el of root.querySelectorAll("*")) {
        const s = getComputedStyle(el);
        if (Number(s.opacity) >= 0.1 || s.display === "none" || s.visibility === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 12) continue;
        // Capas decorativas, diálogos cerrados, carruseles inactivos y menús: su opacidad 0 es intencional.
        if (el.closest("[aria-hidden=true], [inert], [hidden], dialog:not([open]), [role=dialog], [aria-roledescription]")) continue;
        // Controles nativos transparentes sobre un diseño propio y flechas que aparecen al pasar el puntero o al enfocar.
        if (el.matches("select, input, textarea, button")) continue;
        if (!el.textContent?.trim() && !el.querySelector("img, svg, video, canvas")) continue;
        stuck.push(sel(el));
      }
      const wide = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (!r.width || (r.right <= vw + 1 && r.left >= -1) || getComputedStyle(el).position === "fixed") continue;
        // Campos trampa anti-spam y capas ocultas a propósito fuera de pantalla.
        if (el.closest("[aria-hidden=true]")) continue;
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) { if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) { clipped = true; break; } p = p.parentElement; }
        if (!clipped) wide.push(`${sel(el)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
      }
      // Con movimiento reducido no debe quedar nada desplazándose (opacidad o color sí se permiten).
      const moving = isReduced
        ? document.getAnimations().filter((a) => {
            if (a.playState !== "running") return false;
            const frames = a.effect?.getKeyframes?.() ?? [];
            return frames.some((k) => (k.transform && k.transform !== "none") || k.translate || k.scale);
          }).map((a) => `${a.animationName ?? a.transitionProperty ?? "waapi"} @ ${a.effect?.target ? sel(a.effect.target) : "?"}`)
        : [];
      return { overflow: document.documentElement.scrollWidth - vw, wide: [...new Set(wide)].slice(0, 6), stuck: [...new Set(stuck)].slice(0, 8), moving: [...new Set(moving)].slice(0, 8) };
    }, reduced);

    const row = { route, width, ...entry, ...result, errors: [...new Set(errors)] };
    report.push(row);
    const flags = [
      row.overflow > 1 && `desborde ${row.overflow}px`,
      row.wide.length && `fuera ${row.wide.length}`,
      row.stuck.length && `invisibles ${row.stuck.length}`,
      row.moving.length && `mueve-con-RM ${row.moving.length}`,
      row.errors.length && `consola ${row.errors.length}`,
    ].filter(Boolean);
    console.log(`${flags.length ? "✖" : "✔"} ${String(width).padStart(4)} ${route}  entrada=${row.running} motion=${row.motionNodes} ${flags.join(" · ")}`);
    await page.close();
  }
  await context.close();
}
await browser.close();
await writeFile(path.join(out, `report${reduced ? "-reduced" : ""}.json`), JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.overflow > 1 || r.wide.length || r.stuck.length || r.moving.length || r.errors.length);
console.log(`\n${report.length} casos · ${bad.length} con observaciones · reporte en ${out}`);
