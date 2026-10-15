// Campos 2D de distancia con signo (mm) para relieves fundidos: letras y logotipo.
// Se rasterizan con sharp (fuentes de Windows o el SVG de marca) y se convierten con una
// transformada de distancia euclídea exacta (Felzenszwalb). Se comparten entre hilos.
import sharp from 'sharp';

const INF = 1e20;
function edt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
}
/** Distancia euclídea al conjunto de píxeles con mask=true (en píxeles). */
function edt(mask, w, h) {
  const g = new Float64Array(w * h), n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let i = 0; i < w * h; i++) g[i] = mask[i] ? 0 : INF;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = g[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) g[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = g[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(d[x]);
  }
  return g;
}

/** Convierte una máscara (alpha 0-255) en un campo con signo compartido. */
function toField(alpha, w, h, step, u0, v0) {
  const inside = new Uint8Array(w * h), outside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) { inside[i] = alpha[i] >= 128 ? 1 : 0; outside[i] = 1 - inside[i]; }
  const dOut = edt(inside, w, h), dIn = edt(outside, w, h);
  const data = new Float32Array(new SharedArrayBuffer(w * h * 4));
  // Fila 0 de la imagen = v máximo (arriba).
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, j = (h - 1 - y) * w + x;
    data[j] = (inside[i] ? -(dIn[i] - 0.5) : dOut[i] - 0.5) * step;
  }
  return { data, w, h, u0, v0, step, far: 2 * step };
}

async function inkMask(input, targetHeightMm, step) {
  // Recorta la tinta y escala para que su altura sea targetHeightMm.
  const { data, info } = await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 40) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const iw = x1 - x0 + 1, ih = y1 - y0 + 1, scale = targetHeightMm / step / ih;
  const w = Math.max(1, Math.round(iw * scale)), h = Math.max(1, Math.round(ih * scale));
  const out = await sharp(input).ensureAlpha().extract({ left: x0, top: y0, width: iw, height: ih })
    .resize(w, h, { kernel: 'lanczos3' }).extractChannel(3).raw().toBuffer();
  return { mask: out, w, h };
}

/**
 * Bloque de texto en relieve centrado en (0,0).
 * lines: [{ text, height (mm de tinta), font, condensed? }], gap: separación vertical (mm).
 */
export async function textBlockField(lines, { gap = 1.5, step = 0.05, pad = 3, tracking = 0 } = {}) {
  const rendered = [];
  for (const l of lines) {
    const fontfile = l.fontfile ?? 'C:/Windows/Fonts/arialbd.ttf';
    const markup = `<span letter_spacing="${Math.round((l.tracking ?? tracking) * 1024)}">${l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
    const png = await sharp({ text: { text: markup, font: l.font ?? 'Arial Bold', fontfile, dpi: 1200, rgba: true } }).png().toBuffer();
    const m = await inkMask(png, l.height, step);
    if (l.widthScale && l.widthScale !== 1) {
      const nw = Math.max(1, Math.round(m.w * l.widthScale));
      m.mask = await sharp(m.mask, { raw: { width: m.w, height: m.h, channels: 1 } }).resize(nw, m.h).extractChannel(0).raw().toBuffer(); m.w = nw;
    }
    rendered.push(m);
  }
  const p = Math.round(pad / step), gp = Math.round(gap / step);
  const W = Math.max(...rendered.map((r) => r.w)) + 2 * p;
  const H = rendered.reduce((s, r) => s + r.h, 0) + gp * (rendered.length - 1) + 2 * p;
  const alpha = new Uint8Array(W * H);
  let y = p;
  for (const r of rendered) {
    const x = Math.round((W - r.w) / 2);
    for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) alpha[(y + j) * W + x + i] = r.mask[j * r.w + i];
    y += r.h + gp;
  }
  return toField(alpha, W, H, step, -(W - 1) * step / 2, -(H - 1) * step / 2);
}

/** Logotipo FUNDIGSAC (llama y anillo) desde el SVG de marca, alto en mm. */
export async function logoField(svgPath, heightMm, { step = 0.04, pad = 2.5, widthScale = 1 } = {}) {
  // Las separaciones entre llamas son blancas opacas en el SVG: la tinta es todo lo que no es blanco.
  const { data, info } = await sharp(svgPath, { density: 600 }).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4, 0);
  for (let i = 0; i < info.width * info.height; i++) {
    const ink = 255 - Math.min(data[i * info.channels], data[i * info.channels + 1], data[i * info.channels + 2]);
    rgba[i * 4 + 3] = ink > 70 ? 255 : Math.round(ink * 255 / 70);
  }
  const png = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const m = await inkMask(png, heightMm, step);
  if (widthScale !== 1) {
    const nw = Math.round(m.w * widthScale);
    m.mask = await sharp(m.mask, { raw: { width: m.w, height: m.h, channels: 1 } }).resize(nw, m.h).extractChannel(0).raw().toBuffer(); m.w = nw;
  }
  const p = Math.round(pad / step), W = m.w + 2 * p, H = m.h + 2 * p, alpha = new Uint8Array(W * H);
  for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) alpha[(j + p) * W + i + p] = m.mask[j * m.w + i];
  return toField(alpha, W, H, step, -(W - 1) * step / 2, -(H - 1) * step / 2);
}

/** Texto curvado: se genera recto; el modelo lo mapea a coordenadas polares (u = arco, v = radio). */
export const arcTextField = textBlockField;
