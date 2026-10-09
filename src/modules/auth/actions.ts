"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/server/auth/auth";
import { requireSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { user as userTable } from "@/server/db/schema/auth";
import { fieldErrors, profileSchema } from "./schemas";

/**
 * Acciones de servidor de cuenta. Next.js verifica Origin/Host en las Server Actions (CSRF) y cada acción
 * vuelve a comprobar la sesión en el servidor: no depende de que el botón esté oculto ni del proxy.
 */

/** AUTH12: cerrar sesión. Siempre POST (acción de formulario), nunca un enlace GET. */
export async function signOutAction(): Promise<void> {
  try {
    const auth = await getAuth();
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // Sin sesión o sesión ya inválida: el resultado deseado (sin sesión) se cumple igualmente.
  }
  redirect("/login?estado=sesion-cerrada");
}

/** Revoca una sesión propia por id. El token nunca se envía al navegador: se resuelve en el servidor. */
export async function revokeSessionAction(formData: FormData): Promise<void> {
  const current = await requireSession("/cuenta/seguridad");
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId || sessionId.length > 128) return;
  const auth = await getAuth();
  const h = await headers();
  const sessions = await auth.api.listSessions({ headers: h });
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return; // no es una sesión de este usuario
  await auth.api.revokeSession({ headers: h, body: { token: target.token } });
  if (target.id === current.session.id) redirect("/login?estado=sesion-cerrada");
  revalidatePath("/cuenta/seguridad");
}

/** Cierra todas las sesiones salvo la actual. */
export async function revokeOtherSessionsAction(): Promise<void> {
  await requireSession("/cuenta/seguridad");
  const auth = await getAuth();
  await auth.api.revokeOtherSessions({ headers: await headers() });
  revalidatePath("/cuenta/seguridad");
}

export type ProfileState = { status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string> };

/** AUTH10: actualiza nombre y datos B2B opcionales (empresa, RUC, teléfono). El rol nunca se toca aquí. */
export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await requireSession("/cuenta/perfil");
  const parsed = profileSchema.safeParse({
    name: formData.get("name") ?? "",
    company: formData.get("company") ?? "",
    ruc: formData.get("ruc") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Revisa los campos marcados.", errors: fieldErrors(parsed.error) };
  try {
    const db = await getDb();
    await db
      .update(userTable)
      .set({ name: parsed.data.name, company: parsed.data.company, ruc: parsed.data.ruc, phone: parsed.data.phone, updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id));
  } catch {
    return { status: "error", message: "No pudimos guardar los cambios. Inténtalo nuevamente." };
  }
  revalidatePath("/cuenta", "layout");
  return { status: "success", message: "Datos actualizados." };
}
