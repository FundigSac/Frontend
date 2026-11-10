import { expect, test, type Page } from "@playwright/test";
import { blockWritesIfReadOnly } from "./_guard";
import { CATALOG_CELLS, FAMILIES, cellsOfFamily, findCatalogSheet, type FamilySlug } from "../../src/modules/catalog/public-catalog";
import { VALVE_SHEETS } from "../../src/modules/catalog/valve-sheets";

// Familias y fichas que solo existían en el rediseño plano, reconstruidas con el diseño del 4 de noviembre.
blockWritesIfReadOnly(test);

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "fundigsac-consent", value: consent, url: baseURL! }]);
});

const NEW_FAMILIES: readonly FamilySlug[] = ["accesorios-hdpe", "conexiones-y-fittings", "equipos-termofusion", "medidores"];
/** Productos con pantalla propia (W06, fichas de válvula y referencias W07–W09): las cubren otros archivos. */
const OWN_SCREEN = new Set(["valvula-compuerta", "valvula-compuerta-fundigsac", "valvula-compuerta-fundigsac-garantia-extendida", "valvula-mariposa", "tuberia-tyton", "marco-tapa-d400", ...VALVE_SHEETS.map((s) => s.slug)]);
const GENERIC = CATALOG_CELLS.filter((c) => !OWN_SCREEN.has(c.slug));

async function noHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

test.describe("familias del catálogo con diseño del 4 de noviembre", () => {
  for (const slug of NEW_FAMILIES) {
    const family = FAMILIES.find((f) => f.slug === slug)!;
    test(`${slug}: título, todas las tarjetas con su ficha, sin desborde a 390 y 1280 px`, async ({ page }) => {
      const cells = cellsOfFamily(slug);
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(family.href);
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(family.title.es);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${family.href}$`));
        await expect(page.locator("[data-cell]")).toHaveCount(cells.length);
        for (const cell of cells) await expect(page.locator(`[data-cell="${cell.slug}"] a`).first()).toHaveAttribute("href", cell.href);
        expect(await noHorizontalOverflow(page), `${family.href} @ ${width}px`).toBe(true);
      }
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)).flat();
      expect(ld.find((d) => d["@type"] === "ItemList")?.itemListElement).toHaveLength(cells.length);
      expect(ld.find((d) => d["@type"] === "BreadcrumbList")).toBeTruthy();
    });
  }

  test("el buscador de la familia filtra las tarjetas", async ({ page }) => {
    await page.goto("/productos/equipos-termofusion");
    const first = cellsOfFamily("equipos-termofusion")[0];
    await page.locator("main").getByRole("searchbox").fill(first.code ?? first.name.es);
    await expect(page.locator(`[data-cell="${first.slug}"]`)).toBeVisible();
    expect(await page.locator("[data-cell]").count()).toBeLessThan(cellsOfFamily("equipos-termofusion").length);
  });

  test("el menú Productos, el pie y el mapa del sitio llevan a las familias nuevas", async ({ page }) => {
    await page.goto("/mapa-del-sitio");
    for (const slug of NEW_FAMILIES) await expect(page.locator(`main a[href="/productos/${slug}"]`).first()).toBeVisible();
    // En /productos las tarjetas de familia filtran en la misma página (diseño del 4 de noviembre): el acceso es el menú.
    await page.goto("/productos");
    for (const slug of NEW_FAMILIES) await expect(page.locator(`header a[href="/productos/${slug}"]`).first()).toBeAttached();
    for (const slug of NEW_FAMILIES) await expect(page.locator(`footer a[href="/productos/${slug}"]`)).toHaveCount(1);
  });
});

test.describe("fichas genéricas del catálogo", () => {
  test.setTimeout(600_000);
  for (const family of FAMILIES) {
    const cells = GENERIC.filter((c) => c.family === family.slug);
    if (cells.length === 0) continue;
    test(`${family.slug}: cada ficha tiene H1, foto, CTA y no se desborda (${cells.length})`, async ({ page }) => {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        for (const cell of cells) {
          const response = await page.goto(cell.href);
          expect(response?.status(), cell.href).toBe(200);
          await expect(page.getByRole("heading", { level: 1 }), cell.href).toHaveText(cell.name.es);
          await expect(page.getByRole("button", { name: "Agregar a cotización" })).toBeVisible();
          expect(await noHorizontalOverflow(page), `${cell.href} @ ${width}px`).toBe(true);
        }
      }
    });
  }

  test("la llamada a cotizar guarda el producto y la medida, y abre el carrito", async ({ page }) => {
    const cell = GENERIC.find((c) => (findCatalogSheet(c.slug)?.variants.es.length ?? 0) > 1)!;
    const sheet = findCatalogSheet(cell.slug)!;
    await page.goto(cell.href);
    // Hasta 18 medidas se eligen con chips (B10-2); con más, con la lista desplegable.
    const sizes = page.getByRole("group", { name: "Medida" });
    if (sheet.variants.es.length <= 18) await sizes.getByRole("radio", { name: sheet.variants.es[1], exact: true }).check();
    else await page.getByRole("combobox", { name: "Elige la medida" }).selectOption({ label: sheet.variants.es[1] });
    await page.getByRole("button", { name: "Agregar a cotización" }).click();
    await expect(page.getByRole("dialog", { name: /Tu carrito/ })).toBeVisible();
    const stored: { slug: string; variant?: string }[] = JSON.parse((await page.evaluate(() => localStorage.getItem("fundigsac-quote"))) ?? "[]");
    // La medida va tal cual y, si la ficha publica la presión, se le suma (cartVariant).
    const expected = sheet.pressure && !/PN\d/.test(sheet.variants.es[1]) ? `${sheet.variants.es[1]} · ${sheet.pressure}` : sheet.variants.es[1];
    expect(stored).toContainEqual(expect.objectContaining({ slug: cell.slug, variant: expected }));
    await expect(page.getByRole("link", { name: "Cotizar por WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
  });

  test("datos estructurados: Product sin precios ni reseñas y migas con la familia", async ({ page }) => {
    const cell = GENERIC.find((c) => c.family === "medidores")!;
    await page.goto(cell.href);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)).flat();
    const product = ld.find((d) => d["@type"] === "Product");
    expect(product).toMatchObject({ name: cell.name.es });
    expect(product.offers).toBeUndefined();
    expect(product.aggregateRating).toBeUndefined();
    const crumbs = ld.find((d) => d["@type"] === "BreadcrumbList").itemListElement.map((i: { name: string }) => i.name);
    expect(crumbs).toEqual(["Inicio", "Productos", "Medidores", cell.name.es]);
  });

  // El sitemap y robots solo se activan con SITE_INDEXABLE=true: los cubre tests/unit/catalog/sitemap.test.ts.
  test("las fichas por confirmar avisan que los datos están por confirmar", async ({ page }) => {
    const cell = GENERIC.find((c) => c.status === "por-confirmar");
    test.skip(!cell, "No hay fichas por confirmar con pantalla genérica.");
    await page.goto(cell!.href);
    await expect(page.getByText("Esta ficha está por confirmar")).toBeVisible();
  });
});
