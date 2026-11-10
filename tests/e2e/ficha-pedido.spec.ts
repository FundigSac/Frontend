import { expect, test } from "@playwright/test";

/** Evita que el aviso de cookies tape los controles que se prueban. */
async function dismissCookies(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Rechazar todas" }).click({ timeout: 2500 }).catch(() => {});
}

test("ficha: el pedido rápido agrega la válvula con DN y PN al carrito y sincroniza el plano", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta-fundigsac");
  await dismissCookies(page);
  await page.evaluate(() => localStorage.removeItem("fundigsac-quote"));

  const order = page.getByRole("group", { name: "Arma tu pedido" });
  await order.getByLabel("Diámetro (DN)").selectOption("DN150");
  await order.getByRole("button", { name: "PN10", exact: true }).click();
  await expect(order.getByRole("button", { name: "PN10", exact: true })).toHaveAttribute("aria-pressed", "true");

  // El DN elegido arriba es el mismo del plano y de las bridas.
  await expect(page.getByRole("heading", { name: "Bridas · DN150" })).toBeAttached();
  await expect(page.getByRole("img", { name: /Plano de la válvula DN150: L 210 mm/ })).toBeAttached();

  await order.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(order.getByRole("button", { name: "Agregado al carrito" })).toBeVisible();
  const drawer = page.getByRole("dialog", { name: /Tu carrito/ });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("Válvula de compuerta FUNDIGSAC");
  await expect(drawer).toContainText("DN150");

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("fundigsac-quote") ?? "[]"));
  expect(stored).toEqual([expect.objectContaining({ slug: "valvula-compuerta-fundigsac", variant: "DN150 · PN10", quantity: 1 })]);

  // La cotización sigue disponible como enlace único en la ficha.
  await expect(page.locator("main").getByRole("link", { name: "Solicitar cotización" })).toHaveAttribute("href", "/cotizar");
});

test("ficha con garantía extendida: dos flyers (volante y dado) con descarga, vista y elección del accionamiento", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida");
  await dismissCookies(page);
  await page.evaluate(() => localStorage.removeItem("fundigsac-quote"));

  const flyers = page.locator("#documentacion");
  await expect(flyers.getByRole("heading", { name: "Elige el accionamiento" })).toBeVisible();
  await expect(flyers.getByRole("article")).toHaveCount(2);
  // Solo los flyers de 1 página: la ficha de 2 páginas no se muestra en esta ruta.
  await expect(page.getByRole("button", { name: "Ver ficha en pantalla" })).toHaveCount(0);
  for (const [name, pdf] of [["volante (timón)", "/docs/flyer-valvula-compuerta-fundigsac-volante.pdf"], ["dado", "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf"]] as const) {
    await expect(flyers.getByRole("link", { name: `Descargar flyer con ${name}` })).toHaveAttribute("href", pdf);
    const res = await page.request.get(pdf);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  }

  // Volante es la opción 1 y la elegida por defecto; el botón de arriba baja su flyer.
  const order = page.getByRole("group", { name: "Arma tu pedido" });
  const acts = order.getByRole("group", { name: "Accionamiento" });
  await expect(acts.getByRole("button", { name: "Volante" })).toHaveAttribute("aria-pressed", "true");
  await expect(order.getByRole("link", { name: "Descargar ficha técnica" })).toHaveAttribute("href", /volante\.pdf$/);

  // "Usar en mi pedido" en el flyer del dado cambia el accionamiento y el documento de arriba.
  await flyers.getByRole("article", { name: "Con dado" }).getByRole("button", { name: "Usar en mi pedido" }).click();
  await expect(acts.getByRole("button", { name: "Dado" })).toHaveAttribute("aria-pressed", "true");
  await expect(flyers.getByRole("article", { name: "Con dado" }).getByRole("button", { name: "En tu pedido" })).toHaveAttribute("aria-pressed", "true");
  await expect(order.getByRole("link", { name: "Descargar ficha técnica" })).toHaveAttribute("href", /dado\.pdf$/);

  await order.getByRole("button", { name: "Agregar al carrito" }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("fundigsac-quote") ?? "[]"));
  expect(stored).toEqual([expect.objectContaining({ slug: "valvula-compuerta-fundigsac-garantia-extendida", variant: "DN100 · PN16 · Dado" })]);
  await page.keyboard.press("Escape");

  // Vista en pantalla del flyer, una sola página y sin navegación entre páginas.
  await flyers.getByRole("button", { name: "Ver flyer con volante (timón) en pantalla" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Vista del flyer" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Con volante (timón)");
  await expect(dialog.getByRole("button", { name: "Página siguiente" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("ficha con garantía extendida: las medidas siguen el catálogo del fabricante (sin las erratas de la ficha traducida)", async ({ page }) => {
  await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida");
  await dismissCookies(page);
  // Tabla completa: L BS5163 de DN600 es 508 (no 608).
  await expect(page.getByRole("row", { name: "DN600 390 800 508 1180 600" })).toBeAttached();
  const pick = (dn: string) => page.getByRole("button", { name: dn, exact: true }).click();
  // Extremo del vástago: T de DN40 es 29 y K de DN60/65 es 17,3.
  await pick("DN40");
  await expect(page.getByRole("row", { name: "20 14.3 × 14.3 M8 × 20 29" })).toBeVisible();
  await pick("DN60/65");
  await expect(page.getByRole("row", { name: "24 17.3 × 17.3 M10 × 20 33" })).toBeVisible();
  // Bridas PN16: DN80 lleva 8 pernos y DN200 agujeros de 23 mm.
  await pick("DN80");
  await expect(page.getByRole("row", { name: "PN16 200 160 132 16 3 8 × 19" })).toBeVisible();
  await pick("DN200");
  await expect(page.getByRole("row", { name: "PN16 340 295 266 17 3 12 × 23" })).toBeVisible();
});
