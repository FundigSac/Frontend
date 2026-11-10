import type { test as base } from "@playwright/test";

/**
 * Corrida de solo lectura contra producción (E2E_ALLOW_PROD_READONLY=1, ver playwright.config.ts). Varias pruebas
 * envían formularios reales (cotización, consulta, reclamo, solicitud de privacidad, consentimiento, cuentas) y en
 * producción esos envíos quedan como registros reales en la base de datos.
 */
export const READ_ONLY = process.env.E2E_ALLOW_PROD_READONLY === "1";

const REASON = "Corrida de solo lectura (E2E_ALLOW_PROD_READONLY=1): esta prueba envía un formulario real.";

/**
 * Salta las pruebas que envían formularios cuando la corrida es de solo lectura. Llamarla al inicio del archivo o de
 * un `describe` salta todo el grupo; dentro de una prueba, salta solo esa.
 */
export function skipIfReadOnly(test: typeof base) {
  test.skip(READ_ONLY, REASON);
}

/**
 * Red de seguridad para las pruebas que guardan algo de pasada (el aviso de cookies registra el consentimiento al
 * elegir): en solo lectura, todo envío a /api/forms/* y /api/account/* se responde en el navegador con 503 y nunca
 * llega al servidor. Llamarla al inicio del archivo.
 */
export function blockWritesIfReadOnly(test: typeof base) {
  if (!READ_ONLY) return;
  test.beforeEach(async ({ context }) => {
    await context.route(/\/api\/(forms|account)\//, (route) =>
      route.request().method() === "GET"
        ? route.continue()
        : route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "READ_ONLY" }) }),
    );
  });
}
