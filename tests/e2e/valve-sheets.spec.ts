import { expect, test } from "@playwright/test";
import { VALVE_SHEETS } from "../../src/modules/catalog/valve-sheets";

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "fundigsac-consent", value: consent, url: baseURL! }]);
});

test.describe("fichas de válvulas con datos de la lista de precios", () => {
  for (const sheet of VALVE_SHEETS) {
    test(`${sheet.slug}: HTML rastreable, canonical, Product y CTA`, async ({ page }) => {
      const path = `/productos/valvulas/${sheet.slug}`;
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      // El HTML del servidor ya trae el contenido (no depende de JavaScript).
      const html = await response!.text();
      expect(html).toContain(`<h1 id="ficha-title">${sheet.es.name}</h1>`);
      expect(html).toContain(sheet.code);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(sheet.es.name);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      await expect(page.getByRole("img", { name: sheet.es.imageAlt })).toBeVisible();
      await expect(page.getByRole("link", { name: "Válvulas", exact: true }).first()).toHaveAttribute("href", "/productos/valvulas");

      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)).flat();
      const product = ld.find((d) => d["@type"] === "Product");
      expect(product).toMatchObject({ name: sheet.es.name, sku: sheet.code });
      // Sin precios ni reseñas inventadas.
      expect(product.offers).toBeUndefined();
      expect(product.aggregateRating).toBeUndefined();

      const whatsapp = page.getByRole("link", { name: "Cotizar por WhatsApp" });
      await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
      await page.getByRole("button", { name: "Agregar a cotización", exact: true }).click();
      const stored = await page.evaluate(() => localStorage.getItem("fundigsac-quote"));
      expect(stored).toContain(sheet.slug);
    });
  }

  test("las tarjetas de /productos/valvulas enlazan a cada ficha", async ({ page }) => {
    await page.goto("/productos/valvulas");
    for (const sheet of VALVE_SHEETS) {
      await expect(page.locator(`main article a[href="/productos/valvulas/${sheet.slug}"]`).first()).toBeAttached();
    }
  });

  test("en inglés la ficha cambia de idioma", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fundigsac-lang", "en"));
    await page.goto("/productos/valvulas/valvula-check-swing");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Swing check valve");
    await expect(page.getByRole("heading", { name: "Technical specifications" })).toBeVisible();
  });
});
