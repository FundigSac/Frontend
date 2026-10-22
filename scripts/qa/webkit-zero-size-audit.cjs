// Detecta, con el motor de Safari (WebKit), elementos con aspect-ratio que miden 0 × 0 (fotos invisibles en iPhone).
// Uso: node scripts/qa/webkit-zero-size-audit.cjs http://localhost:3000 / /productos /nosotros
// Requiere `npx playwright install webkit`. Chrome es más permisivo: este caso solo se ve en WebKit.
const { webkit, devices } = require("playwright-core");

const [base, ...routes] = process.argv.slice(2);
if (!base || !routes.length) {
  console.error("Uso: node scripts/qa/webkit-zero-size-audit.cjs <baseURL> <ruta> [<ruta>...]");
  process.exit(2);
}

(async () => {
  const browser = await webkit.launch();
  let problems = 0;
  for (const width of [402, 768, 1100]) {
    const context = await browser.newContext({ ...devices["iPhone 14 Pro"], viewport: { width, height: 874 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(900);
      const bad = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll("main *, footer *").forEach((el) => {
          const css = getComputedStyle(el);
          if (css.aspectRatio === "auto" || css.display === "none" || css.display === "contents") return;
          const r = el.getBoundingClientRect();
          if ((r.width < 2 || r.height < 2) && !el.closest("[hidden],[inert],[class*=\"pin\"]")) out.push(`${String(el.className.baseVal ?? el.className).slice(0, 60)} aspect-ratio=${css.aspectRatio} ${Math.round(r.width)}x${Math.round(r.height)}`);
        });
        return out;
      });
      for (const item of new Set(bad)) {
        problems++;
        console.log(`${width}px ${route}  ${item}`);
      }
    }
    await context.close();
  }
  await browser.close();
  console.log(problems ? `${problems} elemento(s) con tamaño 0` : "Sin elementos de tamaño 0");
  process.exit(problems ? 1 : 0);
})();
