import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, performance: false, customization: false, version: 1, savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("eliminar cuenta: explica el proceso con base legal y enlaza las vías de solicitud", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  const errors = trackErrors(page);
  await page.goto("/eliminar-cuenta");
  await expect(page).toHaveTitle(/Eliminar cuenta y datos personales/);
  await expect(page.getByRole("heading", { level: 1, name: "Eliminar tu cuenta y tus datos" })).toBeVisible();
  await expect(page.getByText("Art. 69.3 · D.S. 016-2024-JUS")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lo que borramos y lo que la ley nos obliga a conservar" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir en Facebook/ })).toHaveAttribute("href", "https://www.facebook.com/settings?tab=applications");
  await expect(page.getByRole("link", { name: /Abrir en Google/ })).toHaveAttribute("href", "https://myaccount.google.com/connections");
  await expect(page.getByRole("link", { name: /Escribir un correo/ })).toHaveAttribute("href", /^mailto:cotizaciones@fundigsac\.com\?subject=Eliminar/);
  // Enlazada desde el pie de página de todo el sitio.
  await expect(page.locator("footer").getByRole("link", { name: "Eliminar cuenta" })).toHaveAttribute("href", "/eliminar-cuenta");
  expect(errors).toEqual([]);
});

test("eliminar cuenta: borra la cotización y la conversación guardadas en este dispositivo", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.addInitScript(() => {
    if (sessionStorage.getItem("dl-seeded")) return;
    sessionStorage.setItem("dl-seeded", "1");
    localStorage.setItem("fundigsac-quote", JSON.stringify([{ slug: "valvula-compuerta", name: "Válvula compuerta", quantity: 2 }]));
    sessionStorage.setItem("fundigsac-assistant-v1", JSON.stringify([
      { id: "u1", role: "user", content: "Hola", status: "done" },
      { id: "a1", role: "assistant", content: "¡Hola!", status: "done" },
    ]));
  });
  await page.goto("/eliminar-cuenta");
  const device = page.locator(".dl-device__card");
  await expect(device.getByText("1 producto")).toBeVisible();
  await expect(device.getByText("2 mensajes")).toBeVisible();

  await device.getByRole("button", { name: "Borrar datos de este dispositivo" }).click();
  await expect(device.getByText("¿Confirmas? Esta acción no se puede deshacer.")).toBeVisible();
  await device.getByRole("button", { name: "Sí, borrar ahora" }).click();
  await expect(device.getByText("Listo: este dispositivo quedó limpio")).toBeVisible();
  await expect(device.getByText("Vacía")).toBeVisible();
  await expect(device.getByText("Sin mensajes")).toBeVisible();
  expect(await page.evaluate(() => [localStorage.getItem("fundigsac-quote"), sessionStorage.getItem("fundigsac-assistant-v1")])).toEqual([null, null]);
});

test("eliminar cuenta: el formulario prepara la solicitud con código y envío por correo", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.goto("/eliminar-cuenta");
  const form = page.getByRole("form", { name: "Formulario de solicitud de eliminación de cuenta y datos" });
  await form.getByLabel("Nombres y apellidos").fill("Ana Torres Quispe");
  await form.getByLabel("Correo asociado a tu cuenta").fill("ana.torres@constructora.pe");
  // La cabecera fija puede tapar la opción al desplazarse: se elige la opción directamente, como lo haría el teclado.
  const pick = (name: RegExp) => form.getByRole("radio", { name }).evaluate((el) => (el as HTMLInputElement).click());
  await pick(/^Facebook/);
  await pick(/^Solo mi cuenta/);
  await form.getByRole("button", { name: "Preparar mi solicitud" }).click();
  // Sin confirmar que la eliminación es definitiva, no avanza.
  await expect(page.getByRole("heading", { name: "Tu solicitud está lista" })).toBeHidden();
  await form.getByRole("checkbox", { name: /Entiendo que la eliminación es definitiva/ }).evaluate((el) => (el as HTMLInputElement).click());
  await form.getByRole("button", { name: "Preparar mi solicitud" }).click();

  const ready = page.locator("#solicitud-lista");
  await expect(ready.getByRole("heading", { name: "Tu solicitud está lista" })).toBeVisible();
  const code = (await ready.locator(".dl-ready__code").textContent()) ?? "";
  expect(code).toMatch(/^ELIM-\d{8}-[2-9A-HJKMNP-Z]{4}$/);
  const mailto = decodeURIComponent((await ready.getByRole("link", { name: "Enviar por correo" }).getAttribute("href")) ?? "");
  expect(mailto).toContain("mailto:cotizaciones@fundigsac.com");
  expect(mailto).toContain(code);
  expect(mailto).toContain("Inicio de sesión con Facebook");
  expect(mailto).toContain("Solicito la eliminación de mi cuenta (perfil de acceso y sesión)");
  await ready.getByRole("button", { name: "Editar la solicitud" }).click();
  await expect(form.getByLabel("Nombres y apellidos")).toHaveValue("Ana Torres Quispe");
});
