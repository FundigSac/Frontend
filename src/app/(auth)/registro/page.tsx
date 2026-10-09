import Link from "next/link";
import { redirect } from "next/navigation";
import { authMetadata } from "@/modules/auth/metadata";
import { RegisterForm } from "@/modules/auth/register-form";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { OrDivider, SocialButtons } from "@/modules/auth/ui/social-buttons";
import { LINK } from "@/modules/auth/ui/styles";
import { getOptionalSession } from "@/server/auth";
import { getEnabledSocialProviders } from "@/server/auth/env";
import { safeRedirectPath } from "@/server/auth/redirects";

export const metadata = authMetadata("Crear cuenta");

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeRedirectPath(sp.next);
  if (await getOptionalSession()) redirect(next);
  const providers = getEnabledSocialProviders();
  const loginHref = next === "/cuenta" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Crear cuenta"
      description="Un solo acceso para tus cotizaciones y solicitudes."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href={loginHref} className={LINK}>
            Iniciar sesión
          </Link>
        </>
      }
    >
      <SocialButtons enabled={providers} next={next} />
      <OrDivider />
      <RegisterForm />
    </AuthCard>
  );
}
