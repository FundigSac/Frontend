// Auditoría de rendimiento con Lighthouse (laboratorio) en móvil y escritorio.
// Uso:
//   node scripts/perf/lighthouse.mjs                       → producción (fundigsac-web.vercel.app), rutas clave
//   node scripts/perf/lighthouse.mjs --base http://127.0.0.1:3000 --routes /,/productos
//   node scripts/perf/lighthouse.mjs --only mobile
// Genera .perf/<fecha>/<ruta>-<factor>.json y .perf/<fecha>/resumen.md (no se sube al repo).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const base = arg("base", "https://fundigsac-web.vercel.app").replace(/\/$/, "");
const routes = arg("routes", "/,/productos,/productos/valvulas,/contacto,/cotizar,/industrias/saneamiento").split(",");
const only = arg("only", "both");
const factors = only === "both" ? ["mobile", "desktop"] : [only];

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const outDir = path.join(root, ".perf", stamp);
await mkdir(outDir, { recursive: true });

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const ms = (audit) => (audit?.numericValue == null ? "—" : `${Math.round(audit.numericValue)} ms`);
const cls = (audit) => (audit?.numericValue == null ? "—" : audit.numericValue.toFixed(3));

const rows = [];
try {
  for (const route of routes) {
    for (const factor of factors) {
      const url = `${base}${route}`;
      const flags = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
      const config = factor === "desktop" ? desktopConfig : undefined;
      const result = await lighthouse(url, flags, config);
      const lhr = result.lhr;
      const name = `${route === "/" ? "inicio" : route.replace(/\//g, "_").replace(/^_/, "")}-${factor}`;
      await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(lhr, null, 2));

      if (lhr.runtimeError) {
        rows.push(`| ${route} | ${factor} | ERROR: ${lhr.runtimeError.message} | | | | | | | |`);
        continue;
      }
      const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
      const a = lhr.audits;
      rows.push(
        `| ${route} | ${factor} | ${score("performance")} | ${ms(a["first-contentful-paint"])} | ${ms(a["largest-contentful-paint"])} | ${ms(a["total-blocking-time"])} | ${cls(a["cumulative-layout-shift"])} | ${ms(a["speed-index"])} | ${score("accessibility")} | ${score("best-practices")} / ${score("seo")} |`,
      );
      console.log(`✔ ${route} ${factor}: rendimiento ${score("performance")}`);
    }
  }
} finally {
  await chrome.kill();
}

const header = [
  `# Lighthouse · ${base}`,
  `Fecha: ${new Date().toISOString()}`,
  "",
  "| Ruta | Factor | Rendimiento | FCP | LCP | TBT | CLS | Speed Index | Accesibilidad | Buenas prácticas / SEO |",
  "|---|---|---|---|---|---|---|---|---|---|",
].join("\n");
const summary = `${header}\n${rows.join("\n")}\n`;
await writeFile(path.join(outDir, "resumen.md"), summary);
console.log(`\n${summary}\nReportes: ${path.relative(root, outDir)}`);
