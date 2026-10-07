import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const views = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
try {
  for (const view of views) {
    const context = await browser.newContext({ viewport: { width: view.width, height: view.height } });
    const page = await context.newPage();
    const response = await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded", timeout: 20_000 });
    if (!response || response.status() >= 400) throw new Error(`Mirror homepage returned ${response?.status() ?? "no response"}`);
    await page.evaluate(() => document.fonts.ready);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < pageHeight; y += view.height * 0.8) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(root, "legacy", "screenshots", view.name, "home.png"),
      fullPage: true,
      animations: "disabled",
      timeout: 30_000,
    });
    await context.close();
    console.log(`${view.name}: ${response.status()} http://localhost:4173/`);
  }
} finally {
  await browser.close();
}
