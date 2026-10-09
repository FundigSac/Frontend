// QA transversal: consola, red, desborde horizontal, imágenes rotas, alt, enlaces vacíos, h1 único, lang.
// Uso: node scripts/qa/health.mjs --base http://127.0.0.1:3101 [--widths 320,375,768,1024,1440,1920] [--themes light,dark] [--only w01,...]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROUTES } from "./routes.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const base = args.base ?? process.env.QA_BASE ?? "http://127.0.0.1:3101";
const widths = (args.widths ?? "320,375,768,1024,1440,1920").split(",").map(Number);
const themes = (args.themes ?? "light,dark").split(",");
const only = args.only ? args.only.split(",") : null;
const EXTRA = { terminos: "/terminos-b2b", login: "/login", registro: "/registro", recuperar: "/recuperar", cuenta: "/cuenta" };
const routes = { ...ROUTES, ...EXTRA };
const out = resolve("docs/qa/results");
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const results = [];
for (const [id, path] of Object.entries(routes)) {
  if (only && !only.includes(id)) continue;
  for (const theme of themes) {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 812 : 900 }, reducedMotion: "reduce" });
      await ctx.addInitScript((t) => { try { localStorage.setItem("fundigsac-theme", t); } catch {} }, theme);
      const page = await ctx.newPage();
      const problems = [];
      page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`console.${m.type()}: ${m.text().slice(0, 200)}`); });
      page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
      page.on("response", (r) => { if (r.status() >= 400 && !/favicon|_next\/webpack-hmr/.test(r.url())) problems.push(`http ${r.status()}: ${r.url().replace(base, "")}`); });
      let status = 0;
      try {
        const resp = await page.goto(base + path, { waitUntil: "networkidle", timeout: 300000 });
        status = resp?.status() ?? 0;
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); await document.fonts.ready; });
        const facts = await page.evaluate(() => {
          const imgs = [...document.images];
          return {
            overflowX: document.documentElement.scrollWidth - window.innerWidth,
            brokenImages: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src).slice(0, 5),
            missingAlt: imgs.filter((i) => i.getAttribute("alt") === null).length,
            emptyAlt: imgs.filter((i) => i.getAttribute("alt") === "").length,
            hashLinks: [...document.querySelectorAll('a[href="#"]')].length,
            h1: document.querySelectorAll("h1").length,
            lang: document.documentElement.lang,
            title: document.title,
            dark: document.documentElement.classList.contains("dark"),
            buttonsNoLabel: [...document.querySelectorAll("button")].filter((b) => !(b.textContent || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")).length,
            inputsNoLabel: [...document.querySelectorAll("input:not([type=hidden]),select,textarea")].filter((el) => !el.labels?.length && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby") && el.closest("[aria-hidden=true]") === null).length,
          };
        });
        if (facts.overflowX > 1) problems.push(`overflow-x ${facts.overflowX}px`);
        if (facts.brokenImages.length) problems.push(`broken images: ${facts.brokenImages.join(", ")}`);
        if (facts.missingAlt) problems.push(`${facts.missingAlt} <img> sin alt`);
        if (facts.hashLinks) problems.push(`${facts.hashLinks} enlaces href="#"`);
        if (facts.h1 !== 1 && id !== "login") problems.push(`h1 count ${facts.h1}`);
        if (facts.buttonsNoLabel) problems.push(`${facts.buttonsNoLabel} botones sin nombre accesible`);
        if (facts.inputsNoLabel) problems.push(`${facts.inputsNoLabel} campos sin etiqueta`);
        if (theme === "dark" && !facts.dark) problems.push("tema oscuro no aplicado");
      } catch (e) {
        problems.push(`navegación falló: ${String(e).slice(0, 160)}`);
      }
      results.push({ id, path, theme, width, status, problems: [...new Set(problems)] });
      await ctx.close();
    }
  }
  const bad = results.filter((r) => r.id === id && r.problems.length).length;
  console.log(id, path, bad ? `⚠ ${bad} combinaciones con problemas` : "ok");
}
await browser.close();
await writeFile(resolve(out, "health.json"), JSON.stringify({ base, at: new Date().toISOString(), results }, null, 1));
const total = results.length, failing = results.filter((r) => r.problems.length).length;
console.log(`\n${total - failing}/${total} combinaciones limpias`);
