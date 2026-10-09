import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/modules/auth/sign-out-button";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { BTN_SECONDARY, LINK } from "@/modules/auth/ui/styles";
import { isBanned } from "@/server/auth/access";
import { getSession } from "@/server/auth/session";
import { SITE } from "@/shared/config/site";

export const metadata = authMetadata("Cuenta restringida");

export default async function RestrictedAccountPage() {
  // Con sesión vigente y sin bloqueo no hay motivo para estar aquí. Sin sesión (p. ej. tras un intento de acceso
  // de una cuenta bloqueada) se muestra el mismo aviso genérico, sin datos de la cuenta.
  const session = await getSession().catch(() => null);
  if (session && !isBanned(session.user)) redirect("/cuenta");

  return (
    <AuthCard
      icon="lock"
      tone="danger"
      title="Cuenta restringida"
      description="El acceso a esta cuenta está restringido temporalmente. Por seguridad no podemos mostrar más detalles aquí; nuestro equipo puede ayudarte."
      footer={
        <>
          Escríbenos a{" "}
          <a href={`mailto:${SITE.email}`} className={LINK}>
            {SITE.email}
          </a>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Link href="/contacto" className={BTN_SECONDARY}>
          Contactar a FUNDIGSAC
        </Link>
        {session ? <SignOutButton variant="secondary" /> : null}
      </div>
    </AuthCard>
  );
}
