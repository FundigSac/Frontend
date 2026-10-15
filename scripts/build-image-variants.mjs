// Genera variantes WebP responsivas de todas las fotos rasterizadas de public/ (media e images).
// Se ejecuta antes de dev y build (predev / prebuild). Las variantes NO se versionan: se regeneran en cada build.
// El loader de next/image (src/shared/media/image-loader.ts) apunta a estas variantes en lugar de
// transformar la foto original en la primera visita.
// Uso: node scripts/build-image-variants.mjs
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const SCAN_DIRS = ["media", "images"];
// Anchos de salida: móvil, laptop y escritorio amplio. Un ancho pedido se sirve con el primero que lo cubre.
const BUCKETS = [768, 1200, 1920];
const RASTER = /\.(jpe?g|png|webp)$/i;
const VARIANT = /-w(768|1200|1920)\.webp$/;
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
for (const file of sources) {
  const meta = await sharp(file, { failOn: "none" }).metadata();
  const originalWidth = meta.width ?? Infinity;
  for (const bucket of BUCKETS) {
    const target = file.replace(RASTER, `-w${bucket}.webp`);
    const [srcStat, outStat] = await Promise.all([stat(file), stat(target).catch(() => null)]);
    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      continue;
    }
    await sharp(file, { failOn: "none" })
      .rotate()
      .resize({ width: Math.min(bucket, originalWidth), withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4, smartSubsample: true })
      .toFile(target);
    made++;
  }
}
console.log(`Variantes de imagen: ${made} generadas, ${skipped} al día, ${sources.length} originales.`);
