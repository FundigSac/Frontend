import Link from "next/link";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { BTN_PRIMARY_LINK, BTN_SECONDARY } from "@/modules/auth/ui/styles";

export const metadata = authMetadata("Acceso denegado");

export default function AccessDeniedPage() {
  return (
    <AuthCard icon="lock_person" tone="warning" title="Acceso denegado" description="Tu cuenta no tiene permisos para ver esta sección. Si crees que es un error, contacta a nuestro equipo.">
      <div className="flex flex-col gap-3">
        <Link href="/cuenta" className={BTN_PRIMARY_LINK}>
          Ir a mi cuenta
        </Link>
        <Link href="/" className={BTN_SECONDARY}>
          Volver al inicio
        </Link>
      </div>
    </AuthCard>
  );
}
