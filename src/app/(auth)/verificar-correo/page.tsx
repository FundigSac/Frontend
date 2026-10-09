import Link from "next/link";
import { redirect } from "next/navigation";
import { authMetadata } from "@/modules/auth/metadata";
import { ResendVerification } from "@/modules/auth/resend-verification";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { LINK } from "@/modules/auth/ui/styles";
import { getOptionalSession, getSession } from "@/server/auth";
import { safeRedirectPath } from "@/server/auth/redirects";

export const metadata = authMetadata("Verifica tu correo");

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeRedirectPath(sp.next);
  // Con sesión activa y correo ya verificado no hay nada que hacer aquí.
  const basic = await getOptionalSession();
  const session = basic ? await getSession() : null;
  if (session?.user.emailVerified) redirect(next);

  return (
    <AuthCard
      icon="mark_email_read"
      title="Revisa tu correo"
      description="Te enviamos un enlace para confirmar tu dirección y activar tu cuenta. Puede tardar unos minutos; revisa también la carpeta de spam."
      footer={
        <>
          ¿Ya confirmaste?{" "}
          <Link href="/login" className={LINK}>
            Iniciar sesión
          </Link>
        </>
      }
    >
      <ResendVerification knownEmail={session?.user.email} />
    </AuthCard>
  );
}
