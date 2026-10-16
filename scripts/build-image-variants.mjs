// Genera variantes WebP responsivas de todas las fotos rasterizadas de public/ (media e images).
// Se ejecuta antes de dev y build (predev / prebuild). Las variantes NO se versionan: se regeneran en cada build.
// El loader de next/image (src/shared/media/image-loader.ts) apunta a estas variantes en lugar de
// transformar la foto original en la primera visita.
// Uso: node scripts/build-image-variants.mjs
import { readdir, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const SCAN_DIRS = ["media", "images"];
// Anchos de salida: miniaturas y tarjetas (384, 640), móvil (768), laptop (1200) y escritorio amplio (1920).
// Un ancho pedido se sirve con el primero que lo cubre: sin 384/640 una tarjeta de 170 px descargaba la foto de 768 px.
const BUCKETS = [384, 640, 768, 1200, 1920];
const RASTER = /\.(jpe?g|png|webp)$/i;
const VARIANT = /-w(384|640|768|1200|1920)\.webp$/;
const QUALITY = 74;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const sources = [];
for (const dir of SCAN_DIRS) {
  try {
    for (const file of await walk(path.join(publicDir, dir))) {
      if (RASTER.test(file) && !VARIANT.test(file)) sources.push(file);
    }
  } catch {
    /* carpeta ausente: nada que generar */
  }
}

let made = 0;
let skipped = 0;

/** Variantes de un original: se decodifica una sola vez y de ese mapa de píxeles salen todos los anchos. */
async function processFile(file) {
  const srcStat = await stat(file);
  const pending = [];
  for (const bucket of BUCKETS) {
    const target = file.replace(RASTER, `-w${bucket}.webp`);
    const outStat = await stat(target).catch(() => null);
    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) skipped++;
    else pending.push({ bucket, target });
  }
  if (!pending.length) return;
  const { data, info } = await sharp(file, { failOn: "none" }).rotate().raw().toBuffer({ resolveWithObject: true });
  const raw = { width: info.width, height: info.height, channels: info.channels };
  for (const { bucket, target } of pending) {
    await sharp(data, { raw })
      .resize({ width: Math.min(bucket, info.width), withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4, smartSubsample: true })
      .toFile(target);
    made++;
  }
}

// Varias fotos a la vez (el build de Vercel tiene 2 núcleos): antes cada variante volvía a decodificar el original
// y las fotos iban de una en una; con cinco anchos eso pasaba de 9 minutos por despliegue.
const queue = [...sources];
const workers = Math.min(6, Math.max(2, availableParallelism()));
await Promise.all(Array.from({ length: workers }, async () => {
  for (let file = queue.shift(); file; file = queue.shift()) await processFile(file);
}));
console.log(`Variantes de imagen: ${made} generadas, ${skipped} al día, ${sources.length} originales.`);
