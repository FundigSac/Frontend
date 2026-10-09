import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/** Recoge errores/avisos de consola y excepciones de la página. */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

const ROUTES = ["/", "/productos", "/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas", "/soluciones", "/soluciones/redes-matrices", "/nosotros", "/buscar?q=v%C3%A1lvula", "/ruta-que-no-existe"];

test.describe("consola limpia", () => {
  for (const route of ROUTES) {
    test(`sin errores ni avisos en ${route}`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      expect(problems).toEqual([]);
    });
  }
});

test.describe("W01 inicio", () => {
  test("fichas destacadas y descargas apuntan a rutas reales", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("main a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.filter((h) => h === "#")).toEqual([]);
    await expect(page.getByRole("link", { name: /Ficha: Válvula Compuerta Bridada/ })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta");
    await expect(page.getByRole("link", { name: /Ficha: Tubería Hierro Dúctil Campana Tyton/ })).toHaveAttribute("href", "/productos/tuberias/tuberia-tyton");
    const dl = page.getByRole("link", { name: "Descargar PDF" });
    await expect(dl).toHaveAttribute("href", /^\/contacto\?motivo=documentacion&documento=/);
    await dl.click();
    await expect(page).toHaveURL(/\/contacto\?motivo=documentacion/);
    await expect(page.getByText("Preparando...")).toHaveCount(0);
  });
});

test.describe("W02 catálogo", () => {
  test("lista 8 de 19 productos, pagina y ordena", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#resultados-catalogo article");
    await expect(cards).toHaveCount(8);
    await expect(page.getByRole("status").filter({ hasText: "Mostrando 19 productos" })).toBeVisible();
    await page.getByRole("button", { name: "Página 3" }).click();
    await expect(cards).toHaveCount(3);
    await expect(page.getByText("Página 3 de 3 (3 de 19 ítems)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    await expect(page).toHaveURL(/pagina=3/);
    await page.getByLabel("Ordenar por:").selectOption("dn-asc");
    await expect(page.getByText("Página 1 de 3")).toBeVisible();
    await expect(cards.first().getByRole("heading")).toContainText("Acometida");
    await expect(page).toHaveURL(/orden=dn-asc/);
  });

  test("la búsqueda filtra, actualiza el contador y la URL; limpiar restaura", async ({ page }) => {
    await page.goto("/productos");
    await page.getByRole("searchbox", { name: "Buscar en el catálogo" }).fill("tapa D400");
    const cards = page.locator("#resultados-catalogo article");
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole("status").filter({ hasText: "3 de 19 productos técnicos" })).toBeVisible();
    await expect(page).toHaveURL(/q=tapa(\+|%20)D400/);
    await page.getByRole("searchbox", { name: "Buscar en el catálogo" }).fill("zzz-inexistente");
    await expect(page.getByRole("heading", { name: "No hay productos que coincidan con su búsqueda" })).toBeVisible();
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: "Limpiar filtros" }).click();
    await expect(cards).toHaveCount(8);
    await expect(page).not.toHaveURL(/q=/);
  });

  test("filtros: familia, PN, unión y norma combinan; 'Limpiar' los quita", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#resultados-catalogo article");
    await page.getByLabel("Familia de producto").selectOption("tuberias");
    await expect(cards).toHaveCount(4);
    await expect(page).toHaveURL(/cat=tuberias/);
    await page.getByLabel("PN 40").check();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Tubería Hierro Dúctil Campana Tyton");
    await page.getByRole("button", { name: "Limpiar", exact: true }).click();
    await expect(cards).toHaveCount(8);
    await page.getByLabel("Tipo de Unión").selectOption("tyton");
    await expect(page.getByRole("status")).toContainText("de 19 productos");
    await page.getByLabel("Tipo de Unión").selectOption("");
    await page.getByLabel("EN 124-2 (D400 / C250)").check();
    await expect(cards).toHaveCount(4);
    await page.getByLabel("Diámetro Nominal (DN)").selectOption("700-1200");
    await expect(page.getByRole("heading", { name: "No hay productos que coincidan con su búsqueda" })).toBeVisible();
  });

  test("URL compartible: ?q=&cat= se aplica al cargar", async ({ page }) => {
    await page.goto("/productos?cat=marcos-y-tapas&q=rejilla");
    const cards = page.locator("#resultados-catalogo article");
    await expect(cards).toHaveCount(1);
    await expect(page.getByRole("searchbox", { name: "Buscar en el catálogo" })).toHaveValue("rejilla");
    await expect(page.getByLabel("Familia de producto")).toHaveValue("marcos-y-tapas");
  });

  test("tarjetas: ficha en la página del producto, o solicitud de documento; cotizar precarga", async ({ page }) => {
    await page.goto("/productos");
    const first = page.locator("#resultados-catalogo article").first();
    await expect(first.getByRole("link", { name: /Ficha técnica/ })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta");
    await expect(first.getByRole("link", { name: /Cotizar/ })).toHaveAttribute("href", "/cotizar?producto=valvula-compuerta");
    await page.goto("/productos?q=check");
    const swing = page.locator("#resultados-catalogo article").first();
    await expect(swing.getByRole("link", { name: "Ficha técnica" })).toHaveAttribute("href", /\/contacto\?motivo=documentacion&documento=/);
  });
});

test.describe("W03 válvulas", () => {
  test("los chips filtran la grilla y los contadores coinciden", async ({ page }) => {
    await page.goto("/productos/valvulas");
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(6);
    const todas = page.getByRole("button", { name: /Todas las válvulas/ });
    await expect(todas).toHaveAttribute("aria-pressed", "true");
    await expect(todas).toContainText("6");
    await page.getByRole("button", { name: /Retención \/ Check/ }).click();
    await expect(cards).toHaveCount(2);
    await expect(page.getByRole("status").filter({ hasText: "2 de 6 modelos mostrados" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Retención \/ Check/ })).toHaveAttribute("aria-pressed", "true");
    await expect(todas).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: /Aire y purga ventosas/ }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Sin modelos publicados en esta línea" })).toBeVisible();
    await page.getByRole("button", { name: "Ver todas las válvulas" }).click();
    await expect(cards).toHaveCount(6);
  });
  test("sin anclas vacías y CTAs reales", async ({ page }) => {
    await page.goto("/productos/valvulas");
    expect(await page.locator("main a[href='#']").count()).toBe(0);
    await expect(page.getByRole("link", { name: /Cotizar Lote de Válvulas/ })).toHaveAttribute("href", "/cotizar");
    await expect(page.locator("main article").first().getByRole("link", { name: /Ficha técnica/ })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta");
  });
});

test.describe("W04 / W05 / W10-W12 enlaces", () => {
  for (const route of ["/productos/tuberias", "/productos/marcos-y-tapas", "/soluciones", "/soluciones/redes-matrices", "/nosotros"]) {
    test(`${route}: ningún href="#" ni botón sin acción`, async ({ page }) => {
      await page.goto(route);
      expect(await page.locator("main a[href='#']").count()).toBe(0);
      expect(await page.locator("main button[type='button']").count()).toBe(0);
    });
  }
  test("W04: cotizar Tyton precarga el producto", async ({ page }) => {
    await page.goto("/productos/tuberias");
    await expect(page.getByRole("link", { name: "Cotizar metrado" }).first()).toHaveAttribute("href", "/cotizar?producto=tuberia-tyton");
  });
  test("W11: 'Solicitar Reunión Técnica' abre contacto con motivo", async ({ page }) => {
    await page.goto("/soluciones/redes-matrices");
    await page.getByRole("link", { name: "Solicitar Reunión Técnica" }).click();
    await expect(page).toHaveURL(/\/contacto\?motivo=reunion/);
  });
});

test.describe("W05 formulario de requerimiento", () => {
  test("valida campos obligatorios y no muestra éxito sin respuesta del servidor", async ({ page }) => {
    await page.goto("/productos/marcos-y-tapas");
    const form = page.locator("#procurement-form");
    await form.scrollIntoViewIfNeeded();
    await form.getByRole("button", { name: /Transmitir Solicitud/ }).click();
    // Validación nativa: el primer campo requerido queda inválido y no hay éxito.
    await expect(form.locator("#contact-name:invalid")).toHaveCount(1);
    await expect(page.getByText("¡Requerimiento registrado con éxito!")).toHaveCount(0);
  });

  test("envío real: devuelve folio REQ-… o un error visible (nunca éxito falso)", async ({ page }) => {
    await page.goto("/productos/marcos-y-tapas");
    const form = page.locator("#procurement-form");
    await form.getByLabel("Nombre y Apellidos").fill("Ing. Prueba E2E");
    await form.getByLabel("Razón Social y RUC").fill("Consorcio Prueba (RUC 20601839281)");
    await form.getByLabel("Correo Corporativo").fill("e2e@example.com");
    await form.getByLabel("Teléfono Móvil / WhatsApp").fill("+51 987 654 321");
    await form.getByLabel("Cantidad Estimada (Unidades)").fill("10");
    await form.getByRole("button", { name: /Transmitir Solicitud/ }).click();
    const ok = page.getByText(/Folio de seguimiento: REQ-/);
    const err = page.getByRole("alert");
    await expect(ok.or(err)).toBeVisible({ timeout: 30_000 });
    if (await ok.isVisible()) await expect(page.getByRole("button", { name: /Requerimiento registrado con éxito/ })).toBeVisible();
  });
});

test.describe("W21 404", () => {
  test("el buscador envía a /buscar?q= y los enlaces son reales", async ({ page }) => {
    const res = await page.goto("/ruta-que-no-existe");
    expect(res?.status()).toBe(404);
    await page.getByRole("searchbox", { name: "Buscar en el sitio" }).fill("válvula DN 200");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/buscar\?q=v%C3%A1lvula\+DN\+200|\/buscar\?q=v%C3%A1lvula%20DN%20200/);
    await expect(page.getByRole("heading", { name: /Resultados|Sin resultados/ }).or(page.locator("article").first())).toBeVisible();
  });
  test("búsquedas frecuentes llevan a resultados", async ({ page }) => {
    await page.goto("/ruta-que-no-existe");
    await page.getByRole("link", { name: "Tapa D400 EN 124" }).click();
    await expect(page).toHaveURL(/\/buscar\?q=tapa/);
    await expect(page.locator("article").first()).toBeVisible();
  });
});

test.describe("W22 búsqueda", () => {
  test("'válvula compuerta pn 16' devuelve 6 compuertas, resalta y muestra criterios", async ({ page }) => {
    await page.goto("/buscar?q=v%C3%A1lvula%20compuerta%20pn%2016");
    await expect(page.locator("main article")).toHaveCount(6);
    await expect(page.getByRole("status").filter({ hasText: "6 resultados de ingeniería" })).toBeVisible();
    await expect(page.locator("main article mark").first()).toBeVisible();
    await expect(page.getByText("Presión: PN 16")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    // el criterio numérico se puede quitar
    await page.getByRole("button", { name: "Quitar criterio: Presión: PN 16" }).click();
    await expect(page).toHaveURL(/q=v%C3%A1lvula\+compuerta$|q=v%C3%A1lvula%20compuerta$/);
  });

  test("re-ejecutar búsqueda, vacío y restablecer", async ({ page }) => {
    await page.goto("/buscar");
    await expect(page.locator("main article")).toHaveCount(6);
    await expect(page.getByRole("status").filter({ hasText: "19 productos" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Buscar productos" }).fill("xyzxyz");
    await page.getByRole("button", { name: "Re-ejecutar" }).click();
    await expect(page.getByRole("heading", { name: "Sin resultados para «xyzxyz»" })).toBeVisible();
    await expect(page).toHaveURL(/q=xyzxyz/);
    await page.getByRole("button", { name: "Restablecer todos los filtros" }).first().click();
    await expect(page.locator("main article")).toHaveCount(6);
    await expect(page).not.toHaveURL(/q=/);
  });

  test("filtros por familia y homologación; conteos y deshabilitado en 0", async ({ page }) => {
    await page.goto("/buscar?q=tuber%C3%ADa");
    await expect(page.getByLabel(/Válvulas de Línea/)).toBeDisabled();
    await expect(page.getByLabel(/Tuberías y Juntas/)).toBeEnabled();
    await page.goto("/buscar");
    await page.getByLabel(/Marcos y Tapas Viales/).check();
    await expect(page.getByText("1 activo", { exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "4 productos" })).toBeVisible();
    await page.getByLabel(/SEDAPAL \(Conforme NT-002\)/).check();
    await expect(page.getByRole("status").filter({ hasText: "1 producto" })).toBeVisible();
    await page.getByRole("button", { name: "Limpiar Selección" }).click();
    await expect(page.getByText("0 activos")).toBeVisible();
  });

  test("rango DN, orden y vista de tabla", async ({ page }) => {
    await page.goto("/buscar");
    await page.getByLabel("Diámetro nominal mínimo").selectOption("700");
    await expect(page.getByRole("status").filter({ hasText: "2 productos" })).toBeVisible();
    await page.getByLabel("Diámetro nominal mínimo").selectOption("25");
    await page.getByLabel("Ordenar por:").selectOption("dn-desc");
    await page.getByRole("button", { name: "Vista en tabla de especificaciones" }).click();
    await expect(page.getByRole("button", { name: "Vista en tabla de especificaciones" })).toHaveAttribute("aria-pressed", "true");
    const rows = page.locator("main table tbody tr");
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText("DN 700 – DN 1200");
    await expect(page).toHaveURL(/vista=tabla/);
    await page.getByRole("button", { name: "Página 2" }).click();
    await expect(page.getByText(/Mostrando 6 de 19/)).toBeVisible();
  });

  test("teclado: Enter en el campo ejecuta la búsqueda", async ({ page }) => {
    await page.goto("/buscar");
    const box = page.getByRole("searchbox", { name: "Buscar productos" });
    await box.fill("EN 124");
    await box.press("Enter");
    await expect(page).toHaveURL(/q=EN(\+|%20)124/);
    await expect(page.locator("main article").first()).toBeVisible();
  });
});
