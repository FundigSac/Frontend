import { headers } from "next/headers";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/modules/auth/actions";
import { ChangePasswordForm } from "@/modules/auth/change-password-form";
import { LinkedMethods } from "@/modules/auth/linked-methods";
import { authMetadata } from "@/modules/auth/metadata";
import { Alert } from "@/modules/auth/ui/alert";
import { Panel } from "@/modules/auth/ui/panel";
import { BTN_SECONDARY } from "@/modules/auth/ui/styles";
import { getAuth } from "@/server/auth/auth";
import { getEnabledSocialProviders } from "@/server/auth/env";
import { requireSession } from "@/server/auth/session";

export const metadata = authMetadata("Seguridad");

const dateFormat = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

/** Descripción legible y no sensible del navegador/sistema (sin exponer el user-agent completo). */
function describeAgent(ua?: string | null): string {
  if (!ua) return "Dispositivo desconocido";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iOS" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "sistema desconocido";
  return `${browser} en ${os}`;
}

export default async function SecurityPage() {
  const current = await requireSession("/cuenta/seguridad");
  const auth = await getAuth();
  const h = await headers();
  const [sessions, accounts] = await Promise.all([auth.api.listSessions({ headers: h }), auth.api.listUserAccounts({ headers: h })]);
  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const ordered = [...sessions].sort((a, b) => (a.id === current.session.id ? -1 : b.id === current.session.id ? 1 : +new Date(b.updatedAt) - +new Date(a.updatedAt)));

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Contraseña" description={hasPassword ? "Cambiarla cierra tus otras sesiones activas." : undefined}>
        {hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <Alert tone="info">Tu cuenta accede con un proveedor externo y aún no tiene contraseña. Puedes crear una desde “Métodos de acceso”.</Alert>
        )}
      </Panel>

      <Panel title="Sesiones activas" description="Dispositivos con sesión iniciada. Cierra los que no reconozcas.">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {ordered.map((s) => {
            const isCurrent = s.id === current.session.id;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-primary">
                  devices
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-ui-label text-ui-label text-on-surface">
                    {describeAgent(s.userAgent)}
                    {isCurrent ? <span className="ml-2 rounded border border-border bg-surface px-1.5 py-0.5 text-on-surface-variant">Esta sesión</span> : null}
                  </p>
                  <p className="font-body-compact text-body-compact text-text-secondary">Inicio: {dateFormat.format(new Date(s.createdAt))}</p>
                </div>
                <form action={revokeSessionAction}>
                  <input type="hidden" name="sessionId" value={s.id} />
                  <button type="submit" className="inline-flex h-11 items-center rounded-lg border border-border bg-surface-container-lowest px-4 font-button-text text-button-text text-on-surface hover:bg-surface-container transition-colors">
                    {isCurrent ? "Cerrar esta sesión" : "Cerrar sesión"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
        {ordered.length > 1 ? (
          <form action={revokeOtherSessionsAction} className="mt-4 sm:max-w-[320px]">
            <button type="submit" className={BTN_SECONDARY}>
              Cerrar todas las demás sesiones
            </button>
          </form>
        ) : null}
      </Panel>

      <Panel title="Métodos de acceso">
        <LinkedMethods accounts={accounts.map((a) => ({ id: a.id, providerId: a.providerId }))} enabled={getEnabledSocialProviders()} email={current.user.email} />
      </Panel>
    </div>
  );
}
