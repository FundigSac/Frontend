// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/**
 * Integración real: Better Auth + adaptador Drizzle + PGlite en memoria (migraciones reales de ./drizzle),
 * ejercitada a través de `auth.handler` (la misma ruta HTTP que usa /api/auth/[...all]), con rate limit en base de datos.
 * No hay red ni credenciales OAuth: lo social NO se prueba aquí.
 */
const ORIGIN = "http://localhost:3999";
const GOOD_PASSWORD = "correcto-caballo-bateria-grapa";
const NEW_PASSWORD = "otra-clave-larga-y-distinta-2026";

type Auth = Awaited<ReturnType<typeof import("@/server/auth/auth")["createAuth"]>>;
let auth: Auth;
let db: ReturnType<typeof drizzle>;
let outbox: string;
const background: Promise<unknown>[] = [];
let counter = 0;

const uniqueEmail = () => `qa-${Date.now()}-${++counter}@example.test`;
/** IP distinta por prueba para no mezclar cubos de rate limit. */
const ip = () => ({ "x-forwarded-for": `198.51.100.${(++counter % 200) + 1}` });

async function settle() {
  await Promise.all(background.splice(0));
}

function call(method: "GET" | "POST", url: string, init: { body?: unknown; headers?: Record<string, string> } = {}) {
  return auth.handler(
    new Request(url.startsWith("http") ? url : `${ORIGIN}/api/auth${url}`, {
      method,
      headers: { origin: ORIGIN, ...(init.body !== undefined ? { "content-type": "application/json" } : {}), ...init.headers },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      redirect: "manual",
    }),
  );
}

function mailsTo(email: string) {
  return readdirSync(outbox)
    .sort()
    .map((f) => JSON.parse(readFileSync(path.join(outbox, f), "utf8")) as { to: string; subject: string; text: string; html: string })
    .filter((m) => m.to === email);
}

function linkIn(text: string): string {
  const m = text.match(/https?:\/\/\S+/);
  if (!m) throw new Error("sin enlace en el correo");
  return m[0];
}

function cookieHeader(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

async function signUpAndVerify(email: string, password = GOOD_PASSWORD) {
  const res = await call("POST", "/sign-up/email", { body: { name: "Ana Pérez", email, password }, headers: ip() });
  expect(res.status).toBe(200);
  await settle();
  const verify = mailsTo(email).find((m) => m.subject.startsWith("Confirma tu correo"));
  expect(verify).toBeTruthy();
  const verifyRes = await call("GET", linkIn(verify!.text), { headers: ip() });
  expect(verifyRes.status).toBe(302);
  return { verifyRes };
}

async function signIn(email: string, password: string, headers: Record<string, string> = ip()) {
  return call("POST", "/sign-in/email", { body: { email, password }, headers });
}

beforeAll(async () => {
  outbox = mkdtempSync(path.join(tmpdir(), "fundigsac-outbox-"));
  Object.assign(process.env, {
    BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123456",
    BETTER_AUTH_URL: ORIGIN,
    AUTH_OUTBOX_DIR: outbox,
  });
  delete process.env.RESEND_API_KEY;
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const client = new PGlite();
  db = drizzle(client);
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const { createAuth } = await import("@/server/auth/auth");
  auth = createAuth({ db: db as never, runInBackground: (p) => void background.push(p.catch(() => undefined)) });
}, 120_000);

afterAll(() => vi.restoreAllMocks());

describe("registro y verificación de correo", () => {
  it("el registro no abre sesión, crea rol customer y envía el enlace de verificación", async () => {
    const email = uniqueEmail();
    const res = await call("POST", "/sign-up/email", { body: { name: "Ana Pérez", email, password: GOOD_PASSWORD }, headers: ip() });
    expect(res.status).toBe(200);
    expect(res.headers.getSetCookie()).toHaveLength(0);
    const body = await res.json();
    expect(body.token).toBeNull();
    await settle();
    const { user } = await import("@/server/db/schema/auth");
    const [row] = await db.select().from(user).where(eq(user.email, email));
    expect(row.role).toBe("customer");
    expect(row.emailVerified).toBe(false);
    const mail = mailsTo(email).find((m) => m.subject.startsWith("Confirma tu correo"));
    expect(mail?.text).toContain("/api/auth/verify-email?token=");
    expect(mail?.text).toContain("callbackURL=%2Fcorreo-verificado%3Festado%3Dok");
    expect(mail?.text).not.toContain(GOOD_PASSWORD);
    expect(mail?.html).not.toContain(GOOD_PASSWORD);
  });

  it("sin enumeración: registrar un correo existente responde igual y avisa por correo al titular", async () => {
    const email = uniqueEmail();
    const first = await call("POST", "/sign-up/email", { body: { name: "Ana", email, password: GOOD_PASSWORD }, headers: ip() });
    const second = await call("POST", "/sign-up/email", { body: { name: "Intruso", email, password: NEW_PASSWORD }, headers: ip() });
    expect(second.status).toBe(first.status);
    const a = await first.json();
    const b = await second.json();
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
    expect(Object.keys(b.user).sort()).toEqual(Object.keys(a.user).sort());
    expect(b.token).toBeNull();
    await settle();
    expect(mailsTo(email).some((m) => m.subject.includes("Intento de registro"))).toBe(true);
  });

  it("no permite asignarse un rol al registrarse (input: false)", async () => {
    const email = uniqueEmail();
    const res = await call("POST", "/sign-up/email", { body: { name: "Mal Actor", email, password: GOOD_PASSWORD, role: "admin", banned: false }, headers: ip() });
    await settle();
    const { user } = await import("@/server/db/schema/auth");
    const rows = await db.select().from(user).where(eq(user.email, email));
    // O bien se rechaza la solicitud, o bien se ignora el campo; en ningún caso queda admin.
    if (res.status === 200) expect(rows[0]?.role).toBe("customer");
    else expect(rows).toHaveLength(0);
  });

  it("rechaza contraseñas cortas en el servidor", async () => {
    const res = await call("POST", "/sign-up/email", { body: { name: "Ana", email: uniqueEmail(), password: "corta-123" }, headers: ip() });
    expect(res.status).toBe(400);
  });

  it("no se puede iniciar sesión con correo sin verificar (403 EMAIL_NOT_VERIFIED) y luego sí", async () => {
    const email = uniqueEmail();
    await call("POST", "/sign-up/email", { body: { name: "Ana Pérez", email, password: GOOD_PASSWORD }, headers: ip() });
    await settle();
    const blocked = await signIn(email, GOOD_PASSWORD);
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).code).toBe("EMAIL_NOT_VERIFIED");
    expect(blocked.headers.getSetCookie()).toHaveLength(0);

    const verify = mailsTo(email).filter((m) => m.subject.startsWith("Confirma tu correo")).at(-1)!;
    const verified = await call("GET", linkIn(verify.text), { headers: ip() });
    expect(verified.status).toBe(302);
    expect(verified.headers.get("location")).toContain("/correo-verificado?estado=ok");
    const ok = await signIn(email, GOOD_PASSWORD);
    expect(ok.status).toBe(200);
  });

  it("un token de verificación inválido redirige con ?error=", async () => {
    const res = await call("GET", `/verify-email?token=basura&callbackURL=${encodeURIComponent("/correo-verificado?estado=ok")}`, { headers: ip() });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/\/correo-verificado\?estado=ok&error=/);
  });
});

describe("inicio de sesión y cookies", () => {
  it("cookie de sesión httpOnly + SameSite=Lax con prefijo propio; la sesión expone el rol", async () => {
    const email = uniqueEmail();
    await signUpAndVerify(email);
    const res = await signIn(email, GOOD_PASSWORD);
    expect(res.status).toBe(200);
    const setCookie = res.headers.getSetCookie().find((c) => c.startsWith("fundigsac.session_token="))!;
    expect(setCookie).toBeTruthy();
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\//i);
    // En desarrollo/pruebas (http) no lleva Secure ni prefijo __Secure-; en producción sí (ver docs/auth/AUTH_SETUP.md).
    const session = await auth.api.getSession({ headers: new Headers({ cookie: cookieHeader(res) }) });
    expect(session?.user.email).toBe(email);
    expect((session?.user as { role?: string }).role).toBe("customer");
    expect(JSON.stringify(session)).not.toMatch(/password|hash/i);
  });

  it("credenciales inválidas: misma respuesta para usuario inexistente y contraseña incorrecta", async () => {
    const email = uniqueEmail();
    await signUpAndVerify(email);
    const wrong = await signIn(email, "contraseña-incorrecta-123");
    const missing = await signIn(uniqueEmail(), "contraseña-incorrecta-123");
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(await wrong.json()).toEqual(await missing.json());
  });

  it("CSRF/Origin: rechaza peticiones de otro origen", async () => {
    const res = await call("POST", "/sign-in/email", { body: { email: uniqueEmail(), password: "x".repeat(12) }, headers: { ...ip(), origin: "https://evil.example" } });
    expect(res.status).toBe(403);
  });

  it("open redirect: callbackURL externo es rechazado", async () => {
    const res = await call("GET", `/verify-email?token=x&callbackURL=${encodeURIComponent("https://evil.example/phish")}`, { headers: ip() });
    expect(res.status).toBe(403);
    expect(res.headers.get("location") ?? "").not.toContain("evil.example");
  });

  it("usuario bloqueado: no puede abrir sesión (BANNED_USER) y su sesión previa se detecta como bloqueada", async () => {
    const email = uniqueEmail();
    await signUpAndVerify(email);
    const first = await signIn(email, GOOD_PASSWORD);
    expect(first.status).toBe(200);
    const { user } = await import("@/server/db/schema/auth");
    await db.update(user).set({ banned: true, banReason: "prueba" }).where(eq(user.email, email));
    const blocked = await signIn(email, GOOD_PASSWORD);
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).code).toBe("BANNED_USER");
    const stale = await auth.api.getSession({ headers: new Headers({ cookie: cookieHeader(first) }) });
    const { isBanned } = await import("@/server/auth/access");
    expect(isBanned(stale!.user as { banned: boolean })).toBe(true);
  });
});

describe("recuperación de contraseña", () => {
  it("token de un solo uso: restablece, invalida sesiones previas y rechaza reutilización", async () => {
    const email = uniqueEmail();
    await signUpAndVerify(email);
    const old = await signIn(email, GOOD_PASSWORD);
    const oldCookie = cookieHeader(old);
    expect(await auth.api.getSession({ headers: new Headers({ cookie: oldCookie }) })).not.toBeNull();

    const req = await call("POST", "/request-password-reset", { body: { email, redirectTo: "/restablecer" }, headers: ip() });
    expect(req.status).toBe(200);
    await settle();
    const mail = mailsTo(email).find((m) => m.subject.startsWith("Restablece tu contraseña"))!;
    expect(mail.text).toContain("30 minutos");
    const cb = await call("GET", linkIn(mail.text), { headers: ip() });
    expect(cb.status).toBe(302);
    const location = new URL(cb.headers.get("location")!, ORIGIN);
    expect(location.pathname).toBe("/restablecer");
    const token = location.searchParams.get("token")!;
    expect(token).toBeTruthy();

    const weak = await call("POST", "/reset-password", { body: { newPassword: "corta", token }, headers: ip() });
    expect(weak.status).toBe(400);

    const done = await call("POST", "/reset-password", { body: { newPassword: NEW_PASSWORD, token }, headers: ip() });
    expect(done.status).toBe(200);
    await settle();
    expect(mailsTo(email).some((m) => m.subject.includes("contraseña de FUNDIGSAC fue actualizada"))).toBe(true);

    const reuse = await call("POST", "/reset-password", { body: { newPassword: "una-tercera-clave-valida-9", token }, headers: ip() });
    expect(reuse.status).toBe(400);

    expect(await auth.api.getSession({ headers: new Headers({ cookie: oldCookie }) })).toBeNull();
    expect((await signIn(email, GOOD_PASSWORD)).status).toBe(401);
    expect((await signIn(email, NEW_PASSWORD)).status).toBe(200);
  });

  it("sin enumeración: misma respuesta para correos existentes e inexistentes", async () => {
    const email = uniqueEmail();
    await signUpAndVerify(email);
    const known = await call("POST", "/request-password-reset", { body: { email, redirectTo: "/restablecer" }, headers: ip() });
    const unknown = await call("POST", "/request-password-reset", { body: { email: uniqueEmail(), redirectTo: "/restablecer" }, headers: ip() });
    expect(known.status).toBe(unknown.status);
    expect(await known.json()).toEqual(await unknown.json());
  });

  it("token inexistente redirige con ?error=INVALID_TOKEN", async () => {
    const res = await call("GET", `/reset-password/no-existe?callbackURL=${encodeURIComponent("/restablecer")}`, { headers: ip() });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("error=INVALID_TOKEN");
  });

  it("redirectTo externo es rechazado", async () => {
    const res = await call("POST", "/request-password-reset", { body: { email: uniqueEmail(), redirectTo: "https://evil.example" }, headers: ip() });
    expect(res.status).toBe(403);
  });
});

describe("rate limiting persistente", () => {
  it("sign-in: 5 intentos por minuto y por IP; el sexto devuelve 429 y queda registrado en la base", async () => {
    const headers = { "x-forwarded-for": "203.0.113.77" };
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await signIn(uniqueEmail(), "contraseña-incorrecta-123", headers)).status);
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses.slice(5)).toEqual([429, 429]);
    const { rateLimit } = await import("@/server/db/schema/auth");
    const rows = await db.select().from(rateLimit);
    expect(rows.some((r) => r.key.startsWith("203.0.113.77|/sign-in/email") && r.count >= 5)).toBe(true);
  });

  it("recuperación: máximo 5 solicitudes por 15 minutos", async () => {
    const headers = { "x-forwarded-for": "203.0.113.88" };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await call("POST", "/request-password-reset", { body: { email: uniqueEmail(), redirectTo: "/restablecer" }, headers })).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});
