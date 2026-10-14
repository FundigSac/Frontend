"use client";

import { ArrowRight, CheckCircle2, Mail, MessageCircle, MessageSquareWarning, Megaphone, Phone, RotateCcw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { LeadForm, LeadSubmit, useLeadState } from "@/modules/leads/lead-form";
import { CLAIMS } from "./copy";
import { useCopy } from "./use-copy";

type Kind = "RECLAMO" | "QUEJA";
type Contact = { email: string; phone: string; whatsappNumber: string };

function Field({ id, label, required, full, children }: { id: string; label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`lg-field${full ? " lg-field--full" : ""}`}>
      <label htmlFor={id}>
        {label} {required && <em aria-hidden="true">*</em>}
      </label>
      {children}
    </div>
  );
}

function CountedArea({ id, name, label, placeholder }: { id: string; name: string; label: string; placeholder: string }) {
  const [length, setLength] = useState(0);
  return (
    <Field id={id} label={label} required full>
      <textarea id={id} name={name} required maxLength={1000} rows={4} placeholder={placeholder} onChange={(e) => setLength(e.target.value.length)} onReset={() => setLength(0)} />
      <span className="lg-count" aria-hidden="true">{length} / 1000</span>
    </Field>
  );
}

function Fields() {
  const t = useCopy(CLAIMS);
  const { status, reference, message } = useLeadState();
  const uid = useId();
  const [kind, setKind] = useState<Kind>("RECLAMO");
  const [maxDate, setMaxDate] = useState<string | undefined>();
  const noun = (kind === "RECLAMO" ? t.kinds.reclamo.title : t.kinds.queja.title).toLowerCase();
  const f = t.fields;

  // La fecha máxima es "hoy" en el equipo de la persona; se calcula tras hidratar para no desfasar servidor y cliente.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const d = new Date();
      setMaxDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (status === "success") {
    return (
      <div className="lg-success" role="status">
        <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
        <h2>{t.success.title.replace("{kind}", noun)}</h2>
        <p className="lg-text">{t.success.text}</p>
        {reference && <code>{reference}</code>}
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => window.location.reload()}>
          {t.success.again}
        </button>
      </div>
    );
  }

  const submitLabel = kind === "RECLAMO" ? t.submit.reclamo : t.submit.queja;

  return (
    <>
      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">1</span> {t.legends[0]}</legend>
        <div className="lg-kind">
          <label>
            <input type="radio" name="tipoReclamacion" value="RECLAMO" checked={kind === "RECLAMO"} onChange={() => setKind("RECLAMO")} />
            <Megaphone className="lg-kind__icon" aria-hidden="true" size={36} strokeWidth={1.5} />
            <strong>{t.kinds.reclamo.title}</strong>
            <small>{t.kinds.reclamo.text}</small>
            <span className="lg-kind__dot" aria-hidden="true" />
          </label>
          <label>
            <input type="radio" name="tipoReclamacion" value="QUEJA" checked={kind === "QUEJA"} onChange={() => setKind("QUEJA")} />
            <MessageSquareWarning className="lg-kind__icon" aria-hidden="true" size={36} strokeWidth={1.5} />
            <strong>{t.kinds.queja.title}</strong>
            <small>{t.kinds.queja.text}</small>
            <span className="lg-kind__dot" aria-hidden="true" />
          </label>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">2</span> {t.legends[1]}</legend>
        <div className="lg-grid2">
          <Field id={`${uid}-n`} label={f.name[0]} required>
            <input id={`${uid}-n`} name="nombresYApellidosRazon" required autoComplete="name" placeholder={f.name[1]} />
          </Field>
          <Field id={`${uid}-td`} label={f.docType} required>
            <select id={`${uid}-td`} name="tipoDeDocumento" required defaultValue="">
              <option value="" disabled>{f.docSelect}</option>
              {f.docs.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
          <Field id={`${uid}-nd`} label={f.docNumber[0]} required>
            <input id={`${uid}-nd`} name="numeroDeDocumento" required inputMode="numeric" autoComplete="off" spellCheck={false} placeholder={f.docNumber[1]} />
          </Field>
          <Field id={`${uid}-c`} label={f.email[0]} required>
            <input id={`${uid}-c`} name="correoElectronico" type="email" required autoComplete="email" spellCheck={false} placeholder={f.email[1]} />
          </Field>
          <Field id={`${uid}-t`} label={f.phone[0]} required>
            <input id={`${uid}-t`} name="telefonoDeContacto" type="tel" required autoComplete="tel" placeholder={f.phone[1]} />
          </Field>
          <Field id={`${uid}-d`} label={f.address[0]} required>
            <input id={`${uid}-d`} name="domicilioLegalOHabitual" required autoComplete="street-address" placeholder={f.address[1]} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">3</span> {t.legends[2]}</legend>
        <div className="lg-grid2">
          <Field id={`${uid}-p`} label={f.product} required>
            <select id={`${uid}-p`} name="descripcionDelProductoO" required defaultValue="">
              <option value="" disabled>{f.productSelect}</option>
              {f.products.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field id={`${uid}-f`} label={f.date} required>
            <input id={`${uid}-f`} name="fechaDelSuceso" type="date" required max={maxDate} />
          </Field>
          <Field id={`${uid}-o`} label={f.order[0]} full>
            <input id={`${uid}-o`} name="nDeCotizacionO" autoComplete="off" spellCheck={false} placeholder={f.order[1]} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">4</span> {kind === "RECLAMO" ? t.detailLegend.reclamo : t.detailLegend.queja}</legend>
        <CountedArea id={`${uid}-h`} name="detalleDeLosHechos" label={f.facts[0]} placeholder={kind === "RECLAMO" ? f.facts[1] : f.facts[2]} />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">5</span> {t.legends[4]}</legend>
        <CountedArea id={`${uid}-s`} name="pedidoConcretoOPretension" label={f.request[0]} placeholder={f.request[1]} />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">6</span> {t.legends[5]}</legend>
        <p className="lg-text" style={{ fontSize: 14.5 }}>{f.channelsHint}</p>
        <div className="lg-channels">
          {f.channels.map((c, i) => (
            <label className="lg-check" key={c.value}><input type="checkbox" name="canalesDeRespuesta" value={c.value} defaultChecked={i === 0} /> {c.label}</label>
          ))}
        </div>
      </fieldset>

      <label className="lg-consent">
        <input type="checkbox" name="consentimientoLeyN29733" value="Sí" required />
        <span>
          {t.consent.pre.replace("{kind}", noun)}
          <a className="lg-link-inline" href="/privacidad" target="_blank" rel="noopener noreferrer">{t.consent.link}</a>.
        </span>
      </label>

      {status === "error" && <p className="lg-alert" role="alert">{message}</p>}

      <div className="lg-form-actions">
        <button type="reset" className="lp-btn lp-btn--outline" onClick={() => setKind("RECLAMO")}>
          {t.clear} <RotateCcw aria-hidden="true" size={16} strokeWidth={2} />
        </button>
        <LeadSubmit
          className="lp-btn lp-btn--solid lp-btn--lg"
          idle={<>{submitLabel} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} /></>}
          pending={t.sending}
        />
      </div>
    </>
  );
}

/** Formulario del libro de reclamaciones: valida en el cliente y en el servidor, y entrega un folio real. */
export function ClaimForm({ enabled = true, email, phone, whatsappNumber }: { enabled?: boolean } & Contact) {
  const t = useCopy(CLAIMS);

  if (!enabled) {
    const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t.side.help.whatsappMsg)}`;
    const fb = t.fallback;
    return (
      <div className="lg-form-card">
        <h2>{fb.title}</h2>
        <p>{fb.text}</p>
        <ul className="lg-help" style={{ marginTop: 22 }}>
          <li><a href={`mailto:${email}?subject=${encodeURIComponent(fb.mailSubject)}`}><Mail aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>{fb.mail}</strong><span>{email}</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
          <li><a href={`tel:${phone.replace(/\s/g, "")}`}><Phone aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>{fb.phone}</strong><span>{phone}</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
          <li><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>{fb.whatsapp}</strong><span>{fb.whatsappText}</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
        </ul>
      </div>
    );
  }

  return (
    <LeadForm formId="claim" className="lg-form-card" id="reclamaciones-form" aria-label={t.formAria}>
      <h2>{t.formTitle}</h2>
      <p>{t.formIntro}</p>
      <div style={{ marginTop: 22 }}>
        <Fields />
      </div>
    </LeadForm>
  );
}
