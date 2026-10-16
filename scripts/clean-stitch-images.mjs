// Limpia artefactos de maqueta en imágenes de Stitch (encabezados "W0x — Ficha Técnica…", barras de ventana del visor de
// fotos, paneles de interfaz). Cada imagen se recorta a la foto o se "borra" el texto sobre fondo liso rellenando con el
// degradado del propio fondo. Escribe <nombre>-limpia.jpg junto al original (nombre nuevo: evita la caché de 30 días).
// Uso: node scripts/clean-stitch-images.mjs
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve(import.meta.dirname, "..", "public", "images", "stitch");

// Rectángulos en porcentaje [x0, y0, x1, y1] sobre la imagen original.
const JOBS = {
  "09565b0ba8": { patch: [[0, 0, 68, 8.5]] },
  cc33a8c3d9: { crop: [1.5, 4, 99, 100] },
  e2a8bdba20: { patch: [[0, 0, 23, 14]] },
  "54fd713aba": { crop: [0, 27, 100, 100] },
  "02da4b0467": { crop: [2.5, 7, 97.5, 97.5] },
  b018bc2b92: { patch: [[0, 0, 100, 4.6]] },
  ca20261b68: { patch: [[0, 0, 40, 3.2]] },
  d6fbc56855: { patch: [[2, 2, 95, 14.5]] },
  "9455f79b80": { patch: [[0, 0, 35, 13]] },
  d0fa5bbbb8: { patch: [[0, 0, 100, 5.4], [60, 4, 99.5, 30]] },
  "5633f0c0ec": { crop: [3, 17, 97, 96] },
  b2061c3a7f: { crop: [13, 6, 87, 95] },
  e99a473257: { crop: [12, 5.5, 88, 67.5] },
  f38d0554a0: { patch: [[0, 0, 100, 7]] },
  f8adf605b4: { crop: [5.5, 6.5, 75, 97] },
  a70182bfeb: { crop: [0, 4, 100, 100] },
  b2bccfdcb3: { crop: [5.2, 3.2, 94.6, 100] },
  "915091dd8b": { crop: [5.6, 7, 94.6, 100] },
  "4ffdfc51b2": { patch: [[0, 0, 34, 5.6], [8, 0, 13, 4.5]] },
  "8a067ff5f6": { crop: [25, 13, 86, 86] },
  c28c3c28eb: { patch: [[0, 0, 30, 5.2], [80, 0, 99.6, 5.2]] },
  d7313151e5: { crop: [21.5, 12.5, 79, 72] },
};

/** Rellena el rectángulo interpolando entre los colores de sus bordes (horizontal si hay borde a ambos lados). */
function patch(data, W, H, C, [x0, y0, x1, y1]) {
  const at = (x, y) => (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * C;
  const hasLeft = x0 > 2, hasRight = x1 < W - 3, hasTop = y0 > 2, hasBottom = y1 < H - 3;
  const avg = (cx, cy) => { // media 5x5 para no copiar ruido de un solo píxel
    const out = [0, 0, 0];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const i = at(cx + dx, cy + dy); for (let c = 0; c < 3; c++) out[c] += data[i + c]; }
    return out.map((v) => v / 25);
  };
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      let col;
      if (hasLeft || hasRight) {
        const a = avg(hasLeft ? x0 - 3 : x1 + 3, y), b = avg(hasRight ? x1 + 3 : x0 - 3, y);
        const t = (x - x0) / Math.max(1, x1 - x0);
        col = a.map((v, c) => v + (b[c] - v) * t);
        // Si el borde vertical existe, mezcla también con arriba/abajo para seguir degradados verticales.
        if (hasTop || hasBottom) {
          const p = avg(x, hasTop ? y0 - 3 : y1 + 3), q = avg(x, hasBottom ? y1 + 3 : y0 - 3);
          const s = (y - y0) / Math.max(1, y1 - y0);
          const v = p.map((pv, c) => pv + (q[c] - pv) * s);
          col = col.map((cv, c) => (cv + v[c]) / 2);
        }
      } else {
        const p = avg(x, hasTop ? y0 - 3 : y1 + 3), q = avg(x, hasBottom ? y1 + 3 : y0 - 3);
        const s = (y - y0) / Math.max(1, y1 - y0);
        col = p.map((pv, c) => pv + (q[c] - pv) * s);
      }
      const i = at(x, y);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(col[c]);
    }
  }
}

for (const [name, job] of Object.entries(JOBS)) {
  const src = path.join(dir, `${name}.jpg`);
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const px = ([x0, y0, x1, y1]) => [Math.round((x0 * W) / 100), Math.round((y0 * H) / 100), Math.min(W - 1, Math.round((x1 * W) / 100)), Math.min(H - 1, Math.round((y1 * H) / 100))];
  for (const rect of job.patch ?? []) patch(data, W, H, C, px(rect));
  let img = sharp(data, { raw: { width: W, height: H, channels: C } });
  if (job.patch?.length) img = sharp(await img.png().toBuffer()); // materializa antes de recortar
  if (job.crop) {
    const [x0, y0, x1, y1] = px(job.crop);
    img = img.extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
  }
  const out = path.join(dir, `${name}-limpia.jpg`);
  const meta = await img.jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  console.log(`${name}-limpia.jpg ${meta.width}x${meta.height}`);
}
