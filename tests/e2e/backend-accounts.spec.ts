import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Recorrido real contra el Backend en Docker (API + PostgreSQL + Mailpit): registro, activación por correo, ingreso,
 * cierre de sesión y una cotización con folio. Solo corre si el sitio tiene BACKEND_URL; los enlaces de los correos se
 * leen de Mailpit (MAILPIT_URL, por defecto http://localhost:8025).
 *   PW_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/backend-accounts.spec.ts --project=desktop-chromium
 */
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
}

/** Enlace con token del último correo enviado a `to` (espera hasta 30 s: el despachador corre cada 5 s). */
async function linkFromMailpit(request: APIRequestContext, to: string, path: string): Promise<string> {
  const pattern = new RegExp(`${path}#token=[A-Za-z0-9_-]{20,}`);
  for (let i = 0; i < 15; i++) {
    const search = await (await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}&limit=5`)).json();
    for (const m of (search.messages ?? []) as { ID: string }[]) {
      const message = await (await request.get(`${MAILPIT}/api/v1/message/${m.ID}`)).json();
      const found = pattern.exec(String(message.Text ?? ""));
      if (found) return found[0];
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`No llegó el correo con ${path} a ${to}`);
}

test.beforeEach(async ({ request }) => {
  const session = await (await request.get("/api/auth/session")).json();
  test.skip(session.accounts !== true, "El sitio no tiene BACKEND_URL: estas pruebas necesitan el Backend en Docker.");
});

test("cuenta real: registro, activación por correo, ingreso y cierre de sesión", async ({ page, baseURL, request }) => {
  await prepare(page, baseURL);
  const email = `qa.${Date.now()}@empresa.pe`;
  const password = "Valvula-Ductil-2026!";

  await page.goto("/registro");
  await page.getByLabel("Nombres y apellidos").fill("Prueba Automatizada");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña").fill(password);
  await page.getByRole("checkbox", { name: /Acepto los/ }).check({ force: true });
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toBeVisible();

  // Sin activar, el ingreso explica qué falta y ofrece reenviar el enlace.
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Tu cuenta aún no está activa")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reenviar enlace de activación" })).toBeVisible();

  await page.goto(`/${await linkFromMailpit(request, email, "verificar-correo")}`);
  await expect(page.getByRole("heading", { name: "¡Cuenta activada!" })).toBeVisible();
  // El token se quita de la barra de direcciones tras usarlo.
  await expect(page).toHaveURL(/\/verificar-correo$/);

  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("Clave-Equivocada-1");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Correo o contraseña incorrectos.", { exact: false })).toBeVisible();
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByRole("heading", { name: "Ya iniciaste sesión" })).toBeVisible();

  // Las dos cookies son httpOnly y la de la API solo viaja a /api.
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === "fundigsac-session");
  const api = cookies.find((c) => c.name === "fundigsac-api");
  expect(session?.httpOnly).toBe(true);
  expect(api?.httpOnly).toBe(true);
  expect(api?.path).toBe("/api");
  expect(await page.evaluate(() => document.cookie)).not.toContain("fundigsac-api");

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Inicia sesión" })).toBeVisible();
  expect((await page.context().cookies()).some((c) => c.name === "fundigsac-api")).toBe(false);
});

test("cotización real: el folio lo asigna la API y la confirmación lo verifica", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.goto("/productos");
  await page.evaluate(() =>
    localStorage.setItem("fundigsac-quote", JSON.stringify([{ slug: "acople-gran-rango-agr", name: "Acople gran rango AGR", variant: "DN100 · 105–125 mm", quantity: 8 }])),
  );
  await page.goto("/cotizar");
  const form = page.locator("#cotizacionForm");
  await form.locator("[name=razonSocial]").fill("Constructora Andina SAC");
  await form.locator("[name=rucEmpresa]").fill("20131312955");
  await form.locator("[name=tipoProyecto]").selectOption("saneamiento");
  await form.locator("[name=departamentoDestino]").fill("Arequipa");
  await form.locator("[name=nombreSolicitante]").fill("Prueba Automatizada");
  await form.locator("[name=cargoSolicitante]").fill("Compras");
  await form.locator("[name=correoCorporativo]").fill("compras.qa@andina.pe");
  await form.locator("[name=celularContacto]").fill("+51 987 654 321");
  await form.locator("[name=familiaPrincipal]").selectOption("valvulas");
  await form.locator("[name=diametrosNominales]").fill("DN100");
  await form.locator("[name=cantidadMetrado]").fill("8 unidades");
  await form.locator("[name=consentimiento]").check({ force: true });
  await form.locator("button[type=submit]").click();

  await expect(page).toHaveURL(/\/cotizar\/confirmacion\?ref=COT-\d{4}-\d{6}$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solicitud registrada");
  const folio = new URL(page.url()).searchParams.get("ref") ?? "";
  await expect(page.locator("#folio-code")).toHaveText(folio);
  // El carrito se vacía tras registrar la solicitud, y otro folio en la URL no se muestra como registrado.
  expect(await page.evaluate(() => localStorage.getItem("fundigsac-quote"))).toBeNull();
  await page.goto("/cotizar/confirmacion?ref=COT-2026-000001");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("No hay una solicitud registrada");
});
