// Agrega miniaturas difuminadas (20 px, WebP en base64) a un mapa para `placeholder="blur"` de next/image.
// Uso: node scripts/gen-blur.mjs [--out src/shared/media/blur-legal.ts --name BLUR_LEGAL] /media/legal /media/x.webp …
// Por defecto escribe en src/shared/media/blur.ts (BLUR). Los mapas viajan en el JS de quien los importa: conviene
// uno por área para que cada página cargue solo sus miniaturas. Conserva las entradas existentes; de una carpeta
// toma solo sus originales (no las variantes -wNNN).
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const RASTER = /\.(jpe?g|png|webp)$/i;
const VARIANT = /-w(384|640|768|1200|1920)\.webp$/;

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const outFile = path.join(root, option("out", "src/shared/media/blur.ts"));
const exportName = option("name", "BLUR");

const targets = [];
for (const arg of args) {
  const abs = path.join(publicDir, arg);
  if ((await stat(abs)).isDirectory()) {
    for (const name of await readdir(abs)) if (RASTER.test(name) && !VARIANT.test(name)) targets.push(path.posix.join(arg, name));
  } else targets.push(arg);
}

let source = await readFile(outFile, "utf8").catch(
  () => `/** Miniaturas difuminadas (generadas con scripts/gen-blur.mjs) para \`placeholder="blur"\`. */\nexport const ${exportName}: Record<string, string> = {\n};\n`,
);
let added = 0;
for (const src of targets) {
  if (source.includes(`"${src}":`)) continue;
  const buf = await sharp(path.join(publicDir, src), { failOn: "none" }).rotate().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
  source = source.replace(/\n};\s*$/, `\n  "${src}": "data:image/webp;base64,${buf.toString("base64")}",\n};\n`);
  added++;
}
await writeFile(outFile, source);
console.log(`${path.relative(root, outFile)}: ${added} miniaturas nuevas (${targets.length} revisadas).`);
