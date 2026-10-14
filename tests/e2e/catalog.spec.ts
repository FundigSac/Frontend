import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/** Recoge errores/avisos de consola y excepciones de la página. */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    // Chrome registra el 404 del propio documento en la ruta inexistente; no es un fallo de la página.
    if (/Failed to load resource.*404/.test(m.text()) && page.url().includes("ruta-que-no-existe")) return;
    problems.push(`${m.type()}: ${m.text()}`);
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
  test("tarjetas de componentes y accesos apuntan a rutas reales", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("main a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.filter((h) => h === "#")).toEqual([]);
    // El carrusel de componentes enlaza a las familias y a búsquedas del catálogo.
    for (const href of ["/productos/valvulas", "/productos/marcos-y-tapas", "/productos?q=grifo", "/productos?q=acople", "/productos/tuberias", "/industrias", "/recursos", "/contacto"]) {
      expect(hrefs, `falta un enlace a ${href}`).toContain(href);
    }
    await expect(page.getByRole("link", { name: "Explorar productos" })).toHaveAttribute("href", "/productos");
    await expect(page.getByRole("link", { name: "Ver soluciones" })).toHaveAttribute("href", "/soluciones");
  });

  test("'Explorar productos' y 'Explorar recursos técnicos' navegan", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Explorar recursos técnicos" }).click();
    await expect(page).toHaveURL(/\/recursos$/);
    await page.goto("/");
    await page.getByRole("link", { name: "Explorar productos" }).click();
    await expect(page).toHaveURL(/\/productos$/);
  });
});

test.describe("W02 catálogo", () => {
  // Sin desplazamiento suave: al elegir una familia la página baja a los productos y los clics siguientes deben ser estables.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });
  const searchbox = (page: Page) => page.getByRole("searchbox", { name: "Buscar productos por nombre, referencia o aplicación" });
  const familyButton = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

  test("muestra 5 familias y 10 productos destacados", async ({ page }) => {
    await page.goto("/productos");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Catálogo general");
    const families = page.locator('section[aria-label="Familias de productos"] article');
    await expect(families).toHaveCount(5);
    const hrefs = await families.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(expect.arrayContaining(["/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas", "/productos?familia=accesorios-hdpe", "/productos?familia=conexiones-y-fittings"]));
    await expect(page.locator("#productos-destacados article")).toHaveCount(10);
    await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "true");
  });

  test("la búsqueda filtra y actualiza la URL; el vacío ofrece restaurar", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#productos-destacados article");
    await searchbox(page).fill("tapa");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Tapa circular");
    await expect(page).toHaveURL(/q=tapa/);
    await searchbox(page).fill("zzz-inexistente");
    await expect(page.getByRole("heading", { name: "No encontramos productos con esos datos" })).toBeVisible();
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: /Ver todos los productos/ }).click();
    await expect(cards).toHaveCount(10);
    await expect(searchbox(page)).toHaveValue("");
    await expect(page).not.toHaveURL(/q=/);
  });

  test("filtros por familia: cada botón filtra, repetir el clic lo quita y se combina con la búsqueda", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#productos-destacados article");
    for (const [label, familia, total] of [["Válvulas", "valvulas", 3], ["Tuberías", "tuberias", 1], ["Marcos y tapas", "marcos-y-tapas", 1], ["Accesorios HDPE", "accesorios-hdpe", 3], ["Conexiones y fittings", "conexiones-y-fittings", 2]] as const) {
      await familyButton(page, label).click();
      await expect(familyButton(page, label)).toHaveAttribute("aria-pressed", "true");
      await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "false");
      await expect(cards).toHaveCount(total);
      await expect(page).toHaveURL(new RegExp(`familia=${familia}`));
    }
    await familyButton(page, "Conexiones y fittings").click(); // segundo clic: vuelve a "Todas"
    await expect(cards).toHaveCount(10);
    await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "true");
    await expect(page).not.toHaveURL(/familia=/);

    await familyButton(page, "Accesorios HDPE").click();
    await searchbox(page).fill("codo 90");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Codo 90° HDPE");
    await familyButton(page, "Válvulas").click();
    await expect(page.getByRole("heading", { name: "No encontramos productos con esos datos" })).toBeVisible();
    await familyButton(page, "Todas").click();
    await expect(cards).toHaveCount(1);
  });

  test("URL compartible: ?familia=&q= se aplica al cargar y una familia inválida se ignora", async ({ page }) => {
    await page.goto("/productos?familia=marcos-y-tapas&q=tapa");
    await expect(page.locator("#productos-destacados article")).toHaveCount(1);
    await expect(searchbox(page)).toHaveValue("tapa");
    await expect(familyButton(page, "Marcos y tapas")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/productos?familia=inexistente");
    await expect(page.locator("#productos-destacados article")).toHaveCount(10);
    await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "true");
  });

  test("tarjetas: ficha, cotizar y solicitud del catálogo apuntan a rutas reales", async ({ page }) => {
    await page.goto("/productos");
    expect(await page.locator("main a[href='#']").count()).toBe(0);
    const first = page.locator("#productos-destacados article").first();
    await expect(first).toContainText("Válvula de compuerta bridada");
    await expect(first.getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta");
    await expect(first.getByRole("link", { name: "Cotizar", exact: true })).toHaveAttribute("href", "/cotizar");
    const tapa = page.locator("#productos-destacados article").filter({ hasText: "Tapa circular" });
    await expect(tapa.getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", "/productos/marcos-y-tapas/marco-tapa-d400");
    const catalogo = page.getByRole("link", { name: /Solicitar catálogo PDF|Descargar PDF/ });
    await expect(catalogo).toHaveAttribute("href", /^\/contacto\?motivo=documentacion&documento=|\.pdf$/);
  });

  test("las familias de la cuadrícula navegan a su página", async ({ page }) => {
    await page.goto("/productos");
    await page.getByRole("link", { name: "Explorar Tuberías" }).click();
    await expect(page).toHaveURL(/\/productos\/tuberias$/);
  });

  test("cotizar con producto precargado: /cotizar?producto= muestra el producto y un slug ajeno cae en la cotización general", async ({ page }) => {
    await page.goto("/cotizar?producto=tuberia-tyton");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tubería de hierro dúctil");
    await expect(page.locator("#input-qty")).toBeVisible();
    await page.goto("/cotizar?producto=no-existe");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solicitar una cotización");
  });
});

/** Los listados de línea (válvulas, tuberías, marcos y tapas) comparten estructura: pestañas por tipo, búsqueda, filtro, orden y tarjetas. */
type Line = {
  describe: string;
  route: string;
  region: string;
  total: number;
  search: { label: string; hit: string; hitCount: number };
  filterLabel: string;
  sortLabel: string;
  multi: { tab: string; value: string; count: number };
  single: { tab: string; value: string };
  az: string;
  za: string;
  emptyHeading: string;
  resetButton: string;
  cards: readonly (readonly [string, string])[];
};

const plural = (n: number) => `${n} ${n === 1 ? "producto" : "productos"}`;

function lineTests(line: Line) {
  test.describe(line.describe, () => {
    const cards = (page: Page) => page.locator(`section[aria-label="${line.region}"] article`);
    const count = (page: Page) => page.locator(`section[aria-label="${line.region}"] p[aria-live="polite"]`);
    const tab = (page: Page, text: string) => page.getByRole("tab").filter({ hasText: text });
    const searchbox = (page: Page) => page.getByRole("searchbox", { name: line.search.label });

    test("las pestañas filtran la grilla y los contadores coinciden", async ({ page }) => {
      await page.goto(line.route);
      await expect(cards(page)).toHaveCount(line.total);
      await expect(count(page)).toHaveText(plural(line.total));
      await expect(tab(page, "Todas")).toHaveAttribute("aria-selected", "true");
      await tab(page, line.multi.tab).click();
      await expect(tab(page, line.multi.tab)).toHaveAttribute("aria-selected", "true");
      await expect(tab(page, line.multi.tab)).toContainText(plural(line.multi.count));
      await expect(tab(page, "Todas")).toHaveAttribute("aria-selected", "false");
      await expect(cards(page)).toHaveCount(line.multi.count);
      await expect(count(page)).toHaveText(plural(line.multi.count));
      await tab(page, line.single.tab).click();
      await expect(cards(page)).toHaveCount(1);
      await expect(count(page)).toHaveText("1 producto");
      await tab(page, line.single.tab).click(); // segundo clic: vuelve a "Todas"
      await expect(cards(page)).toHaveCount(line.total);
      await expect(tab(page, "Todas")).toHaveAttribute("aria-selected", "true");
    });

    test("filtro, orden y búsqueda se combinan; el vacío ofrece restaurar", async ({ page }) => {
      await page.goto(line.route);
      await page.getByLabel(line.filterLabel).selectOption(line.multi.value);
      await expect(cards(page)).toHaveCount(line.multi.count);
      await expect(tab(page, line.multi.tab)).toHaveAttribute("aria-selected", "true");
      await page.getByLabel(line.filterLabel).selectOption("todas");
      await expect(cards(page)).toHaveCount(line.total);
      await page.getByLabel(line.sortLabel).selectOption("az");
      await expect(cards(page).first().getByRole("heading")).toHaveText(line.az);
      await page.getByLabel(line.sortLabel).selectOption("za");
      await expect(cards(page).first().getByRole("heading")).toHaveText(line.za);
      await searchbox(page).fill(line.search.hit);
      await expect(cards(page)).toHaveCount(line.search.hitCount);
      await searchbox(page).fill("zzz-inexistente");
      await expect(page.getByRole("heading", { name: line.emptyHeading })).toBeVisible();
      await expect(cards(page)).toHaveCount(0);
      await page.getByRole("button", { name: line.resetButton }).click();
      await expect(cards(page)).toHaveCount(line.total);
      await expect(searchbox(page)).toHaveValue("");
    });

    test("sin anclas vacías y CTAs reales", async ({ page }) => {
      await page.goto(line.route);
      expect(await page.locator("main a[href='#']").count()).toBe(0);
      for (const [name, href] of line.cards) {
        await expect(cards(page).filter({ hasText: name }).getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", href);
      }
      await expect(page.getByRole("link", { name: "Solicitar asesoría" })).toHaveAttribute("href", "/contacto");
      await expect(page.getByRole("link", { name: "Ver todos los recursos" })).toHaveAttribute("href", "/recursos");
      await expect(page.getByRole("link", { name: /Solicitar catálogo PDF|Descargar PDF/ })).toHaveAttribute("href", /^\/contacto\?motivo=documentacion&documento=|\.pdf$/);
    });
  });
}

lineTests({
  describe: "W03 válvulas",
  route: "/productos/valvulas",
  region: "Catálogo de válvulas",
  total: 6,
  search: { label: "Buscar válvula por nombre o referencia", hit: "mariposa", hitCount: 1 },
  filterLabel: "Filtrar por tipo de válvula",
  sortLabel: "Ordenar válvulas",
  multi: { tab: "Control", value: "control", count: 2 },
  single: { tab: "Aire", value: "aire" },
  az: "Válvula check flex",
  za: "Válvula reductora de presión",
  emptyHeading: "No encontramos válvulas con esos datos",
  resetButton: "Ver todas las válvulas",
  cards: [["Válvula de compuerta bridada", "/productos/valvulas/valvula-compuerta"], ["Válvula mariposa", "/productos/valvulas/valvula-mariposa"], ["Válvula check swing", "/contacto"]],
});

lineTests({
  describe: "W04 tuberías",
  route: "/productos/tuberias",
  region: "Catálogo de tuberías",
  total: 6,
  search: { label: "Buscar tubería por nombre, diámetro o referencia", hit: "mortero", hitCount: 1 },
  filterLabel: "Filtrar por tipo de tubería",
  sortLabel: "Ordenar tuberías",
  multi: { tab: "Unión junta", value: "junta", count: 3 },
  single: { tab: "Accesorios", value: "accesorios" },
  az: "Tubería con bridas",
  za: "Tubería HDPE",
  emptyHeading: "No encontramos tuberías con esos datos",
  resetButton: "Ver todos los productos",
  cards: [["Tubería HDPE", "/productos/tuberias/tuberia-tyton"], ["Tubería con bridas", "/contacto"]],
});

lineTests({
  describe: "W05 marcos y tapas",
  route: "/productos/marcos-y-tapas",
  region: "Catálogo de marcos y tapas",
  total: 6,
  search: { label: "Buscar tapa o marco por nombre o referencia", hit: "rejilla", hitCount: 1 },
  filterLabel: "Filtrar por tipo de producto",
  sortLabel: "Ordenar productos",
  multi: { tab: "Tapas circulares", value: "circulares", count: 2 },
  single: { tab: "Rejillas", value: "rejillas" },
  az: "Marco rectangular",
  za: "Tapa para válvula",
  emptyHeading: "No encontramos productos con esos datos",
  resetButton: "Ver todos los productos",
  cards: [["Tapa circular dúctil", "/productos/marcos-y-tapas/marco-tapa-d400"], ["Rejilla pluvial", "/contacto"]],
});

test.describe("W04 / W05 / W10-W12 enlaces", () => {
  for (const route of ["/productos/tuberias", "/productos/marcos-y-tapas", "/soluciones", "/soluciones/redes-matrices", "/nosotros"]) {
    test(`${route}: ningún href="#" ni botón sin acción`, async ({ page }) => {
      await page.goto(route);
      expect(await page.locator("main a[href='#']").count()).toBe(0);
      // Los únicos botones de acción sin enviar nada son las pestañas de tipo de los listados.
      expect(await page.locator("main button[type='button']:not([role='tab'])").count()).toBe(0);
    });
  }
  test("W04: 'Ver ficha' de la tubería HDPE abre su ficha y esta lleva a cotizar", async ({ page }) => {
    await page.goto("/productos/tuberias");
    await page.locator('section[aria-label="Catálogo de tuberías"] article').filter({ hasText: "Tubería HDPE" }).getByRole("link", { name: "Ver ficha", exact: true }).click();
    await expect(page).toHaveURL(/\/productos\/tuberias\/tuberia-tyton$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tubería de hierro dúctil");
    await page.getByRole("link", { name: "Solicitar cotización" }).first().click();
    await expect(page).toHaveURL(/\/cotizar$/);
  });
  test("W11: 'Solicitar cotización' de redes y matrices abre la cotización", async ({ page }) => {
    await page.goto("/soluciones/redes-matrices");
    const hrefs = await page.locator("main").getByRole("link", { name: "Solicitar cotización" }).evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(new Set(hrefs)).toEqual(new Set(["/cotizar"]));
    await expect(page.locator("main").getByRole("link", { name: "Explorar tuberías" })).toHaveAttribute("href", "/productos/tuberias");
    await page.locator("main").getByRole("link", { name: "Solicitar cotización" }).first().click();
    await expect(page).toHaveURL(/\/cotizar$/);
  });
});

test.describe("W05 formulario de requerimiento", () => {
  test("valida campos obligatorios y no envía sin completarlos", async ({ page }) => {
    await page.goto("/cotizar");
    const form = page.locator("#cotizacionForm");
    await form.scrollIntoViewIfNeeded();
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    // Validación nativa: el primer campo requerido queda inválido y no se llega a la confirmación.
    await expect(form.locator("#razonSocial:invalid")).toHaveCount(1);
    await expect(page).toHaveURL(/\/cotizar$/);
  });

  test("la cotización con producto precargado también valida antes de enviar", async ({ page }) => {
    await page.goto("/cotizar?producto=tuberia-tyton");
    const form = page.locator("main form");
    await form.getByRole("button", { name: "Enviar solicitud de cotización" }).click();
    expect(await form.locator("input:invalid, select:invalid, textarea:invalid").count()).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/cotizar\?producto=tuberia-tyton$/);
  });

  test("envío real: lleva a la confirmación con folio COT-… o muestra un error (nunca éxito falso)", async ({ page }) => {
    await page.goto("/cotizar");
    const form = page.locator("#cotizacionForm");
    await form.locator("#razonSocial").fill("Consorcio Prueba E2E");
    await form.locator("#rucEmpresa").fill("20601839281");
    await form.locator("#tipoProyecto").selectOption("saneamiento");
    await form.locator("#departamentoDestino").fill("Lima");
    await form.locator("#nombreSolicitante").fill("Ing. Prueba E2E");
    await form.locator("#cargoSolicitante").fill("Jefe de compras");
    await form.locator("#correoCorporativo").fill("e2e@example.com");
    await form.locator("#celularContacto").fill("+51 987 654 321");
    await form.locator("#familiaPrincipal").selectOption("marcos_tapas");
    await form.locator("#diametrosNominales").fill("DN 600");
    await form.locator("#cantidadMetrado").fill("10 unidades");
    await form.locator("#consentimiento").check();
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    // El anunciador de rutas de Next también usa role=alert: se acota al aviso de error del formulario.
    const err = form.getByRole("alert");
    await Promise.race([page.waitForURL(/\/cotizar\/confirmacion\?ref=COT-/, { timeout: 30_000 }), err.waitFor({ timeout: 30_000 })]);
    if (page.url().includes("/cotizar/confirmacion")) {
      const ref = new URL(page.url()).searchParams.get("ref");
      expect(ref).toMatch(/^COT-/);
      await expect(page.getByText(ref!).first()).toBeVisible();
    } else {
      await expect(err).toBeVisible();
      await expect(err).not.toHaveText("");
    }
  });
});

test.describe("W21 404", () => {
  test("responde 404 con mensaje, acciones y accesos rápidos reales", async ({ page }) => {
    const res = await page.goto("/ruta-que-no-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ups, esta página no se encuentra.");
    await expect(page.getByRole("link", { name: /Volver al inicio/ })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: /Explorar productos/ })).toHaveAttribute("href", "/productos");
    for (const [name, href] of [["Conoce nuestros productos", "/productos"], ["Explora por sectores", "/industrias"], ["Recursos técnicos", "/recursos"]] as const) {
      await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
    }
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  });

  test("usa la cabecera y el pie del sitio, y 'Explorar productos' navega", async ({ page }) => {
    await page.goto("/ruta-que-no-existe");
    await expect(page.locator("header.lp-header")).toBeVisible();
    await expect(page.locator("footer.lp-footer")).toBeVisible();
    await page.getByRole("link", { name: /Explorar productos/ }).click();
    await expect(page).toHaveURL(/\/productos$/);
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
