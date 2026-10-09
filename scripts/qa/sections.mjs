// Compara top/height de cada <section>/<footer> del original vs implementación. Uso: node sections.mjs w01
import { chromium } from "@playwright/test";
import { resolve, join } from "node:path";
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ROUTES } from "./routes.mjs";
const id = process.argv[2];
const STITCH = resolve("../stitch_design_system_studio");
const dir = readdirSync(STITCH).find((d) => d.startsWith(id + "_"));
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const grab = async (url) => {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 300000 });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => [...document.querySelectorAll("main > *, main > * > section, main > * > *, footer")].filter((e)=>e.getBoundingClientRect().height>40).map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.className||"").toString().slice(0, 40), top: Math.round(r.top + scrollY), h: Math.round(r.height), text: (e.textContent||"").trim().slice(0,30) }; }));
  await p.close(); return r;
};
const o = await grab(pathToFileURL(join(STITCH, dir, "code.html")).href);
const m = await grab((process.env.QA_BASE ?? "http://127.0.0.1:3101") + ROUTES[id]);
const n = Math.max(o.length, m.length);
for (let i = 0; i < n; i++) { const a = o[i], c = m[i]; console.log(String(i).padStart(2), a ? `${a.top}/${a.h}` : "-", c ? `${c.top}/${c.h}` : "-", a && c ? `Δtop ${c.top - a.top} Δh ${c.h - a.h}` : "", (a?.text||"").slice(0,24)); }
await b.close();
