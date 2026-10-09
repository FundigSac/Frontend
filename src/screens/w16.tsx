import Link from "next/link";
import Image from "next/image";
import { LeadError, LeadForm, LeadSubmit } from "@/modules/leads/lead-form";

const inputClass = "min-h-11 w-full rounded-lg border border-border bg-surface-elevated px-3.5 py-2.5 font-body-default text-body-default text-on-surface outline-none transition-colors placeholder:text-text-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none";
const labelClass = "mb-1.5 block font-ui-label text-ui-label font-semibold text-on-surface-variant";
const requiredMark = <span aria-hidden="true" className="text-danger"> *</span>;

export function ScreenW16() {
  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <section aria-labelledby="quote-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <nav aria-label="Migas de pan" className="mb-8 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li aria-current="page" className="font-semibold text-on-surface">Cotización</li>
            </ol>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
          <div className="max-w-2xl">
            <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">
              Solicitud comercial
            </p>
            <h1 id="quote-title" className="mt-3 font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">
              Solicitar una cotización
            </h1>
            <p className="mt-5 max-w-2xl font-body-default text-body-default leading-relaxed text-text-secondary">
              Completa los datos de contacto y describe lo que necesitas. El equipo comercial revisará la solicitud y la información disponible.
            </p>
          </div>
          <figure className="relative m-0 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-surface">
            <Image src="/images/stitch/915091dd8b.jpg" alt="Detalle de válvula industrial, imagen referencial que no representa una cotización o producto específico." width={1408} height={768} sizes="(min-width: 1024px) 560px, 100vw" preload className="h-full w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 font-ui-label text-ui-label text-text-secondary">Imagen referencial</figcaption>
          </figure>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Familia de producto", "Medidas requeridas", "Cantidad o metrado", "Destino del proyecto"].map((item) => <div key={item} className="rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="block font-ui-label text-ui-label text-text-muted">Información solicitada</span><span className="mt-1 block font-body-compact text-body-compact font-semibold text-on-surface">{item}</span></div>)}
          </div>
        </div>
      </section>

      <section aria-label="Formulario de cotización" className="bg-background">
        <div className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <LeadForm formId="quote-general" className="space-y-5" id="cotizacionForm">
            <section aria-labelledby="company-project-title" className="rounded-xl border border-border bg-surface-elevated p-5 sm:p-7">
              <div className="mb-6">
                <h2 id="company-project-title" className="font-headline-card text-headline-card font-semibold text-on-surface">
                  Empresa y proyecto
                </h2>
                <p className="mt-1 font-body-compact text-body-compact text-text-secondary">
                  Los campos marcados con asterisco son obligatorios.
                </p>
              </div>

              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="razonSocial">Razón social{requiredMark}</label>
                  <input className={inputClass} id="razonSocial" name="razonSocial" type="text" autoComplete="organization" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="rucEmpresa">RUC de la empresa{requiredMark}</label>
                  <input className={inputClass} id="rucEmpresa" name="rucEmpresa" type="text" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} autoComplete="off" aria-describedby="ruc-help" required />
                  <p className="mt-1 text-xs leading-5 text-text-muted" id="ruc-help">Ingresa 11 dígitos.</p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="tipoProyecto">Tipo de proyecto{requiredMark}</label>
                  <select className={inputClass} id="tipoProyecto" name="tipoProyecto" defaultValue="" required>
                    <option disabled value="">Selecciona una opción</option>
                    <option value="saneamiento">Agua y saneamiento</option>
                    <option value="matrices">Redes y matrices</option>
                    <option value="alcantarillado">Alcantarillado y drenaje</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="departamentoDestino">Departamento de destino{requiredMark}</label>
                  <input className={inputClass} id="departamentoDestino" name="departamentoDestino" type="text" autoComplete="address-level1" placeholder="Departamento o lugar de entrega" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="nombreSolicitante">Nombre de contacto{requiredMark}</label>
                  <input className={inputClass} id="nombreSolicitante" name="nombreSolicitante" type="text" autoComplete="name" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="cargoSolicitante">Cargo{requiredMark}</label>
                  <input className={inputClass} id="cargoSolicitante" name="cargoSolicitante" type="text" autoComplete="organization-title" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="correoCorporativo">Correo electrónico{requiredMark}</label>
                  <input className={inputClass} id="correoCorporativo" name="correoCorporativo" type="email" autoComplete="email" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="celularContacto">Celular de contacto{requiredMark}</label>
                  <input className={inputClass} id="celularContacto" name="celularContacto" type="tel" autoComplete="tel" required />
                </div>
              </div>
            </section>

            <section aria-labelledby="request-title" className="rounded-xl border border-border bg-surface-elevated p-5 sm:p-7">
              <div className="mb-6">
                <h2 id="request-title" className="font-headline-card text-headline-card font-semibold text-on-surface">
                  Requerimiento
                </h2>
                <p className="mt-1 font-body-compact text-body-compact text-text-secondary">
                  Comparte el producto y las cantidades que deseas consultar.
                </p>
              </div>

              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="familiaPrincipal">Familia de producto{requiredMark}</label>
                  <select className={inputClass} id="familiaPrincipal" name="familiaPrincipal" defaultValue="" required>
                    <option disabled value="">Selecciona una familia</option>
                    <option value="valvulas">Válvulas</option>
                    <option value="tuberias">Tuberías</option>
                    <option value="marcos_tapas">Marcos y tapas</option>
                    <option value="mixto">Varias familias u otro producto</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="diametrosNominales">Diámetros o medidas requeridas{requiredMark}</label>
                  <input className={inputClass} id="diametrosNominales" name="diametrosNominales" type="text" placeholder="Indica las medidas o escribe ‘por definir’" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="cantidadMetrado">Cantidad o metrado aproximado{requiredMark}</label>
                  <input className={inputClass} id="cantidadMetrado" name="cantidadMetrado" type="text" placeholder="Indica cantidad y unidad" required />
                </div>
              </div>
            </section>

            <section aria-label="Consentimiento y envío" className="rounded-xl border border-border bg-surface-elevated p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-start gap-3">
                    <input className="mt-1 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" id="consentimiento" name="consentimiento" type="checkbox" required />
                    <label className="font-body-compact text-body-compact leading-relaxed text-text-secondary" htmlFor="consentimiento">
                      Acepto el tratamiento de los datos enviados para gestionar esta solicitud, conforme a la{" "}
                      <Link className="rounded-sm font-semibold text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/privacidad">
                        Política de privacidad
                      </Link>.{requiredMark}
                    </label>
                  </div>
                </div>
                <LeadSubmit
                  baseClassName="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none sm:w-auto"
                  idle="Enviar solicitud"
                  pending="Enviando solicitud…"
                />
              </div>
            </section>
            <LeadError />
          </LeadForm>
        </div>
      </section>
    </main>
  );
}
