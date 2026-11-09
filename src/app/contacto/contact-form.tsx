"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Copy, Loader2, Lock, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { mailtoUrl, whatsappUrl } from "../_legal/claim-message";
import { useCopy } from "../_legal/use-copy";
import { submitForm } from "@/modules/backend/client";
import { track } from "@/shared/analytics/track";
import { PRIVACY_NOTICE_VERSION } from "@/modules/backend/legal";
import { buildContactMessage } from "./contact-message";
import { CONTACT, type FieldName, type ReasonId } from "./copy";

export type ContactPrefill = { reason?: ReasonId; document?: string };

const noSubscribe = () => () => undefined;

/** Lee ?motivo= y ?documento= en el navegador: así la página se prerenderiza y su primer byte no espera al servidor. */
function usePrefill(): ContactPrefill {
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const motivo = params.get("motivo");
    const document = params.get("documento")?.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
    return {
      reason: motivo === "documentacion" || motivo === "reunion" ? motivo : document ? "documentacion" : undefined,
      document: document || undefined,
    };
  }, [search]);
}

/** Motivo del sitio → motivo de la API (InquiryRequest.reason). */
const INQUIRY_REASONS: Record<ReasonId, string> = { documentacion: "DOCUMENTATION", reunion: "MEETING" };

type Control = HTMLInputElement | HTMLTextAreaElement;
type Errors = Partial<Record<FieldName, string>>;

const isControl = (el: EventTarget | Element): el is Control => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

function Field({ id, label, required, full, error, children }: { id: string; label: string; required?: boolean; full?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className={`campo ct-campo${full ? " ct-campo--full" : ""}`}>
      <label htmlFor={id}>
        {label} {required && <em aria-hidden="true">*</em>}
      </label>
      {children}
      {error && (
        <span className="campo__error" id={`${id}-error`}>
          <AlertCircle aria-hidden="true" size={16} strokeWidth={2} /> {error}
        </span>
      )}
    </div>
  );
}

export function ContactForm({ email, whatsappNumber }: { email: string; whatsappNumber: string }) {
  const prefill = usePrefill();
  const t = useCopy(CONTACT);
  const f = t.form;
  const uid = useId();
  const defaultMessage = prefill.document ? f.documentMessage.replace("{document}", prefill.document) : "";
  const [typed, setTyped] = useState<number | null>(null);
  const [prepared, setPrepared] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);

  const ids: Record<FieldName, string> = { fullName: `${uid}-n`, companyName: `${uid}-e`, position: `${uid}-c`, email: `${uid}-m`, phone: `${uid}-t`, message: `${uid}-s` };

  const messageFor = (el: Control) => {
    const name = el.name as FieldName;
    if (el.validity.valueMissing) return f.errors.required[name] ?? f.errors.summary;
    if (el.validity.typeMismatch) return f.errors.email;
    if (el.validity.patternMismatch) return f.errors.phone;
    if (el.validity.tooShort) return f.errors.tooShort;
    return "";
  };

  const fieldProps = (name: FieldName) => ({
    id: ids[name],
    name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${ids[name]}-error` : undefined,
  });

  /** Valida al salir del campo. Un campo vacío solo se marca al enviar, para no regañar a quien recorre el formulario con el tabulador. */
  const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const el = event.target;
    if (!isControl(el) || !el.name) return;
    const name = el.name as FieldName;
    if (el.value === "" && !errors[name]) return;
    setErrors((prev) => ({ ...prev, [name]: el.checkValidity() ? undefined : messageFor(el) }));
  };

  /** En cuanto el dato es válido, el error desaparece. */
  const onInput = (event: React.FormEvent<HTMLFormElement>) => {
    const el = event.target;
    if (!isControl(el) || !el.name) return;
    const name = el.name as FieldName;
    if (errors[name] && el.checkValidity()) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (summary.length) setSummary([]);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;

    const invalid = Array.from(form.elements).filter(isControl).filter((el) => el.name && !el.checkValidity());
    if (invalid.length) {
      const next: Errors = {};
      for (const el of invalid) next[el.name as FieldName] = messageFor(el);
      setErrors(next);
      setSummary(invalid.map((el) => ({ id: el.id, message: messageFor(el) })));
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setSummary([]);

    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setError(null);
    // Con Backend: la consulta se registra con folio. Sin él (o si no responde), se prepara el mensaje como antes.
    setSending(true);
    const outcome = await submitForm<{ folio: string }>("inquiry", {
      reason: prefill.reason ? INQUIRY_REASONS[prefill.reason] : "GENERAL",
      fullName: text("fullName"),
      companyName: text("companyName"),
      position: text("position") || undefined,
      email: text("email"),
      phone: text("phone"),
      message: text("message"),
      requestedDocument: prefill.document?.slice(0, 200),
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      acceptPrivacyNotice: true,
    });
    setSending(false);
    if (outcome.kind === "saved") {
      // Solo aquí el sistema confirmó el envío (folio). Preparar un correo o WhatsApp no cuenta como envío.
      track("contact_form_submit_success", { form_type: "contact", reason: prefill.reason ?? "general" });
      form.reset();
      setTyped(null);
      setSaved(outcome.data.folio);
      window.requestAnimationFrame(() => document.getElementById("contacto-listo")?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    if (outcome.kind === "invalid" || outcome.kind === "limited") {
      setError(outcome.kind === "limited" ? t.saved.limited : t.saved.invalid);
      return;
    }
    // El texto que lee el equipo va en español, sin importar el idioma de la pantalla.
    const reasonEs = prefill.reason ? CONTACT.es.form.reasons[prefill.reason] : "";
    setPrepared(buildContactMessage({ name: text("fullName"), company: text("companyName"), position: text("position"), email: text("email"), phone: text("phone"), message: text("message"), reason: reasonEs }));
    setCopied(false);
    window.requestAnimationFrame(() => document.getElementById("contacto-listo")?.scrollIntoView({ block: "center", behavior: "smooth" }));
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
      <form className="ct-form" id="contacto-form" aria-label={f.aria} onSubmit={onSubmit} onBlur={onBlur} onInput={onInput} noValidate hidden={prepared !== null || saved !== null} aria-busy={sending}>
        <div className="cota">
          <h2>{f.title}</h2>
          <p>{f.intro}</p>
        </div>
        {prefill.reason && <p className="ct-reason"><strong>{f.reasonLabel}:</strong> {f.reasons[prefill.reason]}</p>}

        {summary.length > 0 && (
          <div className="ct-resumen" ref={summaryRef} tabIndex={-1} role="alert">
            <strong>{f.errors.summary}</strong>
            <ul>
              {summary.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(item.id)?.focus(); }}>{item.message}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ct-campos">
          <Field id={ids.fullName} label={f.name[0]} required full error={errors.fullName}>
            <input {...fieldProps("fullName")} required autoComplete="name" placeholder={f.name[1]} />
          </Field>
          <Field id={ids.companyName} label={f.company[0]} required error={errors.companyName}>
            <input {...fieldProps("companyName")} required autoComplete="organization" placeholder={f.company[1]} />
          </Field>
          <Field id={ids.position} label={f.position[0]} error={errors.position}>
            <input {...fieldProps("position")} autoComplete="organization-title" placeholder={f.position[1]} />
          </Field>
          <Field id={ids.email} label={f.email[0]} required error={errors.email}>
            <input {...fieldProps("email")} type="email" required autoComplete="email" spellCheck={false} placeholder={f.email[1]} />
          </Field>
          <Field id={ids.phone} label={f.phone[0]} required error={errors.phone}>
            <input {...fieldProps("phone")} type="tel" required pattern="[0-9+\s\(\)\-]{7,20}" autoComplete="tel" placeholder={f.phone[1]} />
          </Field>
          <Field id={ids.message} label={f.message[0]} required full error={errors.message}>
            <textarea {...fieldProps("message")} required minLength={10} maxLength={1000} rows={5} defaultValue={defaultMessage} placeholder={f.message[1]} onChange={(e) => setTyped(e.target.value.length)} />
            <span className="ct-cuenta" aria-hidden="true">{typed ?? defaultMessage.length} / 1000</span>
          </Field>
        </div>

        {error && (
          <p className="ct-error" role="alert">
            {error}
          </p>
        )}
        <div className="ct-acciones">
          <button type="submit" className="lp-btn lp-btn--solid lp-btn--lg ct-enviar" disabled={sending}>
            <span className={sending ? "is-oculto" : undefined}>{f.submit} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} /></span>
            <span className={sending ? undefined : "is-oculto"}><Loader2 className="mo-spin" aria-hidden="true" size={18} strokeWidth={2} /> {f.sending}</span>
          </button>
          <p className="ct-privacidad">
            <Lock aria-hidden="true" size={16} strokeWidth={1.8} />
            <span>
              {f.privacyPre}
              <Link href="/privacidad" target="_blank" rel="noopener noreferrer">{f.privacyLink}</Link>
              {f.privacyPost}
            </span>
          </p>
        </div>
      </form>

      {saved && (
        <section className="ct-listo" id="contacto-listo" role="status" aria-labelledby="contacto-listo-title">
          <CheckCircle2 aria-hidden="true" size={36} strokeWidth={1.6} />
          <h2 id="contacto-listo-title">{t.saved.title}</h2>
          <p>{t.saved.text}</p>
          <p className="ct-folio">
            <span>{t.saved.folio}</span>
            <strong>{saved}</strong>
          </p>
          <button type="button" className="ct-enlace" onClick={() => setSaved(null)}>
            {t.saved.again}
          </button>
        </section>
      )}

      {prepared && (
        <section className="ct-listo" id="contacto-listo" role="status" aria-labelledby="contacto-listo-title">
          <CheckCircle2 aria-hidden="true" size={36} strokeWidth={1.6} />
          <h2 id="contacto-listo-title">{t.ready.title}</h2>
          <p>{t.ready.text}</p>
          <div className="ct-listo__botones">
            <a className="lp-btn lp-btn--solid" href={mailtoUrl(email, prepared.subject, prepared.body)}>
              <Mail aria-hidden="true" size={18} strokeWidth={1.8} /> {t.ready.mail}
            </a>
            <a className="lp-btn lp-btn--outline" href={whatsappUrl(whatsappNumber, prepared.body)} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" size={18} strokeWidth={1.8} /> {t.ready.whatsapp}
            </a>
            <button type="button" className="lp-btn lp-btn--outline" onClick={copy}>
              <Copy aria-hidden="true" size={18} strokeWidth={1.8} /> {copied ? t.ready.copied : t.ready.copy}
            </button>
          </div>
          <details className="ct-listo__vista">
            <summary>{t.ready.preview}</summary>
            <pre>{prepared.body}</pre>
          </details>
          <p className="ct-listo__nota">{t.ready.note.replace("{email}", email)}</p>
          <button type="button" className="ct-enlace" onClick={() => setPrepared(null)}>
            {t.ready.edit}
          </button>
        </section>
      )}
    </>
  );
}
