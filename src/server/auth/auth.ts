import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { getDb } from "@/server/db/client";
import * as authSchema from "@/server/db/schema/auth";
import { isBanned } from "./access";
import { assertEmailReady, sendEmail } from "./email";
import { existingAccountEmail, passwordChangedEmail, resetPasswordEmail, verificationEmail } from "./email-templates";
import { getAuthSecret, getBaseUrl, getEnabledSocialProviders, getIpHeaders, getTrustedOrigins, getTrustedProxies, isProduction } from "./env";
import { buildRateLimitConfig } from "./rate-limit";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const RESET_TOKEN_TTL_SECONDS = 30 * 60;
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type DrizzleDb = Parameters<typeof drizzleAdapter>[0];

export type CreateAuthOptions = {
  /** Instancia de Drizzle (node-postgres o PGlite). */
  db: DrizzleDb;
  /** Ejecuta trabajo en segundo plano tras responder (por defecto `after()` de Next, con respaldo). */
  runInBackground?: (task: Promise<unknown>) => void;
  /** Sólo pruebas / desarrollo: relaja los límites de rate limit. Ignorado en producción. */
  relaxedRateLimit?: boolean;
};

function defaultRunInBackground(task: Promise<unknown>) {
  try {
    after(task);
  } catch {
    // Fuera del ámbito de una petición de Next (scripts, pruebas): la promesa sigue su curso.
    void task.catch(() => undefined);
  }
}

const MAX_NAME_LENGTH = 120;
const VERIFIED_CALLBACK = "/correo-verificado?estado=ok";

/** Los enlaces de verificación siempre aterrizan en /correo-verificado, sin importar el callbackURL que envíe el cliente. */
function withVerifiedCallback(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("callbackURL", VERIFIED_CALLBACK);
    return u.toString();
  } catch {
    return url;
  }
}

/** Registra un error de envío sin PII (ni destinatario ni enlaces). */
function logEmailFailure(kind: string, error: unknown) {
  console.error(`[auth] fallo al enviar correo (${kind}):`, error instanceof Error ? error.message : "error desconocido");
}

export function createAuth({ db, runInBackground = defaultRunInBackground, relaxedRateLimit = false }: CreateAuthOptions) {
  if (isProduction()) assertEmailReady();
  const providers = getEnabledSocialProviders();
  const baseURL = getBaseUrl();
  const secure = isProduction() || Boolean(baseURL?.startsWith("https://"));
  const ipHeaders = getIpHeaders();
  const trustedProxies = getTrustedProxies();

  return betterAuth({
    appName: "FUNDIGSAC",
    secret: getAuthSecret(),
    ...(baseURL ? { baseURL } : {}),
    basePath: "/api/auth",
    trustedOrigins: getTrustedOrigins(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authSchema.user,
        session: authSchema.session,
        account: authSchema.account,
        verification: authSchema.verification,
        rateLimit: authSchema.rateLimit,
      },
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      // Verificación obligatoria antes de iniciar sesión por correo. Además hace que el registro responda igual
      // para correos nuevos y existentes (sin enumeración de usuarios).
      requireEmailVerification: true,
      autoSignIn: false,
      resetPasswordTokenExpiresIn: RESET_TOKEN_TTL_SECONDS,
      // Cambiar/restablecer la contraseña invalida el resto de sesiones.
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        // Better Auth ejecuta este callback en segundo plano (advanced.backgroundTasks) para no diferenciar por tiempo si el correo existe.
        await sendEmail(resetPasswordEmail(user.email, user.name, url, RESET_TOKEN_TTL_SECONDS / 60)).catch((e) => logEmailFailure("reset", e));
      },
      onPasswordReset: async ({ user }) => {
        await sendEmail(passwordChangedEmail(user.email, user.name)).catch((e) => logEmailFailure("password-changed", e));
      },
      onExistingUserSignUp: async ({ user }, request) => {
        const origin = request ? new URL(request.url).origin : (baseURL ?? "");
        await sendEmail(existingAccountEmail(user.email, user.name, `${origin}/login`)).catch((e) => logEmailFailure("existing-account", e));
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: false,
      expiresIn: 60 * 60,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail(verificationEmail(user.email, user.name, withVerifiedCallback(url))).catch((e) => logEmailFailure("verification", e));
      },
    },

    // Alcances mínimos: Google = openid email profile; Facebook = email public_profile (valores por defecto de Better Auth).
    // Google usa PKCE + state; Facebook usa state (no soporta PKCE). Sólo se habilita un proveedor si hay credenciales.
    socialProviders: {
      ...(providers.google
        ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!.trim(), clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim() } }
        : {}),
      ...(providers.facebook
        ? { facebook: { clientId: process.env.FACEBOOK_CLIENT_ID!.trim(), clientSecret: process.env.FACEBOOK_CLIENT_SECRET!.trim() } }
        : {}),
    },

    account: {
      accountLinking: {
        enabled: true,
        // Ningún proveedor se considera "de confianza" por defecto: el vínculo implícito sólo ocurre si el proveedor
        // afirma email_verified=true (Google sí; Facebook no lo informa) Y el usuario local ya verificó su correo
        // (requireLocalEmailVerified evita el pre-secuestro de cuentas).
        trustedProviders: [],
        requireLocalEmailVerified: true,
        // Vincular un proveedor con otro correo exige acción explícita y no se permite (riesgo de toma de cuenta).
        allowDifferentEmails: false,
        allowUnlinkingAll: false,
        updateUserInfoOnLink: false,
      },
    },

    user: {
      additionalFields: {
        role: { type: ["customer", "advisor", "support", "admin"], required: false, defaultValue: "customer", input: false },
        banned: { type: "boolean", required: false, defaultValue: false, input: false },
        banReason: { type: "string", required: false, input: false },
        banExpires: { type: "date", required: false, input: false },
        company: { type: "string", required: false, input: false },
        ruc: { type: "string", required: false, input: false },
        phone: { type: "string", required: false, input: false },
      },
    },

    session: {
      expiresIn: SESSION_TTL_SECONDS,
      updateAge: 60 * 60 * 24,
      // Sin cookie cache: cada lectura valida la sesión en la base (revocación y bloqueos inmediatos).
      cookieCache: { enabled: false },
    },

    rateLimit: buildRateLimitConfig({ relaxed: relaxedRateLimit && !isProduction() }),

    advanced: {
      cookiePrefix: "fundigsac",
      useSecureCookies: secure,
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure, path: "/" },
      ipAddress: {
        ...(ipHeaders ? { ipAddressHeaders: ipHeaders } : {}),
        ...(trustedProxies ? { trustedProxies } : {}),
      },
      backgroundTasks: { handler: runInBackground },
    },

    // Errores de OAuth (usuario canceló, correo ausente, cuenta no vinculable…) llegan como ?error=<código>.
    onAPIError: { errorURL: "/auth/error" },

    databaseHooks: {
      user: {
        create: {
          before: async (u) => {
            const name = typeof u.name === "string" ? u.name.trim() : "";
            if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
              throw new APIError("BAD_REQUEST", { message: "Nombre no válido.", code: "INVALID_NAME" });
            }
            return { data: { ...u, name } };
          },
        },
        update: {
          before: async (u) => {
            if (typeof u.name === "string") {
              const name = u.name.trim();
              if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
                throw new APIError("BAD_REQUEST", { message: "Nombre no válido.", code: "INVALID_NAME" });
              }
              return { data: { ...u, name } };
            }
          },
        },
      },
      session: {
        create: {
          // Un usuario bloqueado no puede abrir sesión (correo ni OAuth).
          before: async (s, ctx) => {
            if (!ctx) return;
            const found = await ctx.context.internalAdapter.findUserById(s.userId);
            const record = found as { banned?: boolean | null; banExpires?: Date | null } | null;
            if (record && isBanned({ banned: record.banned, banExpires: record.banExpires })) {
              throw new APIError("FORBIDDEN", { message: "Cuenta restringida.", code: "BANNED_USER" });
            }
          },
        },
      },
    },

    // nextCookies debe ser el último plugin: permite fijar/borrar cookies desde Server Actions.
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as { __fundigsacAuth?: Promise<Auth> };

/** Instancia única (perezosa) usada por la aplicación. */
export function getAuth(): Promise<Auth> {
  return (globalForAuth.__fundigsacAuth ??= getDb().then(
    (db) => createAuth({ db: db as unknown as DrizzleDb, relaxedRateLimit: process.env.AUTH_RATE_LIMIT_RELAXED === "1" }),
  ));
}
