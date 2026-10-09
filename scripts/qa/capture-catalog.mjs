// Captura full-page del HTML original de Stitch y de la implementación Next.js.
// Uso: node scripts/qa/capture.mjs [--base http://127.0.0.1:3101] [--width 1440] [--only w01,w02] [--theme light]
import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const base = args.base ?? process.env.QA_BASE ?? "http://127.0.0.1:3101";
const width = Number(args.width ?? 1440);
const height = Number(args.height ?? 900);
const only = args.only ? args.only.split(",") : null;
const theme = args.theme ?? "light";
const STITCH = resolve("../stitch_design_system_studio");
const OUT = resolve("docs/qa/screenshots");

import { ROUTES as BASE_ROUTES } from "./routes.mjs";
// Variante del grupo catálogo: W22 se captura con la misma consulta que muestra el diseño de Stitch.
const ROUTES = { ...BASE_ROUTES, w22: "/buscar?q=v%C3%A1lvula%20compuerta%20pn%2016" };

const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}`;

async function settle(page) {
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight + 600) setTimeout(step, 60); else { window.scrollTo(0, 0); res(); } };
      step();
    });
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(400);
}

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const dirs = (await readdir(STITCH)).filter((d) => /^w\d\d_/.test(d));
for (const dir of dirs) {
  const id = dir.slice(0, 3);
  if (only && !only.includes(id)) continue;
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  if (theme !== "light") await ctx.addInitScript((t) => localStorage.setItem("fundigsac-theme", t), theme);
  const page = await ctx.newPage();
  if (theme === "light" || args.orig) {
    await mkdir(join(OUT, "orig"), { recursive: true });
    await page.goto(pathToFileURL(join(STITCH, dir, "code.html")).href, { waitUntil: "networkidle", timeout: 120000 });
    await settle(page);
    await page.screenshot({ path: join(OUT, "orig", `${id}-${width}.png`), fullPage: true });
  }
  await mkdir(join(OUT, "mine"), { recursive: true });
  await page.goto(base + ROUTES[id], { waitUntil: "networkidle", timeout: 300000 });
  await settle(page);
  await page.screenshot({ path: join(OUT, "mine", `${id}-${width}-${theme}.png`), fullPage: true });
  console.log("captured", id);
  await ctx.close();
}
await browser.close();
