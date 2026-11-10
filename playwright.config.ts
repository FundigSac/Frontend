import { defineConfig, devices } from "@playwright/test";

const chromePath = process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined;
// PW_BASE_URL apunta a un servidor ya levantado (dev o start); sin ella se construye y arranca uno en :3100 sin Backend
// (BACKEND_URL=off; vacía no sirve: en Windows equivale a no definirla y Next usaría la de .env.local), así las pruebas
// del modo sin conexión no dependen del entorno. Las del Backend real (backend-*.spec.ts) usan PW_BASE_URL con un
// servidor que sí tiene BACKEND_URL.
const baseURL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3100";

// Nunca contra producción: varias pruebas envían formularios (cotización, consulta, reclamo, consentimiento) y en
// producción quedan como registros reales. Las previews de Vercel (`<proyecto>-git-<rama>-…` o `<proyecto>-<hash>-…`)
// sí se permiten. Con E2E_ALLOW_PROD_READONLY=1 corre igual, pero las pruebas que envían formularios se saltan y los
// envíos de pasada se cortan en el navegador (tests/e2e/_guard.ts).
function isProduction(url: string | undefined): boolean {
  if (!url) return false;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (["fundigsac-web.vercel.app", "fundigsac.com", "www.fundigsac.com"].includes(host)) return true;
  if (!host.endsWith(".vercel.app")) return false;
  const name = host.slice(0, -".vercel.app".length);
  if (!name.startsWith("fundigsac-")) return false;
  const preview = name.includes("-git-") || /^fundigsac-[a-z0-9-]*?-[a-z0-9]{9}-[a-z0-9-]+$/.test(name);
  return !preview;
}
if (isProduction(process.env.PW_BASE_URL) && process.env.E2E_ALLOW_PROD_READONLY !== "1") {
  throw new Error("No se corre la suite E2E contra producción: los formularios escriben datos reales.");
}

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
    // Los motores de Firefox y Safari (escritorio y iPhone): parte del público entra con ellos.
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "desktop-webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 15"] } },
  ],
  ...(process.env.PW_BASE_URL ? {} : { webServer: { command: "node scripts/build-image-variants.mjs && npx next build && npx next start --hostname 127.0.0.1 --port 3100", env: { BACKEND_URL: "off", LOCAL_HTTP_SERVER: "1" }, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 900_000 } }),
});
