import Link from "next/link";
import { mapOAuthError } from "@/modules/auth/errors";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { BTN_PRIMARY_LINK, LINK } from "@/modules/auth/ui/styles";

export const metadata = authMetadata("Error de acceso");

/**
 * Destino de los errores de proveedores sociales (?error=<código>). Sólo se muestran mensajes propios:
 * el parámetro `error_description` del proveedor se ignora a propósito.
 */
export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const view = mapOAuthError(sp.error);
  const tone = view.tone === "danger" ? "danger" : view.tone === "warning" ? "warning" : "neutral";
  return (
    <AuthCard
      icon={view.tone === "info" ? "info" : "error"}
      tone={tone}
      title={view.title}
      description={view.message}
      footer={
        <>
          ¿Necesitas ayuda?{" "}
          <Link href="/contacto" className={LINK}>
            Contáctanos
          </Link>
        </>
      }
    >
      <Link href={view.action.href} className={BTN_PRIMARY_LINK}>
        {view.action.label}
      </Link>
    </AuthCard>
  );
}
