import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL("../docs/qa/captures/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === "darwin" ? { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } : {}) });
const screens = [
  ["home", "/"],
  ["catalogo", "/productos"],
  ["valvulas", "/productos/valvulas"],
  ["valvula-compuerta", "/productos/valvulas/valvula-compuerta"],
  ["contacto", "/contacto"],
];

for (const theme of ["light", "dark"]) {
  for (const [name, path] of screens) {
    for (const [viewport, settings] of [["desktop", { viewport: { width: 1440, height: 1000 } }], ["mobile", devices["Pixel 7"]]]) {
      const context = await browser.newContext(settings);
      await context.addInitScript((value) => localStorage.setItem("fundigsac-theme", value), theme);
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:3100${path}`, { waitUntil: "networkidle" });
      await page.screenshot({ path: join(output, `${name}-${viewport}-${theme}.png`), fullPage: true });
      await context.close();
    }
  }
}

await browser.close();
