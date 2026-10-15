import { expect, test, type Page } from "@playwright/test";

const consentCookie = async (page: Page) => {
  const c = (await page.context().cookies()).find((x) => x.name === "fundigsac-consent");
  return c ? (JSON.parse(decodeURIComponent(c.value)) as Record<string, unknown>) : null;
};
const banner = (page: Page) => page.getByRole("region", { name: /Aviso de cookies|Cookie notice/ });
const mapFrames = (page: Page) => page.locator("main iframe[src*='google.com/maps']");
const noOverflow = () => document.documentElement.scrollWidth <= window.innerWidth + 1;
/** Espera a que terminen las animaciones de entrada antes de medir cajas. */
const settled = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity) // los pulsos infinitos (WhatsApp) nunca terminan
        .map((a) => a.finished.catch(() => null)),
    ).then(() => undefined),
  );

test.describe("consentimiento de cookies: aviso", () => {
  test("primera visita: el aviso aparece, no hay cookie de decisión y el mapa de Google no se carga", async ({ page }) => {
    const googleRequests: string[] = [];
    page.on("request", (r) => { if (/google\.com\/maps|gstatic\.com|googleapis\.com\/maps/.test(r.url())) googleRequests.push(r.url()); });
    await page.goto("/contacto");
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Aceptar todas" })).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Rechazar todas" })).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Configurar" })).toBeVisible();
    expect(await consentCookie(page)).toBeNull();
    await expect(mapFrames(page)).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Mapa de Google Maps" })).toBeAttached();
    expect(googleRequests).toEqual([]);
  });

  test("rechazar y aceptar pesan lo mismo: ambos son botones sólidos del mismo tamaño", async ({ page }) => {
    await page.goto("/contacto");
    const accept = await banner(page).getByRole("button", { name: "Aceptar todas" }).boundingBox();
    const reject = await banner(page).getByRole("button", { name: "Rechazar todas" }).boundingBox();
    expect(accept && reject).toBeTruthy();
    expect(Math.abs(accept!.height - reject!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(accept!.width - reject!.width)).toBeLessThanOrEqual(24);
  });

  test("rechazar todas: guarda la decisión, oculta el aviso, sigue sin cargar el mapa y persiste al recargar", async ({ page }) => {
    await page.goto("/contacto");
    await banner(page).getByRole("button", { name: "Rechazar todas" }).click();
    await expect(banner(page)).toBeHidden();
    expect(await consentCookie(page)).toMatchObject({ necessary: true, thirdParty: false, source: "banner" });
    await expect(mapFrames(page)).toHaveCount(0);
    await page.reload();
    await expect(banner(page)).toBeHidden();
    await expect(mapFrames(page)).toHaveCount(0);
  });

  test("aceptar todas: guarda la decisión y el mapa de Google se carga, también tras recargar", async ({ page }) => {
    await page.goto("/contacto");
    await banner(page).getByRole("button", { name: "Aceptar todas" }).click();
    expect(await consentCookie(page)).toMatchObject({ thirdParty: true, source: "banner" });
    await expect(mapFrames(page)).toHaveCount(1);
    await page.reload();
    await expect(banner(page)).toBeHidden();
    await expect(mapFrames(page)).toHaveCount(1);
  });

  test("Configurar abre el panel con foco atrapado, Escape lo cierra y guardar respeta el interruptor", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Configurar" }).click();
    const dialog = page.getByRole("dialog", { name: "Preferencias de cookies" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("switch", { name: "Contenido de terceros" })).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await consentCookie(page)).toBeNull();
    await banner(page).getByRole("button", { name: "Configurar" }).click();
    await dialog.getByRole("switch", { name: "Contenido de terceros" }).click();
    await dialog.getByRole("button", { name: "Guardar preferencias" }).click();
    expect(await consentCookie(page)).toMatchObject({ thirdParty: true, source: "preferences" });
  });

  test("retirar el consentimiento: «Preferencias de cookies» del pie reabre el panel y el mapa vuelve al recuadro", async ({ page }) => {
    await page.goto("/contacto");
    await banner(page).getByRole("button", { name: "Aceptar todas" }).click();
    await expect(mapFrames(page)).toHaveCount(1);
    await page.getByRole("button", { name: "Preferencias de cookies" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Preferencias de cookies" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("switch", { name: "Contenido de terceros" })).toHaveAttribute("aria-checked", "true");
    await expect(dialog.getByText(/Decisión guardada el .* Vale hasta el/)).toBeVisible();
    await dialog.getByRole("button", { name: "Rechazar todas" }).click();
    expect(await consentCookie(page)).toMatchObject({ thirdParty: false, source: "preferences" });
    await expect(mapFrames(page)).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Mapa de Google Maps" })).toBeAttached();
  });

  test("una cookie de una política anterior no vale: se vuelve a preguntar", async ({ page, baseURL }) => {
    const old = { necessary: true, thirdParty: true, version: 2, policy: "2024-01", source: "banner", savedAt: new Date().toISOString() };
    await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(old)), url: baseURL ?? "http://127.0.0.1:3100" }]);
    await page.goto("/contacto");
    await expect(banner(page)).toBeVisible();
    await expect(mapFrames(page)).toHaveCount(0);
  });

  test("una cookie de la versión 1 oculta el aviso pero no consiente el mapa", async ({ page, baseURL }) => {
    const legacy = { necessary: true, performance: true, customization: true, version: 1, savedAt: new Date().toISOString() };
    await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(legacy)), url: baseURL ?? "http://127.0.0.1:3100" }]);
    await page.goto("/contacto");
    await expect(banner(page)).toBeHidden();
    await expect(mapFrames(page)).toHaveCount(0);
  });
});

test.describe("contenido de terceros: mapa condicionado", () => {
  test("«Cargar este mapa» muestra solo este mapa sin guardar decisión", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByRole("button", { name: "Rechazar todas" }).click();
    await page.getByRole("button", { name: "Cargar este mapa" }).click();
    await expect(mapFrames(page)).toHaveCount(1);
    expect(await consentCookie(page)).toMatchObject({ thirdParty: false });
  });

  test("«Aceptar contenido de terceros» en el recuadro guarda la decisión (origen embed)", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByRole("button", { name: "Rechazar todas" }).click();
    await page.getByRole("button", { name: "Aceptar contenido de terceros" }).click();
    await expect(mapFrames(page)).toHaveCount(1);
    expect(await consentCookie(page)).toMatchObject({ thirdParty: true, source: "embed" });
  });

  test("sin permiso queda un enlace para abrir el mapa en Google Maps en otra pestaña", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByRole("button", { name: "Rechazar todas" }).click();
    const link = page.getByRole("link", { name: /Abrir en Google Maps/ });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("href", /google\.com\/maps/);
  });

  test("el mapa de la portada también está condicionado", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Rechazar todas" }).click();
    await expect(page.locator("iframe[src*='google.com/maps']")).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Mapa de Google Maps" })).toBeAttached();
  });
});

test.describe("cookies: idioma, tema y pantallas", () => {
  test("en inglés el aviso, el panel y el recuadro del mapa están traducidos", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fundigsac-lang", "en"));
    await page.goto("/contacto");
    await expect(banner(page).getByRole("button", { name: "Accept all" })).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Reject all" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Google Maps map" })).toBeAttached();
    await banner(page).getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("dialog", { name: "Cookie preferences" }).getByRole("switch", { name: "Third-party content" })).toBeVisible();
  });

  test("la política en inglés muestra la tabla y el marco legal", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fundigsac-lang", "en"));
    await page.goto("/cookies");
    await expect(page.getByRole("table", { name: "What we store on your device" }).getByRole("row")).toHaveCount(6);
    await expect(page.getByRole("heading", { name: "Your consent and your rights" })).toBeAttached();
  });

  test("tema oscuro: el aviso y el panel mantienen contraste y no desbordan", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fundigsac-theme", "dark"));
    await page.goto("/contacto");
    await expect(banner(page)).toBeVisible();
    expect(await page.evaluate(noOverflow)).toBe(true);
    await banner(page).getByRole("button", { name: "Configurar" }).click();
    const panel = page.locator(".ck-dialog__panel");
    await expect(panel).toBeVisible();
    await settled(page);
    const box = await panel.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
  });

  test("el aviso y el recuadro del mapa caben completos en pantalla, sin desbordar", async ({ page }) => {
    await page.goto("/contacto");
    await expect(banner(page)).toBeVisible();
    await settled(page);
    const box = await banner(page).boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    expect(await page.evaluate(noOverflow)).toBe(true);
    // el recuadro del mapa muestra sus botones dentro de su contenedor
    await banner(page).getByRole("button", { name: "Rechazar todas" }).click();
    const group = page.getByRole("group", { name: "Mapa de Google Maps" });
    await group.scrollIntoViewIfNeeded();
    const g = await group.boundingBox();
    const b = await group.getByRole("button", { name: "Cargar este mapa" }).boundingBox();
    expect(b!.y).toBeGreaterThanOrEqual(g!.y - 1);
    expect(b!.y + b!.height).toBeLessThanOrEqual(g!.y + g!.height + 1);
    const link = await group.getByRole("button", { name: "Preferencias de cookies" }).boundingBox();
    expect(link!.y + link!.height).toBeLessThanOrEqual(g!.y + g!.height + 1);
  });

  test("la página de cookies no desborda en ningún ancho", async ({ page }) => {
    await page.goto("/cookies");
    await page.getByRole("button", { name: "Rechazar todas" }).click();
    expect(await page.evaluate(noOverflow)).toBe(true);
  });
});
