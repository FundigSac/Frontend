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
  // La lupa se abre en su sitio: lo que se ve en la fila (logo, menú, íconos) no se tapa, no se superpone y no se sale de la pantalla.
  for (const width of [320, 390, 768, 870, 1024, 1262, 1280, 1366, 1440, 1920]) {
    test(`abre en su lugar sin tapar ni desbordar la cabecera a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
      const search = page.locator(".lp-search");
      await expect(page.locator(".lp-header__search")).toBeVisible();
      await page.waitForTimeout(600);
      await page.locator(".lp-header__search").click();
      await expect(search).toHaveClass(/is-open/);
      await expect(search.getByRole("searchbox")).toBeFocused();
      // La cápsula termina de crecer (el campo llega a su ancho final).
      await expect.poll(async () => (await search.getByRole("searchbox").boundingBox())!.width).toBeGreaterThan(100);
      await page.waitForTimeout(700);
      const result = await page.evaluate(() => {
        const R = (e: Element) => e.getBoundingClientRect();
        const bar = R(document.querySelector(".lp-header__bar")!);
        const form = R(document.querySelector(".lp-search")!);
        const visible = (e: Element) => R(e).width > 2 && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).opacity !== "0";
        const others = [...document.querySelectorAll(".lp-header__bar a, .lp-header__bar button, .lp-header__bar img")].filter((e) => !e.closest(".lp-search") && visible(e));
        const overlaps = others.filter((e) => { const r = R(e); return r.left < form.right - 1 && r.right > form.left + 1; }).map((e) => e.className.toString().slice(0, 30) || e.tagName);
        const outside = others.filter((e) => R(e).right > bar.right + 2 || R(e).left < bar.left - 2).map((e) => e.className.toString().slice(0, 30) || e.tagName);
        return { overlaps, outside, formRight: form.right, barRight: bar.right, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(result.overlaps).toEqual([]);
      expect(result.outside).toEqual([]);
      expect(result.formRight).toBeLessThanOrEqual(result.barRight + 2);
      expect(result.overflow).toBeLessThanOrEqual(1);
    });
  }

  test("al pasar el mouse por la lupa se abre la barra y al salir se cierra", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
    const search = page.locator(".lp-search");
    await page.waitForTimeout(600);
    await page.locator(".lp-header__search").hover();
    await expect(search).toHaveClass(/is-open/);
    await page.mouse.move(700, 400);
    await expect(search).not.toHaveClass(/is-open/);
  });

  test("busca con Enter y se cierra con la X", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", { waitUntil: "domcontentloaded" });
    const search = page.locator(".lp-search");
    await page.waitForTimeout(600);
    await page.locator(".lp-header__search").click();
    await search.getByRole("searchbox").fill("valvula");
    await search.getByRole("button", { name: "Cerrar búsqueda" }).click();
    await expect(search).not.toHaveClass(/is-open/);
    await page.locator(".lp-header__search").click();
    await expect(search.getByRole("searchbox")).toHaveValue("");
    await search.getByRole("searchbox").fill("tapa");
    await search.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/\/productos\?q=tapa/);
  });
});
