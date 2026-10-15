import { expect, test, type Page } from "@playwright/test";

// La API de IA se simula: la prueba valida el widget (streaming, enlaces seguros, estados) sin gastar consultas reales.
const ANSWER = [
  "Te conviene la **válvula de compuerta FUNDIGSAC con garantía extendida**:",
  "",
  "- Cuadrante de maniobra para llave T.",
  "- Bridas según ISO 7005-2.",
  "",
  "Revisa la [ficha técnica](/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida) o escribe a [WhatsApp](https://wa.me/51908849664). [Otro sitio](https://ejemplo.invalid).",
].join("\n");

const sse = (text: string) =>
  [...(text.match(/[\s\S]{1,16}/g) ?? []).map((t) => `data: ${JSON.stringify({ type: "text", text: t })}\n\n`), `data: ${JSON.stringify({ type: "done", stop: "end_turn" })}\n\n`].join("");

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, performance: false, customization: false, version: 1, savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
}

test("asistente con IA: abre, responde en streaming y mantiene la conversación", async ({ page, baseURL }) => {
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
  const launcher = page.getByRole("button", { name: "Abrir asistente con IA" });
  await expect(launcher).toBeVisible();
  await launcher.click();

  const panel = page.getByRole("dialog", { name: "Asistente FUNDIGSAC" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: /asistente técnico de FUNDIGSAC/ })).toBeVisible();
  await panel.getByRole("button", { name: "Resume la ficha técnica de esta válvula" }).click();

  await expect(panel.locator(".ai-md strong").first()).toHaveText("válvula de compuerta FUNDIGSAC con garantía extendida");
  await expect(panel.locator(".ai-md li")).toHaveCount(2);
  await expect(panel.getByRole("link", { name: "ficha técnica" })).toHaveAttribute("href", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida");
  await expect(panel.getByRole("link", { name: "WhatsApp" }).first()).toHaveAttribute("href", "https://wa.me/51908849664");
  await expect(panel.getByRole("link", { name: "Otro sitio" })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Copiar respuesta" })).toBeVisible();
  expect(bodies[0]).toMatchObject({ lang: "es", page: "/productos/valvulas/valvula-compuerta-fundigsac", messages: [{ role: "user", content: "Resume la ficha técnica de esta válvula" }] });

  const input = panel.getByRole("textbox", { name: "Tu consulta para el asistente" });
  await input.fill("¿Y en DN200?");
  await input.press("Enter");
  await expect(panel.getByRole("button", { name: "Copiar respuesta" })).toHaveCount(2);
  expect(bodies[1].messages.map((m) => m.role)).toEqual(["user", "assistant", "user"]);

  // La conversación sigue tras recargar (misma pestaña).
  await page.reload();
  await page.getByRole("button", { name: "Abrir asistente con IA" }).click();
  await expect(page.locator(".ai-msg")).toHaveCount(4);
  await page.keyboard.press("Escape");
  await expect(page.locator('.ai-panel[data-state="closed"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("asistente con IA: sin servicio ofrece WhatsApp y cotización", async ({ page, baseURL }) => {
  await prepare(page, baseURL);
  await page.route("**/api/chat", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "not_configured" }) }));
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir asistente con IA" }).click();
  const panel = page.getByRole("dialog", { name: "Asistente FUNDIGSAC" });
  await panel.getByRole("textbox", { name: "Tu consulta para el asistente" }).fill("Hola");
  await panel.getByRole("button", { name: "Enviar" }).click();
  const notice = panel.getByRole("alert");
  await expect(notice).toContainText("Mientras tanto");
  await expect(notice.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/51908849664\?text=/);
  await expect(notice.getByRole("link", { name: "Cotizar" })).toHaveAttribute("href", "/cotizar");
});
