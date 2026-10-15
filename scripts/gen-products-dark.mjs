// Genera el bloque de tema oscuro de las pantallas de catálogo (módulos CSS de /productos).
// Uso: node scripts/gen-products-dark.mjs
// Cada regla con colores literales se duplica bajo html[data-lp-theme="dark"] con colores remapeados a la
// paleta oscura de inicio. El bloque vive entre /* dark:begin */ y /* dark:end */; lo escrito a mano
// después de /* dark:end */ se conserva.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const pnpm = path.resolve("node_modules/.pnpm");
const postcssDir = fs.readdirSync(pnpm).find((d) => d.startsWith("postcss@"));
const postcss = createRequire(path.join(pnpm, postcssDir, "node_modules/postcss/"))("postcss");

const FILES = ["w02-catalog", "w03-valvulas", "w04-tuberias", "w05-marcos"].map((n) => `src/screens/islands/${n}.module.css`);
const DARK = 'html[data-lp-theme="dark"]';


function parseColor(tok) {
  let m = tok.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = tok.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  return null;
}

function toHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s, l, chroma };
}

function hsl(h, s, l, a = 1) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v) => Math.round((v + m) * 255);
  return a < 1 ? `rgb(${to(r)} ${to(g)} ${to(b)} / ${Math.round(a * 100)}%)` : `#${[r, g, b].map((v) => to(v).toString(16).padStart(2, "0")).join("")}`;
}

const withAlpha = (hex, a) => (a < 1 ? `${hex.length === 7 ? `rgb(${parseInt(hex.slice(1, 3), 16)} ${parseInt(hex.slice(3, 5), 16)} ${parseInt(hex.slice(5, 7), 16)} / ${Math.round(a * 100)}%)` : hex}` : hex);

// Paleta oscura de inicio.
const PAGE = "#08121f", CARD = "#0f1d32", RAISED = "#14253f", HIGH = "#1a2e4a";

function mapBg(c) {
  const { h, s, l, chroma } = toHsl(c);
  if (chroma > 0.07 && l > 0.75) return withAlpha(hsl(h, Math.min(s, 0.4), 0.17), c.a); // fondo teñido claro (avisos, chips)
  if (chroma > 0.07) return null; // acento de marca: se conserva
  if (l >= 0.995) return withAlpha(CARD, c.a);
  if (l >= 0.95) return withAlpha(PAGE, c.a);
  if (l >= 0.85) return withAlpha(RAISED, c.a);
  if (l >= 0.6) return withAlpha(HIGH, c.a);
  if (l >= 0.3) return withAlpha("#22385a", c.a);
  return withAlpha("#1c3050", c.a); // botón/chip oscuro sobre página oscura
}

function mapText(c) {
  const { h, s, l, chroma } = toHsl(c);
  if (l > 0.88) return null; // texto claro sobre fondo oscuro o de marca: se conserva
  if (chroma > 0.2 && h >= 10 && h <= 40) return withAlpha("#ff9a62", c.a); // naranja oscuro → naranja claro
  if (chroma > 0.2) return withAlpha(hsl(h, Math.min(s, 0.9), 0.72), c.a); // azul de marca → azul claro
  if (l < 0.22) return withAlpha("#eef3fa", c.a);
  if (l < 0.42) return withAlpha("#c3cfde", c.a);
  return withAlpha("#9db0c7", c.a);
}

function mapBorder(c) {
  const { l, chroma } = toHsl(c);
  if (chroma > 0.15) return null;
  if (l > 0.6) return "rgb(255 255 255 / 14%)";
  return null;
}

const PLATE = /(cardImage|categoryImage|productImage|tabThumb|.thumb|mainImage)/;
const COLOR_TOKEN = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

function remap(value, kind) {
  // Botones y bordes "tinta": en oscuro --ink es claro, así que usan un azul de botón propio.
  if (kind !== "text" && value.includes("var(--ink)")) return value.split("var(--ink)").join("var(--ink-btn)");
  let changed = false;
  const out = value.replace(COLOR_TOKEN, (tok) => {
    const c = parseColor(tok);
    if (!c) return tok;
    // Fondos translúcidos claros (chips sobre fotos): en oscuro necesitan más opacidad para no verse grises.
    const boost = kind === "bg" && c.a < 1 && !value.includes("gradient");
    const next = (kind === "bg" ? mapBg : kind === "text" ? mapText : mapBorder)(boost ? { ...c, a: Math.min(1, c.a + (1 - c.a) * 0.65) } : c);
    if (next === null) return tok;
    changed = true;
    return next;
  });
  return changed ? out : null;
}

const kindOf = (prop) => {
  if (prop.startsWith("--")) return /ink|text|muted|soft|navy|fg/.test(prop) ? "text" : /line|border/.test(prop) ? "border" : "bg";
  if (prop === "color" || prop === "fill" || prop === "stroke" || prop === "caret-color" || prop === "text-decoration-color") return "text";
  if (prop === "background" || prop === "background-color" || prop === "background-image") return "bg";
  if (prop === "outline" || prop === "outline-color" || prop.startsWith("border")) return "border";
  return null;
};

function darkSelector(sel) {
  return sel.split(",").map((s) => `:global(${DARK}) ${s.trim()}`).join(",\n");
}

for (const file of FILES) {
  let src = fs.readFileSync(file, "utf8");
  const crlf = src.includes("\r\n");
  src = src.replace(/\r\n/g, "\n");
  const begin = src.indexOf("/* dark:begin */");
  const end = src.indexOf("/* dark:end */");
  let manual = "";
  if (begin !== -1 && end !== -1) {
    manual = src.slice(end + "/* dark:end */".length);
    // Quita también los encabezados que dejaron ejecuciones anteriores justo antes del bloque.
    let head = src.slice(0, begin);
    for (let h = head.lastIndexOf("/* ===== Tema oscuro de /productos"); h !== -1; h = head.lastIndexOf("/* ===== Tema oscuro de /productos")) head = head.slice(0, h);
    src = head.trimEnd() + "\n";
  }
  const root = postcss.parse(src);
  const out = postcss.root();
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    const decls = [];
    rule.each((n) => {
      if (n.type !== "decl") return;
      const kind = kindOf(n.prop);
      if (!kind) return;
      // Las placas de producto conservan un fondo claro: las fotos con fondo blanco no deben verse como parches.
      if (kind === "bg" && PLATE.test(rule.selector) && n.prop.startsWith("background") && n.prop !== "background-image" && !n.value.includes("url(") && !n.value.includes("gradient")) { decls.push(postcss.decl({ prop: n.prop, value: "#e8eef6" })); return; }
      const v = remap(n.value, kind);
      if (v !== null) decls.push(postcss.decl({ prop: n.prop, value: v }));
    });
    if (rule.selector.trim() === ".page" && decls.some((d) => d.prop === "--ink")) decls.push(postcss.decl({ prop: "--ink-btn", value: "#2b4670" }));
    if (!decls.length) return;
    const clone = postcss.rule({ selector: darkSelector(rule.selector), raws: { semicolon: true } });
    decls.forEach((d) => clone.append(d));
    // Reproduce la cadena de @media/@supports para conservar los puntos de corte.
    const chain = [];
    for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) chain.unshift(p);
    let target = out;
    for (const at of chain) {
      let found = target.nodes?.find((n) => n.type === "atrule" && n.name === at.name && n.params === at.params);
      if (!found) { found = postcss.atRule({ name: at.name, params: at.params }); target.append(found); }
      target = found;
    }
    target.append(clone);
  });
  const block = out.toString().replace(/^(?: {4})+/gm, (m) => " ".repeat(m.length / 2));
  // Miniaturas de las pestañas: fotos oscuras (tapas, tuberías) necesitan una placa clara.
  const extra = src.includes(".tabThumb {") ? `
:global(${DARK}) .tabThumb {
  background: #e8eef6;
}` : "";
  const blockFull = block.trim() + extra;
  let result = `${src.trimEnd()}\n\n/* ===== Tema oscuro de /productos (generado por scripts/gen-products-dark.mjs) ===== */\n/* dark:begin */\n${blockFull}\n/* dark:end */${manual || "\n"}`;
  result = result.replace(/\n+$/, "\n");
  fs.writeFileSync(file, crlf ? result.replace(/\n/g, "\r\n") : result);
  console.log(file, `${(block.match(/\{/g) || []).length} bloques`);
}
