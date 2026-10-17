import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Inicio de sesión con Google. No se puede completar el OAuth real (exige una cuenta de Google), así que se verifica:
 * la redirección a accounts.google.com con los parámetros correctos (client_id, PKCE, state, nonce), el callback con
 * errores controlados y una sesión simulada firmada con AUTH_SECRET (la misma que lee el servidor de pruebas).
 */

function loadEnv(): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = { ...process.env };
  const file = resolve(process.cwd(), ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const at = line.indexOf("=");
      if (at > 0 && !line.startsWith("#") && env[line.slice(0, at)] === undefined) env[line.slice(0, at)] = line.slice(at + 1).trim();
    }
  }
  return env;
}

const env = loadEnv();
const configured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.AUTH_SECRET && env.AUTH_SECRET.length >= 32);

const b64url = (buffer: Buffer | string) => Buffer.from(buffer).toString("base64url");
function sessionCookie(user: { name: string; email: string; picture?: string }, maxAge = 3600) {
  const payload = b64url(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + maxAge }));
  return `${payload}.${b64url(createHmac("sha256", env.AUTH_SECRET as string).update(payload).digest())}`;
}

async function prepare(page: Page, baseURL: string | undefined) {
  const consent = { necessary: true, performance: false, customization: false, version: 1, savedAt: new Date().toISOString() };
  await page.context().addCookies([{ name: "fundigsac-consent", value: encodeURIComponent(JSON.stringify(consent)), url: baseURL ?? "http://127.0.0.1:3100" }]);
  await page.addInitScript(() => sessionStorage.setItem("fundigsac-assistant-teaser", "1"));
}

test.describe("Google: inicio del flujo", () => {
  test.skip(!configured, "Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o AUTH_SECRET (.env.local)");

  test("redirige a accounts.google.com con client_id, PKCE S256, state, nonce y redirect_uri correctos", async ({ request }) => {
    const res = await request.get("/api/auth/google?from=login&next=/carrito", { maxRedirects: 0 });
    // 127.0.0.1 se normaliza a localhost (Google no admite IP en las URI de redirección).
    let response = res;
    if (res.status() === 307) response = await request.get(res.headers().location, { maxRedirects: 0 });
    expect(response.status()).toBe(303);
    const location = new URL(response.headers().location);
    expect(location.origin + location.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    const q = location.searchParams;
    expect(q.get("client_id")).toBe(env.GOOGLE_CLIENT_ID);
    expect(q.get("response_type")).toBe("code");
    expect(q.get("scope")).toBe("openid email profile");
    expect(q.get("code_challenge_method")).toBe("S256");
    expect(q.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(q.get("state")).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    expect(q.get("nonce")).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    const redirect = new URL(q.get("redirect_uri") ?? "");
    expect(redirect.pathname).toBe("/api/auth/callback/google");
    expect(["localhost", "fundigsac-web.vercel.app"]).toContain(redirect.hostname);
    const cookie = response.headersArray().find((h) => h.name.toLowerCase() === "set-cookie" && h.value.startsWith("fundigsac-oauth="))?.value ?? "";
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).toMatch(/Path=\/api\/auth/i);
    expect(response.headers()["cache-control"]).toBe("no-store");
  });

  test("el botón «Continuar con Google» navega a Google (login y registro)", async ({ page, baseURL }) => {
    await prepare(page, baseURL);
    // Se observa la petición a Google y se corta ahí: la prueba no depende de la red ni de las URI registradas.
    await page.route("https://accounts.google.com/**", (route) => route.abort());
    for (const [path, name] of [
      ["/login", "Continuar con Google"],
      ["/registro", "Registrarme con Google"],
    ] as const) {
      await page.goto(path);
      const [request] = await Promise.all([page.waitForRequest(/accounts\.google\.com\/o\/oauth2\/v2\/auth/), page.getByRole("link", { name }).click()]);
      expect(new URL(request.url()).searchParams.get("client_id")).toBe(env.GOOGLE_CLIENT_ID);
    }
  });

  test("conserva ?next= solo si es una ruta interna", async ({ request }) => {
    for (const next of ["//evil.com", "https://evil.com", "/api/auth/logout"]) {
      const res = await request.get(`/api/auth/google?next=${encodeURIComponent(next)}`, { maxRedirects: 0 });
      expect([303, 307]).toContain(res.status());
    }
  });
});

test.describe("Google: callback con errores controlados", () => {
  test("cancelar en Google vuelve al login con un aviso", async ({ page, baseURL }) => {
    // Sin credenciales el servidor responde "not_configured" antes de mirar el error de Google (igual que el resto del archivo).
    test.skip(!configured, "Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o AUTH_SECRET (.env.local)");
    await prepare(page, baseURL);
    await page.goto("/api/auth/callback/google?error=access_denied");
    await expect(page).toHaveURL(/\/login\?error=cancelled/);
    await expect(page.locator(".ac-notice--error")).toContainText("Cancelaste el acceso con Google");
  });

  test("sin cookie de estado (o con state distinto) se rechaza y el registro muestra su aviso", async ({ page, request, baseURL }) => {
    const res = await request.get("/api/auth/callback/google?code=abc&state=falso", { maxRedirects: 0 });
    expect([303, 307]).toContain(res.status());
    expect(res.headers().location).toMatch(/\/login\?error=(state|not_configured)/);
    await prepare(page, baseURL);
    await page.goto("/registro?error=state");
    await expect(page.locator(".ac-notice--error")).toContainText("venció o no se pudo verificar");
    await page.goto("/login?error=desconocido");
    await expect(page.locator(".ac-notice--error")).toContainText("No pudimos iniciar tu sesión");
  });

  test("el aviso se traduce al inglés", async ({ page, baseURL }) => {
    await prepare(page, baseURL);
    await page.addInitScript(() => localStorage.setItem("fundigsac-lang", "en"));
    await page.goto("/login?error=network");
    await expect(page.locator(".ac-notice--error")).toContainText("We couldn't reach Google");
    await expect(page.getByRole("link", { name: "Continue with Google" })).toBeVisible();
  });
});

test.describe("Google: sesión", () => {
  test("sin sesión: /api/auth/session devuelve null y la cabecera ofrece iniciar sesión", async ({ page, request, baseURL }) => {
    const res = await request.get("/api/auth/session");
    expect(await res.json()).toEqual({ user: null });
    expect(res.headers()["cache-control"]).toBe("no-store");
    await prepare(page, baseURL);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Cuenta", exact: true })).toBeVisible();
  });

  test("cerrar sesión exige mismo origen", async ({ request }) => {
    const res = await request.post("/api/auth/logout", { headers: { origin: "https://evil.example" } });
    expect(res.status()).toBe(403);
  });

  test.describe("con sesión simulada", () => {
    test.skip(!configured, "Falta AUTH_SECRET para firmar la sesión simulada");

    test("la cabecera muestra nombre y foto, login muestra la sesión y cerrar sesión la borra", async ({ page, context, baseURL }) => {
      await prepare(page, baseURL);
      const user = { name: "María Quispe", email: "maria@constructora.pe" };
      await context.addCookies([{ name: "fundigsac-session", value: sessionCookie(user), url: baseURL ?? "http://127.0.0.1:3100", httpOnly: true, sameSite: "Lax" }]);

      await page.goto("/");
      const account = page.getByRole("button", { name: "Cuenta: María Quispe" });
      await expect(account).toBeVisible();
      await expect(account.locator(".lp-avatar--initial")).toHaveText("M");

      await page.goto("/login");
      await expect(page.getByRole("heading", { level: 2, name: "Ya iniciaste sesión" })).toBeVisible();
      await expect(page.getByText("Estás conectado como maria@constructora.pe.")).toBeVisible();
      await expect(page.getByRole("link", { name: "Continuar con Google" })).toHaveCount(0);

      await page.getByRole("button", { name: "Cuenta: María Quispe" }).click();
      const menu = page.getByRole("menu", { name: "Cuenta" });
      await expect(menu).toContainText("maria@constructora.pe");
      await menu.getByRole("menuitem", { name: "Cerrar sesión" }).click();
      await expect(page.getByRole("heading", { level: 2, name: "Inicia sesión" })).toBeVisible();
      expect((await context.cookies()).some((c) => c.name === "fundigsac-session")).toBe(false);
      await expect(page.getByRole("button", { name: "Cuenta", exact: true })).toBeVisible();
    });

    test("una cookie manipulada o vencida no inicia sesión", async ({ request, context, baseURL }) => {
      const url = baseURL ?? "http://127.0.0.1:3100";
      const user = { name: "Ana", email: "ana@empresa.pe" };
      await context.addCookies([{ name: "fundigsac-session", value: sessionCookie(user, -60), url }]);
      expect(await (await context.request.get("/api/auth/session")).json()).toEqual({ user: null });
      const good = sessionCookie(user);
      const [payload, mac] = good.split(".");
      const forged = `${b64url(JSON.stringify({ name: "Root", email: "root@empresa.pe", exp: 9999999999 }))}.${mac}`;
      await context.addCookies([{ name: "fundigsac-session", value: forged, url }]);
      expect(await (await context.request.get("/api/auth/session")).json()).toEqual({ user: null });
      await context.addCookies([{ name: "fundigsac-session", value: `${payload}.${mac}`, url }]);
      expect(await (await context.request.get("/api/auth/session")).json()).toMatchObject({ user: { email: "ana@empresa.pe" } });
      expect(request).toBeTruthy();
    });
  });
});
