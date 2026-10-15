"use client";

import Link from "next/link";
import Image from "next/image";
import type { Pair } from "@/app/_legal/copy";
import { useCopy } from "@/app/_legal/use-copy";
import { AnimatedDetails } from "@/shared/ui/animated-details";
import { LeadError, LeadForm, LeadReference, LeadSubmit, LeadWhen } from "@/modules/leads/lead-form";

export type ContactPrefill = { reason?: "documentacion" | "reunion"; document?: string };

const fieldClass = "min-h-12 w-full rounded-lg border border-border bg-surface-elevated px-3.5 py-3 text-[15px] text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const labelClass = "mb-1.5 block text-sm font-medium text-on-surface";

const COPY: Pair<{
  nav: string;
  home: string;
  contact: string;
  h1: string;
  lead: string;
  referenceImage: string;
  referenceAlt: string;
  dataAria: string;
  dataItems: string[];
  pendingValidation: string;
  notice: string;
  formTitle: string;
  requiredNote: string;
  fullName: string;
  company: string;
  corporateEmail: string;
  phone: string;
  reason: string;
  reasonPlaceholder: string;
  reasonOptions: { value: string; label: string }[];
  message: string;
  privacy: string;
  privacyLink: string;
  privacyEnd: string;
  reviewNote: string;
  submitIdle: string;
  submitPending: string;
  submitSuccess: string;
  successPrefix: string;
  channelsEyebrow: string;
  channelsTitle: string;
  channelsText: string;
  channels: string[];
  channelPending: string;
  channelImageAlt: string;
  faqEyebrow: string;
  faqTitle: string;
  faqLead: string;
  faqs: { q: string; a: string }[];
  faqNote: string;
  immediateTitle: string;
  immediateText: string;
  immediateCta: string;
}> = {
  es: {
    nav: "Ruta de navegación",
    home: "Inicio",
    contact: "Contacto",
    h1: "Envíanos tu consulta",
    lead: "Completa el formulario para compartir tu consulta o requerimiento.",
    referenceImage: "Imagen referencial",
    referenceAlt: "Detalle de inspección industrial, imagen referencial que no representa instalaciones de FUNDIGSAC.",
    dataAria: "Datos corporativos pendientes de confirmación",
    dataItems: ["Atención comercial", "Horario de atención", "Despacho y entrega", "Capacidad operativa"],
    pendingValidation: "Pendiente de validación",
    notice: "Los teléfonos, correos y demás canales oficiales están pendientes de validación. Usa este formulario para enviar tu consulta.",
    formTitle: "Datos de contacto",
    requiredNote: "Los campos con asterisco son obligatorios.",
    fullName: "Nombre completo",
    company: "Empresa",
    corporateEmail: "Correo electrónico",
    phone: "Teléfono o móvil",
    reason: "Motivo de contacto",
    reasonPlaceholder: "Selecciona una opción",
    reasonOptions: [
      { value: "consulta_tecnica", label: "Consulta de producto" },
      { value: "cotizacion_proyecto", label: "Cotización de proyecto" },
      { value: "documentacion", label: "Solicitud de documentación" },
      { value: "reunion", label: "Reunión" },
      { value: "asuntos_corporativos", label: "Otro asunto" },
    ],
    message: "Mensaje",
    privacy: "He leído y acepto la",
    privacyLink: "política de privacidad",
    privacyEnd: "y el tratamiento de mis datos para responder esta consulta.",
    reviewNote: "Revisa los datos ingresados antes de enviar.",
    submitIdle: "Enviar consulta",
    submitPending: "Enviando…",
    submitSuccess: "Consulta recibida",
    successPrefix: "Consulta recibida. Referencia:",
    channelsEyebrow: "Canales institucionales",
    channelsTitle: "Información de contacto pendiente de validación",
    channelsText: "Los datos oficiales se publicarán después de su confirmación. Por ahora, envía tu consulta mediante este formulario.",
    channels: ["Teléfono", "Correo institucional", "Dirección", "Horario de atención"],
    channelPending: "Pendiente",
    channelImageAlt: "Productos industriales en almacén, imagen referencial que no representa existencias ni instalaciones de FUNDIGSAC.",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Contratación, despacho y calidad",
    faqLead: "Las condiciones comerciales y operativas están pendientes de validación.",
    faqs: [
      { q: "¿Cuáles son los tiempos de entrega?", a: "Los plazos dependen de la solicitud y de la información comercial vigente. FUNDIGSAC debe confirmar disponibilidad, destino y condiciones antes de comunicar una fecha." },
      { q: "¿Qué documentación se puede solicitar?", a: "La relación de documentos disponibles, su vigencia y sus condiciones de entrega están pendientes de validación. Consulta mediante el formulario para recibir una respuesta confirmada." },
      { q: "¿Qué modalidades comerciales aplican?", a: "Los términos de cotización, pago y contratación deben confirmarse para cada requerimiento. Esta página no publica condiciones comerciales aprobadas." },
      { q: "¿Cómo solicito asistencia para una licitación?", a: "Comparte el alcance y la fecha requerida en el formulario. El tipo de asistencia, el canal de atención y la documentación posible se confirmarán al responder la consulta." },
    ],
    faqNote: "Respuesta sujeta a confirmación del equipo FUNDIGSAC.",
    immediateTitle: "¿Requieres asistencia técnica inmediata?",
    immediateText: "Disponibilidad y canales pendientes de validación. Envía una consulta mediante el formulario.",
    immediateCta: "Enviar consulta",
  },
  en: {
    nav: "Navigation path",
    home: "Home",
    contact: "Contact",
    h1: "Send us your enquiry",
    lead: "Fill in the form to share your enquiry or requirement.",
    referenceImage: "Reference image",
    referenceAlt: "Industrial inspection detail, reference image that does not represent FUNDIGSAC facilities.",
    dataAria: "Corporate details pending confirmation",
    dataItems: ["Sales support", "Business hours", "Dispatch and delivery", "Operating capacity"],
    pendingValidation: "Pending validation",
    notice: "Phone numbers, emails and other official channels are pending validation. Use this form to send your enquiry.",
    formTitle: "Contact details",
    requiredNote: "Fields marked with an asterisk are required.",
    fullName: "Full name",
    company: "Company",
    corporateEmail: "Email",
    phone: "Phone or mobile",
    reason: "Reason for contact",
    reasonPlaceholder: "Select an option",
    reasonOptions: [
      { value: "consulta_tecnica", label: "Product enquiry" },
      { value: "cotizacion_proyecto", label: "Project quotation" },
      { value: "documentacion", label: "Document request" },
      { value: "reunion", label: "Meeting" },
      { value: "asuntos_corporativos", label: "Other matter" },
    ],
    message: "Message",
    privacy: "I have read and accept the",
    privacyLink: "privacy policy",
    privacyEnd: "and the processing of my data to answer this enquiry.",
    reviewNote: "Review the data you entered before sending.",
    submitIdle: "Send enquiry",
    submitPending: "Sending…",
    submitSuccess: "Enquiry received",
    successPrefix: "Enquiry received. Reference:",
    channelsEyebrow: "Official channels",
    channelsTitle: "Contact information pending validation",
    channelsText: "Official details will be published once confirmed. For now, send your enquiry through this form.",
    channels: ["Phone", "Institutional email", "Address", "Business hours"],
    channelPending: "Pending",
    channelImageAlt: "Industrial products in a warehouse, reference image that does not represent FUNDIGSAC stock or facilities.",
    faqEyebrow: "Frequently asked questions",
    faqTitle: "Contracting, dispatch and quality",
    faqLead: "Commercial and operational terms are pending validation.",
    faqs: [
      { q: "What are the delivery times?", a: "Lead times depend on the request and current commercial information. FUNDIGSAC must confirm availability, destination and conditions before communicating a date." },
      { q: "Which documentation can I request?", a: "The list of available documents, their validity and delivery conditions are pending validation. Use the form to receive a confirmed answer." },
      { q: "Which commercial arrangements apply?", a: "Quotation, payment and contracting terms must be confirmed for each requirement. This page does not publish approved commercial conditions." },
      { q: "How do I request support for a tender?", a: "Share the scope and required date in the form. The type of support, the contact channel and possible documentation will be confirmed when we reply." },
    ],
    faqNote: "Answer subject to confirmation by the FUNDIGSAC team.",
    immediateTitle: "Do you need immediate technical support?",
    immediateText: "Availability and channels are pending validation. Send an enquiry through the form.",
    immediateCta: "Send enquiry",
  },
};

export function ScreenW15({ prefill = {} }: { prefill?: ContactPrefill }) {
  const t = useCopy(COPY);
  const defaultMessage = prefill.document ? `Solicito el documento: ${prefill.document}` : "";

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-24">
        <nav aria-label={t.nav} className="mb-7 text-[13px] text-text-secondary">
          <ol className="flex items-center gap-2">
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/">{t.home}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-on-surface">{t.contact}</li>
          </ol>
        </nav>

        <header className="mb-8 grid items-center gap-7 sm:mb-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
          <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">{t.contact}</p>
          <h1 className="mt-2 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-.035em] text-on-surface">
            {t.h1}
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary sm:text-[17px]">
            {t.lead}
          </p>
          </div>
          <figure className="relative m-0 aspect-[16/9] overflow-hidden rounded-[14px] border border-border bg-surface">
            <Image src="/images/stitch/4af35b56cc.jpg" alt={t.referenceAlt} width={1408} height={768} sizes="(min-width: 1024px) 560px, 100vw" className="h-full w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 text-xs font-medium text-text-secondary">{t.referenceImage}</figcaption>
          </figure>
        </header>

        <section aria-label={t.dataAria} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.dataItems.map((item) => <div key={item} className="rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="block font-ui-label text-ui-label text-text-muted">{item}</span><span className="mt-1 block font-body-compact text-body-compact font-semibold text-on-surface">{t.pendingValidation}</span></div>)}
        </section>

        <div className="rounded-[14px] border border-border bg-surface px-4 py-4 sm:px-5">
          <p className="text-sm leading-6 text-text-secondary">
            {t.notice}
          </p>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[.78fr_1.22fr] lg:gap-8">
        <section aria-labelledby="contact-form-title" className="rounded-[14px] border border-border bg-surface-elevated p-4 sm:p-7 lg:col-start-2 lg:row-start-1 lg:p-8">
          <div className="mb-6 border-b border-border pb-5">
            <h2 id="contact-form-title" className="text-xl font-semibold tracking-[-.02em] text-on-surface sm:text-2xl">
              {t.formTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{t.requiredNote}</p>
          </div>

          <LeadForm formId="contact" key={`${prefill.reason ?? ""}|${prefill.document ?? ""}`} id="b2bContactForm" className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="fullName">{t.fullName} <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="fullName" name="fullName" autoComplete="name" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="companyName">{t.company} <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="companyName" name="companyName" autoComplete="organization" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="rucNumber">RUC <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="rucNumber" name="rucNumber" autoComplete="off" inputMode="numeric" maxLength={11} pattern="[0-9]{11}" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="corporateEmail">{t.corporateEmail} <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="corporateEmail" name="corporateEmail" autoComplete="email" required type="email" />
              </div>
              <div>
                <label className={labelClass} htmlFor="phoneMobile">{t.phone} <span aria-hidden="true" className="text-danger">*</span></label>
                <input className={fieldClass} id="phoneMobile" name="phoneMobile" autoComplete="tel" required type="tel" />
              </div>
              <div>
                <label className={labelClass} htmlFor="contactReason">{t.reason} <span aria-hidden="true" className="text-danger">*</span></label>
                <select className={fieldClass} id="contactReason" name="contactReason" required defaultValue={prefill.reason ?? ""}>
                  <option disabled value="">{t.reasonPlaceholder}</option>
                  {t.reasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="technicalMessage">{t.message} <span aria-hidden="true" className="text-danger">*</span></label>
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
                {t.privacy} <Link className="rounded-sm font-medium text-primary underline underline-offset-2 hover:text-primary-container focus-visible:outline-2 focus-visible:outline-focus" href="/privacidad" target="_blank" rel="noreferrer">{t.privacyLink}</Link> {t.privacyEnd} <span aria-hidden="true" className="text-danger">*</span>
              </label>
            </div>

            <div className="flex flex-col items-start gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-text-muted">{t.reviewNote}</p>
              <LeadSubmit
                id="submitBtn"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-on-primary shadow-sm transition-colors duration-200 hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
                idle={t.submitIdle}
                pending={t.submitPending}
                success={t.submitSuccess}
              />
            </div>

            <LeadWhen status="success">
              <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm leading-6 text-success" id="formSuccessMessage" role="status">
                {t.successPrefix} <LeadReference className="font-semibold" />.
              </p>
            </LeadWhen>
            <LeadError />
          </LeadForm>
        </section>
        <section aria-labelledby="contact-channels-title" className="rounded-[14px] border border-border bg-surface p-4 sm:p-6 lg:col-start-1 lg:row-start-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">{t.channelsEyebrow}</p>
            <h2 id="contact-channels-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">{t.channelsTitle}</h2>
            <p className="mt-3 max-w-[58ch] font-body-default text-body-default leading-relaxed text-text-secondary">{t.channelsText}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {t.channels.map((channel) => <div key={channel} className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="font-body-compact text-body-compact font-semibold text-on-surface">{channel}</span><span className="font-ui-label text-ui-label text-text-muted">{t.channelPending}</span></div>)}
            </div>
          </div>
          <div>
            <figure className="relative m-0 aspect-[16/8] overflow-hidden rounded-xl border border-border bg-surface"><Image src="/images/stitch/91e2e81259.jpg" alt={t.channelImageAlt} width={1408} height={768} sizes="(min-width: 1024px) 640px, 100vw" className="h-full w-full object-cover"/><figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 font-ui-label text-ui-label text-text-secondary">{t.referenceImage}</figcaption></figure>
          </div>
        </section>
        </div>
        <section aria-labelledby="contact-faq-title" className="mt-12 bg-surface py-8 sm:mt-14 sm:py-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-3xl text-center"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">{t.faqEyebrow}</p><h2 id="contact-faq-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">{t.faqTitle}</h2><p className="mt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">{t.faqLead}</p></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">{t.faqs.map((item) => <AnimatedDetails key={item.q} className="group rounded-xl border border-border bg-surface-elevated p-5"><summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-3 font-headline-card text-headline-card font-semibold text-on-surface focus-visible:outline-2 focus-visible:outline-focus">{item.q}<span aria-hidden="true" className="shrink-0 text-primary transition-transform group-open:rotate-45 group-data-[state=closing]:rotate-0">+</span></summary><p className="mt-3 border-t border-border pt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.a}</p><p className="mt-3 font-ui-label text-ui-label font-semibold text-text-muted">{t.faqNote}</p></AnimatedDetails>)}</div>
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-body-compact text-body-compact font-semibold text-on-surface">{t.immediateTitle}</h3><p className="mt-1 font-body-compact text-body-compact text-text-secondary">{t.immediateText}</p></div><Link href="#b2bContactForm" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 font-button-text text-button-text font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t.immediateCta}</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}
