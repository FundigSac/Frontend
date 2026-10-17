// Imagen para compartir en redes (Open Graph / Twitter), 1200×630, compuesta solo con material oficial del sitio:
// la foto de planta del hero, la válvula compuerta FUNDIGSAC y el logo. Misma composición que el hero de inicio.
// Uso: node scripts/build-og-image.mjs  →  src/app/opengraph-image.jpg y src/app/twitter-image.jpg
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (p) => path.join(root, p);
const W = 1200;
const H = 630;

// Velo claro a la izquierda, igual que .lp-hero__veil, para que el logo se lea sobre la foto.
const veil = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="v" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#f8fbfe" stop-opacity=".95"/><stop offset=".34" stop-color="#f8fbfe" stop-opacity=".86"/>
    <stop offset=".54" stop-color="#f8fbfe" stop-opacity=".4"/><stop offset=".7" stop-color="#f8fbfe" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
</svg>`);

const photo = await sharp(at("public/media/home-v3/hero-planta.webp")).resize(W, H, { fit: "cover", position: "centre" }).toBuffer();
const valve = await sharp(at("public/media/home-v2/compuerta-sin-timon-v4.webp")).resize({ height: 560 }).toBuffer();
const valveMeta = await sharp(valve).metadata();
const logo = await sharp(at("public/brand/fundigsac.svg"), { density: 300 }).resize({ width: 470 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();

const out = at("src/app/opengraph-image.jpg");
await sharp(photo)
  .composite([
    { input: veil },
    { input: valve, left: W - valveMeta.width - 120, top: H - valveMeta.height - 20 },
    { input: logo, left: 72, top: Math.round((H - logoMeta.height) / 2) },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);
await copyFile(out, at("src/app/twitter-image.jpg"));
console.log("OG listo:", path.relative(root, out));
