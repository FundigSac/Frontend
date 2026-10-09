import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/login-form";
import { authMetadata } from "@/modules/auth/metadata";
import { Alert } from "@/modules/auth/ui/alert";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { OrDivider, SocialButtons } from "@/modules/auth/ui/social-buttons";
import { LINK } from "@/modules/auth/ui/styles";
import { getOptionalSession } from "@/server/auth";
import { getEnabledSocialProviders } from "@/server/auth/env";
import { safeRedirectPath } from "@/server/auth/redirects";

export const metadata = authMetadata("Iniciar sesión");

const NOTICES: Record<string, { tone: "success" | "info"; text: string }> = {
  restablecida: { tone: "success", text: "Tu contraseña se actualizó. Inicia sesión con la nueva contraseña." },
  "sesion-cerrada": { tone: "info", text: "Cerraste sesión correctamente." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeRedirectPath(sp.next);
  if (await getOptionalSession()) redirect(next);
  const providers = getEnabledSocialProviders();
  const estado = typeof sp.estado === "string" ? sp.estado : "";
  const notice = NOTICES[estado];
  const registerHref = next === "/cuenta" ? "/registro" : `/registro?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Accede a tu cuenta para dar seguimiento a tus solicitudes."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href={registerHref} className={LINK}>
            Crear cuenta
          </Link>
        </>
      }
    >
      {notice ? (
        <div className="mb-4">
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      ) : null}
      <SocialButtons enabled={providers} next={next} />
      <OrDivider />
      <LoginForm next={next} />
    </AuthCard>
  );
}
