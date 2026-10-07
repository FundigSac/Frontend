import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.SITE_ORIGIN ?? "http://localhost:3000";
const output = join(process.cwd(), "docs", "visual-review");
const pages = [
  { path: "/", name: "home" },
  { path: "/productos", name: "catalog" },
  { path: "/productos/codo-hdpe-termofusion-90-sdr11", name: "hdpe" },
];
const viewports = [
  { name: "desktop", width: 1536, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const target of pages) {
      await page.goto(new URL(target.path, origin).toString(), { waitUntil: "domcontentloaded" });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += viewport.height * 0.7) {
        await page.evaluate((position) => window.scrollTo(0, position), y);
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined))));
      const broken = await page.evaluate(() => Array.from(document.images).filter((image) => image.naturalWidth === 0).map((image) => image.currentSrc));
      if (broken.length) throw new Error(`Imágenes rotas en ${target.path}: ${broken.join(", ")}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: join(output, `${target.name}-${viewport.name}-checked.png`), fullPage: true });
      console.log(`${target.path} ${viewport.name}: imágenes cargadas`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
