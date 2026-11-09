"use client";

import { ArrowRight, CheckCircle2, Copy, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { newIdempotencyKey, submitForm } from "@/modules/backend/client";
import { PRIVACY_NOTICE_VERSION } from "@/modules/backend/legal";
import { useLang } from "@/shared/layout/landing-prefs";
import { SITE } from "@/shared/config/site";
import { buildClaimMessage, mailtoUrl, whatsappUrl } from "./claim-message";
import { complaintBody, formatDueDate } from "./claim-request";
import { CLAIMS } from "./copy";
import { CheckField, ErrorSummary, ErrorsProvider, Field, SubmitButton, useFormErrors } from "./form-kit";
import { SHEET_UI } from "./sheet-copy";
import { useCopy } from "./use-copy";
import "./forms.css";

type Kind = "RECLAMO" | "QUEJA";
type Contact = { email: string; whatsappNumber: string };

function CountedArea({ id, name, label, placeholder, minLength }: { id: string; name: string; label: string; placeholder: string; minLength?: number }) {
  const [length, setLength] = useState(0);
  return (
    <Field id={id} label={label} required full counter={<span className="ls-count" aria-hidden="true">{length} / 1000</span>}>
      <textarea id={id} name={name} required minLength={minLength} maxLength={1000} rows={5} placeholder={placeholder} onChange={(e) => setLength(e.target.value.length)} />
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

function Fields({ kind, onKind, onMedium, forget }: { kind: Kind; onKind: (kind: Kind) => void; onMedium: (medium: string) => void; forget: (ids: readonly string[]) => void }) {
  const t = useCopy(CLAIMS);
  const ui = useCopy(SHEET_UI);
  const uid = useId();
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

  return (
    <>
      <div className="lg-provider" role="group" aria-label={t.provider.title}>
        <strong className="lg-provider__title">{t.provider.title}</strong>
        <dl>
          <div><dt>{t.provider.name}</dt><dd>{SITE.registeredName}</dd></div>
          <div><dt>{t.provider.ruc}</dt><dd>{SITE.ruc}</dd></div>
          <div><dt>{t.provider.address}</dt><dd>{SITE.address}</dd></div>
          <div><dt>{t.provider.sheet}</dt><dd>{t.provider.sheetValue}</dd></div>
        </dl>
      </div>

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">1</span> {t.legends[0]}</legend>
        <div className="ls-kind">
          <label>
            <input type="radio" name="tipoReclamacion" value="RECLAMO" checked={isClaim} onChange={() => onKind("RECLAMO")} />
            <strong>{t.kinds.reclamo.title}</strong>
            <small>{t.kinds.reclamo.text}</small>
          </label>
          <label>
            <input type="radio" name="tipoReclamacion" value="QUEJA" checked={!isClaim} onChange={() => onKind("QUEJA")} />
            <strong>{t.kinds.queja.title}</strong>
            <small>{t.kinds.queja.text}</small>
          </label>
        </div>
      </fieldset>

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">2</span> {t.legends[1]}</legend>
        <div className="ls-grid2">
          <Field id={`${uid}-n`} label={f.name[0]} required full>
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
          <Field id={`${uid}-d`} label={f.address[0]} required full>
            <input id={`${uid}-d`} name="domicilioLegalOHabitual" required autoComplete="street-address" placeholder={f.address[1]} />
          </Field>
          <Field id={`${uid}-t`} label={f.phone[0]} required>
            <input id={`${uid}-t`} name="telefonoDeContacto" type="tel" required pattern="[0-9+\s\(\)\-]{7,20}" title={ui.errors.phone} autoComplete="tel" placeholder={f.phone[1]} />
          </Field>
          <Field id={`${uid}-c`} label={f.email[0]} required>
            <input id={`${uid}-c`} name="correoElectronico" type="email" required autoComplete="email" spellCheck={false} placeholder={f.email[1]} />
          </Field>
        </div>
        <label className="ls-check ls-minor">
          <input
            type="checkbox"
            name="esMenorDeEdad"
            value="Sí"
            checked={minor}
            onChange={(e) => {
              setMinor(e.target.checked);
              if (!e.target.checked) forget([`${uid}-rn`, `${uid}-rd`]);
            }}
          />{" "}
          {f.minor}
        </label>
        {minor && (
          <div className="ls-minor__fields mo-pop" role="group" aria-label={f.minorHint}>
            <p>{f.minorHint}</p>
            <div className="ls-grid2">
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

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">3</span> {isClaim ? t.goodLegend.reclamo : t.goodLegend.queja}</legend>
        {isClaim ? (
          <>
            <div className="ls-field ls-field--inline" role="radiogroup" aria-label={f.goodType}>
              <span className="ls-label">{f.goodType} <span aria-hidden="true">*</span></span>
              <div className="ls-channels">
                {f.goodTypes.map((g, i) => (
                  <label className="ls-check" key={g.value}><input type="radio" name="tipoDeBien" value={g.value} defaultChecked={i === 0} required /> {g.label}</label>
                ))}
              </div>
            </div>
            <div className="ls-grid2">
              <Field id={`${uid}-p`} label={f.product} required>
                <select id={`${uid}-p`} name="descripcionDelProductoO" required defaultValue="">
                  <option value="" disabled>{f.productSelect}</option>
                  {f.products.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              <Field id={`${uid}-f`} label={f.date} required>
                <input id={`${uid}-f`} name="fechaDelSuceso" type="date" required max={maxDate} />
              </Field>
              <Field id={`${uid}-m`} label={f.amount[0]} hint={f.amountHint}>
                <input id={`${uid}-m`} name="montoReclamado" inputMode="decimal" pattern="[0-9]{1,9}([.,][0-9]{1,2})?" title={ui.errors.amount} autoComplete="off" placeholder={f.amount[1]} />
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
          </>
        ) : (
          <div className="ls-grid2">
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

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">4</span> {isClaim ? t.detailLegend.reclamo : t.detailLegend.queja}</legend>
        <CountedArea id={`${uid}-h`} name="detalleDeLosHechos" label={f.facts[0]} placeholder={isClaim ? f.facts[1] : f.facts[2]} minLength={20} />
      </fieldset>

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">5</span> {t.legends[4]}</legend>
        <CountedArea id={`${uid}-s`} name="pedidoConcretoOPretension" label={f.request[0]} placeholder={f.request[1]} minLength={5} />
      </fieldset>

      <fieldset className="ls-fieldset">
        <legend><span aria-hidden="true">6</span> {t.legends[5]}</legend>
        <span className="ls-hint">{f.mediumHint}</span>
        <div className="ls-channels" role="radiogroup" aria-label={t.legends[5]}>
          {f.mediums.map((c, i) => (
            <label className="ls-check" key={c.value}><input type="radio" name="medioDeRespuesta" value={c.value} defaultChecked={i === 0} required onChange={() => onMedium(c.value)} /> {c.label}</label>
          ))}
        </div>
      </fieldset>

      <CheckField id={`${uid}-consent`} name="consentimientoLeyN29733" value="Sí" errorLabel={ui.errors.consent}>
        {t.consent.pre.replace("{kind}", noun)}
        <a className="ls-link" href="/privacidad" target="_blank" rel="noopener noreferrer">{t.consent.link}</a>.
      </CheckField>

      <ul className="lg-notices">
        <li>{t.notices.deadline}</li>
        <li>{t.notices.copy}</li>
        <li>{t.notices.filing}</li>
        <li>{t.notices.indecopi}</li>
      </ul>
    </>
  );
}

/**
 * Hoja de reclamación: registra en el Backend con número correlativo y plazo legal; sin Backend prepara el texto para
 * enviarlo por correo o WhatsApp. Nunca se inventa un número de hoja.
 */
export function ClaimForm({ email, whatsappNumber, summary }: Contact & { summary: (state: { kind: Kind; medium: string }) => React.ReactNode }) {
  const t = useCopy(CLAIMS);
  const ui = useCopy(SHEET_UI);
  const o = t.offline;
  const [lang] = useLang();
  const firstMedium = t.fields.mediums[0].value;
  const [kind, setKind] = useState<Kind>("RECLAMO");
  const [medium, setMedium] = useState(firstMedium);
  const [resetKey, setResetKey] = useState(0);
  const [prepared, setPrepared] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<{ folio: string; kind: string; responseDueOn: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const idempotencyKey = useRef(newIdempotencyKey());
  const fx = useFormErrors(ui.errors);

  const reveal = (id: string) => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center", behavior }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    if (!fx.validate(form)) return;
    const data = new FormData(form);
    setError(null);
    busy.current = true;
    setSending(true);
    const outcome = await submitForm<{ folio: string; kind: string; responseDueOn: string }>("complaint", complaintBody(data, PRIVACY_NOTICE_VERSION), idempotencyKey.current);
    busy.current = false;
    setSending(false);
    if (outcome.kind === "saved") {
      setSaved(outcome.data);
      reveal("reclamo-registrado");
      return;
    }
    if (outcome.kind === "invalid" || outcome.kind === "limited") {
      idempotencyKey.current = newIdempotencyKey();
      setError(outcome.kind === "limited" ? t.success.limited : t.success.invalid);
      return;
    }
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
    reveal("reclamo-listo");
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

  const changeKind = (next: Kind) => {
    setKind(next);
    fx.clear();
  };

  const onReset = () => {
    setKind("RECLAMO");
    setMedium(firstMedium);
    setError(null);
    fx.clear();
    setResetKey((k) => k + 1);
  };

  const submitLabel = kind === "RECLAMO" ? t.submit.reclamo : t.submit.queja;

  return (
    <div className="ls-claim">
      <div className="ls-claim__main">
        <form className="ls-form" id="reclamaciones-form" aria-label={t.formAria} onSubmit={onSubmit} onBlur={fx.onBlur} onInput={fx.onInput} onReset={onReset} noValidate hidden={prepared !== null || saved !== null}>
          <h2>{t.formTitle}</h2>
          <p>{t.formIntro}</p>
          <ErrorSummary problems={fx.problems} copy={ui.errors} summaryRef={fx.summaryRef} />
          <ErrorsProvider errors={fx.errors}>
            <Fields key={resetKey} kind={kind} onKind={changeKind} onMedium={setMedium} forget={fx.forget} />
          </ErrorsProvider>
          {error && <p className="ls-alert" role="alert">{error}</p>}
          <div className="ls-form__actions">
            <SubmitButton sending={sending} pending={t.sending} idle={<>{submitLabel} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} /></>} />
            <button type="reset" className="lp-btn lp-btn--outline">
              <RotateCcw aria-hidden="true" size={16} strokeWidth={2} /> {t.clear}
            </button>
          </div>
        </form>

        {saved && (
          <section className="ls-result lg-success" id="reclamo-registrado" role="status" aria-labelledby="reclamo-registrado-title">
            <CheckCircle2 className="mo-check" aria-hidden="true" size={40} strokeWidth={1.75} />
            <h2 id="reclamo-registrado-title">{t.success.title.replace("{kind}", (saved.kind === "CLAIM" ? t.kinds.reclamo.title : t.kinds.queja.title).toLowerCase())}</h2>
            <p>{t.success.sheet}</p>
            <code>{saved.folio}</code>
            <p>{t.success.due.replace("{date}", formatDueDate(saved.responseDueOn, lang))}</p>
            <button type="button" className="lp-btn lp-btn--outline" onClick={() => window.location.reload()}>
              {t.success.again}
            </button>
          </section>
        )}

        {prepared && (
          <section className="ls-result mo-pop" id="reclamo-listo" aria-labelledby="reclamo-listo-title">
            <CheckCircle2 className="mo-check" aria-hidden="true" size={40} strokeWidth={1.75} />
            <h2 id="reclamo-listo-title">{o.title}</h2>
            <p>{o.text}</p>
            <div className="ls-result__actions">
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
            <details className="ls-preview">
              <summary>{o.preview}</summary>
              <pre>{prepared.body}</pre>
            </details>
            <span className="ls-hint">{o.note.replace("{email}", email)}</span>
            <button type="button" className="ls-link-btn" onClick={() => setPrepared(null)}>
              {o.edit}
            </button>
          </section>
        )}
      </div>
      {summary({ kind, medium })}
    </div>
  );
}
