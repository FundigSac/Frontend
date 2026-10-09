import { authMetadata } from "@/modules/auth/metadata";
import { Panel } from "@/modules/auth/ui/panel";
import { requireRole } from "@/server/auth/session";

export const metadata = authMetadata("Área del equipo");

const ROLE_LABELS = { customer: "Cliente", advisor: "Asesor comercial", support: "Soporte", admin: "Administrador" } as const;

/** Ejemplo de ruta con autorización por rol: sólo personal (advisor, support, admin). Los clientes van a /acceso-denegado. */
export default async function TeamPage() {
  const { user } = await requireRole(["advisor", "support", "admin"], "/cuenta/equipo");
  return (
    <Panel title="Área del equipo" description="Sección reservada para el personal de FUNDIGSAC.">
      <p className="font-body-default text-body-default text-on-surface">
        Acceso verificado como <strong>{ROLE_LABELS[user.role]}</strong>. Las herramientas internas se incorporarán en próximas fases.
      </p>
    </Panel>
  );
}
