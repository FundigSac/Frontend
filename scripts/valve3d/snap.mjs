// Captura el modelo con la cámara de cada foto (Chromium sin interfaz) y lo compone: foto | modelo | superpuesto.
// Uso: node scripts/valve3d/snap.mjs <carpeta-salida> [variante...]   (requiere scripts/valve3d/preview.mjs en marcha)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cámara aproximada de cada foto de galería: [foto, órbita, campo de visión, objetivo].
export const SHOTS = {
  hitaly: [
    ['media/valvula-hd/v-01.webp', '0deg 57deg 0.75m', '36deg', '0m 0.1m 0m'],
    ['media/valvula-hd/v-02.webp', '180deg 55deg 0.8m', '36deg', '0m 0.1m 0m'],
    ['media/valvula-hd/v-03.webp', '-25deg 4deg 0.95m', '34deg', '0m 0.12m 0m'],
    ['media/valvula-hd/v-04.webp', '95deg 45deg 0.75m', '38deg', '0m 0.1m 0m'],
    ['media/valvula-hd/v-05.webp', '90deg 40deg 0.75m', '38deg', '0m 0.1m 0m'],
  ],
  fundigsac: [
    ['media/valvula-fundigsac/f-07.webp', '0deg 80deg 0.72m', '37deg', '0m 0.1m 0m'],
    ['media/valvula-fundigsac/f-02.webp', '180deg 74deg 0.75m', '37deg', '0m 0.1m 0m'],
    ['media/valvula-fundigsac/f-03.webp', '0deg 3deg 0.95m', '34deg', '0m 0.12m 0m'],
    ['media/valvula-fundigsac/f-04.webp', '90deg 55deg 0.75m', '38deg', '0m 0.1m 0m'],
    ['media/valvula-fundigsac/f-06.webp', '52deg 64deg 0.75m', '38deg', '0m 0.1m 0m'],
  ],
  cuadrante: [
    ['media/valvula-fundigsac-cuadrante/q-01.webp', '0deg 78deg 0.78m', '36deg', '0m 0.125m 0m'],
    ['media/valvula-fundigsac-cuadrante/q-02.webp', '62deg 56deg 0.78m', '38deg', '0m 0.12m 0m'],
    ['media/valvula-fundigsac-cuadrante/q-03.webp', '180deg 74deg 0.78m', '36deg', '0m 0.125m 0m'],
    ['media/valvula-fundigsac-cuadrante/q-04.webp', '125deg 46deg 0.78m', '38deg', '0m 0.12m 0m'],
    ['media/valvula-fundigsac-cuadrante/q-05.webp', '0deg 1deg 0.9m', '34deg', '0m 0.12m 0m'],
  ],
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [outDir, ...picked] = process.argv.slice(2);
const variants = picked.length ? picked : Object.keys(SHOTS);
const W = 800, H = 1000, port = process.env.PREVIEW_PORT ?? '3191';
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const variant of variants) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/?v=${variant}&solo=0&only=model`);
  await page.waitForFunction(() => document.querySelector('model-viewer')?.loaded === true, null, { timeout: 120000 });
  const list = process.env.SNAP_SHOTS ? JSON.parse(process.env.SNAP_SHOTS) : SHOTS[variant];
  for (const [i, [photo, orbit, fov, target]] of list.entries()) {
    await page.evaluate(([o, f, t]) => { const mv = document.querySelector('model-viewer'); mv.cameraTarget = t; mv.cameraOrbit = o; mv.fieldOfView = f; mv.jumpCameraToGoal(); }, [orbit, fov, target]);
    await page.waitForTimeout(900);
    const shot = await page.locator('model-viewer').screenshot();
    const ref = await sharp(path.join(root, 'public', photo)).resize(W, H, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toBuffer();
    const model = await sharp(shot).resize(W, H, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toBuffer();
    const blend = await sharp(model).composite([{ input: await sharp(ref).ensureAlpha(0.5).png().toBuffer() }]).png().toBuffer();
    const sheet = await sharp({ create: { width: W * 3, height: H, channels: 3, background: '#fff' } })
      .composite([{ input: ref, left: 0, top: 0 }, { input: model, left: W, top: 0 }, { input: blend, left: W * 2, top: 0 }]).png().toBuffer();
    await sharp(sheet).resize(1500).jpeg({ quality: 86 }).toFile(path.join(outDir, `${variant}-${i + 1}.jpg`));
  }
  await page.close();
}
await browser.close();
console.log('capturas en', outDir);
