import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

// IP distinta por ejecución: evita el límite de 5 envíos / 10 min por cliente al repetir la suite.
const fakeIp = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
test.use({ extraHTTPHeaders: { "x-forwarded-for": fakeIp } });

/** Espera a que React haya hidratado el elemento (tiene `__reactFiber$…`). */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"));
  }, selector);
}

const go = async (page: Page, url: string, hydrateSelector?: string) => {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  if (hydrateSelector) await hydrated(page, hydrateSelector);
};

const cards = (page: Page) => page.locator("article.resource-card");

test.describe("W13 Recursos técnicos", () => {
  test("filtros de tipo y familia con estado ARIA y sin descargas pendientes", async ({ page }) => {
    await go(page, "/recursos", "#resource-search");
    const articles = page.locator("section[aria-label=\"Documentos técnicos\"] article");
    await expect(articles).toHaveCount(6);
    await expect(page.getByRole("link", { name: /Descargar/ })).toHaveCount(0);

    const fichas = page.getByRole("button", { name: "Fichas técnicas" });
    await expect(fichas).toHaveAttribute("aria-pressed", "false");
    await fichas.click();
    await expect(fichas).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Todos los documentos" })).toHaveAttribute("aria-pressed", "false");
    await expect(articles).toHaveCount(2);
    await expect(page.getByRole("status").filter({ hasText: "2 documentos en preparación." })).toHaveCount(1);

    await page.getByRole("group", { name: "Filtrar por familia de producto" }).getByRole("button", { name: "Marcos y tapas" }).click();
    await expect(articles).toHaveCount(1);
    await expect(articles.first()).toContainText("Documentos de inspección y ensayo");
  });

  test("búsqueda de texto, estado vacío y restablecer filtros", async ({ page }) => {
    await go(page, "/recursos", "#resource-search");
    const articles = page.locator("section[aria-label=\"Documentos técnicos\"] article");
    await page.locator("#resource-search").fill("xyz-no-existe");
    await expect(articles).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "No encontramos documentos" })).toBeVisible();

    await page.getByRole("button", { name: "Fichas técnicas" }).click();
    await page.getByRole("button", { name: "Restablecer filtros" }).first().click();
    await expect(articles).toHaveCount(6);
    await expect(page.locator("#resource-search")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Todos los documentos" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Todas", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("el teclado opera los filtros (Enter sobre el botón de familia)", async ({ page }) => {
    await go(page, "/recursos", "#resource-search");
    const articles = page.locator("section[aria-label=\"Documentos técnicos\"] article");
    const tuberias = page.getByRole("button", { name: "Tuberías", exact: true });
    await tuberias.focus();
    await page.keyboard.press("Enter");
    await expect(tuberias).toHaveAttribute("aria-pressed", "true");
    await expect(articles).toHaveCount(2);
  });
});

test.describe("W14 Detalle de recurso", () => {
  test("compartir copia el enlace y avisa; la migas de pan y el retorno llevan a recursos", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "permisos de portapapeles sólo en chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await go(page, "/recursos/detalle-tecnico", "#btn-share");
    await page.locator("#btn-share").click();
    await expect(page.getByRole("status").filter({ hasText: "Enlace técnico copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());

    await expect(page.getByRole("navigation", { name: "Migas de pan" }).getByRole("link", { name: "Recursos técnicos" })).toHaveAttribute("href", "/recursos");
    await expect(page.getByRole("link", { name: "Volver a Recursos" })).toHaveAttribute("href", "/recursos");
  });

  test("si el portapapeles no está disponible muestra la URL para copiar manualmente", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denegado")) }, configurable: true });
      document.execCommand = () => false;
    });
    await go(page, "/recursos/detalle-tecnico", "#btn-share");
    await page.locator("#btn-share").click();
    await expect(page.getByRole("status").filter({ hasText: "Copie la URL" })).toBeVisible();
  });
});

test.describe("W15 Contacto", () => {
  test("canales reales: teléfono, correo, WhatsApp y cotización, con el mapa de inicio", async ({ page }) => {
    await go(page, "/contacto", "#contacto-form");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contáctanos");
    const channels = page.getByRole("region", { name: "Canales de contacto" });
    await expect(channels.getByRole("link", { name: /Llámanos/ })).toHaveAttribute("href", "tel:+51908849664");
    await expect(channels.getByRole("link", { name: /Escríbenos/ })).toHaveAttribute("href", "mailto:cotizaciones@fundigsac.com");
    await expect(channels.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
    await expect(channels.getByRole("link", { name: /Solicita una cotización/ })).toHaveAttribute("href", "/cotizar");
    await expect(page.locator(".ct-map iframe")).toHaveAttribute("src", /google\.com\/maps\?q=Jir%C3%B3n%20Acomayo/);
    await expect(page.getByRole("link", { name: /Ver en Google Maps/ })).toHaveAttribute("href", /google\.com\/maps\/search/);
    await expect(page.getByText("Jirón Acomayo N° 199, Lote 18, Mz. E")).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Solicitar una cotización" })).toHaveAttribute("href", "/cotizar");
  });

  test("motivo=reunion muestra el motivo y documento precarga el mensaje", async ({ page }) => {
    await go(page, "/contacto?motivo=reunion", "#contacto-form");
    await expect(page.locator(".ct-reason")).toContainText("Solicitud de reunión");
    await expect(page.locator('textarea[name="message"]')).toHaveValue("");
    await go(page, "/contacto?documento=Ficha%20T%C3%A9cnica%20X", "#contacto-form");
    await expect(page.locator(".ct-reason")).toContainText("Solicitud de documentación");
    await expect(page.locator('textarea[name="message"]')).toHaveValue("Solicito el documento: Ficha Técnica X");
    await go(page, "/contacto?motivo=hack", "#contacto-form");
    await expect(page.locator(".ct-reason")).toHaveCount(0);
  });

  test("validación nativa bloquea el envío vacío", async ({ page }) => {
    await go(page, "/contacto", "#contacto-form");
    await page.getByRole("button", { name: /Enviar mensaje/ }).click();
    await expect(page.locator("#contacto-listo")).toHaveCount(0);
    expect(await page.locator('input[name="fullName"]').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await page.locator('input[name="phone"]').fill("abc");
    expect(await page.locator('input[name="phone"]').evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
  });

  test("el mensaje queda listo para enviar por correo o WhatsApp (sin folio inventado) y se puede editar", async ({ page }) => {
    await go(page, "/contacto?motivo=reunion", "#contacto-form");
    const form = page.locator("#contacto-form");
    await form.locator('input[name="fullName"]').fill("Ing. Prueba");
    await form.locator('input[name="companyName"]').fill("Consorcio Prueba S.A.C.");
    await form.locator('input[name="position"]').fill("Jefe de Compras");
    await form.locator('input[name="email"]').fill("compras@prueba.com.pe");
    await form.locator('input[name="phone"]').fill("+51 987 654 321");
    await form.locator('textarea[name="message"]').fill("Necesito reunirme para ver válvulas DN150.");
    await form.getByRole("button", { name: /Enviar mensaje/ }).click();

    const ready = page.locator("#contacto-listo");
    await expect(ready).toBeVisible();
    await expect(ready.getByRole("link", { name: /Enviar por correo/ })).toHaveAttribute("href", /^mailto:cotizaciones@fundigsac\.com\?subject=Consulta%20de%20contacto%20FUNDIGSAC/);
    await expect(ready.getByRole("link", { name: /Enviar por WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
    await ready.getByText("Ver el texto que se enviará").click();
    await expect(ready.locator("pre")).toContainText("Motivo: Solicitud de reunión");
    await expect(ready.locator("pre")).toContainText("Empresa: Consorcio Prueba S.A.C.");
    await expect(ready.locator("pre")).toContainText("Necesito reunirme para ver válvulas DN150.");
    await expect(ready).not.toContainText(/COT-|REC-|CON-/);
    await ready.getByRole("button", { name: "Editar mis datos" }).click();
    await expect(page.locator("#contacto-form")).toBeVisible();
    await expect(form.locator('input[name="fullName"]')).toHaveValue("Ing. Prueba");
  });

  test("el selector cambia la pantalla a inglés y vuelve a español", async ({ page, isMobile }) => {
    await go(page, "/contacto", "#contacto-form");
    const pick = async (name: string) => {
      if (isMobile) {
        await page.getByRole("button", { name: "Abrir menú" }).or(page.getByRole("button", { name: "Open menu" })).click();
        await page.locator(".lp-mobile").getByRole("button", { name, exact: true }).click();
        await page.getByRole("button", { name: "Cerrar menú" }).or(page.getByRole("button", { name: "Close menu" })).click();
      } else {
        await page.locator(".lp-lang__btn").click();
        await page.locator(".lp-lang__menu").getByRole("button", { name, exact: true }).click();
      }
    };
    await pick("English");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact us");
    await expect(page.getByRole("button", { name: /Send message/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Find us in Lima" })).toBeVisible();
    await expect(page.getByText("Jirón Acomayo N° 199, Lot 18, Block E")).toBeVisible();
    await pick("Español");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contáctanos");
  });
});

async function fillQuoteGeneral(page: Page) {
  await page.locator("#razonSocial").fill("Consorcio Prueba E2E S.A.C.");
  await page.locator("#rucEmpresa").fill("20100070970");
  await page.locator("#tipoProyecto").selectOption("saneamiento");
  await page.locator("#departamentoDestino").fill("Lima");
  await page.locator("#nombreSolicitante").fill("Ing. Prueba");
  await page.locator("#cargoSolicitante").fill("Jefe de Compras");
  await page.locator("#correoCorporativo").fill("compras@prueba.com.pe");
  await page.locator("#celularContacto").fill("+51 987 654 321");
  await page.locator("#familiaPrincipal").selectOption("valvulas");
  await page.locator("#diametrosNominales").fill("DN 150");
  await page.locator("#cantidadMetrado").fill("12 unds");
  await page.locator("#consentimiento").check();
}

test.describe("W16 / W17 / W24 Cotización", () => {
  test("cotización general: validación nativa del RUC y envío → confirmación", async ({ page }) => {
    await go(page, "/cotizar", "#razonSocial");

    await page.getByRole("button", { name: /Enviar solicitud/ }).click();
    await expect(page).toHaveURL(/\/cotizar$/);
    expect(await page.locator("#razonSocial").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    await fillQuoteGeneral(page);
    await page.locator("#rucEmpresa").fill("123");
    await page.getByRole("button", { name: /Enviar solicitud/ }).click();
    expect(await page.locator("#rucEmpresa").evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
    await page.locator("#rucEmpresa").fill("20100070970");

    await page.getByRole("button", { name: /Enviar solicitud/ }).click();
    await page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-\d{4}-\d{6}/, { timeout: 60_000 });
    // no se expone información personal en la confirmación
    await expect(page.locator("main")).not.toContainText("compras@prueba.com.pe");
    await expect(page.locator("main")).not.toContainText("Consorcio Prueba E2E");
  });

  test("producto precargado: título por slug, RUC y envío", async ({ page }) => {
    await go(page, "/cotizar?producto=tuberia-tyton", "#input-qty");
    await expect(page).toHaveTitle(/Tyton/);

    const today = await page.evaluate(() => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));

    await page.locator("#ruc").fill("20100070970");

    await page.locator("#input-qty").fill("4");
    await page.locator("#razon-social").fill("Consorcio Producto E2E");
    await page.locator("#contact-name").fill("Ing. Prueba");
    await page.locator("#email").fill("residente@prueba.com.pe");
    await page.locator("#phone").fill("987654321");
    await page.locator("#delivery-place").fill("Almacén Lima");
    await page.locator("#delivery-date").fill(today);
    await page.locator('input[name="declaroQueLaInformacion"]').check();
    await page.getByRole("button", { name: /Enviar solicitud/ }).click();
    await page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-/, { timeout: 60_000 });
  });

  test("un slug desconocido muestra la cotización general (sin inyectar datos)", async ({ page }) => {
    await go(page, "/cotizar?producto=<img src=x>", "#razonSocial");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/cotizaci/i);
    await expect(page.locator("img[src='x']")).toHaveCount(0);
  });

  test("confirmación: sin folio o con folio no válido muestra estado honesto y enlace a una nueva solicitud", async ({ page }) => {
    await go(page, "/cotizar/confirmacion");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No hay una solicitud registrada");
    await expect(page.locator('main a[href="/cotizar"]').first()).toBeVisible();
    await go(page, "/cotizar/confirmacion?ref=COT-2026-999999x");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No hay una solicitud registrada");
    await go(page, "/cotizar/confirmacion?ref=REC-2026-000001x");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No hay una solicitud registrada");
    // folio de marcador de la etapa de diseño: nada se guardó, no se presenta como registro
    await go(page, "/cotizar/confirmacion?ref=COT-0000-000000");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solicitud pendiente de conexión");
    await expect(page.locator("#folio-code")).toHaveText("Sin folio");
  });
});

test.describe("W18 Libro de Reclamaciones", () => {
  test("hoja de reclamación: datos del proveedor, tipo accesible, validación nativa y solicitud lista para enviar", async ({ page }) => {
    await go(page, "/reclamaciones");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Libro de Reclamaciones");

    await hydrated(page, "#reclamaciones-form");
    const form = page.locator("#reclamaciones-form");
    // Datos del proveedor (Anexo I del D.S. 101-2022-PCM)
    await expect(form.locator(".lg-provider")).toContainText("20601839281");
    await expect(form.locator(".lg-provider")).toContainText("Fundición y Desarrollo de Ingeniería y Gestión S.A.C.");
    await expect(form.getByRole("radio", { name: /Reclamo/ })).toBeChecked();
    await expect(form.getByText("Disconformidad relacionada con los productos o servicios.")).toBeVisible();
    await expect(form.getByText("Malestar o descontento respecto a la atención al público.")).toBeVisible();
    await form.getByRole("radio", { name: /Queja/ }).check();
    await expect(form.getByRole("radio", { name: /Reclamo/ })).not.toBeChecked();
    await expect(form.getByRole("button", { name: /Enviar queja/ })).toBeVisible();
    await form.getByRole("radio", { name: /Reclamo/ }).check();

    // validación nativa: campos obligatorios vacíos
    await form.getByRole("button", { name: /Enviar reclamo/ }).click();
    await expect(page.locator(".lg-success")).toHaveCount(0);
    expect(await form.locator('input[name="nombresYApellidosRazon"]').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    await form.locator('input[name="nombresYApellidosRazon"]').fill("Usuario de Prueba");
    await form.locator('select[name="tipoDeDocumento"]').selectOption("DNI");
    // el DNI exige 8 dígitos
    await form.locator('input[name="numeroDeDocumento"]').fill("1234");
    expect(await form.locator('input[name="numeroDeDocumento"]').evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
    await form.locator('input[name="numeroDeDocumento"]').fill("72489102");
    await form.locator('input[name="correoElectronico"]').fill("prueba@correo.pe");
    await form.locator('input[name="telefonoDeContacto"]').fill("+51 987 654 321");
    await form.locator('input[name="domicilioLegalOHabitual"]').fill("Av. Prueba 123, Lima");
    await expect(form.getByRole("radio", { name: "Producto", exact: true })).toBeChecked();
    await form.locator('select[name="descripcionDelProductoO"]').selectOption("Válvulas");
    await form.locator('input[name="fechaDelSuceso"]').fill("2026-10-10");
    await form.locator('input[name="montoReclamado"]').fill("1500.50");
    await form.locator('textarea[name="detalleDeLosHechos"]').fill("Detalle de prueba automatizada.");
    await form.locator('textarea[name="pedidoConcretoOPretension"]').fill("Respuesta técnica formal.");

    // la declaración y el consentimiento son obligatorios
    await form.getByRole("button", { name: /Enviar reclamo/ }).click();
    expect(await form.locator('input[name="consentimientoLeyN29733"]').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await form.locator('input[name="consentimientoLeyN29733"]').check();
    await form.getByRole("button", { name: /Enviar reclamo/ }).click();

    // Con base de datos: folio REC real. Sin ella: solicitud lista para enviar por correo o WhatsApp (nunca un folio inventado).
    const success = page.locator(".lg-success");
    const ready = page.locator("#reclamo-listo");
    await expect(success.or(ready)).toBeVisible({ timeout: 60_000 });
    if (await success.isVisible()) {
      await expect(success).toContainText(/REC-\d{4}-\d{6}/);
    } else {
      await expect(ready.getByRole("link", { name: /Enviar por correo/ })).toHaveAttribute("href", /^mailto:cotizaciones@fundigsac\.com\?subject=Reclamo/);
      await expect(ready.getByRole("link", { name: /Enviar por WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
      await expect(ready.locator("pre")).toContainText("Usuario de Prueba");
      await expect(ready.locator("pre")).toContainText("Monto reclamado: S/ 1,500.50");
      await expect(ready.locator("pre")).toContainText("RUC: 20601839281");
      await ready.getByRole("button", { name: "Editar mis datos" }).click();
      await expect(page.locator("#reclamaciones-form")).toBeVisible();
      await expect(form.locator('input[name="nombresYApellidosRazon"]')).toHaveValue("Usuario de Prueba");
    }
  });

  test("la queja pide el lugar de atención (no el bien ni el monto) y el menor de edad debe indicar a su representante", async ({ page }) => {
    await go(page, "/reclamaciones");
    await hydrated(page, "#reclamaciones-form");
    const form = page.locator("#reclamaciones-form");

    await form.getByRole("radio", { name: /Queja/ }).check();
    await expect(form.getByText("Atención recibida")).toBeVisible();
    await expect(form.locator('select[name="lugarDeAtencion"]')).toBeVisible();
    await expect(form.locator('select[name="descripcionDelProductoO"]')).toHaveCount(0);
    await expect(form.locator('input[name="montoReclamado"]')).toHaveCount(0);
    await form.getByRole("radio", { name: /Reclamo/ }).check();
    await expect(form.locator('input[name="montoReclamado"]')).toBeVisible();
    await expect(form.locator('select[name="lugarDeAtencion"]')).toHaveCount(0);

    // menor de edad: aparecen los datos del padre, madre o representante y son obligatorios
    await expect(form.locator('input[name="representanteNombre"]')).toHaveCount(0);
    await form.getByLabel(/Soy menor de edad/).check();
    await expect(form.locator('input[name="representanteNombre"]')).toBeVisible();
    expect(await form.locator('input[name="representanteNombre"]').evaluate((el: HTMLInputElement) => el.required)).toBe(true);
    expect(await form.locator('input[name="representanteDocumento"]').evaluate((el: HTMLInputElement) => el.required)).toBe(true);
    await form.getByLabel(/Soy menor de edad/).uncheck();
    await expect(form.locator('input[name="representanteNombre"]')).toHaveCount(0);

    // el tipo de documento define el formato del número
    await form.locator('select[name="tipoDeDocumento"]').selectOption("RUC");
    await form.locator('input[name="numeroDeDocumento"]').fill("20601839281");
    expect(await form.locator('input[name="numeroDeDocumento"]').evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
    await form.locator('input[name="numeroDeDocumento"]').fill("2060183928");
    expect(await form.locator('input[name="numeroDeDocumento"]').evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
  });

  test("avisos legales: plazo de 15 días hábiles, copia por correo, vía INDECOPI", async ({ page }) => {
    await go(page, "/reclamaciones");
    const notices = page.locator(".lg-notices");
    await expect(notices).toContainText("quince (15) días hábiles");
    await expect(notices).toContainText("INDECOPI");
    await expect(notices).toContainText("copia de tu hoja de reclamación");
  });
});

test.describe("W19 Privacidad", () => {
  test("estructura de la política, siete secciones y vía de contacto real", async ({ page }) => {
    await go(page, "/privacidad");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Política de privacidad");
    await expect(page.getByRole("heading", { name: "Nuestro compromiso con tu privacidad" })).toBeVisible();
    for (const title of ["Legalidad", "Finalidad", "Seguridad", "Transparencia"]) {
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
    await expect(page.locator(".lg-step")).toHaveCount(7);
    await expect(page.getByRole("heading", { name: "Derechos del titular" })).toBeVisible();
    await expect(page.locator(".lg-aside").getByRole("link", { name: /cotizaciones@fundigsac\.com/ })).toHaveAttribute("href", /^mailto:/);

    let dialog = false;
    page.on("dialog", (d) => { dialog = true; void d.dismiss(); });
    await page.getByRole("link", { name: /Ir al formulario de contacto/ }).click();
    await expect(page).toHaveURL(/\/contacto/);
    expect(dialog).toBe(false);
  });
});

test.describe("W20 Cookies", () => {
  test("preferencias reales: cookie propia, estado, personalización y persistencia", async ({ page, context }) => {
    await go(page, "/cookies", ".lg-switch:not([disabled])");
    expect((await context.cookies()).find((c) => c.name === "fundigsac-consent")).toBeUndefined();
    const analytics = page.getByRole("switch", { name: "Cookies analíticas" });
    const functional = page.getByRole("switch", { name: "Cookies funcionales" });
    await expect(page.getByRole("switch", { name: "Cookies necesarias" })).toBeDisabled();
    await expect(page.getByRole("switch", { name: "Cookies publicitarias" })).toBeDisabled();

    // rechazar opcionales
    await page.getByRole("button", { name: "Rechazar opcionales" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Solo se usarán las cookies necesarias." })).toBeVisible();
    await expect(analytics).toHaveAttribute("aria-checked", "false");
    await expect(functional).toHaveAttribute("aria-checked", "false");
    const rejected = (await context.cookies()).find((c) => c.name === "fundigsac-consent");
    expect(rejected).toBeTruthy();
    expect(rejected!.sameSite).toBe("Lax");
    expect(rejected!.secure).toBe(false); // http en las pruebas
    const days = (rejected!.expires - Date.now() / 1000) / 86400;
    expect(days).toBeGreaterThan(179);
    expect(days).toBeLessThanOrEqual(180.01);
    expect(JSON.parse(decodeURIComponent(rejected!.value))).toMatchObject({ necessary: true, performance: false, customization: false, version: 1 });

    // personalizar y guardar
    await analytics.click();
    await expect(analytics).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Guardar preferencias" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Preferencias guardadas." })).toBeVisible();
    const saved = JSON.parse(decodeURIComponent((await context.cookies()).find((c) => c.name === "fundigsac-consent")!.value));
    expect(saved).toMatchObject({ performance: true, customization: false });

    // persiste tras recargar
    await page.reload({ waitUntil: "domcontentloaded" });
    await hydrated(page, ".lg-switch:not([disabled])");
    await expect(analytics).toHaveAttribute("aria-checked", "true");
    await expect(functional).toHaveAttribute("aria-checked", "false");

    // aceptar todas
    await page.getByRole("button", { name: /Aceptar todas/ }).first().click();
    await expect(analytics).toHaveAttribute("aria-checked", "true");
    await expect(functional).toHaveAttribute("aria-checked", "true");
    expect(JSON.parse(decodeURIComponent((await context.cookies()).find((c) => c.name === "fundigsac-consent")!.value))).toMatchObject({ performance: true, customization: true });
  });

  test("las preguntas frecuentes se expanden con el teclado", async ({ page }) => {
    await go(page, "/cookies");
    const first = page.locator(".lg-faq details").first();
    await expect(first).not.toHaveAttribute("open", "");
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
  });
});

test.describe("Términos y condiciones", () => {
  test("diez secciones numeradas, índice con sección activa y anclas que respetan el encabezado", async ({ page }) => {
    await go(page, "/terminos", ".lg-toc a");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Términos y condiciones");
    await expect(page.locator(".lg-term")).toHaveCount(10);
    const toc = page.getByRole("navigation", { name: "Contenido de los términos" });
    await expect(toc.locator('a[aria-current="true"]')).toHaveAttribute("href", "#aceptacion");

    await toc.getByRole("link", { name: /Propiedad intelectual/ }).click();
    await expect(toc.locator('a[aria-current="true"]')).toHaveAttribute("href", "#propiedad");
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById("propiedad")!.getBoundingClientRect().top))).toBeGreaterThanOrEqual(80);
    await expect(page.locator(".lg-term").getByRole("link", { name: "Política de Privacidad" })).toHaveAttribute("href", "/privacidad");
  });

  test("texto justificado sin cortar palabras con guiones y tipografía de lectura", async ({ page }) => {
    await go(page, "/terminos", ".lg-toc a");
    const body = page.locator(".lg-term p").first();
    // Justificado desde 640 px; en móvil queda alineado a la izquierda para evitar "ríos" entre palabras.
    const wide = (page.viewportSize()?.width ?? 0) >= 640;
    await expect(body).toHaveCSS("text-align", wide ? "justify" : "start");
    if (wide) await expect(body).toHaveCSS("hyphens", "none");
    await expect(body).toHaveCSS("font-family", /Inter/);
  });

  test("las páginas legales y la 404 muestran el botón de WhatsApp y la flecha de volver arriba", async ({ page }) => {
    for (const route of ["/terminos", "/privacidad", "/cookies", "/reclamaciones", "/ruta-que-no-existe"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("a.lp-float__wa")).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664/);
      await expect(page.locator("button.lp-float__top")).toHaveCount(1);
    }
    await page.goto("/privacidad", { waitUntil: "domcontentloaded" });
    await hydrated(page, "button.lp-float__top");
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(page.locator("button.lp-float__top.is-visible")).toHaveCount(1);
    // En desarrollo el indicador de Next cubre este rincón: se dispara el clic del propio botón.
    await page.locator("button.lp-float__top").evaluate((el) => (el as HTMLButtonElement).click());
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });

  test("respeta el idioma y el modo oscuro elegidos en el sitio", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("fundigsac-lang", "en");
      localStorage.setItem("fundigsac-theme", "dark");
    });
    for (const [route, h1] of [["/terminos", "Terms and conditions"], ["/privacidad", "Privacy policy"], ["/cookies", "Cookie policy"], ["/reclamaciones", "Complaints Book"]] as const) {
      await go(page, route);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
      await expect(page.locator("html")).toHaveAttribute("data-lp-theme", "dark");
      await expect(page.locator("main.lg")).toHaveCSS("background-color", "rgb(8, 18, 31)");
    }
    await page.goto("/ruta-que-no-existe");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Oops, this page can’t be found.");
  });
});

test.describe("Mapa del sitio", () => {
  test("el enlace del pie abre una página real con todos los grupos y enlaces válidos", async ({ page }) => {
    await go(page, "/");
    await page.locator("footer.lp-footer").getByRole("link", { name: "Mapa del sitio" }).click();
    await expect(page).toHaveURL(/\/mapa-del-sitio$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Mapa del sitio");
    // cuatro grupos: el de cuenta se retiró hasta que exista el área de clientes
    await expect(page.locator(".lg-map__card")).toHaveCount(4);
    const hrefs = await page.locator(".lg-map__links a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThanOrEqual(20);
    for (const href of hrefs) expect(href).toMatch(/^\//);
    // cada enlace interno responde (sin 404)
    for (const href of new Set(hrefs)) {
      const res = await page.request.get(href as string);
      expect(res.status(), href as string).toBeLessThan(400);
    }
  });
});

test.describe("T&C B2B y consola limpia", () => {
  test("términos B2B: texto pendiente, sin cláusulas inventadas", async ({ page }) => {
    await go(page, "/terminos-b2b");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Términos y Condiciones Comerciales B2B");
    await expect(page.locator("main")).toContainText("pendiente de revisión");
  });

  const routes = ["/recursos", "/recursos/detalle-tecnico", "/contacto", "/cotizar", "/cotizar?producto=valvula-compuerta", "/cotizar?producto=marco-tapa-d400", "/cotizar/confirmacion", "/reclamaciones", "/privacidad", "/cookies", "/terminos", "/mapa-del-sitio", "/terminos-b2b"];
  for (const route of routes) {
    test(`sin errores ni advertencias de consola: ${route}`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m: ConsoleMessage) => {
        // El mapa de Google (iframe de terceros) registra sus propios errores de CORS: no son del sitio.
        if (/google\.com|googleapis\.com|gstatic\.com/.test(m.location().url)) return;
        if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
      });
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      await go(page, route);
      await page.waitForLoadState("networkidle");
      // interacción mínima para disparar efectos (scroll)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      expect(problems).toEqual([]);
    });
  }
});

test.describe("Preguntas frecuentes animadas", () => {
  test("cookies: el acordeón abre y cierra con animación de altura y deja el estilo limpio", async ({ page }) => {
    await page.goto("/cookies");
    const item = page.locator(".lg-faq details").first();
    await item.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const el = document.querySelector(".lg-faq details");
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
    });
    const height = () => item.evaluate((el) => el.getBoundingClientRect().height);
    const closed = await height();
    await item.locator("summary").click();
    await expect(item).toHaveJSProperty("open", true);
    await expect.poll(height).toBeGreaterThan(closed + 30);
    await expect(item).not.toHaveAttribute("data-state", /.+/);
    await expect(item).not.toHaveAttribute("style", /overflow/);
    await item.locator("summary").click();
    await expect(item).toHaveJSProperty("open", false);
    await expect.poll(height).toBeCloseTo(closed, 0);
    await expect(item).not.toHaveAttribute("style", /overflow/);
  });

  test("cookies: con movimiento reducido el acordeón abre al instante", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/cookies");
    const item = page.locator(".lg-faq details").nth(2);
    await item.scrollIntoViewIfNeeded();
    await item.locator("summary").click();
    await expect(item).toHaveJSProperty("open", true);
    await expect(item).not.toHaveAttribute("data-state", /.+/);
  });
});
