// Optimiza las diez imágenes proporcionadas para la página de minería.
// Uso: node scripts/prepare-mining-media.mjs <carpeta de originales>
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const blur = {};
const report = [];
await mkdir(path.join(root, "public/media/mineria"), { recursive: true });
for (const [id, name] of files) {
  const source = await readFile(path.join(input, `codex-clipboard-${id}.png`));
  const image = sharp(source).rotate();
  const { data, info } = await image.clone().webp({ quality: 86, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(root, `public/media/mineria/${name}.webp`), data);
  const preview = await image.clone().resize({ width: 20 }).webp({ quality: 35 }).toBuffer();
  blur[`/media/mineria/${name}.webp`] = `data:image/webp;base64,${preview.toString("base64")}`;
  report.push({ image: name, width: info.width, height: info.height, originalBytes: source.length, webpBytes: data.length });
}
await writeFile(path.join(root, "src/app/industrias/mineria/media-blur.ts"),
  `// Generado por scripts/prepare-mining-media.mjs.\nexport const MINING_BLUR: Record<string, string> = ${JSON.stringify(blur, null, 2)};\n`);
console.log(JSON.stringify({ images: report, originalBytes: report.reduce((sum, i) => sum + i.originalBytes, 0), webpBytes: report.reduce((sum, i) => sum + i.webpBytes, 0) }, null, 2));
