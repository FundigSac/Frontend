import { authMetadata } from "@/modules/auth/metadata";
import { ProfileForm } from "@/modules/auth/profile-form";
import { Panel } from "@/modules/auth/ui/panel";
import { requireSession } from "@/server/auth/session";

export const metadata = authMetadata("Perfil");

export default async function ProfilePage() {
  const { user } = await requireSession("/cuenta/perfil");
  return (
    <Panel title="Perfil" description={`Correo de la cuenta: ${user.email}. Para cambiarlo contacta a nuestro equipo.`}>
      <ProfileForm defaults={{ name: user.name, company: user.company ?? "", ruc: user.ruc ?? "", phone: user.phone ?? "" }} />
    </Panel>
  );
}
