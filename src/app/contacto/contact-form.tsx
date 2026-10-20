"use client";

import { ArrowRight, CheckCircle2, Copy, Lock, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { mailtoUrl, whatsappUrl } from "../_legal/claim-message";
import { useCopy } from "../_legal/use-copy";
import { submitForm } from "@/modules/backend/client";
import { PRIVACY_NOTICE_VERSION } from "@/modules/backend/legal";
import { buildContactMessage } from "./contact-message";
import { CONTACT, type ReasonId } from "./copy";

export type ContactPrefill = { reason?: ReasonId; document?: string };

/** Motivo del sitio → motivo de la API (InquiryRequest.reason). */
const INQUIRY_REASONS: Record<ReasonId, string> = { documentacion: "DOCUMENTATION", reunion: "MEETING" };

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

export function ContactForm({ email, whatsappNumber, prefill }: { email: string; whatsappNumber: string; prefill: ContactPrefill }) {
  const t = useCopy(CONTACT);
  const f = t.form;
  const uid = useId();
  const defaultMessage = prefill.document ? f.documentMessage.replace("{document}", prefill.document) : "";
  const [length, setLength] = useState(defaultMessage.length);
  const [prepared, setPrepared] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
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
      form.reset();
      setLength(0);
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
      <form className="ct-form" id="contacto-form" aria-label={f.aria} onSubmit={onSubmit} hidden={prepared !== null || saved !== null} aria-busy={sending}>
        <p className="lg-eyebrow">{f.eyebrow}</p>
        <h2 className="ct-title">{f.title}</h2>
        <p className="ct-intro">{f.intro}</p>
        {prefill.reason && <p className="ct-reason"><strong>{f.reasonLabel}:</strong> {f.reasons[prefill.reason]}</p>}

        <div className="ct-fields">
          <Field id={`${uid}-n`} label={f.name[0]} required full>
            <input id={`${uid}-n`} name="fullName" required autoComplete="name" placeholder={f.name[1]} />
          </Field>
          <Field id={`${uid}-e`} label={f.company[0]} required>
            <input id={`${uid}-e`} name="companyName" required autoComplete="organization" placeholder={f.company[1]} />
          </Field>
          <Field id={`${uid}-c`} label={f.position[0]}>
            <input id={`${uid}-c`} name="position" autoComplete="organization-title" placeholder={f.position[1]} />
          </Field>
          <Field id={`${uid}-m`} label={f.email[0]} required>
            <input id={`${uid}-m`} name="email" type="email" required autoComplete="email" spellCheck={false} placeholder={f.email[1]} />
          </Field>
          <Field id={`${uid}-t`} label={f.phone[0]} required>
            <input id={`${uid}-t`} name="phone" type="tel" required pattern="[0-9+\s\(\)\-]{7,20}" autoComplete="tel" placeholder={f.phone[1]} />
          </Field>
          <Field id={`${uid}-s`} label={f.message[0]} required full>
            <textarea id={`${uid}-s`} name="message" required maxLength={1000} rows={5} defaultValue={defaultMessage} placeholder={f.message[1]} onChange={(e) => setLength(e.target.value.length)} />
            <span className="lg-count" aria-hidden="true">{length} / 1000</span>
          </Field>
        </div>

        {error && (
          <p className="ct-error" role="alert">
            {error}
          </p>
        )}
        <div className="ct-actions">
          <button type="submit" className="lp-btn lp-btn--solid lp-btn--lg" disabled={sending}>
            {f.submit} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </button>
          <p className="ct-privacy">
            <Lock aria-hidden="true" size={22} strokeWidth={1.6} />
            <span>
              {f.privacyPre}
              <Link className="lg-link-inline" href="/privacidad" target="_blank" rel="noopener noreferrer">{f.privacyLink}</Link>
              {f.privacyPost}
            </span>
          </p>
        </div>
      </form>

      {saved && (
        <section className="ct-form ct-ready lg-offline" id="contacto-listo" aria-labelledby="contacto-listo-title">
          <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
          <h2 id="contacto-listo-title">{t.saved.title}</h2>
          <p className="lg-text">{t.saved.text}</p>
          <p className="ct-folio">
            <span>{t.saved.folio}</span>
            <strong>{saved}</strong>
          </p>
          <button type="button" className="lg-link-btn" onClick={() => setSaved(null)}>
            {t.saved.again}
          </button>
        </section>
      )}

      {prepared && (
        <section className="ct-form ct-ready lg-offline" id="contacto-listo" aria-labelledby="contacto-listo-title">
          <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
          <h2 id="contacto-listo-title">{t.ready.title}</h2>
          <p className="lg-text">{t.ready.text}</p>
          <div className="lg-offline__actions">
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
          <details className="lg-offline__preview">
            <summary>{t.ready.preview}</summary>
            <pre>{prepared.body}</pre>
          </details>
          <p className="lg-offline__note">{t.ready.note.replace("{email}", email)}</p>
          <button type="button" className="lg-link-btn" onClick={() => setPrepared(null)}>
            {t.ready.edit}
          </button>
        </section>
      )}
    </>
  );
}
