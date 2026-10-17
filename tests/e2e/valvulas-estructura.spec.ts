import { expect, test, type Page } from "@playwright/test";

/** Evita que el aviso de cookies tape los controles que se prueban. */
async function dismissCookies(page: Page) {
  await page.getByRole("button", { name: "Rechazar todas" }).click({ timeout: 2500 }).catch(() => {});
}

/** Tarjetas de válvula del listado (excluye la tarjeta de descarga del catálogo). */
const valveCards = (page: Page) => page.locator("main article").filter({ has: page.getByRole("link", { name: /^(Ver|Solicitar) ficha$/ }) });

const NO_OVERFLOW = () => document.documentElement.scrollWidth <= window.innerWidth + 1;

test.describe("listado de válvulas: estructura", () => {
  test("hero con eyebrow, franja de 4 características, tarjetas con rango y beneficios", async ({ page }) => {
    await page.goto("/productos/valvulas");
    await dismissCookies(page);
    await expect(page.getByRole("heading", { level: 1, name: "Válvulas" })).toBeVisible();
    await expect(page.getByText("Nuestras soluciones", { exact: true })).toBeVisible();
    for (const label of ["Alta resistencia", "Cumplimiento", "Variedad de", "Soporte técnico"]) await expect(page.getByText(label).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Catálogo de válvulas" })).toBeVisible();

    // Solo las tres compuertas con ficha aprobada muestran el rango de diámetros.
    const cards = valveCards(page);
    await expect(cards).toHaveCount(8);
    await expect(cards.filter({ hasText: "DN40 – DN600" })).toHaveCount(2);
    await expect(cards.filter({ hasText: "DN50 – DN600" })).toHaveCount(1);
    await expect(cards.first().getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta");

    // Banda de asesoría: dos botones a Contacto; franja de beneficios.
    await expect(page.getByRole("link", { name: "Solicitar asesoría" })).toHaveAttribute("href", "/contacto");
    await expect(page.getByRole("link", { name: "Contáctanos" })).toHaveAttribute("href", "/contacto");
    for (const label of ["Asesoría técnica", "Productos certificados", "Stock disponible", "Soluciones a medida"]) await expect(page.getByText(label).first()).toBeAttached();
    expect(await page.evaluate(NO_OVERFLOW)).toBe(true);
  });

  test("filtrar por familia y buscar siguen funcionando con las tarjetas nuevas", async ({ page }) => {
    await page.goto("/productos/valvulas");
    await dismissCookies(page);
    await page.getByRole("tab", { name: /Compuerta/ }).click();
    await expect(valveCards(page)).toHaveCount(3);
    await page.getByRole("tab", { name: /Compuerta/ }).click();
    await expect(valveCards(page)).toHaveCount(8);
    await page.getByPlaceholder(/Buscar válvula/).fill("mariposa");
    await expect(valveCards(page)).toHaveCount(1);
    await page.getByPlaceholder(/Buscar válvula/).fill("zzz");
    await expect(page.getByRole("status").filter({ hasText: "No encontramos" })).toBeVisible();
  });

  test("en inglés se traducen eyebrow, características y botones", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fundigsac-lang", "en"));
    await page.goto("/productos/valvulas");
    await dismissCookies(page);
    await expect(page.getByText("Our solutions", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Valve catalog" })).toBeVisible();
    await expect(page.getByText("Standards").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact us" })).toBeVisible();
  });
});

for (const [slug, name, range, thumbsAlt] of [
  ["valvula-compuerta", "Válvula de compuerta bridada", "DN40 – DN600", /^Ver Válvula de compuerta bridada/],
  ["valvula-compuerta-fundigsac", "Válvula de compuerta bridada FUNDIGSAC", "DN50 – DN600", /^Ver Válvula de compuerta bridada FUNDIGSAC/],
  ["valvula-compuerta-fundigsac-garantia-extendida", "Válvula de compuerta bridada FUNDIGSAC", "DN40 – DN600", /^Ver Válvula de compuerta bridada FUNDIGSAC/],
] as const) {
  test.describe(`ficha ${slug}: estructura`, () => {
    test("galería, franja de datos, pestañas y CTAs", async ({ page }) => {
      await page.goto(`/productos/valvulas/${slug}`);
      await dismissCookies(page);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);

      // Galería: 5 fotos + tarjeta de 3D; la foto principal es la primera imagen de <main>.
      const thumbs = page.getByRole("group", { name: "Fotos de la válvula" }).getByRole("button");
      await expect(thumbs).toHaveCount(5);
      await expect(thumbs.first()).toHaveAttribute("aria-label", thumbsAlt);
      await expect(page.getByRole("button", { name: "Ver en 3D" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Ampliar" })).toBeVisible();

      // Franja de datos con 4 valores.
      await expect(page.getByRole("list", { name: "Datos principales" }).locator("> li")).toHaveCount(4);

      // CTAs: una sola cotización y la ficha técnica (descarga o solicitud).
      await expect(page.locator("main").getByRole("link", { name: "Solicitar cotización" })).toHaveAttribute("href", "/cotizar");
      await expect(page.locator("main").getByRole("link", { name: /ficha técnica/i }).first()).toBeVisible();
      // la banda de asesoría solo informa: no lleva botones ni tarjeta de contacto
      await expect(page.locator("main").getByRole("link", { name: "Solicitar asesoría" })).toHaveCount(0);

      // Rango del selector de diámetros.
      await expect(page.getByText(range, { exact: true }).first()).toBeVisible();
      expect(await page.evaluate(NO_OVERFLOW)).toBe(true);
    });

    test("la documentación va en una fila compacta con descarga y vista en pantalla", async ({ page, isMobile }) => {
      await page.goto(`/productos/valvulas/${slug}`);
      await dismissCookies(page);
      const doc = page.locator("#documentacion");
      await expect(doc.getByRole("link", { name: /Descargar ficha técnica/ })).toHaveAttribute("href", /\.pdf$/);
      await expect(doc.getByRole("button", { name: "Ver ficha en pantalla" })).toBeVisible();
      // compacta: no ocupa media pantalla
      expect((await doc.boundingBox())!.height).toBeLessThan(isMobile ? 420 : 260);
      await expect(page.getByRole("navigation", { name: "Secciones de la ficha" })).toHaveCount(0);
    });

    test("el selector de diámetro actualiza la fila resaltada y las bridas", async ({ page }) => {
      await page.goto(`/productos/valvulas/${slug}`);
      await dismissCookies(page);
      await page.getByRole("button", { name: "DN100", exact: true }).click();
      await expect(page.getByRole("button", { name: "DN100", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("heading", { name: "Bridas · DN100" })).toBeVisible();
    });
  });
}

test("ficha: Vista 3D alterna con las fotos y una miniatura vuelve a la foto", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta");
  await dismissCookies(page);
  const toggle = page.getByRole("button", { name: "Ver en 3D" });
  await toggle.click();
  await expect(page.getByRole("button", { name: "Volver a las fotos" })).toHaveAttribute("aria-pressed", "true");
  await page.locator("[role='list'] button[role='listitem']").nth(2).click();
  await expect(page.getByRole("button", { name: "Ver en 3D" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("main model-viewer")).toHaveCount(0);
});

test("ficha: la documentación abre la previsualización del PDF con Escape", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta");
  await dismissCookies(page);
  await page.getByRole("button", { name: "Previsualizar la ficha técnica" }).click();
  await expect(page.getByRole("dialog", { name: "Previsualización de la ficha técnica" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Previsualización de la ficha técnica" })).toBeHidden();
});

test("ficha en tema oscuro: tarjetas con fondo oscuro y foto clara, sin desborde", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta");
  await dismissCookies(page);
  await page.evaluate(() => { document.documentElement.dataset.lpTheme = "dark"; });
  const bg = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).backgroundColor);
  const luminance = (rgb: string) => { const [r, g, b] = rgb.match(/\d+/g)!.map(Number); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  expect(luminance(await bg("main"))).toBeLessThan(0.2);
  expect(luminance(await bg("main table"))).toBeLessThan(0.3);
  expect(await page.evaluate(NO_OVERFLOW)).toBe(true);
});

test("movimiento reducido: la ficha y el listado muestran todo sin esperar animaciones", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const route of ["/productos/valvulas", "/productos/valvulas/valvula-compuerta"]) {
    await page.goto(route);
    const hidden = await page.evaluate(() => [...document.querySelectorAll("main [data-reveal]")].filter((e) => getComputedStyle(e).opacity === "0").length);
    expect(hidden).toBe(0);
  }
  await context.close();
});
