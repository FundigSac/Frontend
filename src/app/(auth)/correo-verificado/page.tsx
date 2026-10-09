import { redirect } from "next/navigation";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { BTN_PRIMARY_LINK } from "@/modules/auth/ui/styles";
import { getOptionalSession } from "@/server/auth";
import Link from "next/link";

export const metadata = authMetadata("Correo verificado");

/** Destino del enlace de verificación. Better Auth añade ?error=<código> si el token no sirve. */
export default async function EmailVerifiedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  if (sp.error) redirect("/enlace-expirado?tipo=verificacion");
  if (sp.estado !== "ok") redirect("/login");
  const signedIn = Boolean(await getOptionalSession());

  return (
    <AuthCard icon="verified_user" tone="success" title="Correo verificado" description="Tu dirección quedó confirmada. Ya puedes iniciar sesión con tu correo y contraseña.">
      <Link href={signedIn ? "/cuenta" : "/login"} className={BTN_PRIMARY_LINK}>
        {signedIn ? "Ir a mi cuenta" : "Iniciar sesión"}
      </Link>
    </AuthCard>
  );
}
