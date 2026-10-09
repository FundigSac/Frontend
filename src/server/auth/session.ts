import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { type AccessRequirements, evaluateAccess, isBanned, isUserRole, type SessionUser } from "./access";
import { getAuth } from "./auth";
import type { UserRole } from "@/server/db/schema/auth";

export type AppSession = {
  user: SessionUser & { image?: string | null; company?: string | null; ruc?: string | null; phone?: string | null; createdAt?: Date };
  session: { id: string; token: string; expiresAt: Date; ipAddress?: string | null; userAgent?: string | null };
};

function normalize(raw: unknown): AppSession | null {
  if (!raw || typeof raw !== "object") return null;
  const { user, session } = raw as { user?: Record<string, unknown>; session?: Record<string, unknown> };
  if (!user || !session || typeof user.id !== "string") return null;
  return {
    user: {
      id: user.id,
      name: String(user.name ?? ""),
      email: String(user.email ?? ""),
      emailVerified: Boolean(user.emailVerified),
      // El rol sólo se toma de la base; ante un valor desconocido se degrada al mínimo privilegio.
      role: isUserRole(user.role) ? user.role : "customer",
      banned: Boolean(user.banned),
      banExpires: (user.banExpires as Date | string | null | undefined) ?? null,
      image: (user.image as string | null | undefined) ?? null,
      company: (user.company as string | null | undefined) ?? null,
      ruc: (user.ruc as string | null | undefined) ?? null,
      phone: (user.phone as string | null | undefined) ?? null,
      createdAt: user.createdAt instanceof Date ? user.createdAt : undefined,
    },
    session: {
      id: String(session.id),
      token: String(session.token),
      expiresAt: new Date(session.expiresAt as string | Date),
      ipAddress: (session.ipAddress as string | null | undefined) ?? null,
      userAgent: (session.userAgent as string | null | undefined) ?? null,
    },
  };
}

/** Sesión vigente (o null). Una lectura por petición (React cache). Puede lanzar si la base falla. */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const auth = await getAuth();
  return normalize(await auth.api.getSession({ headers: await headers() }));
});

/**
 * Sesión mínima para otros módulos (p. ej. vincular una solicitud al usuario). Nunca lanza:
 * ante cualquier fallo, o si la cuenta está bloqueada, devuelve null.
 */
export async function getOptionalSession(): Promise<{ user: { id: string; role: UserRole; name: string; email: string } } | null> {
  try {
    const s = await getSession();
    if (!s || isBanned(s.user)) return null;
    return { user: { id: s.user.id, role: s.user.role, name: s.user.name, email: s.user.email } };
  } catch {
    return null;
  }
}

async function enforce(req: AccessRequirements): Promise<AppSession> {
  const session = await getSession();
  const decision = evaluateAccess(session?.user, req);
  if (!decision.ok) redirect(decision.redirectTo);
  return session as AppSession;
}

/** Exige sesión; si no hay, redirige a /login?next=<ruta segura>. Bloqueados → /cuenta-restringida. */
export function requireSession(next = "/cuenta"): Promise<AppSession> {
  return enforce({ next });
}

/** Exige sesión y que el rol sea uno de los indicados (si no, /acceso-denegado). */
export function requireRole(roles: readonly UserRole[], next = "/cuenta"): Promise<AppSession> {
  return enforce({ next, roles });
}

/** Exige sesión con correo verificado (si no, /verificar-correo). */
export function requireVerifiedEmail(next = "/cuenta"): Promise<AppSession> {
  return enforce({ next, requireVerifiedEmail: true });
}
