"use client";

import Link from "next/link";
import { CircleCheck, FileText, Printer } from "lucide-react";
import { PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { useLang } from "@/shared/layout/landing-prefs";
import { W24CopyButton, W24PrintButton } from "./islands/w24-actions";
import { translate } from "./w24-en";
import "@/modules/quote/hoja.css";

export type ConfirmationLead = { reference: string; dateLabel: string; typeLabel: string };

/**
 * Solo se dice "registrada" si el Backend confirmó el folio. Sin folio, o con un marcador de la etapa sin conexión, la
 * pantalla lo dice tal cual y ofrece volver a solicitar.
 */
export function ScreenW24({ lead, unavailable = false }: { lead: ConfirmationLead | null; unavailable?: boolean }) {
  const [lang] = useLang();
  const t = (es: string) => translate(lang, es);
  const pending = lead?.reference === PENDING_QUOTE_REFERENCE;
  const saved = lead !== null && !pending;

  const title = pending ? t("Solicitud pendiente de conexión") : saved ? t("Solicitud registrada") : unavailable ? t("No se pudo consultar la solicitud") : t("No hay una solicitud registrada");
  const text = pending
    ? t("Recibimos el formulario, pero el sistema de atención aún no está conectado: ninguna solicitud se guardó. Vuelve a enviarla cuando el servicio esté disponible.")
    : saved
      ? t("El sistema asignó este folio al guardar la solicitud. Ventas revisará tu requerimiento y te enviará la propuesta por correo; también te enviamos una constancia.")
      : unavailable
        ? t("El servicio de consulta no respondió. Inténtalo de nuevo más tarde.")
        : t("El folio no está disponible en este enlace. Revisa la dirección o inicia una solicitud.");
  const status = pending ? t("Solicitud no guardada") : saved ? t("Registro confirmado") : t("Consulta no disponible");

  return (
    <main lang={lang} className="hj">
      <div className="hj-shell">
        <nav aria-label={t("Migas de pan")} className="hj-migas">
          <ol>
            <li>
              <Link href="/">{t("Inicio")}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/cotizar">{t("Cotización")}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t("Confirmación")}</li>
          </ol>
        </nav>

        <div className="hj-grid">
          <div className="hj-col">
            <div className="hj-head">
              <div className="hj-estado" data-ok={saved || undefined}>
                {saved ? <CircleCheck aria-hidden="true" size={18} /> : <FileText aria-hidden="true" size={18} />}
                <span>{status}</span>
              </div>
              <h1 id="confirmation-title">{title}</h1>
              <p className="hj-lead">{text}</p>
            </div>

            {saved && (
              <section aria-labelledby="next-title" className="hj-seccion">
                <div className="cota">
                  <h2 id="next-title">{t("Siguiente paso")}</h2>
                </div>
                <ol className="hj-pasos-texto">
                  <li>{t("Guarda el folio para identificar el registro.")}</li>
                  <li>{t("Revisa tu correo: ahí llegarán la constancia y la propuesta.")}</li>
                </ol>
              </section>
            )}

            <div className="hj-botones">
              {saved ? (
                <>
                  <Link href="/productos" className="lp-btn lp-btn--solid">
                    {t("Volver al catálogo")}
                  </Link>
                  <W24PrintButton className="lp-btn lp-btn--outline">
                    <Printer aria-hidden="true" size={18} strokeWidth={1.8} />
                    {t("Imprimir confirmación")}
                  </W24PrintButton>
                </>
              ) : (
                <>
                  <Link href="/cotizar" className="lp-btn lp-btn--solid">
                    {t("Nueva solicitud")}
                  </Link>
                  <Link href="/productos" className="lp-btn lp-btn--outline">
                    {t("Volver al catálogo")}
                  </Link>
                </>
              )}
            </div>
          </div>

          <aside className="hj-aside">
            <section className="hj-cajetin" aria-label={t("Resumen de la solicitud")}>
              <h2 className="hj-cajetin__titulo on-dark">{t("Resumen de la solicitud")}</h2>
              <dl>
                <div className="hj-celda--full">
                  <dt>{t("Código de seguimiento")}</dt>
                  <dd>
                    <div className="hj-folio">
                      <span id="folio-code" data-code={saved || undefined}>{pending ? t("Sin folio") : saved ? lead.reference : t("Pendiente de consulta")}</span>
                      {saved && <W24CopyButton value={lead.reference} />}
                    </div>
                  </dd>
                </div>
                <div>
                  <dt>{t("Tipo")}</dt>
                  <dd>{lead ? t(lead.typeLabel) : t("Sin datos disponibles")}</dd>
                </div>
                <div>
                  <dt>{t("Fecha de registro")}</dt>
                  <dd>{lead ? t(lead.dateLabel) : t("Sin datos disponibles")}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
