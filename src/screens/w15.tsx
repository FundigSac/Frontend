import Link from "next/link";
import Image from "next/image";
import { LeadError, LeadForm, LeadReference, LeadSubmit, LeadWhen } from "@/modules/leads/lead-form";

export type ContactPrefill = { reason?: "documentacion" | "reunion"; document?: string };

const fieldClass = "min-h-12 w-full rounded-lg border border-border bg-surface-elevated px-3.5 py-3 text-[15px] text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const labelClass = "mb-1.5 block text-sm font-medium text-on-surface";

export function ScreenW15({ prefill = {} }: { prefill?: ContactPrefill }) {
  const defaultMessage = prefill.document ? `Solicito el documento: ${prefill.document}` : "";

  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-24">
        <nav aria-label="Ruta de navegación" className="mb-7 text-[13px] text-text-secondary">
          <ol className="flex items-center gap-2">
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-on-surface">Contacto</li>
          </ol>
        </nav>

        <header className="mb-8 grid items-center gap-7 sm:mb-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
          <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">Contacto</p>
          <h1 className="mt-2 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-.035em] text-on-surface">
            Envíanos tu consulta
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary sm:text-[17px]">
            Completa el formulario para compartir tu consulta o requerimiento.
          </p>
          </div>
          <figure className="relative m-0 aspect-[16/9] overflow-hidden rounded-[14px] border border-border bg-surface">
            <Image src="/images/stitch/4af35b56cc.jpg" alt="Detalle de inspección industrial, imagen referencial que no representa instalaciones de FUNDIGSAC." width={1408} height={768} sizes="(min-width: 1024px) 560px, 100vw" className="h-full w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 text-xs font-medium text-text-secondary">Imagen referencial</figcaption>
          </figure>
        </header>

        <section aria-label="Datos corporativos pendientes de confirmación" className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Atención comercial", "Horario de atención", "Despacho y entrega", "Capacidad operativa"].map((item) => <div key={item} className="rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="block font-ui-label text-ui-label text-text-muted">{item}</span><span className="mt-1 block font-body-compact text-body-compact font-semibold text-on-surface">Pendiente de validación</span></div>)}
        </section>

        <div className="rounded-[14px] border border-border bg-surface px-4 py-4 sm:px-5">
          <p className="text-sm leading-6 text-text-secondary">
            Los teléfonos, correos y demás canales oficiales están pendientes de validación. Usa este formulario para enviar tu consulta.
          </p>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[.78fr_1.22fr] lg:gap-8">
        <section aria-labelledby="contact-form-title" className="rounded-[14px] border border-border bg-surface-elevated p-4 sm:p-7 lg:col-start-2 lg:row-start-1 lg:p-8">
          <div className="mb-6 border-b border-border pb-5">
            <h2 id="contact-form-title" className="text-xl font-semibold tracking-[-.02em] text-on-surface sm:text-2xl">
              Datos de contacto
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Los campos con asterisco son obligatorios.</p>
          </div>

          <LeadForm formId="contact" key={`${prefill.reason ?? ""}|${prefill.document ?? ""}`} id="b2bContactForm" className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="fullName">Nombre completo <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="fullName" name="fullName" autoComplete="name" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="companyName">Empresa <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="companyName" name="companyName" autoComplete="organization" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="rucNumber">RUC <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="rucNumber" name="rucNumber" autoComplete="off" inputMode="numeric" maxLength={11} pattern="[0-9]{11}" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="corporateEmail">Correo electrónico <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="corporateEmail" name="corporateEmail" autoComplete="email" required type="email" />
              </div>
              <div>
                <label className={labelClass} htmlFor="phoneMobile">Teléfono o móvil <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="phoneMobile" name="phoneMobile" autoComplete="tel" required type="tel" />
              </div>
              <div>
                <label className={labelClass} htmlFor="contactReason">Motivo de contacto <span aria-hidden="true" className="text-danger">*</span></label>
                <select className={fieldClass} id="contactReason" name="contactReason" required defaultValue={prefill.reason ?? ""}>
                  <option disabled value="">Selecciona una opción</option>
                  <option value="consulta_tecnica">Consulta de producto</option>
                  <option value="cotizacion_proyecto">Cotización de proyecto</option>
                  <option value="documentacion">Solicitud de documentación</option>
                  <option value="reunion">Reunión</option>
                  <option value="asuntos_corporativos">Otro asunto</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="technicalMessage">Mensaje <span aria-hidden="true" className="text-danger">*</span></label>
              <textarea
                className={`${fieldClass} min-h-36 resize-y`}
                id="technicalMessage"
                name="technicalMessage"
                rows={5}
                required
                defaultValue={defaultMessage}
              />
            </div>

            <div className="flex items-start gap-3 border-t border-border pt-5">
              <input className="mt-1 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" id="privacyConsent" name="privacyConsent" required type="checkbox" />
              <label className="text-sm leading-6 text-text-secondary" htmlFor="privacyConsent">
                He leído y acepto la <Link className="rounded-sm font-medium text-primary underline underline-offset-2 hover:text-primary-container focus-visible:outline-2 focus-visible:outline-focus" href="/privacidad" target="_blank" rel="noreferrer">política de privacidad</Link> y el tratamiento de mis datos para responder esta consulta. <span aria-hidden="true" className="text-danger">*</span>
              </label>
            </div>

            <div className="flex flex-col items-start gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-text-muted">Revisa los datos ingresados antes de enviar.</p>
              <LeadSubmit
                id="submitBtn"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-on-primary shadow-sm transition-colors duration-200 hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
                idle="Enviar consulta"
                pending="Enviando…"
                success="Consulta recibida"
              />
            </div>

            <LeadWhen status="success">
              <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm leading-6 text-success" id="formSuccessMessage" role="status">
                Consulta recibida. Referencia: <LeadReference className="font-semibold" />.
              </p>
            </LeadWhen>
            <LeadError />
          </LeadForm>
        </section>
        <section aria-labelledby="contact-channels-title" className="rounded-[14px] border border-border bg-surface p-4 sm:p-6 lg:col-start-1 lg:row-start-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">Canales institucionales</p>
            <h2 id="contact-channels-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Información de contacto pendiente de validación</h2>
            <p className="mt-3 max-w-[58ch] font-body-default text-body-default leading-relaxed text-text-secondary">Los datos oficiales se publicarán después de su confirmación. Por ahora, envía tu consulta mediante este formulario.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Teléfono", "Correo institucional", "Dirección", "Horario de atención"].map((channel) => <div key={channel} className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="font-body-compact text-body-compact font-semibold text-on-surface">{channel}</span><span className="font-ui-label text-ui-label text-text-muted">Pendiente</span></div>)}
            </div>
          </div>
          <div>
            <figure className="relative m-0 aspect-[16/8] overflow-hidden rounded-xl border border-border bg-surface"><Image src="/images/stitch/91e2e81259.jpg" alt="Productos industriales en almacén, imagen referencial que no representa existencias ni instalaciones de FUNDIGSAC." width={1408} height={768} sizes="(min-width: 1024px) 640px, 100vw" className="h-full w-full object-cover"/><figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 font-ui-label text-ui-label text-text-secondary">Imagen referencial</figcaption></figure>
          </div>
        </section>
        </div>
        <section aria-labelledby="contact-faq-title" className="mt-12 bg-surface py-8 sm:mt-14 sm:py-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-3xl text-center"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Preguntas frecuentes</p><h2 id="contact-faq-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Contratación, despacho y calidad</h2><p className="mt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">Las condiciones comerciales y operativas están pendientes de validación.</p></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">{[
              { q: "¿Cuáles son los tiempos de entrega?", a: "Los plazos dependen de la solicitud y de la información comercial vigente. FUNDIGSAC debe confirmar disponibilidad, destino y condiciones antes de comunicar una fecha." },
              { q: "¿Qué documentación se puede solicitar?", a: "La relación de documentos disponibles, su vigencia y sus condiciones de entrega están pendientes de validación. Consulta mediante el formulario para recibir una respuesta confirmada." },
              { q: "¿Qué modalidades comerciales aplican?", a: "Los términos de cotización, pago y contratación deben confirmarse para cada requerimiento. Esta página no publica condiciones comerciales aprobadas." },
              { q: "¿Cómo solicito asistencia para una licitación?", a: "Comparte el alcance y la fecha requerida en el formulario. El tipo de asistencia, el canal de atención y la documentación posible se confirmarán al responder la consulta." },
            ].map((item) => <details key={item.q} className="group rounded-xl border border-border bg-surface-elevated p-5"><summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-3 font-headline-card text-headline-card font-semibold text-on-surface focus-visible:outline-2 focus-visible:outline-focus">{item.q}<span aria-hidden="true" className="shrink-0 text-primary transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 border-t border-border pt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.a}</p><p className="mt-3 font-ui-label text-ui-label font-semibold text-text-muted">Respuesta sujeta a confirmación del equipo FUNDIGSAC.</p></details>)}</div>
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-body-compact text-body-compact font-semibold text-on-surface">¿Requieres asistencia técnica inmediata?</h3><p className="mt-1 font-body-compact text-body-compact text-text-secondary">Disponibilidad y canales pendientes de validación. Envía una consulta mediante el formulario.</p></div><Link href="#b2bContactForm" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 font-button-text text-button-text font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Enviar consulta</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}
