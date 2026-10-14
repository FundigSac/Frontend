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
  test("filtros de categoría, familia y búsqueda con estado ARIA y conteo", async ({ page }) => {
    await go(page, "/recursos", "#docSearchInput");
    await expect(cards(page)).toHaveCount(6);

    const fichas = page.getByRole("button", { name: /^Fichas Técnicas/ });
    await expect(fichas).toHaveAttribute("aria-pressed", "false");
    await fichas.click();
    await expect(fichas).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /^Todos los documentos/ })).toHaveAttribute("aria-pressed", "false");
    await expect(cards(page)).toHaveCount(2);
    await expect(page.locator("#resultsCount")).toHaveText("2 documentos encontrados.");

    await page.getByRole("button", { name: "Marcos y Tapas" }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("Protocolo de Ensayos Metrológicos");
    await expect(page.locator("#resultsCount")).toHaveText("1 documento encontrado.");
    await expect(page).toHaveURL(/cat=fichas/);
    await expect(page).toHaveURL(/fam=marcos/);
  });

  test("búsqueda de texto, 'limpiar', estado vacío y restablecer filtros", async ({ page }) => {
    await go(page, "/recursos", "#docSearchInput");
    const search = page.locator("#docSearchInput");
    await expect(page.locator("#clearSearch")).toHaveCount(0);

    await search.fill("golpe de ariete");
    await expect(cards(page)).toHaveCount(1);
    await expect(page.locator("#clearSearch")).toBeVisible();
    await expect(page).toHaveURL(/q=golpe\+de\+ariete/);

    await page.locator("#clearSearch").click();
    await expect(cards(page)).toHaveCount(6);
    await expect(search).toHaveValue("");
    await expect(page.locator("#clearSearch")).toHaveCount(0);

    await search.fill("xyz-no-existe");
    await expect(cards(page)).toHaveCount(0);
    await expect(page.locator("#noResults")).toBeVisible();
    await expect(page.locator("#resultsCount")).toHaveText("No se encontraron documentos.");

    await page.getByRole("button", { name: "Planos CAD / DWG (1)" }).click();
    await page.locator("#resetFilters").click();
    await expect(page.locator("#noResults")).toHaveCount(0);
    await expect(cards(page)).toHaveCount(6);
    await expect(page.getByRole("button", { name: /^Todos los documentos/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Todas", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("los filtros se leen de la URL (?q=&cat=&fam=) y los botones se operan con teclado", async ({ page }) => {
    await go(page, "/recursos?q=ariete&cat=manuales&fam=valvulas", "#docSearchInput");
    await expect(page.locator("#docSearchInput")).toHaveValue("ariete");
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Manuales de Montaje/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Válvulas", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/recursos?cat=inexistente&fam=<script>", { waitUntil: "domcontentloaded" });
    await hydrated(page, "#docSearchInput");
    await expect(cards(page)).toHaveCount(6);

    const tuberias = page.getByRole("button", { name: "Tuberías", exact: true });
    await tuberias.focus();
    await page.keyboard.press("Enter");
    await expect(tuberias).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(3);
  });

  test("las descargas llevan al formulario de contacto con el documento precargado (sin simular descargas)", async ({ page }) => {
    await go(page, "/recursos", "#docSearchInput");
    const first = cards(page).first().getByRole("link", { name: /Descargar PDF/ });
    const href = await first.getAttribute("href");
    expect(href).toContain("/contacto?motivo=documentacion&documento=");
    expect(decodeURIComponent(href!)).toContain("Catálogo General Técnico FUNDIGSAC 2026");
    await first.click();
    await expect(page).toHaveURL(/\/contacto\?motivo=documentacion/);
    await expect(page.locator("#technicalMessage")).toHaveValue("Solicito el documento: Catálogo General Técnico FUNDIGSAC 2026");
    await expect(page.locator("#contactReason")).toHaveValue("documentacion");
  });
});

test.describe("W14 Detalle de recurso", () => {
  test("compartir copia el enlace y avisa con el toast global; descargar no simula descarga", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "permisos de portapapeles sólo en chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await go(page, "/recursos/detalle-tecnico", "#btn-share");
    await page.locator("#btn-share").click();
    await expect(page.getByRole("status").filter({ hasText: "Enlace técnico copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());

    const dl = page.getByRole("link", { name: /Descargar Catálogo Completo/ });
    await expect(dl).toHaveAttribute("href", /\/contacto\?motivo=documentacion&documento=/);
    await expect(page.locator("#toast")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Ruta de navegación" }).getByRole("link", { name: "Recursos Técnicos" })).toHaveAttribute("href", "/recursos");
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
  test("motivo=reunion selecciona la opción y documento precarga el mensaje", async ({ page }) => {
    await go(page, "/contacto?motivo=reunion", "#fullName");
    await expect(page.locator("#contactReason")).toHaveValue("reunion");
    await expect(page.locator("#technicalMessage")).toHaveValue("");
    await go(page, "/contacto?documento=Ficha%20T%C3%A9cnica%20X", "#fullName");
    await expect(page.locator("#contactReason")).toHaveValue("documentacion");
    await expect(page.locator("#technicalMessage")).toHaveValue("Solicito el documento: Ficha Técnica X");
    await go(page, "/contacto?motivo=hack", "#fullName");
    await expect(page.locator("#contactReason")).toHaveValue("");
  });

  test("validación nativa bloquea el envío vacío", async ({ page }) => {
    await go(page, "/contacto", "#fullName");
    await page.locator("#submitBtn").click();
    await expect(page).toHaveURL(/\/contacto$/);
    expect(await page.locator("#fullName").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await expect(page.locator("#formSuccessMessage")).toHaveCount(0);
  });
});

async function fillQuoteGeneral(page: Page) {
  await page.locator("#razonSocial").fill("Consorcio Prueba E2E S.A.C.");
  await page.locator("#rucEmpresa").fill("20100070970");
  await page.locator("#tipoProyecto").selectOption("saneamiento");
  await page.locator("#departamentoDestino").selectOption("lima");
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
  test("cotización general: validación nativa, nota de adjuntos y envío real → confirmación con folio", async ({ page }) => {
    await go(page, "/cotizar", "#razonSocial");
    await expect(page.getByText("Los adjuntos se coordinan por correo con el equipo comercial")).toBeVisible();

    await page.getByRole("button", { name: /Enviar Requerimiento/ }).click();
    await expect(page).toHaveURL(/\/cotizar$/);
    expect(await page.locator("#razonSocial").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    await fillQuoteGeneral(page);
    await page.locator("#rucEmpresa").fill("123");
    await page.getByRole("button", { name: /Enviar Requerimiento/ }).click();
    expect(await page.locator("#rucEmpresa").evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
    await page.locator("#rucEmpresa").fill("20100070970");

    await page.locator("#fileUpload").setInputFiles({ name: "metrado.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 prueba") });
    await expect(page.locator("#fileNameLabel")).toHaveText("metrado.pdf");

    await page.getByRole("button", { name: /Enviar Requerimiento/ }).click();
    await page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-\d{4}-\d{6}/, { timeout: 60_000 });
    const ref = new URL(page.url()).searchParams.get("ref")!;
    await expect(page.locator("#folio-code")).toHaveText(ref);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Registrado Exitosamente");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    // no se expone información personal
    await expect(page.locator("main")).not.toContainText("compras@prueba.com.pe");
    await expect(page.locator("main")).not.toContainText("Consorcio Prueba E2E");
  });

  test("producto precargado: resumen por slug, stepper, fecha mínima, cambiar producto y envío", async ({ page }) => {
    await go(page, "/cotizar?producto=tuberia-tyton", "#input-qty");
    await expect(page.getByText("SKU: TUB-TYT-C40")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Tubería de Hierro Dúctil Junta Flexible Tyton/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cambiar producto o especificación técnica" })).toHaveAttribute("href", "/productos");
    await expect(page.getByRole("navigation", { name: "Ruta de navegación" }).getByRole("link", { name: /Tubería Tyton/ })).toHaveAttribute("href", "/productos/tuberias/tuberia-tyton");

    const qty = page.locator("#input-qty");
    await expect(qty).toHaveValue("4");
    await page.getByRole("button", { name: "Aumentar cantidad" }).click();
    await expect(qty).toHaveValue("5");
    for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Disminuir cantidad" }).click({ trial: false }).catch(() => {});
    await expect(qty).toHaveValue("1");
    await expect(page.getByRole("button", { name: "Disminuir cantidad" })).toBeDisabled();

    const today = await page.evaluate(() => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
    await expect(page.locator("#delivery-date")).toHaveAttribute("min", today);

    // casillas de accesorios (valores del diseño: primera marcada por defecto)
    const addons = page.locator('input[name="addons"]');
    await expect(addons).toHaveCount(3);
    await expect(addons.first()).toBeChecked();
    await addons.nth(1).check();

    // RUC: botón "Validar" (formato + dígito verificador; no consulta a la SUNAT)
    await page.locator("#ruc").fill("20100070971");
    await page.getByRole("button", { name: "Validar formato del RUC" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dígito verificador" })).toBeVisible();
    await page.locator("#ruc").fill("20100070970");
    await page.getByRole("button", { name: "Validar formato del RUC" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Formato de RUC correcto" })).toBeVisible();

    await page.locator("#razon-social").fill("Consorcio Producto E2E");
    await page.locator("#contact-name").fill("Ing. Prueba");
    await page.locator("#email").fill("residente@prueba.com.pe");
    await page.locator("#phone").fill("987654321");
    await page.locator("#delivery-place").selectOption("almacen-lima");
    await page.locator("#delivery-date").fill(today);
    await page.locator('input[name="declaroQueLaInformacion"]').check();
    await page.getByRole("button", { name: /Solicitar Proforma Oficial/ }).click();
    await page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-/, { timeout: 60_000 });
    await expect(page.locator("#folio-code")).toHaveText(/^COT-\d{4}-\d{6}$/);
  });

  test("un slug desconocido muestra la cotización general (sin inyectar datos)", async ({ page }) => {
    await go(page, "/cotizar?producto=<img src=x>", "#razonSocial");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Solicitud Formal de Cotización");
  });

  test("confirmación: sin folio o con folio inexistente muestra estado honesto; con folio real permite copiar e imprimir", async ({ page, context, browserName }) => {
    await go(page, "/cotizar/confirmacion");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No encontramos esta solicitud");
    await expect(page.getByRole("link", { name: "Solicitar una cotización" })).toHaveAttribute("href", "/cotizar");
    await go(page, "/cotizar/confirmacion?ref=COT-2026-999999");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No encontramos esta solicitud");
    await go(page, "/cotizar/confirmacion?ref=REC-2026-000001");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("No encontramos esta solicitud");

    // folio real: se crea una cotización
    await go(page, "/cotizar", "#razonSocial");
    await fillQuoteGeneral(page);
    await page.getByRole("button", { name: /Enviar Requerimiento/ }).click();
    await page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-/, { timeout: 60_000 });
    const ref = new URL(page.url()).searchParams.get("ref")!;
    await hydrated(page, "#copy-btn");

    await expect(page.getByText(/\d{1,2} de \w+ de \d{4} · \d{2}:\d{2} hrs \(PET\)/)).toBeVisible();
    await expect(page.getByText("COT-2026-FND-0841")).toHaveCount(0);

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.locator("#copy-btn").click();
      await expect(page.locator("#copy-btn")).toContainText("Copiado");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ref);
      await expect(page.getByRole("status").filter({ hasText: ref })).toBeVisible();
    }

    await page.evaluate(() => {
      (window as unknown as { __printed: number }).__printed = 0;
      window.print = () => void ((window as unknown as { __printed: number }).__printed += 1);
    });
    await page.getByRole("button", { name: /Imprimir Confirmación/ }).click();
    expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
  });
});

test.describe("W18 Libro de Reclamaciones", () => {
  test("tipo de solicitud accesible, validación nativa y registro real con folio REC", async ({ page }) => {
    await go(page, "/reclamaciones");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Libro de Reclamaciones");

    // Sin base de datos configurada el registro se declara "en preparación" y ofrece los canales de atención.
    const fallback = page.getByRole("heading", { name: "Registro en línea en preparación" });
    if (await fallback.isVisible()) {
      await expect(page.getByRole("link", { name: /Por correo/ })).toHaveAttribute("href", /^mailto:/);
      await expect(page.getByRole("link", { name: /Por teléfono/ })).toHaveAttribute("href", /^tel:/);
      await expect(page.getByRole("link", { name: /Por WhatsApp/ })).toHaveAttribute("href", /wa\.me/);
      return;
    }

    await hydrated(page, "#reclamaciones-form");
    const form = page.locator("#reclamaciones-form");
    await expect(form.getByRole("radio", { name: /Reclamo/ })).toBeChecked();
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
    await form.locator('input[name="numeroDeDocumento"]').fill("72489102");
    await form.locator('input[name="correoElectronico"]').fill("prueba@correo.pe");
    await form.locator('input[name="telefonoDeContacto"]').fill("+51 987 654 321");
    await form.locator('input[name="domicilioLegalOHabitual"]').fill("Av. Prueba 123, Lima");
    await form.locator('select[name="descripcionDelProductoO"]').selectOption("Válvulas");
    await form.locator('input[name="fechaDelSuceso"]').fill("2026-10-10");
    await form.locator('textarea[name="detalleDeLosHechos"]').fill("Detalle de prueba automatizada.");
    await form.locator('textarea[name="pedidoConcretoOPretension"]').fill("Respuesta técnica formal.");

    // la declaración y el consentimiento son obligatorios
    await form.getByRole("button", { name: /Enviar reclamo/ }).click();
    expect(await form.locator('input[name="consentimientoLeyN29733"]').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await form.locator('input[name="consentimientoLeyN29733"]').check();
    await form.getByRole("button", { name: /Enviar reclamo/ }).click();

    const success = page.locator(".lg-success");
    await expect(success).toBeVisible({ timeout: 60_000 });
    await expect(success).toContainText(/REC-\d{4}-\d{6}/);
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

  test("texto justificado con guiones automáticos y tipografía de lectura", async ({ page }) => {
    await go(page, "/terminos", ".lg-toc a");
    const body = page.locator(".lg-term p").first();
    // Justificado desde 640 px; en móvil queda alineado a la izquierda para evitar "ríos" entre palabras.
    const wide = (page.viewportSize()?.width ?? 0) >= 640;
    await expect(body).toHaveCSS("text-align", wide ? "justify" : "start");
    await expect(body).toHaveCSS("font-family", /Inter/);
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

test.describe("T&C B2B y consola limpia", () => {
  test("términos B2B: texto pendiente, sin cláusulas inventadas", async ({ page }) => {
    await go(page, "/terminos-b2b");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Términos y Condiciones Comerciales B2B");
    await expect(page.locator("main")).toContainText("pendiente de revisión");
  });

  const routes = ["/recursos", "/recursos/detalle-tecnico", "/contacto", "/cotizar", "/cotizar?producto=valvula-compuerta", "/cotizar?producto=marco-tapa-d400", "/cotizar/confirmacion", "/reclamaciones", "/privacidad", "/cookies", "/terminos", "/terminos-b2b"];
  for (const route of routes) {
    test(`sin errores ni advertencias de consola: ${route}`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m: ConsoleMessage) => {
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
