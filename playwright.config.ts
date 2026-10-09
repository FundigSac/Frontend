import { defineConfig, devices } from "@playwright/test";

const chromePath = process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined;
// PW_BASE_URL apunta a un servidor ya levantado (dev o start); sin ella se construye y arranca uno en :3100.
const baseURL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  timeout: 120_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: process.env.PW_REPORT_DIR ?? "playwright-report" }]],
  outputDir: process.env.PW_OUTPUT_DIR ?? "test-results",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", launchOptions: chromePath ? { executablePath: chromePath } : {} },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  ...(process.env.PW_BASE_URL ? {} : { webServer: { command: "node_modules/.bin/next build && node_modules/.bin/next start --hostname 127.0.0.1 --port 3100", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 900_000 } }),
});
