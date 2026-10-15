// Genera variantes WebP responsivas de las fotos de la página 404 en public/media/legal/404/.
// Se sirven como archivos estáticos (sin transformar en /_next/image en la primera visita).
// Uso: node scripts/optimize-404-images.mjs
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const legal = path.join(root, "public", "media", "legal");
const out = path.join(legal, "404");

const JOBS = [
  // Foto de fondo a pantalla completa: anchos 768 (móvil), 1200 (tablet/laptop) y 1672 (original).
  { src: "hero-404.webp", name: "hero-404", widths: [768, 1200, 1672], quality: 74 },
  // Miniaturas de las tarjetas (se muestran a 84–116 px CSS; 256 y 512 cubren hasta 2x).
  { src: "404-productos.webp", name: "404-productos", widths: [256, 512], quality: 72 },
  { src: "404-sectores.webp", name: "404-sectores", widths: [256, 512], quality: 72 },
  { src: "404-recursos.webp", name: "404-recursos", widths: [256, 512], quality: 72 },
];

await mkdir(out, { recursive: true });

for (const job of JOBS) {
  const input = path.join(legal, job.src);
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    const target = Math.min(width, meta.width ?? width);
    const file = path.join(out, `${job.name}-${width}.webp`);
    await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: 6, smartSubsample: true })
      .toFile(file);
    const { size } = await stat(file);
    console.log(`${path.relative(root, file)}  ${(size / 1024).toFixed(0)} KB  (${target}px)`);
  }
}
