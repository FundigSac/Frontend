import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { authMetadata } from "@/modules/auth/metadata";
import { ResendVerification } from "@/modules/auth/resend-verification";
import { Alert } from "@/modules/auth/ui/alert";
import { Panel } from "@/modules/auth/ui/panel";
import { BTN_SECONDARY, LINK } from "@/modules/auth/ui/styles";
import { requireSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { leadSubmissions } from "@/server/db/schema/leads";

export const metadata = authMetadata("Resumen de cuenta");

const ROLE_LABELS = { customer: "Cliente", advisor: "Asesor comercial", support: "Soporte", admin: "Administrador" } as const;
const KIND_LABELS: Record<string, string> = { contact: "Contacto", quote: "Cotización", procurement: "Requerimiento", claim: "Reclamo" };
const STATUS_LABELS: Record<string, string> = { received: "Recibida", in_review: "En revisión", answered: "Respondida", closed: "Cerrada" };

const dateFormat = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "America/Lima" });

async function loadRequests(userId: string) {
  try {
    const db = await getDb();
    return await db
      .select({ reference: leadSubmissions.reference, kind: leadSubmissions.kind, status: leadSubmissions.status, createdAt: leadSubmissions.createdAt })
      .from(leadSubmissions)
      .where(eq(leadSubmissions.userId, userId))
      .orderBy(desc(leadSubmissions.createdAt))
      .limit(10);
  } catch {
    return null;
  }
}

export default async function AccountPage() {
  const session = await requireSession("/cuenta");
  const { user } = session;
  const requests = await loadRequests(user.id);

  return (
    <div className="flex flex-col gap-6">
      {user.emailVerified ? null : (
        <Panel title="Confirma tu correo" description="Tu correo aún no está verificado. Algunas funciones de la cuenta requieren confirmarlo.">
          <ResendVerification knownEmail={user.email} />
        </Panel>
      )}

      <Panel title="Tus datos" id="datos">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Item label="Nombre" value={user.name} />
          <Item label="Correo" value={user.email} extra={user.emailVerified ? "Verificado" : "Sin verificar"} />
          <Item label="Empresa" value={user.company} />
          <Item label="RUC" value={user.ruc} />
          <Item label="Teléfono" value={user.phone} />
          <Item label="Tipo de cuenta" value={ROLE_LABELS[user.role]} />
        </dl>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/cuenta/perfil" className={`${BTN_SECONDARY} sm:w-auto`}>
            Editar perfil
          </Link>
          <Link href="/cuenta/seguridad" className={`${BTN_SECONDARY} sm:w-auto`}>
            Seguridad
          </Link>
        </div>
      </Panel>

      <Panel title="Mis solicitudes" id="solicitudes" description="Cotizaciones y consultas enviadas con esta cuenta.">
        {requests === null ? (
          <Alert tone="warning">No pudimos cargar tus solicitudes en este momento. Inténtalo nuevamente más tarde.</Alert>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="font-body-compact text-body-compact text-text-secondary">Aún no tienes solicitudes asociadas a esta cuenta.</p>
            <Link href="/cotizar" className={LINK}>
              Solicitar una cotización
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {requests.map((r) => (
              <li key={r.reference} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-ui-label text-ui-label text-on-surface">{r.reference}</p>
                  <p className="font-body-compact text-body-compact text-text-secondary">
                    {KIND_LABELS[r.kind] ?? r.kind} · {dateFormat.format(r.createdAt)}
                  </p>
                </div>
                <span className="rounded border border-border bg-surface px-2 py-0.5 font-ui-label text-ui-label text-on-surface-variant">{STATUS_LABELS[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Item({ label, value, extra }: { label: string; value?: string | null; extra?: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-ui-label text-ui-label text-text-muted">{label}</dt>
      <dd className="mt-0.5 break-words font-body-default text-body-default text-on-surface">
        {value ? value : <span className="text-text-muted">No indicado</span>}
        {extra ? <span className="ml-2 rounded border border-border bg-surface px-1.5 py-0.5 align-middle font-ui-label text-ui-label text-on-surface-variant">{extra}</span> : null}
      </dd>
    </div>
  );
}
