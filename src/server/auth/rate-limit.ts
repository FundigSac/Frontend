/**
 * Reglas de rate limiting de Better Auth (por IP y ruta, almacenadas en la tabla `auth_rate_limit`).
 * Sólo se aplican a peticiones HTTP a /api/auth/*; las llamadas internas `auth.api.*` no pasan por aquí.
 * `window` en segundos.
 */
export type RateRule = { window: number; max: number };

export const RATE_RULES: Record<string, RateRule> = {
  "/sign-in/email": { window: 60, max: 5 },
  "/sign-in/social": { window: 60, max: 10 },
  "/sign-up/email": { window: 3600, max: 8 },
  "/request-password-reset": { window: 900, max: 5 },
  "/reset-password": { window: 300, max: 10 },
  "/send-verification-email": { window: 300, max: 5 },
  "/change-password": { window: 300, max: 5 },
  "/link-social": { window: 300, max: 10 },
  "/unlink-account": { window: 300, max: 10 },
};

/**
 * `relaxed` multiplica los máximos (sólo desarrollo/pruebas E2E; se ignora en producción).
 * `/get-session` queda sin límite propio: es una lectura barata que usa el encabezado (sólo con cookie válida toca la BD).
 */
export function buildRateLimitConfig(opts: { relaxed?: boolean } = {}) {
  const factor = opts.relaxed ? 100 : 1;
  const customRules: Record<string, RateRule | false> = {};
  for (const [path, rule] of Object.entries(RATE_RULES)) customRules[path] = { window: rule.window, max: rule.max * factor };
  customRules["/get-session"] = false;
  return {
    enabled: true,
    storage: "database" as const,
    modelName: "rateLimit",
    window: 60,
    max: 60 * factor,
    customRules,
  };
}
