import { redirect } from "next/navigation";
import { authMetadata } from "@/modules/auth/metadata";
import { ResetForm } from "@/modules/auth/reset-form";
import { AuthCard } from "@/modules/auth/ui/auth-card";

// El token viaja en la URL: no se envía Referer a terceros desde esta página.
export const metadata = authMetadata("Nueva contraseña", { referrer: "no-referrer" });

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  // Better Auth redirige con ?error=INVALID_TOKEN si el token no existe o venció; sin token tampoco hay nada que hacer.
  if (sp.error || !token || token.length > 256) redirect("/enlace-expirado?tipo=restablecer");

  return (
    <AuthCard icon="lock_reset" title="Crea una nueva contraseña" description="Elige una contraseña que no uses en otros sitios. Al guardarla se cerrarán tus otras sesiones.">
      <ResetForm token={token} />
    </AuthCard>
  );
}
