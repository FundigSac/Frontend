import { expect, test, type Page } from "@playwright/test";

// La API de IA se simula: la prueba valida el widget (streaming, enlaces seguros, estados) sin gastar consultas reales.
const ANSWER = [
  "Te conviene la **válvula de compuerta FUNDIGSAC con garantía extendida**:",
  "",
  "- Cuadrante de maniobra para llave T.",
  "- Bridas según ISO 7005-2.",
  "",
  "Revisa la [ficha técnica](/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida) o escribe a [WhatsApp](https://wa.me/51908849664). [Otro sitio](https://ejemplo.invalid).",
  "[[¿Y en DN200?|¿Qué normas cumple?]]",
].join("\n");

const sse = (text: string) =>
  [...(text.match(/[\s\S]{1,16}/g) ?? []).map((t) => `data: ${JSON.stringify({ type: "text", text: t })}\n\n`), `data: ${JSON.stringify({ type: "done", stop: "end_turn" })}\n\n`].join("");

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, performance: false, customization: false, version: 1, savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
}

test("FundigIA: abre, responde en streaming, reacciona y mantiene la conversación", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  const bodies: { messages: { role: string; content: string }[]; lang: string; page: string }[] = [];
  await page.route("**/api/chat", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream; charset=utf-8" }, body: sse(ANSWER) });
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/productos/valvulas/valvula-compuerta-fundigsac");
  const launcher = page.getByRole("button", { name: /Abrir FundigIA/ });
  await expect(launcher).toBeVisible();
  await launcher.click();

  const panel = page.getByRole("dialog", { name: /FundigIA/ });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Soy FundigIA/ })).toBeVisible();
  await panel.getByRole("button", { name: "Resume la ficha técnica de esta válvula" }).click();

  await expect(panel.locator(".ai-md strong").first()).toHaveText("válvula de compuerta FUNDIGSAC con garantía extendida");
  await expect(panel.locator(".ai-md li")).toHaveCount(2);
  await expect(panel.getByRole("link", { name: "ficha técnica" })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida");
  await expect(panel.getByRole("link", { name: "WhatsApp" }).first()).toHaveAttribute("href", "https://wa.me/51908849664");
  await expect(panel.getByRole("link", { name: "Otro sitio" })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Copiar respuesta" })).toBeVisible();
  await expect(panel.locator(".ai-md")).not.toContainText("[[");
  await panel.getByRole("button", { name: "Me sirvió", exact: true }).click();
  await expect(panel.getByRole("button", { name: "Me sirvió", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByText("¡Gracias por tu opinión!")).toBeVisible();
  await expect(panel.getByRole("navigation", { name: "Opciones principales" }).getByRole("link", { name: "Llamar" })).toHaveAttribute("href", "tel:+51908849664");
  expect(bodies[0]).toMatchObject({ lang: "es", page: "/productos/valvulas/valvula-compuerta-fundigsac", messages: [{ role: "user", content: "Resume la ficha técnica de esta válvula" }] });

  // Pregunta sugerida: continúa la conversación sin reenviar las sugerencias al servidor.
  await panel.getByRole("group", { name: "Sigue preguntando" }).getByRole("button", { name: "¿Y en DN200?" }).click();
  await expect(panel.getByRole("button", { name: "Copiar respuesta" })).toHaveCount(2);
  expect(bodies[1].messages.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
  expect(bodies[1].messages[1].content).not.toContain("[[");
  expect(bodies[1].messages[2].content).toBe("¿Y en DN200?");

  // La conversación sigue tras recargar (misma pestaña).
  await page.reload();
  await page.getByRole("button", { name: /Abrir FundigIA/ }).click();
  await expect(page.locator(".ai-msg")).toHaveCount(4);
  await page.keyboard.press("Escape");
  await expect(page.locator('.ai-panel[data-state="closed"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("FundigIA: si el servicio falla ofrece WhatsApp y cotización", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.route("**/api/chat", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "not_configured" }) }));
  await page.goto("/");
  await page.getByRole("button", { name: /Abrir FundigIA/ }).click();
  const panel = page.getByRole("dialog", { name: /FundigIA/ });
  await panel.getByRole("textbox", { name: "Tu consulta para FundigIA" }).fill("Hola");
  await panel.getByRole("button", { name: "Enviar" }).click();
  const notice = panel.getByRole("alert");
  await expect(notice).toContainText("no está disponible");
  await expect(notice.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
  await expect(notice.getByRole("link", { name: "Cotizar" })).toHaveAttribute("href", "/cotizar");
});

test("FundigIA responde de verdad (IA o guía rápida con los datos del sitio)", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.goto("/");
  await page.getByRole("button", { name: /Abrir FundigIA/ }).click();
  const panel = page.getByRole("dialog", { name: /FundigIA/ });
  const input = panel.getByRole("textbox", { name: "Tu consulta para FundigIA" });
  await input.fill("Medidas de brida DN150 PN16");
  await input.press("Enter");
  await expect(panel.locator(".ai-msg--bot .ai-md").last()).toContainText(/DN\s?150/, { timeout: 45_000 });
  await expect(panel.getByRole("button", { name: "Copiar respuesta" })).toBeVisible({ timeout: 45_000 });
});
