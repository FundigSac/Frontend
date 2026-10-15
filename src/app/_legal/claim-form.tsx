"use client";

import { ArrowRight, CheckCircle2, Copy, Mail, MessageCircle, MessageSquareWarning, Megaphone, RotateCcw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { LeadSubmit, useLeadState } from "@/modules/leads/lead-form";
import { SITE } from "@/shared/config/site";
import { buildClaimMessage, mailtoUrl, whatsappUrl } from "./claim-message";
import { CLAIMS } from "./copy";
import { useCopy } from "./use-copy";

type Kind = "RECLAMO" | "QUEJA";
type Contact = { email: string; phone?: string; whatsappNumber: string };

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

/** Formato de cada documento de identidad (el número se valida en el navegador según el tipo elegido). */
const DOC_RULES: Record<string, { pattern: string; max: number; mode: "numeric" | "text" }> = {
  DNI: { pattern: "[0-9]{8}", max: 8, mode: "numeric" },
  RUC: { pattern: "[0-9]{11}", max: 11, mode: "numeric" },
  CE: { pattern: "[A-Za-z0-9]{6,12}", max: 12, mode: "text" },
  PASAPORTE: { pattern: "[A-Za-z0-9]{6,12}", max: 12, mode: "text" },
};

function Fields() {
  const t = useCopy(CLAIMS);
  const { status, reference, message } = useLeadState();
  const uid = useId();
  const [kind, setKind] = useState<Kind>("RECLAMO");
  const [docType, setDocType] = useState("");
  const [minor, setMinor] = useState(false);
  const [maxDate, setMaxDate] = useState<string | undefined>();
  const noun = (kind === "RECLAMO" ? t.kinds.reclamo.title : t.kinds.queja.title).toLowerCase();
  const f = t.fields;
  const doc = DOC_RULES[docType];
  const isClaim = kind === "RECLAMO";

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

  const submitLabel = isClaim ? t.submit.reclamo : t.submit.queja;

  return (
    <>
      <div className="lg-provider" role="group" aria-label={t.provider.title}>
        <p className="lg-provider__title">{t.provider.title}</p>
        <dl>
          <div><dt>{t.provider.name}</dt><dd>{SITE.registeredName}</dd></div>
          <div><dt>{t.provider.ruc}</dt><dd>{SITE.ruc}</dd></div>
          <div><dt>{t.provider.address}</dt><dd>{SITE.address}</dd></div>
          <div><dt>{t.provider.sheet}</dt><dd>{t.provider.sheetValue}</dd></div>
        </dl>
      </div>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">1</span> {t.legends[0]}</legend>
        <div className="lg-kind">
          <label>
            <input type="radio" name="tipoReclamacion" value="RECLAMO" checked={isClaim} onChange={() => setKind("RECLAMO")} />
            <Megaphone className="lg-kind__icon" aria-hidden="true" size={36} strokeWidth={1.5} />
            <strong>{t.kinds.reclamo.title}</strong>
            <small>{t.kinds.reclamo.text}</small>
            <span className="lg-kind__dot" aria-hidden="true" />
          </label>
          <label>
            <input type="radio" name="tipoReclamacion" value="QUEJA" checked={!isClaim} onChange={() => setKind("QUEJA")} />
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
            <select id={`${uid}-td`} name="tipoDeDocumento" required value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="" disabled>{f.docSelect}</option>
              {f.docs.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
          <Field id={`${uid}-nd`} label={f.docNumber[0]} required>
            <input
              id={`${uid}-nd`}
              name="numeroDeDocumento"
              required
              inputMode={doc?.mode ?? "text"}
              pattern={doc?.pattern}
              maxLength={doc?.max}
              title={doc ? f.docHints[docType as keyof typeof f.docHints] : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder={f.docNumber[1]}
            />
          </Field>
          <Field id={`${uid}-d`} label={f.address[0]} required>
            <input id={`${uid}-d`} name="domicilioLegalOHabitual" required autoComplete="street-address" placeholder={f.address[1]} />
          </Field>
          <Field id={`${uid}-t`} label={f.phone[0]} required>
            <input id={`${uid}-t`} name="telefonoDeContacto" type="tel" required pattern="[0-9+()\s\-]{7,20}" autoComplete="tel" placeholder={f.phone[1]} />
          </Field>
          <Field id={`${uid}-c`} label={f.email[0]} required>
            <input id={`${uid}-c`} name="correoElectronico" type="email" required autoComplete="email" spellCheck={false} placeholder={f.email[1]} />
          </Field>
        </div>
        <label className="lg-check lg-minor">
          <input type="checkbox" name="esMenorDeEdad" value="Sí" checked={minor} onChange={(e) => setMinor(e.target.checked)} /> {f.minor}
        </label>
        {minor && (
          <div className="lg-minor__fields" role="group" aria-label={f.minorHint}>
            <p className="lg-text" style={{ fontSize: 14.5 }}>{f.minorHint}</p>
            <div className="lg-grid2">
              <Field id={`${uid}-rn`} label={f.repName[0]} required>
                <input id={`${uid}-rn`} name="representanteNombre" required autoComplete="off" placeholder={f.repName[1]} />
              </Field>
              <Field id={`${uid}-rd`} label={f.repDoc[0]} required>
                <input id={`${uid}-rd`} name="representanteDocumento" required pattern="[A-Za-z0-9]{6,12}" title={f.docHints.CE} autoComplete="off" spellCheck={false} placeholder={f.repDoc[1]} />
              </Field>
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">3</span> {isClaim ? t.goodLegend.reclamo : t.goodLegend.queja}</legend>
        {isClaim ? (
          <>
            <div className="lg-field lg-field--full lg-field--inline" role="radiogroup" aria-label={f.goodType}>
              <span className="lg-label">{f.goodType} <em aria-hidden="true">*</em></span>
              <div className="lg-channels">
                {f.goodTypes.map((g, i) => (
                  <label className="lg-check" key={g.value}><input type="radio" name="tipoDeBien" value={g.value} defaultChecked={i === 0} required /> {g.label}</label>
                ))}
              </div>
            </div>
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
              <Field id={`${uid}-m`} label={f.amount[0]}>
                <input id={`${uid}-m`} name="montoReclamado" inputMode="decimal" pattern="[0-9]{1,9}([.,][0-9]{1,2})?" title={f.amountHint} autoComplete="off" placeholder={f.amount[1]} />
              </Field>
              <Field id={`${uid}-mo`} label={f.currency}>
                <select id={`${uid}-mo`} name="moneda" defaultValue="PEN">
                  {f.currencies.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field id={`${uid}-o`} label={f.order[0]} full>
                <input id={`${uid}-o`} name="nDeCotizacionO" autoComplete="off" spellCheck={false} placeholder={f.order[1]} />
              </Field>
            </div>
            <p className="lg-text lg-hint">{f.amountHint}</p>
          </>
        ) : (
          <div className="lg-grid2">
            <Field id={`${uid}-l`} label={f.place} required>
              <select id={`${uid}-l`} name="lugarDeAtencion" required defaultValue="">
                <option value="" disabled>{f.placeSelect}</option>
                {f.places.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field id={`${uid}-f`} label={f.date} required>
              <input id={`${uid}-f`} name="fechaDelSuceso" type="date" required max={maxDate} />
            </Field>
            <Field id={`${uid}-o`} label={f.order[0]} full>
              <input id={`${uid}-o`} name="nDeCotizacionO" autoComplete="off" spellCheck={false} placeholder={f.order[1]} />
            </Field>
          </div>
        )}
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">4</span> {isClaim ? t.detailLegend.reclamo : t.detailLegend.queja}</legend>
        <CountedArea id={`${uid}-h`} name="detalleDeLosHechos" label={f.facts[0]} placeholder={isClaim ? f.facts[1] : f.facts[2]} />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">5</span> {t.legends[4]}</legend>
        <CountedArea id={`${uid}-s`} name="pedidoConcretoOPretension" label={f.request[0]} placeholder={f.request[1]} />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">6</span> {t.legends[5]}</legend>
        <p className="lg-text" style={{ fontSize: 14.5 }}>{f.mediumHint}</p>
        <div className="lg-channels" role="radiogroup" aria-label={t.legends[5]}>
          {f.mediums.map((c, i) => (
            <label className="lg-check" key={c.value}><input type="radio" name="medioDeRespuesta" value={c.value} defaultChecked={i === 0} required /> {c.label}</label>
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

      <ul className="lg-notices">
        <li>{t.notices.deadline}</li>
        <li>{t.notices.copy}</li>
        <li>{t.notices.filing}</li>
        <li>{t.notices.indecopi}</li>
      </ul>

      {status === "error" && <p className="lg-alert" role="alert">{message}</p>}

      <div className="lg-form-actions">
        <button type="reset" className="lp-btn lp-btn--outline" onClick={() => { setKind("RECLAMO"); setDocType(""); setMinor(false); }}>
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

/**
 * Modo sin registro en línea (no hay base de datos configurada): el formulario se ve y valida igual, y al enviar
 * prepara el texto del reclamo para mandarlo por correo o WhatsApp. No se inventa ningún folio.
 */
function OfflineClaimForm({ email, whatsappNumber }: Omit<Contact, "phone">) {
  const t = useCopy(CLAIMS);
  const o = t.offline;
  const [prepared, setPrepared] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "");
    setPrepared(
      buildClaimMessage({
        tipoReclamacion: text("tipoReclamacion"),
        nombresYApellidosRazon: text("nombresYApellidosRazon"),
        tipoDeDocumento: text("tipoDeDocumento"),
        numeroDeDocumento: text("numeroDeDocumento"),
        correoElectronico: text("correoElectronico"),
        telefonoDeContacto: text("telefonoDeContacto"),
        domicilioLegalOHabitual: text("domicilioLegalOHabitual"),
        esMenorDeEdad: text("esMenorDeEdad"),
        representanteNombre: text("representanteNombre"),
        representanteDocumento: text("representanteDocumento"),
        tipoDeBien: text("tipoDeBien"),
        descripcionDelProductoO: text("descripcionDelProductoO"),
        montoReclamado: text("montoReclamado"),
        moneda: text("moneda"),
        lugarDeAtencion: text("lugarDeAtencion"),
        fechaDelSuceso: text("fechaDelSuceso"),
        nDeCotizacionO: text("nDeCotizacionO"),
        detalleDeLosHechos: text("detalleDeLosHechos"),
        pedidoConcretoOPretension: text("pedidoConcretoOPretension"),
        medioDeRespuesta: text("medioDeRespuesta"),
      }),
    );
    setCopied(false);
    window.requestAnimationFrame(() => document.getElementById("reclamo-listo")?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };

  const copy = async () => {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <form className="lg-form-card" id="reclamaciones-form" aria-label={t.formAria} onSubmit={onSubmit} hidden={prepared !== null}>
        <h2>{t.formTitle}</h2>
        <p>{t.formIntro}</p>
        <div style={{ marginTop: 22 }}>
          <Fields />
        </div>
      </form>

      {prepared && (
        <section className="lg-form-card lg-offline" id="reclamo-listo" aria-labelledby="reclamo-listo-title">
          <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
          <h2 id="reclamo-listo-title">{o.title}</h2>
          <p className="lg-text">{o.text}</p>
          <div className="lg-offline__actions">
            <a className="lp-btn lp-btn--solid" href={mailtoUrl(email, prepared.subject, prepared.body)}>
              <Mail aria-hidden="true" size={18} strokeWidth={1.8} /> {o.mail}
            </a>
            <a className="lp-btn lp-btn--outline" href={whatsappUrl(whatsappNumber, prepared.body)} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" size={18} strokeWidth={1.8} /> {o.whatsapp}
            </a>
            <button type="button" className="lp-btn lp-btn--outline" onClick={copy}>
              <Copy aria-hidden="true" size={18} strokeWidth={1.8} /> {copied ? o.copied : o.copy}
            </button>
          </div>
          <details className="lg-offline__preview">
            <summary>{o.preview}</summary>
            <pre>{prepared.body}</pre>
          </details>
          <p className="lg-offline__note">{o.note.replace("{email}", email)}</p>
          <button type="button" className="lg-link-btn" onClick={() => setPrepared(null)}>
            {o.edit}
          </button>
        </section>
      )}
    </>
  );
}

/** Formulario del libro de reclamaciones: no hay base de datos, así que prepara el envío por correo/WhatsApp. */
export function ClaimForm({ email, whatsappNumber }: Omit<Contact, "phone">) {
  return <OfflineClaimForm email={email} whatsappNumber={whatsappNumber} />;
}
