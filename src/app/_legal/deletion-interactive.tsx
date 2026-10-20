"use client";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Check,
  Copy,
  Eraser,
  KeyRound,
  Loader2,
  Mail,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  UserX,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FacebookIcon, GoogleIcon } from "@/modules/access/access-fields";
import { signOut, useAuth } from "@/modules/auth/use-auth";
import { clearCart, useCart } from "@/modules/cart/cart-store";
import { clearStoredConversation, storedConversationLength } from "@/shared/assistant/use-assistant-chat";
import { mailtoUrl, whatsappUrl } from "./claim-message";
import type { DeletionCopy } from "./deletion-copy";
import { buildDeletionMessage, deletionReference, type DeletionMethod, type DeletionScope } from "./deletion-message";
import { submitForm } from "@/modules/backend/client";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Tarjeta animada del hero: ejemplo del avance de una solicitud ---------- */

const STEP_MS = 1400;
const HOLD_TICKS = 3;

export function StatusCard({ t }: { t: DeletionCopy["status"] }) {
  const total = t.steps.length;
  // En el servidor (y con movimiento reducido) se muestra completa; tras hidratar, recorre los pasos en bucle.
  const [tick, setTick] = useState(total);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion()) return;
    let current = 0;
    let timer = 0;
    let visible = true;
    const start = window.requestAnimationFrame(() => setTick(0));
    const run = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (!visible || document.hidden) return;
        current = current >= total + HOLD_TICKS ? 0 : current + 1;
        setTick(current);
      }, STEP_MS);
    };
    run();
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => {
      window.cancelAnimationFrame(start);
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [total]);

  const step = Math.min(tick, total);
  const finished = step >= total;

  return (
    <div className="dl-status" ref={ref} role="img" aria-label={t.aria}>
      <div className="dl-status__head">
        <span className="dl-status__icon"><ShieldCheck size={20} strokeWidth={1.8} /></span>
        <div>
          <small>{t.label}</small>
          <strong>ELIM-20261016-7K3Q</strong>
        </div>
        <span className="dl-status__sample">{t.sample}</span>
      </div>
      <div className="dl-status__bar"><span style={{ transform: `scaleX(${step / total})` }} /></div>
      <ol className="dl-status__steps">
        {t.steps.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={label} data-state={state}>
              <span className="dl-status__dot">{state === "done" ? <Check size={13} strokeWidth={3} /> : null}</span>
              {label}
            </li>
          );
        })}
      </ol>
      <p className={`dl-status__done${finished ? " is-on" : ""}`}>
        <Mail size={16} strokeWidth={1.9} /> {t.done}
      </p>
    </div>
  );
}

/* ---------- Línea de tiempo del proceso: se "llena" al entrar en pantalla ---------- */

export function useRunOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      const id = window.requestAnimationFrame(() => setRun(true));
      return () => window.cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRun(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return [ref, run] as const;
}

export function ProcessTimeline({ t }: { t: DeletionCopy["process"] }) {
  const [ref, run] = useRunOnView<HTMLOListElement>();
  return (
    <ol className={`dl-timeline${run ? " is-run" : ""}`} ref={ref}>
      {t.steps.map((s, i) => (
        <li key={s.title} style={{ ["--i" as string]: i }}>
          <span className="dl-timeline__node" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          <span className="dl-timeline__when">{s.when}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <span className="dl-law">{s.law}</span>
        </li>
      ))}
    </ol>
  );
}

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
  const rows: { key: string; icon: LucideIcon; title: string; value: string; on: boolean }[] = [
    { key: "session", icon: UserRound, title: t.session.title, value: user ? t.session.on.replace("{email}", user.email) : t.session.off, on: Boolean(user) },
    { key: "quote", icon: ShoppingCart, title: t.quote.title, value: count(cart.length, t.quote), on: cart.length > 0 },
    { key: "chat", icon: Bot, title: t.chat.title, value: count(chat, t.chat), on: chat > 0 },
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
    <div className="dl-device__card" data-reveal="">
      <ul className="dl-device__rows" aria-live="polite">
        {rows.map(({ key, icon: Icon, title, value, on }) => (
          <li key={key} data-on={on ? "" : undefined}>
            <span className="dl-device__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
            <div>
              <strong>{title}</strong>
              <span>{value}</span>
            </div>
            <span className="dl-device__pulse" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <div className="dl-device__actions" aria-live="polite">
        {phase === "done" ? (
          <div className="dl-device__done" role="status">
            <CheckCircle2 aria-hidden="true" size={26} strokeWidth={1.8} />
            <div>
              <strong>{t.doneTitle}</strong>
              <span>{t.doneText}</span>
            </div>
            <a className="lp-btn lp-btn--solid" href="#solicitud">
              {t.doneCta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </a>
          </div>
        ) : phase === "confirm" || phase === "working" ? (
          <div className="dl-device__confirm">
            <strong>{t.confirmTitle}</strong>
            <div>
              <button ref={confirmRef} type="button" className="lp-btn lp-btn--solid dl-btn-danger" onClick={erase} disabled={phase === "working"}>
                {phase === "working" ? <Loader2 className="dl-spin" aria-hidden="true" size={18} /> : <Eraser aria-hidden="true" size={18} strokeWidth={1.9} />}
                {phase === "working" ? t.working : t.confirm}
              </button>
              <button type="button" className="lp-btn lp-btn--outline dl-btn-ghost" onClick={() => setPhase("idle")} disabled={phase === "working"}>
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <>
            {phase === "error" && <p className="dl-device__error" role="alert">{t.error}</p>}
            {!hasData && <p className="dl-device__empty">{t.nothing}</p>}
            <button type="button" className="lp-btn lp-btn--solid" onClick={() => setPhase("confirm")} disabled={!hasData}>
              <Eraser aria-hidden="true" size={18} strokeWidth={1.9} /> {t.cta}
            </button>
          </>
        )}
        <p className="dl-device__note">{t.note}</p>
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
  const { user, accounts } = useAuth();
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [details, setDetails] = useState("");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [copied, setCopied] = useState(false);
  const filled = useRef(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);

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
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    const reference = deletionReference();
    const scope = String(data.get("alcance")) as DeletionScope;
    const message = buildDeletionMessage(
      {
        name,
        email: mail,
        method: String(data.get("metodo")) as DeletionMethod,
        scope: String(data.get("alcance")) as DeletionScope,
        doc: String(data.get("documento") ?? ""),
        details,
      },
      reference,
    );
    setError(null);
    // Con Backend, la solicitud de supresión (o de oposición a publicidad) queda registrada con folio y plazo legal;
    // el texto preparado es el mismo que verá el equipo de privacidad. Sin Backend se envía por correo o WhatsApp.
    sending.current = true;
    const outcome = await submitForm<{ folio: string }>("privacy-request", {
      type: scope === "marketing" ? "OPPOSITION" : "ACCOUNT_DELETION",
      fullName: name.trim().slice(0, 160),
      email: mail.trim(),
      details: message.body.slice(0, 4000),
      acceptPrivacyNotice: Boolean(data.get("confirmo")),
    });
    sending.current = false;
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
      <form className="lg-form-card dl-form" aria-label={t.aria} onSubmit={onSubmit} hidden={prepared !== null || saved !== null}>
        <p className="lg-eyebrow">{t.eyebrow}</p>
        <h2 id="dl-form-title">{t.title}</h2>
        <p>{t.intro}</p>
        {user && (
          <p className="dl-signed" role="status">
            <CheckCircle2 aria-hidden="true" size={17} strokeWidth={2} /> {t.signedAs.replace("{email}", user.email)}
          </p>
        )}

        <fieldset className="lg-fieldset">
          <legend><span aria-hidden="true">1</span> {t.legends.who}</legend>
          <div className="lg-grid2">
            <div className="lg-field">
              <label htmlFor={`${uid}-name`}>{t.name} <em aria-hidden="true">*</em></label>
              <input id={`${uid}-name`} name="nombre" required minLength={3} maxLength={120} autoComplete="name" placeholder={t.namePh} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="lg-field">
              <label htmlFor={`${uid}-mail`}>{t.email} <em aria-hidden="true">*</em></label>
              <input id={`${uid}-mail`} name="correo" type="email" required maxLength={160} autoComplete="email" inputMode="email" spellCheck={false} placeholder={t.emailPh} value={mail} onChange={(e) => setMail(e.target.value)} aria-describedby={`${uid}-mail-hint`} />
              <span className="dl-hint" id={`${uid}-mail-hint`}>{t.emailHint}</span>
            </div>
          </div>
        </fieldset>

        <fieldset className="lg-fieldset">
          <legend><span aria-hidden="true">2</span> {t.legends.method}</legend>
          <div className="dl-methods">
            {METHODS.map((m, i) => (
              <label key={m}>
                <input type="radio" name="metodo" value={m} required={i === 0} defaultChecked={m === "google"} />
                <span className="dl-methods__icon">{METHOD_ICONS[m]()}</span>
                {t.methods[m]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lg-fieldset">
          <legend><span aria-hidden="true">3</span> {t.legends.scope}</legend>
          <div className="lg-kind dl-scopes">
            {SCOPES.map((s) => (
              <label key={s}>
                <input type="radio" name="alcance" value={s} defaultChecked={s === "all"} />
                <span className="lg-kind__dot" aria-hidden="true" />
                <strong>{t.scopes[s].title}</strong>
                <small>{t.scopes[s].text}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lg-fieldset">
          <legend><span aria-hidden="true">4</span> {t.legends.extra}</legend>
          <div className="lg-grid2">
            <div className="lg-field">
              <label htmlFor={`${uid}-doc`}>{t.doc}</label>
              <input id={`${uid}-doc`} name="documento" maxLength={40} autoComplete="off" spellCheck={false} placeholder={t.docPh} aria-describedby={`${uid}-doc-hint`} />
              <span className="dl-hint" id={`${uid}-doc-hint`}>{t.docHint}</span>
            </div>
            <div className="lg-field">
              <label htmlFor={`${uid}-det`}>{t.details}</label>
              <textarea id={`${uid}-det`} name="detalles" rows={3} maxLength={600} placeholder={t.detailsPh} value={details} onChange={(e) => setDetails(e.target.value)} />
              <span className="lg-count" aria-hidden="true">{details.length} / 600</span>
            </div>
          </div>
        </fieldset>

        <label className="lg-consent">
          <input type="checkbox" name="confirmo" required />
          <span>{t.confirm}</span>
        </label>
        <p className="dl-privacy">
          {t.privacy.pre}<Link className="lg-link-inline" href="/privacidad">{t.privacy.link}</Link>{t.privacy.post}
        </p>

        {error && (
          <p className="lg-alert" role="alert">
            {error}
          </p>
        )}
        <div className="lg-form-actions">
          <button type="submit" className="lp-btn lp-btn--solid lp-btn--lg">
            {accounts ? t.submitOnline : t.submit} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </button>
        </div>
      </form>

      {saved && (
        <section className="lg-form-card dl-ready" id="solicitud-registrada" tabIndex={-1} role="status" aria-labelledby="dl-saved-title">
          <svg className="dl-ready__check" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" />
            <path d="M15 27.5 22.5 35 37.5 18" />
          </svg>
          <h2 id="dl-saved-title">{t.saved.title}</h2>
          <p className="lg-text">{t.saved.text.replace("{email}", mail.trim())}</p>
          <code className="dl-ready__code">{saved}</code>
          <button type="button" className="lg-link-btn" onClick={() => setSaved(null)}>
            {t.saved.again}
          </button>
        </section>
      )}

      {prepared && (
        <section className="lg-form-card dl-ready" id="solicitud-lista" tabIndex={-1} aria-labelledby="dl-ready-title">
          <svg className="dl-ready__check" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" />
            <path d="M15 27.5 22.5 35 37.5 18" />
          </svg>
          <h2 id="dl-ready-title">{r.title}</h2>
          <p className="lg-text">{r.text}</p>
          <code className="dl-ready__code">{prepared.reference}</code>
          <div className="lg-offline__actions">
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
          <details className="lg-offline__preview">
            <summary>{r.preview}</summary>
            <pre>{prepared.body}</pre>
          </details>
          <p className="lg-offline__note">{r.note.replace("{email}", email)}</p>
          <button type="button" className="lg-link-btn" onClick={() => setPrepared(null)}>
            {r.edit}
          </button>
        </section>
      )}
    </>
  );
}
