import { expect, test } from "@playwright/test";

// Entrada "Línea de presión": solo en "/", una vez por sesión, nunca con movimiento reducido, sin bloquear nada.
test("se ve una vez en la portada, se retira sola y no tapa la llamada a la acción", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("html")).toHaveAttribute("data-intro", "", { timeout: 3000 });
  const capa = page.locator(".fx-intro");
  expect(await capa.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
  expect(await capa.evaluate((e) => e.querySelectorAll("img, image").length + (e.textContent ?? "").trim().length)).toBe(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/, { timeout: 4000 });
  await expect(capa).toBeHidden();
  await page.reload();
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/);
});

test("no se cruza con el título, las llamadas a la acción ni los controles del carrusel", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("html")).toHaveAttribute("data-intro", "", { timeout: 3000 });
  const capa = await page.locator(".fx-intro").boundingBox();
  expect(capa).not.toBeNull();
  for (const selector of ["#lp-hero-title", ".lp-hero__actions", ".lp-hero__controls"]) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box, selector).not.toBeNull();
    const overlaps = box!.y < capa!.y + capa!.height && box!.y + box!.height > capa!.y && box!.x < capa!.x + capa!.width && box!.x + box!.width > capa!.x;
    expect(overlaps, selector).toBe(false);
  }
});

test("no aparece fuera de la portada", async ({ page }) => {
  await page.goto("/contacto", { waitUntil: "commit" });
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/);
});

test.describe("con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });
  test("no aparece", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/);
    await expect(page.locator(".fx-intro")).toBeHidden();
  });
});
