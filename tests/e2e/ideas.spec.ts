import { expect, test, type Page } from "@playwright/test";
import { blockWritesIfReadOnly, skipIfReadOnly } from "./_guard";

/**
 * Ideas del informe de inspiración aplicadas al sitio (Report/03-inspiration-parts, 03c-external-design-discovery):
 * B18-1, X2-1 + X1-1, B30-3 + X5-7, X1-2 + B8-3, B28-1, X11-3, X11-2, X7-3 y B28-9. Los envíos de formularios se
 * responden en el navegador con datos sintéticos: ninguna prueba llega a un Backend real.
 */
blockWritesIfReadOnly(test);

const fakeIp = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
test.use({ extraHTTPHeaders: { "x-forwarded-for": fakeIp } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
});

async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"));
  }, selector);
}

async function open(page: Page, url: string, hydrateSelector: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await hydrated(page, hydrateSelector);
  await page.getByRole("button", { name: "Rechazar todas" }).click({ timeout: 2500 }).catch(() => {});
}

const CART = [{ slug: "valvula-compuerta", name: "Válvula de compuerta bridada", variant: "DN100 · PN16", quantity: 3 }];

test.describe("B18-1 contraste del naranja", () => {
  for (const route of ["/", "/productos", "/carrito", "/reclamaciones", "/cotizar"]) {
    test(`todo texto sobre naranja o en naranja pasa AA en ${route}`, async ({ page }) => {
      await page.addInitScript((c) => localStorage.setItem("fundigsac-quote", JSON.stringify(c)), CART);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const failures = await page.evaluate(() => {
        const parse = (c: string) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
        };
        type C = { r: number; g: number; b: number };
        const lum = ({ r, g, b }: C) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a: C, b: C) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const orange = ({ r, g, b }: C) => r > 150 && r - b > 90 && g < r - 40 && g > 40;
        // Fondo sólido más cercano; si hay un degradado o una imagen en el camino, el elemento no se mide.
        const bgOf = (el: Element): C | null => {
          for (let n: Element | null = el; n; n = n.parentElement) {
            const s = getComputedStyle(n);
            if (s.backgroundImage !== "none") return null;
            const c = parse(s.backgroundColor);
            if (c && c.a > 0.9) return c;
          }
          return { r: 255, g: 255, b: 255 };
        };
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const text = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent?.trim()).join("").trim();
          if (!text) continue;
          const rect = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          if (!rect.width || !rect.height || s.visibility === "hidden" || Number(s.opacity) < 0.95 || el.closest("[aria-hidden='true'], [inert]")) continue;
          const fg = parse(s.color);
          const bg = bgOf(el);
          if (!fg || !bg || (!orange(fg) && !orange(bg))) continue;
          const size = parseFloat(s.fontSize);
          const large = size >= 24 || (Number(s.fontWeight) >= 700 && size >= 18.66);
          const r = ratio(fg, bg);
          if (r < (large ? 3 : 4.5)) out.push(`${r.toFixed(2)} «${text.slice(0, 30)}» ${s.color} / rgb(${bg.r},${bg.g},${bg.b})`);
        }
        return out;
      });
      expect(failures).toEqual([]);
    });
  }

  test("el botón principal y el contador del carrito usan el naranja de CTA (4.56:1 con blanco)", async ({ page }) => {
    await page.addInitScript((c) => localStorage.setItem("fundigsac-quote", JSON.stringify(c)), CART);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".lp-cart__badge")).toHaveCSS("background-color", "rgb(201, 79, 10)");
    await expect(page.locator(".lp-hero .lp-btn--solid").first()).toHaveCSS("background-color", "rgb(201, 79, 10)");
  });
});

test.describe("X2-1 + X1-1 filtros activos y contador", () => {
  test("válvulas: chips por filtro, quitar uno a uno, restablecer todo y contador anunciado", async ({ page }) => {
    await open(page, "/productos/valvulas", 'main input[type="search"]');
    const section = page.locator("section[aria-label]").filter({ has: page.locator('input[type="search"]') });
    const count = section.locator('p[aria-live="polite"]');
    await expect(count).toHaveAttribute("aria-atomic", "true");
    await expect(count).toHaveText("12 productos");
    await expect(page.locator("[data-active-filters]")).toHaveCount(0);

    await page.getByPlaceholder(/Buscar válvula/).fill("compuerta");
    await page.getByLabel("Ordenar válvulas").selectOption("az");
    const chips = page.getByRole("group", { name: "Filtros activos" });
    await expect(chips.getByRole("listitem")).toHaveCount(2);
    await expect(chips).toContainText("Búsqueda: «compuerta»");
    await expect(chips).toContainText("Orden: Nombre (A–Z)");
    await expect(count).toHaveText("5 productos");

    await chips.getByRole("button", { name: "Quitar filtro: Búsqueda: «compuerta»" }).click();
    await expect(page.getByPlaceholder(/Buscar válvula/)).toHaveValue("");
    await expect(count).toHaveText("12 productos");
    // El foco pasa al chip que queda, no se pierde en el documento.
    await expect(chips.getByRole("button", { name: /Quitar filtro: Orden/ })).toBeFocused();

    await page.getByRole("tab", { name: /Mariposa/ }).click();
    await expect(chips.getByRole("listitem")).toHaveCount(2);
    await chips.getByRole("button", { name: "Restablecer todo" }).click();
    await expect(page.locator("[data-active-filters]")).toHaveCount(0);
    await expect(page.getByRole("tab", { name: /Todas/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByPlaceholder(/Buscar válvula/)).toBeFocused();
  });

  test("familia genérica y /productos: el chip de línea o familia se quita con el teclado", async ({ page }) => {
    await open(page, "/productos/accesorios-hdpe", 'main input[type="search"]');
    await page.getByRole("tab", { name: /Codos/ }).click();
    const chip = page.getByRole("button", { name: "Quitar filtro: Codos" });
    await chip.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tab", { name: /Todos/ })).toHaveAttribute("aria-selected", "true");

    await open(page, "/productos?familia=valvulas", 'input[type="search"]');
    await expect(page.locator('#productos-destacados p[aria-live="polite"]')).toHaveText("5 productos");
    await page.getByRole("button", { name: "Quitar filtro: Válvulas" }).click();
    await expect(page.locator('#productos-destacados p[aria-live="polite"]')).toHaveText("14 productos");
    await expect(page).not.toHaveURL(/familia=/);
  });
});

test.describe("B30-3 + X5-7 búsqueda sin resultados", () => {
  test("muestra lo buscado, pistas y familias, y lleva a cotizar con el texto ya escrito", async ({ page }) => {
    await open(page, "/productos?q=grifo%20bronce", 'input[type="search"]');
    const empty = page.locator("[data-empty-search]");
    await expect(empty).toContainText("Buscaste: «grifo bronce»");
    await expect(empty.getByRole("listitem").first()).toBeVisible();
    await expect(empty.getByRole("navigation", { name: "Familias más consultadas" }).getByRole("link")).toHaveCount(5);
    const quote = empty.getByRole("link", { name: "Pedir cotización de «grifo bronce»" });
    await expect(quote).toHaveAttribute("href", "/cotizar?consulta=grifo%20bronce");
    await quote.click();
    await expect(page).toHaveURL(/\/cotizar\?consulta=grifo%20bronce$/);
    await expect(page.getByLabel("Producto que buscas")).toHaveValue("grifo bronce");
  });

  test("también en los listados de familia; sin consulta, /cotizar no muestra el campo", async ({ page }) => {
    await open(page, "/productos/tuberias", 'main input[type="search"]');
    await page.locator('main input[type="search"]').fill("grifo");
    await expect(page.getByRole("link", { name: "Pedir cotización de «grifo»" })).toHaveAttribute("href", "/cotizar?consulta=grifo");
    await page.goto("/cotizar");
    await expect(page.locator("#productoBuscado")).toHaveCount(0);
  });
});

test.describe("X1-2 + B8-3 línea técnica de las tarjetas", () => {
  test("solo con datos de la ficha: válvulas y accesorios la muestran, tuberías sin datos no", async ({ page }) => {
    await page.goto("/productos/valvulas");
    const fundigsac = page.locator("article").filter({ has: page.locator('a[href="/productos/valvulas/valvula-compuerta-fundigsac"]') });
    await expect(fundigsac.locator("[data-spec-line]")).toHaveText("DN50 – DN600 · PN10 / PN16");
    const luflex = page.locator("article").filter({ has: page.locator('a[href="/productos/valvulas/valvula-embone-tipo-luflex"]') });
    await expect(luflex.locator("[data-spec-line]")).toContainText("PN16 · Hierro dúctil GGG50 · Embone");

    await page.goto("/productos/accesorios-hdpe");
    await expect(page.locator('[data-cell="codo-hdpe-termofusion-90-sdr11"] [data-spec-line]')).toHaveText("HDPE · Termofusión");
    await page.goto("/productos/equipos-termofusion");
    await expect(page.locator("[data-spec-line]")).toHaveCount(0);
    await page.goto("/productos/tuberias");
    await expect(page.locator("[data-spec-line]")).toHaveCount(0);
  });
});

async function fillQuote(page: Page) {
  await page.locator("#razonSocial").fill("Consorcio Demo S.A.C.");
  await page.locator("#rucEmpresa").fill("20100070970");
  await page.locator("#tipoProyecto").selectOption("saneamiento");
  await page.locator("#departamentoDestino").fill("Lima");
  await page.locator("#nombreSolicitante").fill("Ing. Demo");
  await page.locator("#cargoSolicitante").fill("Compras");
  await page.locator("#correoCorporativo").fill("demo@example.com");
  await page.locator("#celularContacto").fill("987654321");
  await page.locator("#familiaPrincipal").selectOption("valvulas");
  await page.locator("#diametrosNominales").fill("DN 150");
  await page.locator("#cantidadMetrado").fill("4 unds");
  await page.locator("#consentimiento").check();
}

test.describe("B28-1 botón de envío de la cotización", () => {
  skipIfReadOnly(test);

  test("reposo → enviando → «Enviado» con el estado anunciado, y luego la confirmación", async ({ page }) => {
    await page.route("**/api/forms/quote", async (route) => {
      await new Promise((r) => setTimeout(r, 700));
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ folio: "COT-2026-000123" }) });
    });
    await open(page, "/cotizar", "#razonSocial");
    await fillQuote(page);
    const button = page.locator('#cotizacionForm button[type="submit"]');
    await expect(button).toHaveAttribute("data-submit-state", "idle");
    await button.click();
    await expect(button).toHaveAttribute("data-submit-state", "pending");
    await expect(button).toBeDisabled();
    await expect(page.locator('#cotizacionForm [role="status"]').first()).toHaveText("Enviando la solicitud…");
    await expect(button).toHaveAttribute("data-submit-state", "done", { timeout: 30_000 });
    await expect(button).toHaveAccessibleName("Enviado");
    await expect(page).toHaveURL(/\/cotizar\/confirmacion\?ref=COT-2026-000123$/, { timeout: 30_000 });
  });

  test("si el sistema rechaza datos, se muestra su motivo real y el botón vuelve a estar disponible", async ({ page }) => {
    await page.route("**/api/forms/quote", (route) =>
      route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "VALIDATION", errors: [{ field: "contact.ruc", code: "INVALID", message: "El RUC no figura como activo." }] }) }),
    );
    await open(page, "/cotizar", "#razonSocial");
    await fillQuote(page);
    const button = page.locator('#cotizacionForm button[type="submit"]');
    await button.click();
    await expect(page.getByRole("alert").filter({ hasText: "El RUC no figura como activo." })).toBeVisible({ timeout: 30_000 });
    await expect(button).toHaveAttribute("data-submit-state", "idle");
    await expect(button).toBeEnabled();
  });

  test("con movimiento reducido el cambio de estado no se anima", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/cotizar");
    // motion.css deja 0,01 ms en todo con movimiento reducido: en la práctica, instantáneo.
    const duration = await page.locator(".lead-submit__layer").first().evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duration).toBeLessThan(0.001);
    await context.close();
  });
});

test.describe("X11-3 resumen de errores", () => {
  for (const { route, form, submit, first, field } of [
    { route: "/cotizar", form: "#cotizacionForm", submit: /Enviar solicitud/, first: "Razón social", field: "#razonSocial" },
    { route: "/contacto", form: "#contacto-form", submit: /Enviar mensaje/, first: "Nombre completo", field: 'input[name="fullName"]' },
    { route: "/reclamaciones", form: "#reclamaciones-form", submit: /Enviar reclamo/, first: "Nombres y apellidos", field: 'input[name="nombresYApellidosRazon"]' },
  ]) {
    test(`${route}: al enviar con errores, el resumen recibe el foco y enlaza cada campo`, async ({ page }) => {
      await open(page, route, form);
      await page.locator(form).getByRole("button", { name: submit }).click();
      const summary = page.locator(`${form} [data-error-summary]`);
      await expect(summary).toBeFocused();
      await expect(summary.getByRole("heading")).toContainText(/Revisa \d+ campos? antes de enviar/);
      await expect(page.locator(field)).toHaveAttribute("aria-invalid", "true");
      const link = summary.getByRole("link").first();
      await expect(link).toContainText(first);
      await link.click();
      await expect(page.locator(field)).toBeFocused();
      await page.locator(field).fill("Dato de prueba");
      await expect(page.locator(field)).not.toHaveAttribute("aria-invalid", "true");
    });
  }
});

test.describe("X11-2 constancia del Libro de Reclamaciones", () => {
  skipIfReadOnly(test);

  async function fileClaim(page: Page, receipt: Record<string, string>) {
    await page.route("**/api/forms/complaint", (route) => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(receipt) }));
    await open(page, "/reclamaciones", "#reclamaciones-form");
    const f = page.locator("#reclamaciones-form");
    await f.locator('input[name="nombresYApellidosRazon"]').fill("Usuario Demo");
    await f.locator('select[name="tipoDeDocumento"]').selectOption("DNI");
    await f.locator('input[name="numeroDeDocumento"]').fill("12345678");
    await f.locator('input[name="correoElectronico"]').fill("demo@example.com");
    await f.locator('input[name="telefonoDeContacto"]').fill("987654321");
    await f.locator('input[name="domicilioLegalOHabitual"]').fill("Av. Demo 123, Lima");
    await f.locator('select[name="descripcionDelProductoO"]').selectOption("Válvulas");
    await f.locator('input[name="fechaDelSuceso"]').fill("2026-10-10");
    await f.locator('textarea[name="detalleDeLosHechos"]').fill("Detalle de prueba con datos sintéticos.");
    await f.locator('textarea[name="pedidoConcretoOPretension"]').fill("Respuesta formal.");
    await f.locator('input[name="consentimientoLeyN29733"]').check();
    await f.getByRole("button", { name: /Enviar reclamo/ }).click();
    return page.locator("#reclamo-registrado");
  }

  test("muestra folio, fecha de registro y plazo legal devueltos por el sistema, e imprime solo la constancia", async ({ page }) => {
    const receipt = await fileClaim(page, { folio: "REC-2026-000123", kind: "CLAIM", status: "RECEIVED", filedAt: "2026-11-10T15:30:00Z", responseDueOn: "2026-12-02", receiptToken: "demo" });
    await expect(receipt).toBeVisible({ timeout: 30_000 });
    await expect(receipt.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(receipt).toContainText("REC-2026-000123");
    await expect(receipt).toContainText(/Fecha de registro\s*10 de noviembre de 2026/);
    await expect(receipt).toContainText(/Plazo legal de respuesta\s*2 de diciembre de 2026/);
    await expect(receipt).toContainText("RUC 20601839281");
    await expect(receipt.getByRole("button", { name: "Imprimir constancia" })).toBeVisible();
    await page.emulateMedia({ media: "print" });
    await expect(receipt.locator("code")).toBeVisible();
    await expect(page.locator("header").first()).toBeHidden();
    await expect(receipt.getByRole("button", { name: "Imprimir constancia" })).toBeHidden();
  });

  test("sin fecha de registro en la respuesta, no se muestra una inventada", async ({ page }) => {
    const receipt = await fileClaim(page, { folio: "REC-2026-000124", kind: "GRIEVANCE", status: "RECEIVED", responseDueOn: "2026-12-02" });
    await expect(receipt).toBeVisible({ timeout: 30_000 });
    await expect(receipt).not.toContainText("Fecha de registro");
    await expect(receipt).toContainText("2 de diciembre de 2026");
  });
});

test.describe("X7-3 cantidades del carrito", () => {
  test("− / + con nombre del producto, mínimo 1 y el total anunciado en la cabecera", async ({ page }) => {
    await page.addInitScript((c) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("fundigsac-quote", JSON.stringify(c)); sessionStorage.setItem("seeded", "1"); } }, CART);
    await open(page, "/carrito", "main");
    const group = page.getByRole("group", { name: "Cantidad: Válvula de compuerta bridada" }).first();
    const qty = group.getByRole("spinbutton", { name: "Cantidad: Válvula de compuerta bridada" });
    await expect(qty).toHaveValue("3");
    await group.getByRole("button", { name: "Sumar una unidad: Válvula de compuerta bridada" }).click();
    await expect(qty).toHaveValue("4");
    await expect(page.locator("[data-cart-announcer]")).toHaveText("Mi cotización: 4 unidades");
    const minus = group.getByRole("button", { name: "Restar una unidad: Válvula de compuerta bridada" });
    for (let i = 0; i < 3; i++) await minus.click();
    await expect(qty).toHaveValue("1");
    await expect(minus).toBeDisabled();
    await expect(page.locator("[data-cart-announcer]")).toHaveText("Mi cotización: 1 unidad");
    // Se puede borrar el número para escribir otro; al salir vacío vuelve a 1.
    await qty.fill("");
    await expect(qty).toHaveValue("");
    await qty.blur();
    await expect(qty).toHaveValue("1");
    await qty.fill("7");
    await expect(qty).toHaveValue("7");
  });
});

test.describe("B28-9 carrusel del inicio", () => {
  test("tiene un control de pausa visible que detiene la rotación", async ({ page }) => {
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pausar carrusel" });
    await expect(pause).toBeVisible();
    const box = await pause.boundingBox();
    expect(box && box.width >= 24 && box.height >= 24).toBe(true);
    await pause.click();
    await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeVisible();
  });

  test("con movimiento reducido empieza en pausa y no rota", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });
    await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeVisible();
    const first = await page.locator(".lp-hero__valve.is-active").getAttribute("src");
    await page.waitForTimeout(3500);
    expect(await page.locator(".lp-hero__valve.is-active").getAttribute("src")).toBe(first);
    await context.close();
  });
});
