import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Calidad transversal del sitio (pulido de octubre 2026): cabeceras de seguridad, defensas de la API, enlaces que
 * existen, sin desbordes en móvil, transición entre páginas, imágenes sin artefactos de maqueta y contraste AA.
 */

const consent = encodeURIComponent(JSON.stringify({ necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() }));

/** Sin el aviso de cookies encima: se guarda una decisión previa. */
async function withConsent(page: Page) {
  const base = test.info().project.use.baseURL ?? "http://127.0.0.1:3100";
  await page.context().addCookies([{ name: "fundigsac-consent", value: consent, url: base }]);
}

test.describe("seguridad", () => {
  test("las páginas envían CSP estricta, aislamiento de origen y permisos cerrados", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("script-src-attr 'none'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["cross-origin-resource-policy"]).toBe("same-origin");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["permissions-policy"]).toContain("browsing-topics=()");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("el chat rechaza peticiones de otros sitios, cuerpos que no son JSON y cuerpos desmedidos", async ({ request }) => {
    const valid = { messages: [{ role: "user", content: "Hola" }], lang: "es", page: "/" };
    const crossSite = await request.post("/api/chat", { data: valid, headers: { "sec-fetch-site": "cross-site", "x-forwarded-for": "203.0.113.70" } });
    expect(crossSite.status()).toBe(403);

    const notJson = await request.post("/api/chat", { data: "hola", headers: { "content-type": "text/plain", "x-forwarded-for": "203.0.113.71" } });
    expect(notJson.status()).toBe(415);

    const huge = await request.post("/api/chat", {
      data: JSON.stringify({ ...valid, messages: [{ role: "user", content: "x".repeat(300_000) }] }),
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.72" },
    });
    expect(huge.status()).toBe(413);
  });

  test("cerrar sesión desde otro sitio está prohibido", async ({ request }) => {
    const res = await request.post("/api/auth/logout", { headers: { "sec-fetch-site": "cross-site" } });
    expect(res.status()).toBe(403);
  });
});

test.describe("enlaces y contenido", () => {
  test("las tarjetas y familias de /industrias llevan a páginas que existen", async ({ page, request }) => {
    await page.goto("/industrias");
    const hrefs = await page.locator("main a[href^='/']").evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href")!.split("#")[0]))]);
    expect(hrefs.length).toBeGreaterThan(10);
    for (const href of hrefs) {
      const res = await request.get(href, { maxRedirects: 2 });
      expect(res.status(), href).toBeLessThan(400);
    }
  });

  test("las familias del catálogo tienen su propia ruta y cargan solo su pantalla", async ({ page }) => {
    for (const [path, title] of [["/productos/valvulas", "Válvulas"], ["/productos/tuberias", "Tuberías"], ["/productos/marcos-y-tapas", "Marcos y tapas"]] as const) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(title));
    }
    expect((await page.request.get("/productos/no-existe")).status()).toBe(404);
  });

  test("las fichas de referencia ya no muestran capturas con encabezados de maqueta", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (r) => { if (r.request().resourceType() === "image" && r.status() >= 400) failed.push(r.url()); });
    for (const path of ["/productos/valvulas/valvula-mariposa", "/productos/tuberias/tuberia-tyton", "/productos/marcos-y-tapas/marco-tapa-d400", "/cotizar"]) {
      await page.goto(path);
      const srcs = await page.locator("img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
      // Las versiones con barra de ventana o título "W0x — Ficha…" se reemplazaron por las -limpia / -recorte.
      for (const id of ["915091dd8b", "54fd713aba", "09565b0ba8", "5633f0c0ec", "337606625a", "e99a473257"]) {
        expect(srcs.some((s) => s.includes(`${id}-w`) || s.endsWith(`${id}.jpg`)), `${path}: ${id}`).toBe(false);
      }
    }
    expect(failed).toEqual([]);
  });
});

test.describe("diseño", () => {
  test("sin desborde horizontal en móvil en las páginas con títulos largos", async ({ page }) => {
    await withConsent(page);
    for (const width of [320, 360, 390, 412]) {
      await page.setViewportSize({ width, height: 860 });
      for (const path of ["/recursos", "/recursos/detalle-tecnico", "/industrias", "/cotizar"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} @ ${width}px`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("/industrias: botón principal con estilo de botón y títulos de sector como encabezados", async ({ page }) => {
    await withConsent(page);
    await page.goto("/industrias");
    const cta = page.getByRole("link", { name: /Consultar mis componentes/ });
    await expect(cta).toHaveCSS("background-color", "rgb(201, 79, 10)");
    const size = await page.locator("#saneamiento .x-head h2").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(24);
  });

  test("cambiar de sección es instantáneo: sin transición que lave la pantalla ni tape la cabecera", async ({ page }) => {
    await withConsent(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __vt: number };
      w.__vt = 0;
      const original = document.startViewTransition?.bind(document);
      if (original) document.startViewTransition = ((...args: Parameters<typeof original>) => { w.__vt++; return original(...args); }) as typeof document.startViewTransition;
    });
    await page.goto("/");
    await page.locator("footer a[href='/productos/valvulas']").first().click();
    await expect(page).toHaveURL(/\/productos\/valvulas$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Una transición de vista dibujaba las capturas de página encima de la cabecera fija y fundía todo a blanco.
    expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(0);
    await expect(page.locator("header.lp-header")).toBeVisible();
  });

  test("las fotos hero llegan con miniatura difuminada (sin hueco blanco al navegar)", async ({ request }) => {
    for (const path of ["/terminos", "/privacidad", "/cookies", "/nosotros", "/contacto", "/productos/valvulas"]) {
      const html = await (await request.get(path)).text();
      const hero = html.match(/<img[^>]*class="(?:lg-hero__photo|[^"]*heroPhoto)"[^>]*>/)?.[0] ?? "";
      expect(hero, path).toContain("background-image");
    }
  });
});

test.describe("accesibilidad: contraste AA", () => {
  for (const path of ["/", "/productos", "/productos/valvulas", "/productos/tuberias", "/reclamaciones", "/productos/valvulas/valvula-mariposa"]) {
    test(`sin fallos de contraste en ${path}`, async ({ page }) => {
      await page.goto(path); // con el aviso de cookies visible: su botón principal también debe cumplir
      await page.waitForTimeout(1200); // animaciones de entrada (opacidad) terminadas
      const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim()}`))).toEqual([]);
    });
  }
});
