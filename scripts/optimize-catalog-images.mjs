// Genera variantes WebP responsivas de las fotos de fondo del catálogo (/productos) en public/media/productos-page/.
// El hero y la banda de soporte son background-image CSS: se sirven como estáticos y se precargan desde la página.
// Uso: node scripts/optimize-catalog-images.mjs
import { stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "public", "media", "productos-page");

const JOBS = [
  // Hero del catálogo: 1200 px para móvil y 1600 px para escritorio.
  { src: "productos1.jpg", name: "productos1", widths: [1200, 1600], quality: 72 },
  // Banda de soporte del catálogo.
  { src: "productos7.jpg", name: "productos7", widths: [1200, 1600], quality: 72 },
];

for (const job of JOBS) {
  const input = path.join(dir, job.src);
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    const target = Math.min(width, meta.width ?? width);
    const file = path.join(dir, `${job.name}-${width}.webp`);
    await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: 6, smartSubsample: true })
      .toFile(file);
    const { size } = await stat(file);
    console.log(`${path.relative(root, file)}  ${(size / 1024).toFixed(0)} KB  (${target}px)`);
  }
}
