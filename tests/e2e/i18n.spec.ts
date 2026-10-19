import { expect, test } from "@playwright/test";

/**
 * Cada pantalla debe seguir el selector de idioma: en inglés el título principal está traducido y no quedan
 * textos de interfaz en español (se comparan contra una lista de palabras que no existen en inglés).
 */
const SCREENS: [string, RegExp][] = [
  ["/productos", /General catalog/],
  ["/productos/valvulas", /Valves/],
  ["/productos/tuberias", /Ductile iron\s*pipes/],
  ["/productos/marcos-y-tapas", /Frames and covers/],
  ["/productos/valvulas/valvula-compuerta", /Flanged gate valve/],
  ["/productos/valvulas/valvula-compuerta-fundigsac", /FUNDIGSAC flanged gate valve/],
  ["/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", /FUNDIGSAC flanged gate valve/],
  ["/productos/valvulas/valvula-mariposa", /Butterfly valve/],
  ["/productos/tuberias/tuberia-tyton", /Ductile iron pipe/],
  ["/productos/marcos-y-tapas/marco-tapa-d400", /Frame and cover/],
  ["/industrias", /Components for every type of network/],
  ["/cotizar", /Request a quote/],
  ["/cotizar?producto=valvula-compuerta", /Flanged gate valve/],
  ["/cotizar/confirmacion", /There is no registered request/],
];

const SPANISH = /\b(Solicitar|Cotizar|Buscar|Todos los|Ver ficha|Ver productos|Información|pendiente|Válvulas|Tuberías|Catálogo|Presión|Diámetro|Documentación|Empresa|Teléfono)\b/;

test.describe("idioma inglés en las pantallas del catálogo y la cotización", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addInitScript(() => {
      try {
        localStorage.setItem("fundigsac-lang", "en");
      } catch {
        /* sin almacenamiento */
      }
    });
    // Sin banner de cookies tapando la pantalla.
    const consent = { necessary: true, thirdParty: false, version: 2, policy: "2026-10", source: "banner", savedAt: new Date().toISOString() };
    await context.addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
  });

  for (const [route, h1] of SCREENS) {
    test(`${route}: título y textos en inglés`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      // Contenido principal (sin la cabecera, el pie ni el nombre de los productos que solo existen en español).
      const text = await page.locator("main").innerText();
      const leftovers = text.split("\n").filter((line) => SPANISH.test(line));
      expect(leftovers, `texto en español en ${route}`).toEqual([]);
    });
  }
});
