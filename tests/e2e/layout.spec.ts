import { expect, test, type Page } from "@playwright/test";

/** Páginas de marca revisadas en todos los anchos: sin desbordes horizontales ni imágenes rotas. */
const ROUTES = [
  "/",
  "/industrias/agricultura",
  "/industrias/saneamiento",
  "/industrias/mineria",
  "/terminos",
  "/privacidad",
  "/cookies",
  "/reclamaciones",
  "/mapa-del-sitio",
  "/ruta-que-no-existe",
];
const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

async function loadEverything(page: Page) {
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((i) => ((i as HTMLImageElement).loading = "eager"));
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

test.describe("diseño responsive", () => {
  for (const route of ROUTES) {
    test(`sin desbordes ni imágenes rotas en ${route}`, async ({ page }) => {
      test.setTimeout(180_000);
      const failures: string[] = [];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await loadEverything(page);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const broken = [...document.images].filter((i) => i.getBoundingClientRect().width > 0 && i.complete && i.naturalWidth === 0).map((i) => i.currentSrc.slice(-60));
          return { overflow: doc.scrollWidth - doc.clientWidth, broken };
        });
        if (result.overflow > 1) failures.push(`${width}px: desborde horizontal de ${result.overflow}px`);
        if (result.broken.length) failures.push(`${width}px: imágenes rotas ${result.broken.join(", ")}`);
      }
      expect(failures).toEqual([]);
    });
  }
});
