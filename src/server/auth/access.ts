import type { UserRole } from "@/server/db/schema/auth";
import { loginUrl, safeRedirectPath } from "./redirects";

/** Lógica de autorización pura (sin dependencias de Next) para poder probarla de forma aislada. */
export const ROLES = ["customer", "advisor", "support", "admin"] as const satisfies readonly UserRole[];

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  banned?: boolean | null;
  banExpires?: Date | string | null;
};

export type AccessDecision = { ok: true } | { ok: false; redirectTo: string };

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Un bloqueo está activo si `banned` y no tiene vencimiento o aún no venció. */
export function isBanned(user: Pick<SessionUser, "banned" | "banExpires">, now: Date = new Date()): boolean {
  if (!user.banned) return false;
  if (!user.banExpires) return true;
  const expires = new Date(user.banExpires).getTime();
  return Number.isNaN(expires) ? true : expires > now.getTime();
}

export type AccessRequirements = {
  /** Ruta a la que volver tras iniciar sesión. */
  next?: string;
  /** Roles permitidos (pertenencia exacta; no hay jerarquía implícita). */
  roles?: readonly UserRole[];
  requireVerifiedEmail?: boolean;
};

export function evaluateAccess(user: SessionUser | null | undefined, req: AccessRequirements = {}): AccessDecision {
  const next = safeRedirectPath(req.next, "/cuenta");
  if (!user) return { ok: false, redirectTo: loginUrl(next) };
  if (isBanned(user)) return { ok: false, redirectTo: "/cuenta-restringida" };
  if (req.requireVerifiedEmail && !user.emailVerified) {
    return { ok: false, redirectTo: `/verificar-correo?next=${encodeURIComponent(next)}` };
  }
  if (req.roles && req.roles.length > 0 && !req.roles.includes(user.role)) {
    return { ok: false, redirectTo: "/acceso-denegado" };
  }
  return { ok: true };
}
