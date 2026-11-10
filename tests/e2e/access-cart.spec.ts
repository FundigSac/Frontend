import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, performance: false, customization: false, version: 1, savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
}

/** Las cuentas con correo solo están activas con Backend; sin él estas pantallas son una vista previa. */
async function accountsEnabled(page: Page) {
  const res = await page.request.get("/api/auth/session");
  return ((await res.json()) as { accounts?: boolean }).accounts === true;
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("acceso: inicio de sesión valida, muestra el aviso y enlaza registro y recuperación", async ({ page, baseURL }) => {
  test.skip(await accountsEnabled(page), "Con Backend el ingreso es real: lo cubre backend-accounts.spec.ts.");
  await prepare(page, baseURL);
  const errors = trackErrors(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 2, name: "Inicia sesión" })).toBeVisible();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Ingresa tu correo electrónico.")).toBeVisible();
  await expect(page.getByText("Ingresa tu contraseña.")).toBeVisible();

  await page.getByLabel("Correo electrónico").fill("ingenieria@constructora.pe");
  await page.getByLabel("Contraseña", { exact: true }).fill("Secreto123");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("La zona de clientes llega muy pronto")).toBeVisible();

  // Google es el único inicio de sesión social (enlace a /api/auth/google).
  await expect(page.getByRole("link", { name: "Continuar con Google" })).toHaveAttribute("href", "/api/auth/google?from=login&hl=es");
  await expect(page.getByText("Facebook")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toHaveAttribute("href", "/recuperar");
  await expect(page.getByRole("link", { name: "Regístrate aquí" })).toHaveAttribute("href", "/registro");
  expect(errors).toEqual([]);
});

test("acceso: registro exige términos y mide la seguridad de la contraseña", async ({ page, baseURL }) => {
  test.skip(await accountsEnabled(page), "Con Backend el registro es real: lo cubre backend-accounts.spec.ts.");
  await prepare(page, baseURL);
  await page.goto("/registro");
  await expect(page.getByRole("link", { name: "Registrarme con Google" })).toHaveAttribute("href", /from=registro/);
  await expect(page.getByText("Facebook")).toHaveCount(0);
  await page.getByLabel("Nombres y apellidos").fill("María Quispe");
  await page.getByLabel("Correo electrónico").fill("maria@constructora.pe");
  await page.getByLabel("Contraseña", { exact: true }).fill("Fundig#2026x");
  await expect(page.getByRole("meter", { name: "Seguridad de la contraseña" })).toHaveAttribute("aria-valuetext", "Fuerte");
  await page.getByLabel("Confirmar contraseña").fill("Fundig#2026x");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Debes aceptar los términos para continuar.")).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check({ force: true });
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("La zona de clientes llega muy pronto")).toBeVisible();
});

test("acceso: recuperar y actualizar contraseña validan y avisan que las cuentas llegan pronto (sin éxito simulado)", async ({ page, baseURL }) => {
  test.skip(await accountsEnabled(page), "Con Backend la recuperación es real: lo cubre backend-accounts.spec.ts.");
  await prepare(page, baseURL);
  await page.goto("/recuperar");
  await page.getByLabel("Correo electrónico").fill("maria@constructora.pe");
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  // Solo hay acceso con Google: no se envía correo, así que no se muestra "Revisa tu correo".
  await expect(page.getByText("La zona de clientes llega muy pronto")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toHaveCount(0);

  await page.goto("/restablecer");
  await page.getByLabel("Nueva contraseña").fill("Fundig#2026x");
  await page.getByLabel("Confirmar contraseña").fill("Otra#2026");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();
  await page.getByLabel("Confirmar contraseña").fill("Fundig#2026x");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByText("La zona de clientes llega muy pronto")).toBeVisible();
  await expect(page.getByRole("heading", { name: "¡Contraseña actualizada!" })).toHaveCount(0);
});

test("carrito: agrega, cambia medida y cantidad, envía por WhatsApp y abre el panel desde la cabecera", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  const errors = trackErrors(page);
  await page.goto("/carrito");
  await expect(page.locator(".cp-empty").getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
  await page.locator(".ct-suggest li", { hasText: "Válvula de compuerta FUNDIGSAC" }).first().getByRole("button", { name: "Agregar" }).click();

  const item = page.locator(".cp-item").first();
  await expect(item).toContainText("Válvula de compuerta FUNDIGSAC");
  await item.getByLabel("Diámetro").selectOption("DN150");
  await item.getByRole("button", { name: "Sumar una unidad" }).click();
  await item.getByRole("button", { name: "Sumar una unidad" }).click();
  await expect(item.getByRole("spinbutton", { name: "Cantidad" })).toHaveValue("3");
  await expect(page.getByRole("link", { name: "Enviar lista por WhatsApp" })).toHaveAttribute("href", /3%20%C3%97%20V%C3%A1lvula%20de%20compuerta%20FUNDIGSAC%20\(DN150%20%C2%B7%20PN16\)/);

  // La cabecera cuenta las unidades y abre el panel lateral.
  const cartButton = page.locator(".lp-cart");
  await expect(cartButton).toHaveAttribute("aria-label", /\(3\)/);
  if (await page.locator(".lp-header__toggle").isVisible()) await expect(cartButton).toBeVisible();
  await cartButton.click();
  const drawer = page.getByRole("dialog", { name: /Tu carrito/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("DN150 · PN16")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('.cd[data-state="closed"]')).toHaveCount(1);

  await item.getByRole("button", { name: /Quitar/ }).click();
  await expect(page.locator(".cp-empty").getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
  expect(errors).toEqual([]);
});
