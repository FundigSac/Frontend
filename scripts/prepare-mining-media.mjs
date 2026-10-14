// Optimiza las diez imágenes proporcionadas para la página de minería.
// Uso: node scripts/prepare-mining-media.mjs <carpeta de originales>
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const input = process.argv[2];
if (!input) throw new Error("Indica la carpeta con las diez imágenes originales.");
const files = [
  ["6632c945-845b-4845-9b5a-2070c5ec8834", "valvula-mina"],
  ["5e490fbe-5d5b-4a30-b7d7-89e37cfd1a1a", "hero-planta"],
  ["15856cca-d9b7-4d43-820f-25d7c40ae188", "valvula-planta"],
  ["f5645a2c-4ac1-4879-8385-5e4975a6d648", "agua-proceso"],
  ["45b00a39-c5d3-4d37-8464-dc63c35a3173", "recirculacion"],
  ["7ce80106-a966-4714-a12f-a555e6fc292e", "tuberias-hdpe"],
  ["b0935bda-c328-4ae7-aeca-3da01b97e685", "acople-bridado"],
  ["59f67f4e-7bec-43a3-be53-ec9cbbb108d1", "valvula-proceso"],
  ["f15a9354-fae5-447d-b4b2-e0777ebb4d9c", "catalogo-mineria"],
  ["17c8d7a4-6e92-42ca-b693-d1be3d511d9b", "planta-atardecer"],
];
const prepared = {};
const generatedFiles = new Set();
const report = [];
const widths = [384, 640, 828, 1080, 1448, 1672, 1920, 2172];
const qualities = { "agua-proceso": 72, recirculacion: 72, "valvula-mina": 70, "tuberias-hdpe": 70, "acople-bridado": 70, "valvula-proceso": 70, "planta-atardecer": 60 };
await mkdir(path.join(root, "public/media/mineria"), { recursive: true });
await mkdir(path.join(root, "public/media/mineria/responsive"), { recursive: true });
for (const [id, name] of files) {
  const source = await readFile(path.join(input, `codex-clipboard-${id}.png`));
  const image = sharp(source).rotate();
  const { data, info } = await image.clone().webp({ quality: 86, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(root, `public/media/mineria/${name}.webp`), data);
  const variants = { avif: [], webp: [] };
  const quality = qualities[name] ?? 75;
  for (const width of [...new Set([...widths.filter((w) => w < info.width), info.width])]) {
    for (const format of ["avif", "webp"]) {
      // La escala de calidad de AVIF es distinta de WebP; equivale al ajuste del optimizador de Next.
      const formatQuality = format === "avif" ? Math.max(Math.round(quality * (50 / 80)), 1) : quality;
      const buffer = await image.clone().resize({ width, withoutEnlargement: true })[format]({ quality: formatQuality, effort: 4 }).toBuffer();
      const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
      const filename = `${name}-${width}-${hash}.${format}`;
      generatedFiles.add(filename);
      await writeFile(path.join(root, "public/media/mineria/responsive", filename), buffer);
      variants[format].push({ width, src: `/media/mineria/responsive/${filename}`, bytes: buffer.length });
    }
  }
  prepared[`/media/mineria/${name}.webp`] = {
    width: info.width,
    height: info.height,
    src: variants.webp.find((v) => v.width >= 828).src,
    srcSet: variants.webp.map((v) => `${v.src} ${v.width}w`).join(", "),
    avifSrcSet: variants.avif.map((v) => `${v.src} ${v.width}w`).join(", "),
  };
  report.push({ image: name, width: info.width, height: info.height, originalBytes: source.length, webpBytes: data.length });
}
await writeFile(path.join(root, "src/app/industrias/mineria/media-responsive.ts"),
  `// Generado por scripts/prepare-mining-media.mjs: variantes listas antes de servir la página.\nimport type { PreparedImage } from "../_sector/sector-image";\n\nexport const MINING_IMAGES: Record<string, PreparedImage> = ${JSON.stringify(prepared, null, 2)};\n`);
// Retira únicamente variantes antiguas de este generador, después de guardar el manifiesto nuevo.
const responsiveDir = path.resolve(root, "public/media/mineria/responsive");
if (path.dirname(responsiveDir) !== path.resolve(root, "public/media/mineria")) throw new Error("Ruta de variantes inválida.");
for (const filename of await readdir(responsiveDir)) {
  const owned = files.some(([, name]) => new RegExp(`^${name}-\\d+-[a-f0-9]{12}\\.(avif|webp)$`).test(filename));
  if (owned && !generatedFiles.has(filename)) await unlink(path.join(responsiveDir, filename));
}
console.log(JSON.stringify({ images: report, originalBytes: report.reduce((sum, i) => sum + i.originalBytes, 0), webpBytes: report.reduce((sum, i) => sum + i.webpBytes, 0) }, null, 2));
