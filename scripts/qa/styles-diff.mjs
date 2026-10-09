// Recorre en paralelo <main> del original y de la implementación y lista diferencias de estilo computado/geometría.
// Uso: node styles-diff.mjs w01 [maxReport]
import { chromium } from "@playwright/test";
import { resolve, join } from "node:path";
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ROUTES } from "./routes.mjs";
const id = process.argv[2];
const max = Number(process.argv[3] ?? 40);
const width = Number(process.argv[4] ?? 1440);
const STITCH = resolve("../stitch_design_system_studio");
const dir = readdirSync(STITCH).find((d) => d.startsWith(id + "_"));
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const PROPS = ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "borderRadius", "borderTopWidth", "borderTopColor", "paddingTop", "paddingLeft", "gap", "boxShadow", "display", "opacity", "textTransform"];
const SEL = process.env.SEL || "main";
const grab = async (url) => {
  const p = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 300000 });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(([PROPS, SEL]) => {
    const out = [];
    const walk = (e, path) => {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const norm = (v) => { try { cv.clearRect(0,0,1,1); cv.fillStyle = "#000"; cv.fillStyle = v; cv.fillRect(0,0,1,1); const d = cv.getImageData(0,0,1,1).data; return `rgba(${d[0]},${d[1]},${d[2]},${(d[3]/255).toFixed(2)})`; } catch { return v; } };
      const s = {}; for (const k of PROPS) { let v = cs[k]; if (/color$/i.test(k) || k === "color" || k === "backgroundColor") v = /^(rgba?|oklab|oklch|color)/.test(v) ? norm(v) : v; if (k === "boxShadow") v = v.split(/\)\s*,\s*/).filter((x) => !/0px 0px 0px 0px/.test(x.replace(/rgba\([^)]*\)?/, ""))).join(")," ) || "none"; s[k] = v; }
      out.push({ path, tag: e.tagName.toLowerCase(), cls: (e.getAttribute("class") || "").slice(0, 70), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, x: Math.round(r.left), s, text: [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").slice(0, 30) });
      [...e.children].forEach((c, i) => walk(c, path + ">" + c.tagName.toLowerCase() + i));
    };
    walk(document.querySelector(SEL), SEL);
    return out;
  }, [PROPS, SEL]);
  await p.close(); return r;
};
const o = await grab(pathToFileURL(join(STITCH, dir, "code.html")).href);
const m = await grab((process.env.QA_BASE ?? "http://127.0.0.1:3101") + ROUTES[id]);
console.log("elements", o.length, m.length);
let n = 0;
for (let i = 0; i < Math.min(o.length, m.length) && n < max; i++) {
  const a = o[i], c = m[i];
  if (a.tag !== c.tag) { console.log("STRUCT MISMATCH at", i, a.path, a.tag, c.tag); break; }
  const diffs = [];
  for (const k of PROPS) if (a.s[k] !== c.s[k]) diffs.push(`${k}: ${a.s[k]} → ${c.s[k]}`);
  if (Math.abs(a.w - c.w) > 1) diffs.push(`w ${a.w}→${c.w}`);
  if (Math.abs(a.h - c.h) > 1) diffs.push(`h ${a.h}→${c.h}`);
  if (diffs.length) { n++; console.log(`#${i} <${a.tag}> "${a.text}" .${a.cls}\n    ${diffs.join(" | ")}`); }
}
await b.close();
