import Link from "next/link";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { BTN_PRIMARY_LINK, LINK } from "@/modules/auth/ui/styles";

export const metadata = authMetadata("Enlace no válido o vencido");

export default async function ExpiredLinkPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const reset = sp.tipo === "restablecer";
  return (
    <AuthCard
      icon="history_toggle_off"
      tone="warning"
      title="El enlace ya no es válido"
      description={
        reset
          ? "El enlace para restablecer tu contraseña venció o ya fue utilizado. Por seguridad cada enlace es de un solo uso."
          : "El enlace de verificación venció o no es válido. Solicita uno nuevo para activar tu cuenta."
      }
      footer={
        <Link href="/login" className={LINK}>
          Volver a iniciar sesión
        </Link>
      }
    >
      <Link href={reset ? "/recuperar" : "/verificar-correo"} className={BTN_PRIMARY_LINK}>
        {reset ? "Solicitar un nuevo enlace" : "Reenviar verificación"}
      </Link>
    </AuthCard>
  );
}
