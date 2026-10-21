import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/** Sistema de movimiento (src/shared/motion): nada queda oculto, se respeta "reducir movimiento" y las piezas animadas
 *  del inicio (hero, menú móvil) siguen funcionando. */
const ROUTES = ["/", "/industrias", "/industrias/saneamiento", "/industrias/agricultura", "/productos", "/productos/tuberias", "/productos/valvulas/valvula-compuerta", "/productos/valvulas/valvula-mariposa", "/cotizar", "/nosotros", "/contacto", "/terminos", "/cookies", "/eliminar-cuenta"];

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));

/** WebKit aplica `upgrade-insecure-requests` también a http://127.0.0.1: pediría todo por HTTPS y no cargaría el JS.
 *  Solo para servidores locales sin TLS se quita esa directiva de la respuesta (el resto de la CSP se mantiene). */
async function prepare(context: BrowserContext, baseURL: string, browserName: string) {
  await context.addCookies([{ name: "fundigsac-consent", value: consent, url: baseURL }]);
  if (browserName !== "webkit" || !baseURL.startsWith("http://")) return;
  await context.route("**/*", async (route) => {
    // Un prefetch todavía en vuelo cuando termina la prueba no debe romperla.
    const response = await route.fetch().catch(() => null);
    if (!response) return route.abort().catch(() => {});
    const headers = response.headers();
    if (headers["content-security-policy"]) headers["content-security-policy"] = headers["content-security-policy"].replace(/upgrade-insecure-requests;?\s*/, "");
    await route.fulfill({ response, headers }).catch(() => {});
  });
}

test.beforeEach(async ({ context, baseURL, browserName }) => {
  await prepare(context, baseURL!, browserName);
});

/** Bloques revelables que siguen invisibles (opacidad < 0,1) en este momento. Las entradas en curso se dan por
 *  terminadas: Firefox no avanza las animaciones de lo que está fuera de la vista y su estilo leído quedaría a medias. */
const hiddenReveals = (page: Page) =>
  page.evaluate(() => {
    document.getAnimations().forEach((a) => a.effect?.getTiming().iterations !== Infinity && a.finish());
    return [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.1)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")}`);
  });

test.describe("movimiento", () => {
  for (const route of ROUTES) {
    test(`ningún bloque queda oculto tras recorrer ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        for (let y = 0; y <= document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.6)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
      });
      // La última entrada dura < 1,2 s; se espera a que termine sin fijar un tiempo (máquinas lentas en CI).
      await expect.poll(() => hiddenReveals(page), { timeout: 6000 }).toEqual([]);
    });
  }

  test("un salto al final de la página no deja oculto lo que se pasó por encima", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => hiddenReveals(page), { timeout: 6000 }).toEqual([]);
  });

  test("con movimiento reducido todo se ve desde el primer momento", async ({ browser, baseURL, browserName }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await prepare(context, baseURL!, browserName);
    const page = await context.newPage();
    await page.goto(`${baseURL}/`, { waitUntil: "load" });
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-motion"))).toBe(false);
    expect(await hiddenReveals(page)).toEqual([]);
    await context.close();
  });

  // El barrido vertical se revirtió (5eb2ba3) al fundido con subida: la válvula activa cambia sin clases intermedias.
  test("el hero cambia de variante y sigue respondiendo al teclado", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const active = page.locator(".lp-hero__valve.is-active");
    const before = await active.getAttribute("src");
    await page.locator(".lp-hero__ctrl").nth(1).click();
    await expect(page.locator(".lp-hero__valve.is-active")).toHaveCount(1);
    await expect(active).not.toHaveAttribute("src", before!);
    // Safari no enfoca un botón al pulsarlo: el foco llega por teclado, como con Tab.
    await page.locator(".lp-hero__ctrl").nth(1).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(active).toHaveAttribute("src", before!);
  });

  test("el menú móvil abre, deja la página inerte y cierra con Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/", { waitUntil: "load" });
    const toggle = page.locator(".lp-header__toggle");
    await toggle.click();
    const menu = page.locator(".lp-mobile");
    await expect(menu).toHaveClass(/is-open/);
    await expect(menu).toBeVisible();
    await expect(page.locator("#contenido")).toHaveJSProperty("inert", true);
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveClass(/is-open/);
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("la barra de navegación no bloquea clics y desaparece al llegar", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const bar = page.locator(".mo-progress");
    await expect(bar).toHaveCSS("pointer-events", "none");
    await page.locator(".lp-hero__actions a").first().click();
    await page.waitForURL("**/productos");
    await expect(bar).toHaveAttribute("data-state", "idle", { timeout: 3000 });
  });

  test("al filtrar el catálogo las tarjetas nuevas entran con animación", async ({ page }) => {
    await page.goto("/productos/tuberias", { waitUntil: "load" });
    const grid = page.locator("[data-results]");
    await expect(grid).not.toHaveAttribute("data-filtered", "");
    await page.getByRole("tab").nth(1).click();
    await expect(grid).toHaveAttribute("data-filtered", "");
  });
});
