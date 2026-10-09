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
  test("radios accesibles, validación, nota legal y registro real con folio REC", async ({ page }) => {
    await go(page, "/reclamaciones", "#numeroDeDocumento");
    await expect(page.getByText("La validez legal de este libro virtual depende de la aprobación formal de FUNDIGSAC")).toBeVisible();

    const group = page.getByRole("radiogroup", { name: "Tipo de reclamación" });
    await expect(group.getByRole("radio", { name: /Reclamo/ })).toBeChecked();
    await group.getByRole("radio", { name: /Queja/ }).check();
    await expect(group.getByRole("radio", { name: /Reclamo/ })).not.toBeChecked();
    await page.getByRole("radio", { name: "Servicio" }).check();

    await page.getByRole("button", { name: /Registrar Reclamación/ }).click();
    await expect(page.locator("#successBanner")).toHaveCount(0);
    expect(await page.locator("#numeroDeDocumento").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    // apoderado
    await page.getByRole("button", { name: "Habilitar campo de apoderado" }).click();
    await expect(page.locator("#apoderadoNombre")).toBeVisible();
    await page.getByRole("button", { name: "Ocultar campo de apoderado" }).click();
    await expect(page.locator("#apoderadoNombre")).toHaveCount(0);

    await page.locator("#tipoDeDocumento").selectOption("DNI");
    await page.locator("#numeroDeDocumento").fill("72489102");
    await page.locator("#telefonoDeContacto").fill("+51 987 654 321");
    await page.locator("#nombresYApellidosRazon").fill("Usuario de Prueba");
    await page.locator("#correoElectronico").fill("prueba@correo.pe");
    await page.locator("#domicilioLegalOHabitual").fill("Av. Prueba 123, Lima");
    await page.locator("#descripcionDelProductoO").fill("Válvula de compuerta DN 200");
    await page.locator("#detalleDeLosHechos").fill("Detalle de prueba automatizada.");
    await page.locator("#pedidoConcretoOPretension").fill("Respuesta técnica formal.");
    await expect(page.getByText("Los adjuntos se coordinan por correo con el equipo comercial")).toBeVisible();
    // las casillas son obligatorias
    await page.getByRole("button", { name: /Registrar Reclamación/ }).click();
    expect(await page.locator('input[name="declaracionJuradaDeVeracidad"]').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await page.locator('input[name="declaracionJuradaDeVeracidad"]').check();
    await page.locator('input[name="consentimientoLeyN29733"]').check();
    await page.getByRole("button", { name: /Registrar Reclamación/ }).click();

    const banner = page.locator("#successBanner");
    await expect(banner).toBeVisible({ timeout: 60_000 });
    await expect(banner).toContainText(/REC-\d{4}-\d{6}/);
    await expect(banner).not.toContainText("HR-2026-00412");
  });
});

test.describe("W19 Privacidad", () => {
  test("barra de progreso y resaltado del índice según el scroll; los anclas respetan el encabezado fijo", async ({ page }) => {
    await go(page, "/privacidad", "#toc-nav a");
    const bar = page.locator("#reading-progress");
    const toc = page.locator("#toc-nav");
    await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#responsable");
    expect(await bar.evaluate((el) => el.getBoundingClientRect().width)).toBe(0);

    await page.evaluate(() => window.scrollTo(0, document.getElementById("seguridad")!.offsetTop - 100));
    await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#seguridad");
    await expect.poll(() => bar.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(10);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#responsable");

    await toc.getByRole("link", { name: /Finalidades del Tratamiento/ }).click();
    await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#finalidades");
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById("finalidades")!.getBoundingClientRect().top))).toBeGreaterThanOrEqual(76);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => bar.evaluate((el) => Math.round(el.getBoundingClientRect().width / (el.parentElement as HTMLElement).getBoundingClientRect().width * 100))).toBeGreaterThanOrEqual(98);
  });

  test("el formulario ARCO lleva al contacto con el documento precargado (sin alert ni descarga falsa)", async ({ page }) => {
    let dialog = false;
    page.on("dialog", (d) => { dialog = true; void d.dismiss(); });
    await go(page, "/privacidad", "#toc-nav a");
    const link = page.getByRole("link", { name: /Descargar Formulario ARCO/ });
    await expect(link).toHaveAttribute("href", /\/contacto\?motivo=documentacion&documento=/);
    await link.click();
    await expect(page).toHaveURL(/\/contacto\?motivo=documentacion/);
    expect(dialog).toBe(false);
  });
});

test.describe("W20 Cookies", () => {
  test("preferencias reales: cookie propia, estado, aviso con cierre automático y persistencia", async ({ page, context }) => {
    await go(page, "/cookies", "#btnSavePreferences");
    await expect(page.locator("#consentStatusBadge")).toContainText("Sin preferencias guardadas");
    expect((await context.cookies()).find((c) => c.name === "fundigsac-consent")).toBeUndefined();

    // rechazar opcionales
    await page.locator("#btnRejectOptional").click();
    await expect(page.locator("#consentStatusBadge")).toContainText("Solo Necesarias Activas");
    await expect(page.locator("#cookiePerformanceToggle")).not.toBeChecked();
    await expect(page.locator("#cookieCustomizationToggle")).not.toBeChecked();
    const rejected = (await context.cookies()).find((c) => c.name === "fundigsac-consent");
    expect(rejected).toBeTruthy();
    expect(rejected!.sameSite).toBe("Lax");
    expect(rejected!.secure).toBe(false); // http en las pruebas
    const days = (rejected!.expires - Date.now() / 1000) / 86400;
    expect(days).toBeGreaterThan(179);
    expect(days).toBeLessThanOrEqual(180.01);
    const parsed = JSON.parse(decodeURIComponent(rejected!.value));
    expect(parsed).toMatchObject({ necessary: true, performance: false, customization: false, version: 1 });

    const notice = page.locator("#consentNotification");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("rechazaron las cookies opcionales");
    await expect(notice).toBeHidden({ timeout: 8000 }); // se oculta solo a los 5 s

    // personalizar y guardar
    await page.locator("label:has(#cookiePerformanceToggle)").click();
    await expect(page.locator("#cookiePerformanceToggle")).toBeChecked();
    await page.locator("#btnSavePreferences").click();
    await expect(page.locator("#consentStatusBadge")).toContainText("Configuración Personalizada");
    await expect(notice).toBeVisible();
    await page.locator("#dismissAlert").click();
    await expect(notice).toHaveCount(0);
    const saved = JSON.parse(decodeURIComponent((await context.cookies()).find((c) => c.name === "fundigsac-consent")!.value));
    expect(saved).toMatchObject({ performance: true, customization: false });

    // persiste tras recargar
    await page.reload({ waitUntil: "domcontentloaded" });
    await hydrated(page, "#btnSavePreferences");
    await expect(page.locator("#cookiePerformanceToggle")).toBeChecked();
    await expect(page.locator("#cookieCustomizationToggle")).not.toBeChecked();
    await expect(page.locator("#consentStatusBadge")).toContainText("Configuración Personalizada");

    // todas
    await page.locator("label:has(#cookieCustomizationToggle)").click();
    await page.locator("#btnSavePreferences").click();
    await expect(page.locator("#consentStatusBadge")).toContainText("Todas las Cookies Habilitadas");
  });

  test("la barra de progreso avanza al hacer scroll y el índice marca la sección visible", async ({ page }) => {
    await go(page, "/cookies", "#btnSavePreferences");
    const bar = page.locator("#scrollProgressBar");
    const before = await bar.evaluate((el) => el.getBoundingClientRect().width);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => bar.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(before);
    await expect(page.getByRole("navigation", { name: "Índice normativo" }).locator('a[aria-current="location"]')).toHaveAttribute("href", "#section-6");
  });

  test("sin banner global de cookies en el resto del sitio", async ({ page }) => {
    await go(page, "/");
    await expect(page.locator("#consentStatusBadge")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("T&C B2B y consola limpia", () => {
  test("términos B2B: texto pendiente, sin cláusulas inventadas", async ({ page }) => {
    await go(page, "/terminos-b2b");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Términos y Condiciones Comerciales B2B");
    await expect(page.locator("main")).toContainText("pendiente de revisión");
  });

  const routes = ["/recursos", "/recursos/detalle-tecnico", "/contacto", "/cotizar", "/cotizar?producto=valvula-compuerta", "/cotizar?producto=marco-tapa-d400", "/cotizar/confirmacion", "/reclamaciones", "/privacidad", "/cookies", "/terminos-b2b"];
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
