// Recorta el fondo de estudio gris de fotos de válvula y escribe WebP con transparencia (1000 px de ancho).
// El fondo es la región clara y poco saturada conectada con el borde de la foto; la válvula azul y sus tapones
// blancos (rodeados de azul) quedan intactos. Uso: node scripts/cut-valve-photos.mjs <salida> <entrada>...
import path from "node:path";
import sharp from "sharp";

const [out, ...inputs] = process.argv.slice(2);
const WIDTH = 1000;
const BRIGHT = 150; // luminancia mínima del fondo (incluye la sombra del piso)
const SAT = 26; // max(r,g,b) - min(r,g,b) máximo del fondo

for (const [i, file] of inputs.entries()) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const isBg = (p) => {
    const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) <= SAT && (r + g + b) / 3 >= BRIGHT;
  };
  const bg = new Uint8Array(W * H);
  const stack = [];
  const push = (p) => { if (!bg[p] && isBg(p)) { bg[p] = 1; stack.push(p); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W);
    if (y < H - 1) push(p + W);
  }
  // Un píxel de borde se descarta también (halo gris del antialias) y la máscara se suaviza.
  const mask = Buffer.alloc(W * H, 255);
  for (let p = 0; p < W * H; p++) if (bg[p]) mask[p] = 0;
  const { data: soft, info: si } = await sharp(mask, { raw: { width: W, height: H, channels: 1 } })
    .convolve({ width: 3, height: 3, kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1], scale: 9 })
    .threshold(250) // erosiona 1 px
    .blur(0.8)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    rgba[p * 4] = data[p * 3]; rgba[p * 4 + 1] = data[p * 3 + 1]; rgba[p * 4 + 2] = data[p * 3 + 2]; rgba[p * 4 + 3] = soft[p * si.channels];
  }
  const name = path.join(out, `g-0${i + 1}.webp`);
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .resize({ width: WIDTH, height: 1250, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 95 })
    .toFile(name);
  console.log(name);
}
