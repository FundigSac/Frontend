import { expect, test } from "@playwright/test";

/** El sitio no usa la raya larga (—) en ningún texto visible: ni en español ni en inglés. */
const ROUTES = [
  "/", "/productos", "/productos/valvulas", "/productos/tuberias", "/productos/marcos-y-tapas",
  "/productos/valvulas/valvula-compuerta", "/productos/valvulas/valvula-compuerta-fundigsac", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida",
  "/productos/valvulas/valvula-mariposa", "/productos/tuberias/tuberia-tyton", "/productos/marcos-y-tapas/marco-tapa-d400",
  "/industrias/saneamiento", "/industrias/agricultura", "/industrias/mineria", "/nosotros", "/soluciones", "/recursos", "/contacto",
  "/cotizar", "/buscar", "/terminos", "/terminos-b2b", "/privacidad", "/cookies", "/reclamaciones", "/mapa-del-sitio",
];

for (const lang of ["es", "en"] as const) {
  test.describe(`sin raya larga (${lang})`, () => {
    test.beforeEach(async ({ context }) => {
      await context.addInitScript((l) => {
        try { window.localStorage.setItem("fundigsac-lang", l); } catch { /* sin almacenamiento */ }
      }, lang);
    });

    for (const route of ROUTES) {
      test(`${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle");
        // Abre los acordeones para revisar también el texto oculto.
        await page.evaluate(() => document.querySelectorAll("details").forEach((d) => d.setAttribute("open", "")));
        const text = await page.evaluate(() => document.body.innerText);
        const attrs = await page.evaluate(() => [...document.querySelectorAll("[alt],[aria-label],[title],[placeholder]")].map((e) => ["alt", "aria-label", "title", "placeholder"].map((a) => e.getAttribute(a) ?? "").join(" ")).join(" "));
        expect(text + " " + attrs, "texto visible con raya larga").not.toContain("—");
      });
    }
  });
}
