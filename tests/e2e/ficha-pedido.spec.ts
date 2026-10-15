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
