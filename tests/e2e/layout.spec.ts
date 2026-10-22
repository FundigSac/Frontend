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
  // Alrededor de 1280 y 1440 px la cabecera lleva menú y botón de cotización: abrir la barra no puede empujarlos ni desbordar.
  for (const width of [1024, 1280, 1440, 1920]) {
    test(`abre sin mover la cabecera ni desbordar a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
      const search = page.locator(".lp-search");
      const actions = page.locator(".lp-header__actions");
      const before = await actions.boundingBox();
      await search.getByRole("button", { name: "Buscar" }).click();
      await expect(search).toHaveClass(/is-open/);
      await expect(search.getByRole("searchbox")).toBeFocused();
      // La cápsula termina de crecer: su ancho animado llega al valor final.
      await expect.poll(() => search.evaluate((el) => parseFloat(getComputedStyle(el, "::before").width))).toBeGreaterThan(200);
      const after = await actions.boundingBox();
      expect(after).toEqual(before);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const quote = page.locator(".lp-header__quote");
      if (await quote.isVisible()) {
        const box = await quote.boundingBox();
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
    });
  }

  test("en móvil cubre la cabecera con fondo opaco y se cierra con la X", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
    const search = page.locator(".lp-search");
    await search.getByRole("button", { name: "Buscar" }).click();
    await expect(search).toHaveClass(/is-open/);
    const header = await page.locator(".lp-header").boundingBox();
    const bar = await search.boundingBox();
    expect(bar!.x).toBeLessThanOrEqual(1);
    expect(bar!.width).toBeGreaterThanOrEqual(388);
    expect(bar!.height).toBeGreaterThanOrEqual(header!.height - 2);
    const alpha = await search.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(alpha).not.toMatch(/rgba\(.*,\s*0\)$|transparent/);
    await search.getByRole("searchbox").fill("valvula");
    await search.getByRole("button", { name: "Cerrar búsqueda" }).click();
    await expect(search).not.toHaveClass(/is-open/);
    await expect(search.getByRole("searchbox")).toHaveValue("");
  });
});
