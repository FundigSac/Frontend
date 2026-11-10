import { expect, test, type Page } from "@playwright/test";
import { findCatalogSheet } from "../../src/modules/catalog/public-catalog";
import { variantKey } from "../../src/modules/catalog/variant-table";
import { blockWritesIfReadOnly } from "./_guard";

/**
 * Segunda tanda de ideas del informe de inspiración (Report/03-inspiration-parts): X1-4 (tabla de medidas), X5-4
 * (medidas hermanas por dirección), B10-2 (chips, cantidad y CTA naranja), X5-1 (conteo por filtro) y las familias
 * de termofusión y medidores en /productos. Más los puntos de Lighthouse: puntos del carrusel de 24 px, texto legible
 * antes del revelado y variantes de imagen de 480 px. Ninguna prueba envía formularios.
 */
blockWritesIfReadOnly(test);

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));

test.beforeEach(async ({ context, baseURL, page }) => {
  await context.addCookies([{ name: "fundigsac-consent", value: consent, url: baseURL! }]);
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
});

/** Espera a que React tome el control del elemento (los clics antes de hidratar se pierden). */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"));
  }, selector);
}

const MELEC = "/productos/medidores/medidor-electromagnetico-melec";
const melec = findCatalogSheet("medidor-electromagnetico-melec")!;

test.describe("ficha: tabla de medidas (X1-4) y medidas hermanas (X5-4)", () => {
  test("la tabla tiene caption, encabezados con scope y primera columna fija", async ({ page }) => {
    await page.goto(MELEC);
    const section = page.getByRole("region", { name: "Medidas disponibles" });
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Medidas disponibles");
    const table = section.getByRole("table");
    await expect(table.locator("caption")).toHaveText(`Medidor electromagnético: ${melec.variants.es.length} medidas publicadas`);
    await expect(table.locator('thead th[scope="col"]')).toHaveText(["DN", "Pulgadas"]);
    await expect(table.locator('tbody th[scope="row"]')).toHaveCount(melec.variants.es.length);
    // Cada fila repite exactamente la medida publicada en la lista de precios.
    const first = melec.variants.es[0].split(" · ");
    await expect(table.locator("tbody tr").first()).toContainText(first[0]);
    await expect(table.locator("tbody tr").first()).toContainText(first[1]);
    expect(await table.locator('tbody th[scope="row"]').first().evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
  });

  test("elegir una medida en la tabla la marca en el bloque de pedido y en la dirección", async ({ page }) => {
    await page.goto(MELEC);
    await hydrated(page, "[data-size-chip]");
    const label = melec.variants.es[2];
    const dn = label.split(" · ")[0];
    // Con el teclado: el enlace de la fila funciona igual que con un clic (y no depende del desplazamiento suave).
    await page.getByRole("table").getByRole("link", { name: `Elegir ${dn}` }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "Medida" }).getByRole("radio", { name: label, exact: true })).toBeChecked();
    await expect(page).toHaveURL(new RegExp(`\\?medida=${variantKey(label)}$`));
    await expect(page.getByRole("table").getByRole("link", { name: `Elegir ${dn}` })).toHaveAttribute("aria-current", "true");
    // El foco queda en la medida elegida, listo para agregar con el teclado.
    await expect(page.getByRole("radio", { name: label, exact: true })).toBeFocused();
  });

  test("una dirección con ?medida= abre la ficha con esa medida elegida", async ({ page }) => {
    const label = melec.variants.es[3];
    await page.goto(`${MELEC}?medida=${variantKey(label)}`);
    await expect(page.getByRole("radio", { name: label, exact: true })).toBeChecked();
    await expect(page.getByRole("table").locator('a[aria-current="true"]')).toHaveCount(1);
  });

  test("sin dos medidas no hay tabla", async ({ page }) => {
    // Marco y tapa pesado: la lista de precios no trae medidas.
    await page.goto("/productos/marcos-y-tapas/marco-y-tapa-pesada-2seg");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Medidas disponibles" })).toHaveCount(0);
  });

  test("en pantallas angostas una tabla ancha avisa que se desliza y se puede recorrer con el teclado", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/productos/equipos-termofusion/maquina-termofusion-sud-sdp-4-mordazas");
    const scroller = page.locator('[role="region"]:has(> table)');
    await expect(scroller).toBeVisible();
    const overflowing = await scroller.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    test.skip(!overflowing, "La tabla cabe en este motor a 360 px: no hay desplazamiento que anunciar.");
    await expect(page.getByText("La tabla tiene más columnas")).toBeVisible();
    await expect(scroller).toHaveAttribute("tabindex", "0");
    await expect(scroller).toHaveAttribute("aria-describedby", /.+/);
    // La página no se desborda: solo la tabla se desliza.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
});

test.describe("ficha: chips, cantidad y CTA naranja (B10-2)", () => {
  test("la ficha de válvula muestra DN como chips, la presión publicada y guarda la cantidad", async ({ page }) => {
    await page.goto("/productos/valvulas/valvula-check-swing");
    await hydrated(page, "[data-size-chip]");
    const sizes = page.getByRole("group", { name: "Medida" });
    await expect(sizes.getByRole("radio").first()).toBeChecked();
    await sizes.getByRole("radio", { name: /^DN100/ }).check();
    await expect(page.getByText("Presión nominal")).toBeVisible();
    await expect(page.locator("#pedido").getByText("PN16", { exact: true })).toBeVisible();
    const qty = page.getByRole("group", { name: "Cantidad: Válvula check swing" });
    await qty.getByRole("button", { name: "Sumar una unidad: Válvula check swing" }).click();
    await qty.getByRole("button", { name: "Sumar una unidad: Válvula check swing" }).click();
    await expect(qty.getByRole("spinbutton")).toHaveValue("3");
    const cta = page.getByRole("button", { name: "Agregar a cotización" });
    // Naranja de la marca, con texto blanco legible (#b84a12 sobre blanco: 5,2:1).
    expect(await cta.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(184, 74, 18)");
    await cta.click();
    await expect(page.getByRole("dialog", { name: /Tu carrito/ })).toBeVisible();
    const stored: { slug: string; variant?: string; quantity: number }[] = JSON.parse((await page.evaluate(() => localStorage.getItem("fundigsac-quote"))) ?? "[]");
    expect(stored).toContainEqual(expect.objectContaining({ slug: "valvula-check-swing", quantity: 3, variant: expect.stringMatching(/^DN100 · .+ · PN16$/) }));
  });

  test("la cantidad no baja de 1 ni acepta vacío al salir del campo", async ({ page }) => {
    await page.goto(MELEC);
    await hydrated(page, "[data-size-chip]");
    const qty = page.getByRole("group", { name: /^Cantidad: / });
    await expect(qty.getByRole("button", { name: /^Restar una unidad/ })).toBeDisabled();
    const input = qty.getByRole("spinbutton");
    await input.fill("");
    await input.blur();
    await expect(input).toHaveValue("1");
  });

  test("las flechas del teclado recorren los chips de medida", async ({ page }) => {
    await page.goto(MELEC);
    await hydrated(page, "[data-size-chip]");
    const radios = page.getByRole("group", { name: "Medida" }).getByRole("radio");
    await radios.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(1)).toBeFocused();
  });
});

test.describe("/productos: conteo por filtro (X5-1) y familias nuevas", () => {
  const familyButton = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

  test("cada filtro muestra cuántos productos tiene y anuncia el conteo", async ({ page }) => {
    await page.goto("/productos");
    await expect(familyButton(page, "Todas")).toContainText("14");
    await expect(familyButton(page, "Válvulas")).toContainText("5");
    await expect(familyButton(page, "Medidores")).toContainText("1");
    await expect(familyButton(page, "Válvulas")).toHaveAccessibleDescription("5 productos destacados");
    await expect(familyButton(page, "Medidores")).toHaveAccessibleDescription("1 producto destacado");
  });

  test("con una búsqueda, las familias sin resultados quedan desactivadas", async ({ page }) => {
    await page.goto("/productos");
    await hydrated(page, 'main input[type="search"]');
    await page.getByRole("searchbox", { name: "Buscar productos por nombre, referencia o aplicación" }).fill("medidor");
    await expect(familyButton(page, "Todas")).toContainText("1");
    await expect(familyButton(page, "Medidores")).toBeEnabled();
    await expect(familyButton(page, "Válvulas")).toBeDisabled();
    await expect(familyButton(page, "Equipos de termofusión")).toBeDisabled();
    await familyButton(page, "Medidores").click();
    await expect(page.locator("#productos-destacados article")).toHaveCount(1);
    await expect(page.locator("#productos-destacados article").first()).toContainText("Medidor electromagnético MELEC");
  });

  test("las familias de termofusión y medidores tienen tarjeta y destacado que llevan a sus páginas", async ({ page }) => {
    await page.goto("/productos");
    const families = page.getByRole("region", { name: "Familias de productos" });
    await expect(families.getByRole("link", { name: "Explorar Equipos de termofusión" })).toHaveAttribute("href", "/productos/equipos-termofusion");
    await expect(families.getByRole("link", { name: "Explorar Medidores" })).toHaveAttribute("href", "/productos/medidores");
    const featured = page.locator("#productos-destacados article").filter({ hasText: "Medidor electromagnético MELEC" });
    await expect(featured.getByRole("link", { name: "Ver ficha", exact: true })).toHaveAttribute("href", MELEC);
    await expect(featured).toContainText("DN 50 – DN 600");
    await families.getByRole("link", { name: "Explorar Medidores" }).click();
    await expect(page).toHaveURL(/\/productos\/medidores$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Medidores de agua");
  });

  test("las pantallas de familia del 4/11 enlazan a las fichas nuevas en lugar de Contacto", async ({ page }) => {
    for (const [route, region, slug] of [
      ["/productos/valvulas", "Catálogo de válvulas", "/productos/valvulas/valvula-de-aire-3-funciones-premium-vdap"],
      ["/productos/tuberias", "Catálogo de tuberías", "/productos/tuberias/tuberia-mortero-cemento"],
      ["/productos/marcos-y-tapas", "Catálogo de marcos y tapas", "/productos/marcos-y-tapas/tapa-de-registro"],
    ] as const) {
      await page.goto(route);
      const cards = page.locator(`section[aria-label="${region}"] article`);
      await expect(cards.locator(`a[href="${slug}"]`).first()).toBeAttached();
      // Ninguna tarjeta de producto manda a pedir la ficha por Contacto (el catálogo general en PDF sí puede).
      expect(await cards.locator('a[href^="/contacto?motivo=documentacion&documento="]').count(), route).toBe(0);
    }
  });
});

test.describe("puntos de Lighthouse", () => {
  test("los puntos del carrusel de válvulas miden al menos 24 × 24 px (WCAG 2.5.8) sin agrandar el punto", async ({ page }) => {
    await page.goto("/productos/valvulas");
    const dots = page.locator('main article [role="group"] button[aria-label]');
    await expect(dots.first()).toBeAttached();
    const boxes = await dots.evaluateAll((els) => els.slice(0, 6).map((el) => {
      const r = el.getBoundingClientRect();
      const track = (el.firstElementChild as HTMLElement).getBoundingClientRect();
      return { w: r.width, h: r.height, trackH: track.height };
    }));
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.w).toBeGreaterThanOrEqual(24);
      expect(box.h).toBeGreaterThanOrEqual(24);
      expect(box.trackH).toBe(4);
    }
  });

  test("antes de recorrer la página, el texto de las tarjetas ya es legible (sin opacidad de revelado)", async ({ page }) => {
    await page.goto("/productos/valvulas");
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-motion"));
    // Tarjetas fuera de pantalla que todavía no se revelaron.
    const faded = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("main article h3")]
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight)
        .map((el) => {
          let opacity = 1;
          for (let n: HTMLElement | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
          return opacity;
        }),
    );
    expect(faded.length).toBeGreaterThan(0);
    // La cuadrícula entra con un fundido de 0,35 s al cargar; pasado ese instante, nada queda transparente.
    await expect.poll(() => page.evaluate(() =>
      Math.min(...[...document.querySelectorAll<HTMLElement>("main article h3")]
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight)
        .map((el) => {
          let opacity = 1;
          for (let n: HTMLElement | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
          return opacity;
        })),
    ), { timeout: 5000 }).toBeGreaterThan(0.99);
  });

  test("el inicio ofrece la variante de 480 px a la foto de la válvula del hero", async ({ page }) => {
    await page.goto("/");
    const photo = page.locator('img[src*="compuerta-con-timon-v4"]').first();
    await expect(photo).toHaveAttribute("srcset", /compuerta-con-timon-v4-w480\.webp 480w/);
    await expect(photo).toHaveAttribute("sizes", "(max-width: 860px) 66vw, (max-width: 1280px) 32vw, 26vw");
    await expect(page.locator('img[src*="hero-planta"]').first()).toHaveAttribute("fetchpriority", "high");
  });
});
