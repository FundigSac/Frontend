// Medidor de KPI: audita rutas con Lighthouse en móvil y escritorio contra un build de producción ya levantado.
// Uso:
//   node scripts/perf/kpi-gate.mjs --app fundigsac --base http://127.0.0.1:3101 --routes /,/productos
//   node scripts/perf/kpi-gate.mjs --app stock --base http://127.0.0.1:4173 --routes / --runs 5 --no-seo
// Cada ruta y factor se juzga con la mediana de las corridas (3 por defecto). Sale con código 1 si algo no cumple.
// Imprime una línea por ruta y factor, y agrega una línea JSON por corrida a Report/kpi/<app>.jsonl.
// Usa la misma configuración de Lighthouse que lighthouse.mjs; ese archivo audita al importarlo y por eso no se importa.
// --no-seo es para apps que no deben indexarse: omite solo la categoría SEO.
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";

const MIN_SCORE = 90;
const CATEGORIES = [
  { id: "performance", label: "perf" },
  { id: "accessibility", label: "a11y" },
  { id: "best-practices", label: "bp" },
  { id: "seo", label: "seo" },
];
const METRICS = [
  { key: "lcp", audit: "largest-contentful-paint", max: 2500, decimals: 0 },
  { key: "cls", audit: "cumulative-layout-shift", max: 0.1, decimals: 3 },
  { key: "tbt", audit: "total-blocking-time", max: 200, decimals: 0 },
  { key: "fcp", audit: "first-contentful-paint", max: 1800, decimals: 0 },
  { key: "si", audit: "speed-index", max: 3400, decimals: 0 },
];
const FACTORS = ["mobile", "desktop"];

function usageError(message) {
  console.error(`kpi-gate: ${message}`);
  console.error("Uso: node scripts/perf/kpi-gate.mjs --app <nombre> --base <url> --routes /,/x [--runs 3] [--no-seo]");
  process.exit(1);
}

function readOptions() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        app: { type: "string" },
        base: { type: "string" },
        routes: { type: "string" },
        runs: { type: "string", default: "3" },
        "no-seo": { type: "boolean", default: false },
      },
    }));
  } catch (error) {
    usageError(error.message);
  }

  // El nombre termina en una ruta de archivo: sin separadores ni "..".
  if (!values.app || !/^[\w-][\w.-]*$/.test(values.app)) usageError("--app debe ser un nombre simple, sin barras");

  let base;
  try {
    base = new URL(values.base ?? "");
  } catch {
    usageError("--base debe ser una URL completa, por ejemplo http://127.0.0.1:3101");
  }
  if (!["http:", "https:"].includes(base.protocol)) usageError("--base debe usar http o https");

  const routes = (values.routes ?? "").split(",").map((route) => route.trim()).filter(Boolean);
  if (routes.length === 0 || routes.some((route) => !route.startsWith("/"))) {
    usageError("--routes debe ser una lista separada por comas de rutas que empiecen con /");
  }

  const runs = Number(values.runs);
  if (!Number.isInteger(runs) || runs < 1) usageError("--runs debe ser un entero mayor que 0");

  return { app: values.app, base: base.href.replace(/\/$/, ""), routes, runs, noSeo: values["no-seo"] };
}

const { app, base, routes, runs, noSeo } = readOptions();
const categories = noSeo ? CATEGORIES.filter((category) => category.id !== "seo") : CATEGORIES;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const kpiDir = path.join(projectRoot, "Report", "kpi");
const logFile = path.join(kpiDir, `${app}.jsonl`);
await mkdir(kpiDir, { recursive: true });

// Un Chrome por corrida: así una corrida no hereda memoria ni caché de la anterior.
async function audit(url, factor) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const flags = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: categories.map((category) => category.id) };
    const result = await lighthouse(url, flags, factor === "desktop" ? desktopConfig : undefined);
    if (!result?.lhr) throw new Error("Lighthouse no devolvió resultado");
    return result.lhr;
  } finally {
    try {
      await chrome.kill();
    } catch {
      /* En Windows la carpeta temporal de Chrome puede seguir bloqueada al cerrar. */
    }
  }
}

function readRun(lhr) {
  if (lhr.runtimeError) return { error: lhr.runtimeError.code, detail: lhr.runtimeError.message };

  const scores = {};
  for (const { id } of categories) {
    const score = lhr.categories[id]?.score;
    scores[id] = score == null ? null : Math.round(score * 100);
  }
  const metrics = {};
  for (const { key, audit: auditId } of METRICS) {
    metrics[key] = lhr.audits[auditId]?.numericValue ?? null;
  }

  // Un dato ausente nunca cuenta como aprobado.
  const missing = [
    ...Object.entries(scores).filter(([, value]) => value === null).map(([id]) => id),
    ...Object.entries(metrics).filter(([, value]) => value === null).map(([key]) => key),
  ];
  if (missing.length > 0) return { scores, metrics, error: `sin dato: ${missing.join(",")}` };
  return { scores, metrics, error: null };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarize(results) {
  const valid = results.filter((result) => !result.error);
  if (valid.length === 0) return null;
  const scores = Object.fromEntries(categories.map(({ id }) => [id, median(valid.map((result) => result.scores[id]))]));
  const metrics = Object.fromEntries(METRICS.map(({ key }) => [key, median(valid.map((result) => result.metrics[key]))]));
  return { scores, metrics };
}

function findFailures(summary, results) {
  const failed = results.filter((result) => result.error);
  const failures = failed.length > 0 ? [`errores=${failed.length}/${results.length} (${failed[0].error})`] : [];
  if (!summary) return failures;
  for (const { id, label } of categories) {
    if (summary.scores[id] < MIN_SCORE) failures.push(`${label}<${MIN_SCORE}`);
  }
  for (const { key, max } of METRICS) {
    if (summary.metrics[key] > max) failures.push(`${key}>${max}`);
  }
  return failures;
}

function redirectTarget(url, finalUrl) {
  if (!finalUrl) return null;
  const pathOf = (value) => new URL(value).pathname.replace(/\/$/, "") || "/";
  return pathOf(url) === pathOf(finalUrl) ? null : pathOf(finalUrl);
}

function formatLine(route, factor, summary, failures, redirect) {
  const values = summary
    ? [
        ...categories.map(({ id, label }) => `${label}=${summary.scores[id]}`),
        ...METRICS.map(({ key, decimals }) => `${key}=${summary.metrics[key].toFixed(decimals)}`),
      ]
    : ["sin datos"];
  const status = failures.length > 0 ? "FALLA" : "OK";
  const target = redirect ? ` redirige=${redirect}` : "";
  const reasons = failures.length > 0 ? ` | ${failures.join(" ")}` : "";
  return `${status} ${route} ${factor} ${values.join(" ")} corridas=${runs}${target}${reasons}`;
}

let anyFailure = false;

for (const route of routes) {
  for (const factor of FACTORS) {
    const url = `${base}${route}`;
    const results = [];
    let redirect = null;

    for (let run = 1; run <= runs; run += 1) {
      let result;
      let finalUrl = null;
      let lighthouseVersion = null;
      try {
        const lhr = await audit(url, factor);
        finalUrl = lhr.finalDisplayedUrl ?? null;
        lighthouseVersion = lhr.lighthouseVersion ?? null;
        result = readRun(lhr);
      } catch (error) {
        result = { error: error.message };
      }
      results.push(result);
      redirect ??= redirectTarget(url, finalUrl);

      // Se escribe al terminar cada corrida: si el proceso muere, lo medido queda guardado.
      const entry = {
        ts: new Date().toISOString(),
        app,
        base,
        route,
        factor,
        run,
        runs,
        noSeo,
        finalUrl,
        lighthouseVersion,
        scores: result.scores ?? null,
        metrics: result.metrics ?? null,
        error: result.error,
        detail: result.detail ?? null,
      };
      await appendFile(logFile, `${JSON.stringify(entry)}\n`);
    }

    const summary = summarize(results);
    const failures = findFailures(summary, results);
    if (failures.length > 0) anyFailure = true;
    console.log(formatLine(route, factor, summary, failures, redirect));
  }
}

process.exit(anyFailure ? 1 : 0);
