import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { safeStem } from "./utils/crawl-shared";

type Crawl = { pages: { url: string; status: number | null }[] };
const root = process.cwd();
const crawl = JSON.parse(await readFile(path.join(root, "reports/crawl/pages.json"), "utf8")) as Crawl;
const views = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const failures: { url: string; viewport: string; error: string }[] = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const view of views) {
    const context = await browser.newContext({ viewport: { width: view.width, height: view.height }, deviceScaleFactor: 1 });
    await context.addInitScript("globalThis.__name ??= (fn) => fn;");
    const page = await context.newPage();
    for (const item of crawl.pages) {
      if (item.status === null) { failures.push({ url: item.url, viewport: view.name, error: "No successful page response during crawl" }); continue; }
      try {
        const localUrl = `http://localhost:4173${new URL(item.url).pathname}`;
        await page.goto(localUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
        await Promise.race([page.evaluate(() => document.fonts.ready), new Promise((resolve) => setTimeout(resolve, 4_000))]);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += view.height * 0.8) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(100);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await Promise.race([page.evaluate(async () => {
          await Promise.all([...document.images].filter((image) => image.loading !== "lazy" || image.getBoundingClientRect().top < innerHeight * 2).map((image) => image.decode().catch(() => undefined)));
        }), new Promise((resolve) => setTimeout(resolve, 4_000))]);
        await page.screenshot({ path: path.join(root, "legacy", "screenshots", view.name, `${safeStem(item.url)}.png`), fullPage: true, animations: "disabled", timeout: 30_000 });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ url: item.url, viewport: view.name, error: message });
        console.warn(`Capture failed (${view.name}) ${item.url}: ${message}`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(path.join(root, "reports/crawl/capture-errors.json"), JSON.stringify({ attempted: crawl.pages.length * views.length, succeeded: crawl.pages.length * views.length - failures.length, failures }, null, 2), "utf8");
console.log(`Capture complete: ${crawl.pages.length * views.length - failures.length}/${crawl.pages.length * views.length} screenshots saved.`);
