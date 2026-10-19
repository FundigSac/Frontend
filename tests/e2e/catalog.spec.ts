import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/** Recoge errores/avisos de consola y excepciones de la página. */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    // Chrome registra el 404 del propio documento en la ruta inexistente; no es un fallo de la página.
    if (/Failed to load resource.*404/.test(m.text()) && page.url().includes("ruta-que-no-existe")) return;
    // Solo en `next dev`: precarga el CSS del not-found (legal.css) en todas las rutas y Chrome avisa si la carga tarda. El build de producción no lo emite.
    if (/legal_[\w-]+\.css was preloaded using link preload but not used/.test(m.text())) return;
    problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

const ROUTES = ["/", "/productos", "/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas", "/nosotros", "/ruta-que-no-existe"];

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
    for (const href of ["/productos/valvulas", "/productos/marcos-y-tapas", "/productos?q=acople", "/productos/tuberias", "/industrias", "/recursos", "/contacto"]) {
      expect(hrefs, `falta un enlace a ${href}`).toContain(href);
    }
    await expect(page.getByRole("link", { name: "Explorar productos" })).toHaveAttribute("href", "/productos");
    await expect(page.getByRole("link", { name: "Ver soluciones" })).toHaveAttribute("href", "/industrias");
  });

  test("Grifos no está en el catálogo: la tarjeta lleva a cotizar y ningún acceso de búsqueda termina en un catálogo vacío", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a.lp-card").filter({ hasText: "Grifos" })).toHaveAttribute("href", "/cotizar");
    const homeHrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    await page.goto("/mapa-del-sitio");
    const mapHrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    expect([...homeHrefs, ...mapHrefs]).not.toContain("/productos?q=grifo");
    const searches = [...new Set([...homeHrefs, ...mapHrefs].filter((h) => h.startsWith("/productos?q=")))];
    expect(searches.length).toBeGreaterThan(0);
    for (const href of searches) {
      await page.goto(href);
      await expect(page.locator("#productos-destacados article").first(), `${href} no devuelve productos`).toBeVisible();
    }
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

  test("muestra 5 familias y 12 productos destacados", async ({ page }) => {
    await page.goto("/productos");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Catálogo general");
    const families = page.getByRole("region", { name: "Familias de productos" }).locator("article");
    await expect(families).toHaveCount(5);
    const hrefs = await families.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(expect.arrayContaining(["/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas", "/productos?familia=accesorios-hdpe", "/productos?familia=conexiones-y-fittings"]));
    await expect(page.locator("#productos-destacados article")).toHaveCount(12);
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
    await expect(cards).toHaveCount(12);
    await expect(searchbox(page)).toHaveValue("");
    await expect(page).not.toHaveURL(/q=/);
  });

  test("filtros por familia: cada botón filtra, repetir el clic lo quita y se combina con la búsqueda", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#productos-destacados article");
    for (const [label, familia, total] of [["Válvulas", "valvulas", 5], ["Tuberías", "tuberias", 1], ["Marcos y tapas", "marcos-y-tapas", 1], ["Accesorios HDPE", "accesorios-hdpe", 3], ["Conexiones y fittings", "conexiones-y-fittings", 2]] as const) {
      await familyButton(page, label).click();
      await expect(familyButton(page, label)).toHaveAttribute("aria-pressed", "true");
      await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "false");
      await expect(cards).toHaveCount(total);
      await expect(page).toHaveURL(new RegExp(`familia=${familia}`));
    }
    await familyButton(page, "Conexiones y fittings").click(); // segundo clic: vuelve a "Todas"
    await expect(cards).toHaveCount(12);
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
    await expect(page.locator("#productos-destacados article")).toHaveCount(12);
    await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "true");
  });

  test("navegación suave: las tarjetas con ?familia= filtran y marcan el botón de familia sin recargar", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#productos-destacados article");
    await expect(cards.first()).toBeVisible();
    const all = await cards.count();
    for (const [name, label, familia, total] of [
      ["Codo 90° HDPE", "Accesorios HDPE", "accesorios-hdpe", 3],
      ["Tee HDPE", "Accesorios HDPE", "accesorios-hdpe", 3],
      ["Reducción HDPE", "Accesorios HDPE", "accesorios-hdpe", 3],
      ["Unión flexible HDPE", "Conexiones y fittings", "conexiones-y-fittings", 2],
      ["Adaptador brida HDPE", "Conexiones y fittings", "conexiones-y-fittings", 2],
    ] as const) {
      await familyButton(page, "Todas").click();
      await expect(cards).toHaveCount(all);
      await cards.filter({ hasText: name }).getByRole("link", { name: "Ver ficha", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`familia=${familia}$`));
      await expect(familyButton(page, label)).toHaveAttribute("aria-pressed", "true");
      await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "false");
      await expect(cards).toHaveCount(total);
      await expect(cards.filter({ hasText: name })).toHaveCount(1);
    }
    // Atrás (popstate) vuelve al catálogo completo.
    await page.goBack();
    await expect(page).not.toHaveURL(/familia=/);
    await expect(familyButton(page, "Todas")).toHaveAttribute("aria-pressed", "true");
    await expect(cards).toHaveCount(all);
  });

  test("navegación suave: la URL de la carga inicial vuelve a filtrar tras quitar el filtro con los botones", async ({ page }) => {
    await page.goto("/productos?familia=accesorios-hdpe");
    const cards = page.locator("#productos-destacados article");
    await expect(cards).toHaveCount(3);
    await familyButton(page, "Todas").click();
    await expect(cards).not.toHaveCount(3);
    await page.getByRole("link", { name: "Explorar Accesorios HDPE" }).click();
    await expect(page).toHaveURL(/familia=accesorios-hdpe$/);
    await expect(familyButton(page, "Accesorios HDPE")).toHaveAttribute("aria-pressed", "true");
    await expect(cards).toHaveCount(3);
  });

  test("navegación suave: el filtro de familia sustituye una búsqueda previa y los espacios al teclear se conservan", async ({ page }) => {
    await page.goto("/productos");
    const cards = page.locator("#productos-destacados article");
    await searchbox(page).pressSequentially("tapa ");
    await expect(searchbox(page)).toHaveValue("tapa ");
    await expect(cards).toHaveCount(1);
    await page.getByRole("region", { name: "Familias de productos" }).getByRole("link", { name: "Explorar Conexiones y fittings" }).click();
    await expect(page).toHaveURL(/familia=conexiones-y-fittings$/);
    await expect(searchbox(page)).toHaveValue("");
    await expect(familyButton(page, "Conexiones y fittings")).toHaveAttribute("aria-pressed", "true");
    await expect(cards).toHaveCount(2);
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

  test("ficha FUNDIGSAC con garantía extendida sale del catálogo con etiqueta, sin años, y usa la plantilla de la ficha", async ({ page }) => {
    const slug = "valvula-compuerta-fundigsac-garantia-extendida";
    await page.goto("/productos");
    const card = page.locator("#productos-destacados article").filter({ hasText: "Garantía extendida" });
    await expect(card).toHaveCount(1);
    await expect(card).not.toContainText("5 años");
    await expect(card.getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", `/productos/valvulas/${slug}`);
    await card.getByRole("link", { name: "Ver ficha", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/productos/valvulas/${slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Válvula de compuerta bridada FUNDIGSAC");
    await expect(page.getByText("Garantía extendida respaldada por FUNDIGSAC")).toBeVisible();
    await expect(page.getByRole("row", { name: /^Garantía Extendida/ })).toBeVisible();
    await expect(page.locator("main").getByText("5 años")).toHaveCount(0);
    const thumbs = page.getByRole("group", { name: "Fotos de la válvula" }).getByRole("button");
    await expect(thumbs).toHaveCount(5);
    const srcOf = () => page.getByRole("group", { name: "Fotos de la válvula" }).locator("img").evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)));
    expect((await srcOf()).every((u) => u.includes("/media/valvula-fundigsac-cuadrante/q-0"))).toBe(true);
    await expect(page.locator("main").getByRole("link", { name: "Solicitar cotización" })).toHaveAttribute("href", "/cotizar");
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac-5-anos");
    await expect(page).toHaveURL(new RegExp(`/productos/valvulas/${slug}$`));
  });

  test("ficha FUNDIGSAC: galería con 5 fotos propias y sin garantía indicada; la base conserva la suya", async ({ page }) => {
    await page.goto("/productos");
    const card = page.locator("#productos-destacados article").filter({ hasText: "Válvula de compuerta FUNDIGSAC" }).filter({ hasNotText: "Garantía extendida" });
    await card.getByRole("link", { name: "Ver ficha", exact: true }).click();
    await expect(page).toHaveURL(/\/productos\/valvulas\/valvula-compuerta-fundigsac$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Válvula de compuerta bridada FUNDIGSAC");
    await expect(page.locator("main").getByText(/garantía/i)).toHaveCount(0);
    await expect(page.getByRole("row", { name: /^Marca FUNDIGSAC/ })).toBeVisible();
    const thumbs = page.getByRole("group", { name: "Fotos de la válvula" }).getByRole("button");
    await expect(thumbs).toHaveCount(5);
    await expect(page.locator("main img").first()).toHaveAttribute("alt", /FUNDIGSAC, vista frontal con el logotipo en relieve/);
    const srcOf = () => page.getByRole("group", { name: "Fotos de la válvula" }).locator("img").evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)));
    expect((await srcOf()).every((u) => u.includes("/media/valvula-fundigsac/f-0"))).toBe(true);
    await thumbs.nth(3).click();
    await expect(page.locator("main img").first()).toHaveAttribute("alt", /etiqueta DN100 de 4 pulgadas en la brida/);
    await page.getByRole("button", { name: "Ampliar" }).click();
    await expect(page.getByRole("dialog", { name: "Galería ampliada" })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Galería ampliada" })).toBeHidden();
    for (const slug of ["valvula-compuerta"]) {
      await page.goto(`/productos/valvulas/${slug}`);
      expect((await srcOf()).every((u) => u.includes("/media/valvula-hd/v-0"))).toBe(true);
    }
  });

  test("fichas de compuerta: cada una muestra los datos y el PDF de su ficha técnica", async ({ page }) => {
    const cases = [
      ["valvula-compuerta", "Ficha técnica FT-HI-100 · Rev. 13", "/docs/ficha-tecnica-valvula-compuerta-bridada.pdf", /^Rango dimensional DN40 a DN600/],
      ["valvula-compuerta-fundigsac", "Ficha técnica FUNDIGSAC · Válvula compuerta bridada", "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf", /^Diseño DIN 3352 F4/],
      ["valvula-compuerta-fundigsac-garantia-extendida", "Ficha técnica FT-HD N° 002-2024", "/docs/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf", /^Ficha técnica FT-HD N° 002-2024/],
    ] as const;
    for (const [slug, title, pdf, row] of cases) {
      await page.goto(`/productos/valvulas/${slug}`);
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
      await expect(page.locator("main a[download]").first()).toHaveAttribute("href", pdf);
      await expect(page.getByRole("row", { name: row })).toBeVisible();
      const res = await page.request.get(pdf);
      expect(res.status()).toBe(200);
    }
    // FUNDIGSAC de 1 año: ficha FUNDIGSAC completada con la del proveedor (DN100: D1 180, D2 156, 8 × Φ19, M16).
    await page.goto("/productos/valvulas/valvula-compuerta-fundigsac");
    await page.getByRole("button", { name: "DN100", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Bridas · DN100" })).toBeVisible();
    await expect(page.getByRole("row", { name: /PN16 220 180 156 19 – 3 8 × 19 M16/ })).toBeVisible();
    await page.getByRole("button", { name: "DN300", exact: true }).click();
    await expect(page.getByRole("row", { name: /PN16 455 410 370 24.5 – 4 12 × 28 M24/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /^Serie Z45X/ })).toBeVisible();
  });

  test("Ver en 3D: cada válvula de compuerta carga su propio modelo", async ({ page }) => {
    test.setTimeout(120_000);
    const cases = [
      ["valvula-compuerta", "/models/valvula-hitaly.glb"],
      ["valvula-compuerta-fundigsac", "/models/valvula-fundigsac.glb"],
      ["valvula-compuerta-fundigsac-garantia-extendida", "/models/valvula-fundigsac-cuadrante.glb"],
    ] as const;
    // Texturas externas del mismo origen: ningún blob: bloqueado por la CSP ni textura sin cargar.
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error" && /Content Security Policy|texture|GLTFLoader/i.test(m.text())) errors.push(m.text()); });
    page.on("response", (r) => { if (r.url().includes("/models/") && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const [slug, model] of cases) {
      await page.goto(`/productos/valvulas/${slug}`);
      const res = await page.request.get(model);
      expect(res.status()).toBe(200);
      await page.getByRole("button", { name: "Ver en 3D" }).first().click();
      const viewer = page.locator("main model-viewer").first();
      // React asigna src como propiedad del elemento personalizado (no se refleja como atributo).
      await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src?: string }).src ?? ""), { timeout: 30_000 }).toContain(model);
      await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { loaded?: boolean }).loaded === true), { timeout: 60_000 }).toBe(true);
      await page.getByRole("button", { name: "Volver a las fotos" }).first().click();
      await expect(page.locator("main model-viewer")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
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
        // Por encabezado exacto: un nombre puede ser subcadena de otro.
        const card = cards(page).filter({ has: page.getByRole("heading", { name, exact: true }) }).filter({ has: page.locator(`a[href="${href}"]`) });
        // Sin ficha publicada, la tarjeta pide la ficha por Contacto con el producto indicado (no promete "Ver ficha").
        const label = href.startsWith("/contacto") ? "Solicitar ficha" : "Ver ficha";
        await expect(card.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
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
  total: 8,
  search: { label: "Buscar válvula por nombre o referencia", hit: "mariposa", hitCount: 1 },
  filterLabel: "Filtrar por tipo de válvula",
  sortLabel: "Ordenar válvulas",
  multi: { tab: "Control", value: "control", count: 2 },
  single: { tab: "Aire", value: "aire" },
  az: "Válvula check flex",
  za: "Válvula reductora de presión",
  emptyHeading: "No encontramos válvulas con esos datos",
  resetButton: "Ver todas las válvulas",
  cards: [["Válvula de compuerta bridada", "/productos/valvulas/valvula-compuerta"], ["Válvula de compuerta FUNDIGSAC", "/productos/valvulas/valvula-compuerta-fundigsac"], ["Válvula de compuerta FUNDIGSAC", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida"], ["Válvula mariposa", "/productos/valvulas/valvula-mariposa"], ["Válvula check swing", "/contacto?motivo=documentacion&documento=V%C3%A1lvula%20check%20swing"]],
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
  cards: [["Tubería HDPE", "/productos/tuberias/tuberia-tyton"], ["Tubería con bridas", "/contacto?motivo=documentacion&documento=Tuber%C3%ADa%20con%20bridas"]],
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
  cards: [["Tapa circular dúctil", "/productos/marcos-y-tapas/marco-tapa-d400"], ["Rejilla pluvial", "/contacto?motivo=documentacion&documento=Rejilla%20pluvial"]],
});

test.describe("W04 / W05 / W10-W12 enlaces", () => {
  for (const route of ["/productos/tuberias", "/productos/marcos-y-tapas", "/nosotros"]) {
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

  test("envío: deja la solicitud lista para correo o WhatsApp sin borrar datos (nunca éxito falso)", async ({ page }) => {
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
    // Etapa sin registro en línea: nunca un folio ni un "registrado" falso; la solicitud queda lista para enviarse.
    await expect(form.getByRole("heading", { name: "Tu solicitud está lista para enviar" })).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/cotizar$/);
    await expect(form.locator("#razonSocial")).toHaveValue("Consorcio Prueba E2E");
    const body = decodeURIComponent((await form.getByRole("link", { name: "Enviar por correo" }).getAttribute("href"))!);
    expect(body).toContain("Consorcio Prueba E2E");
    expect(body).toContain("DN 600");
    expect(body).not.toContain("No completar este campo"); // la trampa anti-bots no viaja en el mensaje
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

test.describe("W03 válvulas · idioma", () => {
  test("el selector cambia toda la pantalla a inglés y vuelve a español, sin perder filtros ni búsqueda", async ({ page, isMobile }) => {
    await page.goto("/productos/valvulas");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Válvulas");
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
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Valves");
    const cards = page.locator("section[aria-label='Valve catalog'] article");
    await expect(cards).toHaveCount(8);
    await expect(cards.filter({ hasText: "Extended warranty" })).toHaveCount(1);
    await expect(page.locator("main").getByText("Garantía extendida")).toHaveCount(0);
    await page.getByPlaceholder("Search valves by name or reference…").fill("butterfly");
    await expect(cards).toHaveCount(1);
    await expect(cards.first().getByRole("heading")).toHaveText("Butterfly valve");
    await page.getByPlaceholder("Search valves by name or reference…").fill("zzzz");
    await expect(page.getByRole("heading", { name: "We couldn’t find valves matching that" })).toBeVisible();
    await page.getByRole("button", { name: "Show all valves" }).click();
    await expect(cards).toHaveCount(8);
    await pick("Español");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-PE");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Válvulas");
    await expect(page.locator("section[aria-label='Catálogo de válvulas'] article").filter({ hasText: "Garantía extendida" })).toHaveCount(1);
  });
});
