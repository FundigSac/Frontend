// Lighthouse A/B local: original (09a8d7c, :3201) frente a nuevo (:3200), mismas condiciones, intercalado.
import { writeFile } from "node:fs/promises";
const NM = "/Volumes/Programas/FundigSac/frontend/node_modules";
const { default: lighthouse } = await import(`${NM}/lighthouse/core/index.js`);
const { default: desktopConfig } = await import(`${NM}/lighthouse/core/config/desktop-config.js`);
const chromeLauncher = await import(`${NM}/chrome-launcher/dist/index.js`);
const OUT = process.argv[2];
const RUNS = Number(process.argv[3] || 3);
const routes = ["/", "/productos", "/productos/valvulas", "/productos/valvulas/valvula-compuerta-fundigsac", "/industrias", "/industrias/agricultura", "/nosotros", "/contacto", "/cotizar"];
const servers = { antes: "http://127.0.0.1:3201", despues: "http://127.0.0.1:3200" };
const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const rows = [];
const one = async (url, factor) => {
  const flags = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
  const { lhr } = await lighthouse(url, flags, factor === "desktop" ? desktopConfig : undefined);
  const a = lhr.audits; const sc = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
  return { perf: sc("performance"), a11y: sc("accessibility"), bp: sc("best-practices"), seo: sc("seo"), fcp: a["first-contentful-paint"].numericValue, lcp: a["largest-contentful-paint"].numericValue, tbt: a["total-blocking-time"].numericValue, cls: a["cumulative-layout-shift"].numericValue, si: a["speed-index"].numericValue, bytes: a["total-byte-weight"].numericValue };
};
try {
  // Calentar cada ruta en ambos servidores (la primera petición de una ruta dinámica compila/llena cachés).
  for (const r of routes) for (const base of Object.values(servers)) await fetch(base + r).catch(() => {});
  for (let run = 1; run <= RUNS; run++) {
    for (const r of routes) for (const [name, base] of Object.entries(servers)) {
      const m = await one(base + r, "mobile"); rows.push({ run, route: r, server: name, factor: "mobile", ...m });
      console.log(run, "mobile", name, r, m.perf, Math.round(m.lcp));
    }
  }
  for (const r of routes) for (const [name, base] of Object.entries(servers)) {
    const m = await one(base + r, "desktop"); rows.push({ run: 1, route: r, server: name, factor: "desktop", ...m });
    console.log(1, "desktop", name, r, m.perf, Math.round(m.lcp));
  }
} finally {
  await writeFile(OUT, JSON.stringify(rows, null, 1));
  await chrome.kill();
}
