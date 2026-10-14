import base from "./playwright.config";
import { defineConfig } from "@playwright/test";

// Solo uso local: reutiliza el Chromium ya instalado cuando la versión de Playwright pide otro build.
const executablePath = process.env.PW_CHROME_PATH;
export default defineConfig({
  ...base,
  use: { ...base.use, launchOptions: executablePath ? { executablePath } : {} },
});
