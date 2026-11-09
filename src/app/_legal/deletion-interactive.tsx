"use client";

import { ArrowRight, Check, CheckCircle2, Copy, Eraser, KeyRound, Loader2, Mail, MessageCircle, UserX } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FacebookIcon, GoogleIcon } from "@/modules/access/access-fields";
import { signOut, useAuth } from "@/modules/auth/use-auth";
import { submitForm } from "@/modules/backend/client";
import { clearCart, useCart } from "@/modules/cart/cart-store";
import { clearStoredConversation, storedConversationLength } from "@/shared/assistant/use-assistant-chat";
import { mailtoUrl, whatsappUrl } from "./claim-message";
import type { DeletionCopy } from "./deletion-copy";
import { buildDeletionMessage, deletionReference, type DeletionMethod, type DeletionScope } from "./deletion-message";
import { CheckField, ErrorSummary, ErrorsProvider, Field, SubmitButton, useFormErrors } from "./form-kit";
import { SHEET_UI } from "./sheet-copy";
import { useCopy } from "./use-copy";
import "./forms.css";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Borrado inmediato de lo guardado en este navegador ---------- */

type Phase = "idle" | "confirm" | "working" | "done" | "error";

export function DeviceCleaner({ t }: { t: DeletionCopy["device"] }) {
  const { user } = useAuth();
  const cart = useCart();
  const [chat, setChat] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const confirmRef = useRef<HTMLButtonElement>(null);

  // La conversación vive en sessionStorage: se lee tras hidratar y al volver a la pestaña.
  useEffect(() => {
    const read = () => setChat(storedConversationLength());
    const id = window.requestAnimationFrame(read);
    window.addEventListener("focus", read);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("focus", read);
    };
  }, []);

  useEffect(() => {
    if (phase === "confirm") confirmRef.current?.focus();
  }, [phase]);

  const count = (n: number, c: { on: string; one: string; off: string }) => (n === 0 ? c.off : n === 1 ? c.one : c.on.replace("{n}", String(n)));
  const rows = [
    { key: "session", title: t.session.title, value: user ? t.session.on.replace("{email}", user.email) : t.session.off, on: Boolean(user) },
    { key: "quote", title: t.quote.title, value: count(cart.length, t.quote), on: cart.length > 0 },
    { key: "chat", title: t.chat.title, value: count(chat, t.chat), on: chat > 0 },
  ];
  const hasData = rows.some((r) => r.on);

  const erase = async () => {
    setPhase("working");
    if (user && !(await signOut())) {
      setPhase("error");
      return;
    }
    clearCart();
    clearStoredConversation();
    setChat(0);
    setPhase("done");
  };

  return (
    <div className="dl-device__card">
      <ul className="dl-device__rows" aria-live="polite">
        {rows.map(({ key, title, value, on }) => (
          <li key={key} data-on={on ? "" : undefined}>
            <strong>{title}</strong>
            <span>{value}</span>
          </li>
        ))}
      </ul>

      <div className="dl-device__actions" aria-live="polite">
        {phase === "done" ? (
          <div className="dl-device__done mo-pop" role="status">
            <CheckCircle2 className="mo-check" aria-hidden="true" size={24} strokeWidth={1.8} />
            <div>
              <strong>{t.doneTitle}</strong>
              <span>{t.doneText}</span>
            </div>
            <a className="lp-btn lp-btn--solid" href="#solicitud">
              {t.doneCta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </a>
          </div>
        ) : phase === "confirm" || phase === "working" ? (
          <div className="dl-device__confirm mo-pop">
            <strong>{t.confirmTitle}</strong>
            <div>
              <button ref={confirmRef} type="button" className="lp-btn lp-btn--solid dl-btn-danger" onClick={erase} disabled={phase === "working"}>
                {phase === "working" ? <Loader2 className="mo-spin" aria-hidden="true" size={18} /> : <Eraser aria-hidden="true" size={18} strokeWidth={1.9} />}
                {phase === "working" ? t.working : t.confirm}
              </button>
              <button type="button" className="lp-btn lp-btn--outline" onClick={() => setPhase("idle")} disabled={phase === "working"}>
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <>
            {phase === "error" && <span className="ls-error" role="alert">{t.error}</span>}
            {!hasData && <span className="ls-hint">{t.nothing}</span>}
            <button type="button" className="lp-btn lp-btn--outline" onClick={() => setPhase("confirm")} disabled={!hasData}>
              <Eraser aria-hidden="true" size={18} strokeWidth={1.9} /> {t.cta}
            </button>
          </>
        )}
        <span className="ls-hint">{t.note}</span>
      </div>
    </div>
  );
}

/* ---------- Formulario de solicitud ---------- */

const METHOD_ICONS: Record<DeletionMethod, () => React.ReactNode> = {
  google: () => <GoogleIcon />,
  facebook: () => <FacebookIcon />,
  email: () => <KeyRound aria-hidden="true" size={19} strokeWidth={1.8} />,
  none: () => <UserX aria-hidden="true" size={19} strokeWidth={1.8} />,
};
const METHODS: DeletionMethod[] = ["google", "facebook", "email", "none"];
const SCOPES: DeletionScope[] = ["all", "account", "marketing"];

type Prepared = { reference: string; subject: string; body: string };

export function DeletionForm({ t, email, whatsappNumber }: { t: DeletionCopy["form"]; email: string; whatsappNumber: string }) {
  const uid = useId();
  const ui = useCopy(SHEET_UI);
  const { user, accounts } = useAuth();
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [details, setDetails] = useState("");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [copied, setCopied] = useState(false);
  const filled = useRef(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const fx = useFormErrors(ui.errors);

  // Con sesión iniciada se completan nombre y correo (una sola vez, sin pisar lo que la persona ya escribió).
  useEffect(() => {
    if (!user || filled.current) return;
    filled.current = true;
    const id = window.requestAnimationFrame(() => {
      setName((v) => v || user.name);
      setMail((v) => v || user.email);
    });
    return () => window.cancelAnimationFrame(id);
  }, [user]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    if (!fx.validate(form)) return;
    const data = new FormData(form);
    const reference = deletionReference();
    const scope = String(data.get("alcance")) as DeletionScope;
    const message = buildDeletionMessage(
      {
        name,
        email: mail,
        method: String(data.get("metodo")) as DeletionMethod,
        scope,
        doc: String(data.get("documento") ?? ""),
        details,
      },
      reference,
    );
    setError(null);
    // Con Backend, la solicitud de supresión (o de oposición a publicidad) queda registrada con folio y plazo legal;
    // el texto preparado es el mismo que verá el equipo de privacidad. Sin Backend se envía por correo o WhatsApp.
    busy.current = true;
    setSending(true);
    const outcome = await submitForm<{ folio: string }>("privacy-request", {
      type: scope === "marketing" ? "OPPOSITION" : "ACCOUNT_DELETION",
      fullName: name.trim().slice(0, 160),
      email: mail.trim(),
      details: message.body.slice(0, 4000),
      acceptPrivacyNotice: Boolean(data.get("confirmo")),
    });
    busy.current = false;
    setSending(false);
    if (outcome.kind === "saved") {
      setSaved(outcome.data.folio);
      window.requestAnimationFrame(() => document.getElementById("solicitud-registrada")?.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" }));
      return;
    }
    if (outcome.kind === "invalid" || outcome.kind === "limited") {
      setError(outcome.kind === "limited" ? t.saved.limited : t.saved.invalid);
      return;
    }
    setPrepared({ reference, ...message });
    setCopied(false);
    window.requestAnimationFrame(() => {
      const ready = document.getElementById("solicitud-lista");
      ready?.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
      ready?.focus({ preventScroll: true });
    });
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

  const r = t.ready;

  return (
    <>
      <form className="ls-form dl-form" aria-label={t.aria} onSubmit={onSubmit} onBlur={fx.onBlur} onInput={fx.onInput} noValidate hidden={prepared !== null || saved !== null}>
        <h2 id="dl-form-title">{t.title}</h2>
        <p>{t.intro}</p>
        {user && (
          <span className="dl-signed" role="status">
            <CheckCircle2 aria-hidden="true" size={17} strokeWidth={2} /> {t.signedAs.replace("{email}", user.email)}
          </span>
        )}
        <ErrorSummary problems={fx.problems} copy={ui.errors} summaryRef={fx.summaryRef} />

        <ErrorsProvider errors={fx.errors}>
          <fieldset className="ls-fieldset">
            <legend><span aria-hidden="true">1</span> {t.legends.who}</legend>
            <div className="ls-grid2">
              <Field id={`${uid}-name`} label={t.name} required>
                <input id={`${uid}-name`} name="nombre" required minLength={3} maxLength={120} autoComplete="name" placeholder={t.namePh} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field id={`${uid}-mail`} label={t.email} required hint={t.emailHint}>
                <input id={`${uid}-mail`} name="correo" type="email" required maxLength={160} autoComplete="email" inputMode="email" spellCheck={false} placeholder={t.emailPh} value={mail} onChange={(e) => setMail(e.target.value)} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="ls-fieldset">
            <legend><span aria-hidden="true">2</span> {t.legends.method}</legend>
            <div className="ls-tiles">
              {METHODS.map((m, i) => (
                <label key={m}>
                  <input type="radio" name="metodo" value={m} required={i === 0} defaultChecked={m === "google"} />
                  <span className="ls-tiles__icon">{METHOD_ICONS[m]()}</span>
                  {t.methods[m]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ls-fieldset">
            <legend><span aria-hidden="true">3</span> {t.legends.scope}</legend>
            <div className="ls-kind ls-kind--stack">
              {SCOPES.map((s) => (
                <label key={s}>
                  <input type="radio" name="alcance" value={s} defaultChecked={s === "all"} />
                  <strong>{t.scopes[s].title}</strong>
                  <small>{t.scopes[s].text}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ls-fieldset">
            <legend><span aria-hidden="true">4</span> {t.legends.extra}</legend>
            <div className="ls-grid2">
              <Field id={`${uid}-doc`} label={t.doc} full hint={t.docHint}>
                <input id={`${uid}-doc`} name="documento" maxLength={40} autoComplete="off" spellCheck={false} placeholder={t.docPh} />
              </Field>
              <Field id={`${uid}-det`} label={t.details} full counter={<span className="ls-count" aria-hidden="true">{details.length} / 600</span>}>
                <textarea id={`${uid}-det`} name="detalles" rows={4} maxLength={600} placeholder={t.detailsPh} value={details} onChange={(e) => setDetails(e.target.value)} />
              </Field>
            </div>
          </fieldset>

          <CheckField id={`${uid}-confirm`} name="confirmo" errorLabel={ui.deletion.confirmError}>
            {t.confirm}
          </CheckField>
        </ErrorsProvider>
        <span className="ls-hint">
          {t.privacy.pre}<Link className="ls-link" href="/privacidad">{t.privacy.link}</Link>{t.privacy.post}
        </span>

        {error && <p className="ls-alert" role="alert">{error}</p>}
        <div className="ls-form__actions">
          <SubmitButton sending={sending} pending={ui.deletion.sending} idle={<>{accounts ? t.submitOnline : t.submit} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} /></>} />
        </div>
      </form>

      {saved && (
        <section className="ls-result dl-ready" id="solicitud-registrada" tabIndex={-1} role="status" aria-labelledby="dl-saved-title">
          <CheckCircle2 className="mo-check" aria-hidden="true" size={40} strokeWidth={1.75} />
          <h2 id="dl-saved-title">{t.saved.title}</h2>
          <p>{t.saved.text.replace("{email}", mail.trim())}</p>
          <code className="dl-ready__code">{saved}</code>
          <button type="button" className="ls-link-btn" onClick={() => setSaved(null)}>
            {t.saved.again}
          </button>
        </section>
      )}

      {prepared && (
        <section className="ls-result dl-ready mo-pop" id="solicitud-lista" tabIndex={-1} aria-labelledby="dl-ready-title">
          <CheckCircle2 className="mo-check" aria-hidden="true" size={40} strokeWidth={1.75} />
          <h2 id="dl-ready-title">{r.title}</h2>
          <p>{r.text}</p>
          <code className="dl-ready__code">{prepared.reference}</code>
          <div className="ls-result__actions">
            <a className="lp-btn lp-btn--solid" href={mailtoUrl(email, prepared.subject, prepared.body)}>
              <Mail aria-hidden="true" size={18} strokeWidth={1.8} /> {r.mail}
            </a>
            <a className="lp-btn lp-btn--outline" href={whatsappUrl(whatsappNumber, prepared.body)} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" size={18} strokeWidth={1.8} /> {r.whatsapp}
            </a>
            <button type="button" className="lp-btn lp-btn--outline" onClick={copy}>
              {copied ? <Check aria-hidden="true" size={18} strokeWidth={2.2} /> : <Copy aria-hidden="true" size={18} strokeWidth={1.8} />} {copied ? r.copied : r.copy}
            </button>
          </div>
          <details className="ls-preview">
            <summary>{r.preview}</summary>
            <pre>{prepared.body}</pre>
          </details>
          <span className="ls-hint">{r.note.replace("{email}", email)}</span>
          <button type="button" className="ls-link-btn" onClick={() => setPrepared(null)}>
            {r.edit}
          </button>
        </section>
      )}
    </>
  );
}
