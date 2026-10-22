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

test.describe("buscador animado de la cabecera", () => {
  // Alrededor de 1280 y 1440 px la cabecera lleva menú y botón de cotización: abrir la barra no puede tapar ni empujar nada.
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    test(`abre un panel bajo la cabecera sin tapar ni mover nada a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
      const search = page.locator(".lp-search");
      const row = page.locator(".lp-header__bar");
      const before = await row.evaluate((el) => [...el.querySelectorAll("a, button, img")].filter((n) => !n.closest(".lp-search__panel")).map((n) => JSON.stringify(n.getBoundingClientRect())));
      await search.locator(".lp-header__search").click();
      await expect(search).toHaveClass(/is-open/);
      await expect(search.getByRole("searchbox")).toBeFocused();
      const panel = page.locator(".lp-search__panel");
      // El panel termina de crecer y queda dentro de la pantalla.
      await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(Math.min(300, width - 60));
      const box = (await panel.boundingBox())!;
      const header = (await page.locator(".lp-header").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
      // Ningún enlace, ícono ni botón de la fila de la cabecera se movió.
      const after = await row.evaluate((el) => [...el.querySelectorAll("a, button, img")].filter((n) => !n.closest(".lp-search__panel")).map((n) => JSON.stringify(n.getBoundingClientRect())));
      expect(after.length).toBe(before.length);
      expect(after.filter((r, i) => r !== before[i])).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("busca con Enter y se cierra con la X", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
    const search = page.locator(".lp-search");
    await search.locator(".lp-header__search").click();
    await search.getByRole("searchbox").fill("valvula");
    await search.locator(".lp-header__search").click();
    await expect(search).not.toHaveClass(/is-open/);
    await search.locator(".lp-header__search").click();
    await expect(search.getByRole("searchbox")).toHaveValue("");
    await search.getByRole("searchbox").fill("tapa");
    await search.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/\/productos\?q=tapa/);
  });
});
