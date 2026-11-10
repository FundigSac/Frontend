"use client";

import { useRouter } from "next/navigation";
import { Check, Copy, LoaderCircle, Mail, MessageCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { mailtoUrl, whatsappUrl } from "@/app/_legal/claim-message";
import { site } from "@/lib/site-info";
import { newIdempotencyKey, submitForm } from "@/modules/backend/client";
import { PRIVACY_NOTICE_VERSION } from "@/modules/backend/legal";
import { cartSummary, clearCart, useCart, type CartItem } from "@/modules/cart/cart-store";
import { generalQuote, productQuote, withoutCatalogLinks, type QuoteBody } from "@/modules/quote/quote-request";
import { PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { track } from "@/shared/analytics/track";
import { SITE } from "@/shared/config/site";
import { useLang } from "@/shared/layout/landing-prefs";
import { FormErrorSummary, useFormErrorSummary } from "@/shared/ui/form-error-summary";
import { submitLead } from "./actions";
import { LEAD_FORMS, type LeadFormId } from "./forms";
import { LEAD_UI, localizeLeadMessage } from "./lead-copy";
import { buildLeadMessage, formEntries, type LeadMessage } from "./lead-message";
import type { LeadResult } from "./types";
import "./lead-submit.css";

/**
 * `offline`: datos válidos, pero aún no hay registro en línea; la solicitud queda lista para enviarse por correo o WhatsApp.
 * `sent`: el sistema registró el envío y se está abriendo la confirmación (el botón muestra «Enviado»).
 */
type Status = "idle" | "pending" | "sent" | "success" | "error" | "offline";
type LeadState = { status: Status; reference?: string; message?: string; prepared?: LeadMessage };
const LeadContext = createContext<LeadState>({ status: "idle" });
export const useLeadState = () => useContext(LeadContext);

type LeadFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "action" | "id"> & {
  formId: LeadFormId;
  id?: string;
};

/**
 * Formulario público con validación nativa + validación de servidor. Mientras no hay registro en línea, una solicitud
 * válida queda preparada para enviarse por correo o WhatsApp (<LeadOffline>), sin borrar lo escrito.
 * Los hijos (renderizados en servidor) acceden al estado con <LeadSubmit>, <LeadWhen>.
 */
export function LeadForm({ formId, id, children, ...rest }: LeadFormProps) {
  const router = useRouter();
  const [lang] = useLang();
  const ui = LEAD_UI[lang];
  const [state, setState] = useState<LeadState>({ status: "idle" });
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const cart = useCart();
  // Misma clave en los reintentos del mismo envío: la API devuelve el mismo folio en lugar de duplicarlo.
  const idempotencyKey = useRef(newIdempotencyKey());
  const summary = useFormErrorSummary(lang);
  const clearSummary = summary.clear;

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (state.status === "pending" || state.status === "sent") return; // evita dobles envíos
      clearSummary(); // el navegador solo deja llegar aquí un formulario válido
      const data = new FormData(form);
      setState({ status: "pending" });
      startTransition(async () => {
        // Si la acción del servidor falla (red, despliegue nuevo), se avisa sin perder lo escrito ni romper la página.
        const result = await submitLead(formId, data).catch((): LeadResult => ({ ok: false, message: ui.connectionError }));
        // Con Backend conectado, la cotización se registra de verdad y la confirmación muestra el folio real.
        if (result.ok && result.reference === PENDING_QUOTE_REFERENCE && (formId === "quote-general" || formId === "quote-product")) {
          const saved = await registerQuote(formId, data, cart, idempotencyKey.current);
          if (saved.kind === "saved") {
            // El Backend registró la cotización con folio: envío confirmado.
            track("contact_form_submit_success", { form_type: formId === "quote-product" ? "quote_product" : "quote_general" });
            if (formId === "quote-general" && cart.length) clearCart();
            idempotencyKey.current = newIdempotencyKey();
            setState({ status: "sent", reference: saved.folio });
            await showSent();
            router.push(`/cotizar/confirmacion?ref=${encodeURIComponent(saved.folio)}`);
            return;
          }
          if (saved.kind === "invalid" || saved.kind === "limited") {
            // El error real: el motivo general y, si la API lo detalla, qué datos rechazó.
            const details = saved.kind === "invalid" ? saved.messages.slice(0, 3).join(" ") : "";
            setState({ status: "error", message: saved.kind === "limited" ? ui.limited : [ui.invalid, details].filter(Boolean).join(" ") });
            return;
          }
        }
        // Sin registro en línea: no se borra nada ni se navega a una confirmación vacía; se prepara el mensaje.
        if (result.ok && result.reference === PENDING_QUOTE_REFERENCE) {
          const fromCart = formId === "quote-general" && cart.length ? cartSummary(cart, "es").replace(/^.*\n/, "PRODUCTOS DEL CARRITO\n") : undefined;
          setState({ status: "offline", prepared: buildLeadMessage("Solicitud de cotización", formEntries(form), fromCart) });
          return;
        }
        if (result.ok) {
          form.reset();
          const confirmation = LEAD_FORMS[formId].confirmation;
          if (confirmation) {
            setState({ status: "sent", reference: result.reference });
            await showSent();
            router.push(`${confirmation}?ref=${encodeURIComponent(result.reference)}`);
            return;
          }
          setState({ status: "success", reference: result.reference });
          return;
        }
        setState({ status: "error", message: localizeLeadMessage(lang, result.message) });
        const first = Object.entries(result.fieldErrors ?? {})[0];
        if (first) {
          const el = form.elements.namedItem(first[0]);
          if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            el.setCustomValidity(localizeLeadMessage(lang, first[1]));
            el.reportValidity();
            el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
          }
        }
      });
    },
    [cart, formId, router, state.status, lang, ui, clearSummary],
  );

  const value = useMemo(() => state, [state]);
  return (
    <LeadContext.Provider value={value}>
      <form {...rest} id={id} ref={formRef} onSubmit={onSubmit} onInvalidCapture={summary.onInvalidCapture} aria-busy={state.status === "pending"}>
        <FormErrorSummary issues={summary.issues} lang={lang} summaryRef={summary.summaryRef} />
        {/* Estado del envío para lectores de pantalla (B28-1); el error lo anuncia <LeadError> con role="alert". */}
        <p className="sr-only" role="status" aria-live="polite">{state.status === "pending" ? ui.sendingStatus : state.status === "sent" ? ui.sentStatus : ""}</p>
        {/* Honeypot: invisible para personas, atractivo para bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>
            {ui.honeypot}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {children}
        {state.status === "offline" && state.prepared && <LeadOffline prepared={state.prepared} />}
      </form>
    </LeadContext.Provider>
  );
}

type LeadSubmitProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  idle: React.ReactNode;
  pending: React.ReactNode;
  success?: React.ReactNode;
  /** Clases a quitar/añadir cuando el envío fue exitoso (Stitch pinta el botón en verde). */
  successClassName?: string;
  baseClassName?: string;
};

/**
 * Botón de envío con tres estados que se funden entre sí (B28-1): reposo → enviando (indicador giratorio) → «Enviado» con
 * check. Solo cambian opacidad y desplazamiento (~250 ms, sin rebote); con movimiento reducido el cambio es inmediato.
 * Las tres capas ocupan la misma celda, así el botón no cambia de tamaño. El nombre accesible es el de la capa visible.
 */
export function LeadSubmit({ idle, pending, success, successClassName, baseClassName, className, ...rest }: LeadSubmitProps) {
  const { status } = useLeadState();
  const [lang] = useLang();
  const done = status === "sent" || status === "success";
  const phase = status === "pending" ? "pending" : done ? "done" : "idle";
  const ok = done && success;
  return (
    <button
      {...rest}
      type="submit"
      disabled={status === "pending" || status === "sent"}
      data-submit-state={phase}
      className={`${ok && successClassName ? successClassName : (baseClassName ?? className ?? "")}${status === "pending" ? " cursor-wait" : ""}`}
    >
      <span className="lead-submit">
        <span className="lead-submit__layer" aria-hidden={phase !== "idle"}>{idle}</span>
        <span className="lead-submit__layer" aria-hidden={phase !== "pending"}>
          <LoaderCircle className="lead-submit__spin" aria-hidden="true" size={18} strokeWidth={2.2} /> {pending}
        </span>
        <span className="lead-submit__layer" aria-hidden={phase !== "done"}>
          <Check aria-hidden="true" size={18} strokeWidth={2.6} /> {success ?? LEAD_UI[lang].sent}
        </span>
      </span>
    </button>
  );
}

/** Muestra sus hijos (renderizados en servidor) sólo en el estado indicado. */
export function LeadWhen({ status, children }: { status: Status; children: React.ReactNode }) {
  const state = useLeadState();
  return state.status === status ? <>{children}</> : null;
}

/** Folio real asignado por el servidor (sólo tiene valor tras un envío exitoso). */
export function LeadReference({ className }: { className?: string }) {
  const { reference } = useLeadState();
  return reference ? <span className={className}>{reference}</span> : null;
}

/** Mensaje de error estándar (consistente con los tokens del sistema). */
export function LeadError({ className = "" }: { className?: string }) {
  const { status, message } = useLeadState();
  if (status !== "error") return null;
  return (
    <p role="alert" className={`flex items-start gap-2 rounded-lg border border-danger/30 bg-error-container/60 px-4 py-3 font-body-compact text-body-compact text-on-error-container ${className}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[18px] mt-0.5">error</span>
      <span>{message}</span>
    </p>
  );
}

/**
 * Solicitud lista para enviar mientras el registro en línea no está conectado: mismo patrón que Contacto y
 * Libro de reclamaciones. El formulario conserva lo escrito; si se corrige algo, se vuelve a preparar al reenviar.
 */
function LeadOffline({ prepared }: { prepared: LeadMessage }) {
  const [lang] = useLang();
  const ui = LEAD_UI[lang];
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [prepared]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prepared.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* sin portapapeles: el texto sigue visible en la vista previa */
    }
  };

  const action = "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 font-button-text text-button-text font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none";
  return (
    <section aria-labelledby="lead-offline-title" className="rounded-xl border border-primary/30 bg-surface-elevated p-5 shadow-sm sm:p-7">
      <h2 id="lead-offline-title" ref={headingRef} tabIndex={-1} className="font-headline-card text-headline-card font-semibold text-on-surface outline-none">
        {ui.readyTitle}
      </h2>
      <p className="mt-2 max-w-2xl font-body-compact text-body-compact leading-relaxed text-text-secondary">
        {ui.readyText}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={`${action} bg-primary text-on-primary hover:bg-primary-container hover:text-brand-on`} href={mailtoUrl(SITE.email, prepared.subject, prepared.body)}>
          <Mail aria-hidden="true" size={18} strokeWidth={1.8} /> {ui.byEmail}
        </a>
        <a className={`${action} border border-border bg-surface text-on-surface hover:bg-surface-container-low`} href={whatsappUrl(site.whatsappNumber, prepared.body)} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" size={18} strokeWidth={1.8} /> {ui.byWhatsapp}
        </a>
        <button type="button" className={`${action} border border-border bg-surface text-on-surface hover:bg-surface-container-low`} onClick={copy}>
          {copied ? <Check aria-hidden="true" size={18} strokeWidth={1.8} /> : <Copy aria-hidden="true" size={18} strokeWidth={1.8} />}
          {copied ? ui.copied : ui.copy}
        </button>
      </div>
      <details className="mt-5 rounded-lg border border-border bg-surface-container-low">
        <summary className="cursor-pointer px-4 py-3 font-button-text text-button-text font-semibold text-on-surface">{ui.viewMessage}</summary>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words border-t border-border px-4 py-3 font-body-compact text-body-compact text-text-secondary">{prepared.body}</pre>
      </details>
      <p className="mt-4 font-ui-label text-ui-label leading-relaxed text-text-muted">
        {ui.destination} {SITE.email}. {ui.resend}
      </p>
    </section>
  );
}

/** Deja ver «Enviado» un momento antes de abrir la confirmación (sin espera con movimiento reducido: el estado ya se anunció). */
function showSent(): Promise<void> {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return new Promise((resolve) => window.setTimeout(resolve, reduce ? 0 : 600));
}

type QuoteOutcome = { kind: "saved"; folio: string } | { kind: "offline" } | { kind: "invalid"; messages: string[] } | { kind: "limited" };

/**
 * Registra la cotización en el Backend. Si la API no reconoce un producto o medida del catálogo del sitio, se reenvía
 * como texto libre (con otra clave de idempotencia, porque el cuerpo cambia).
 */
async function registerQuote(formId: "quote-general" | "quote-product", data: FormData, cart: CartItem[], key: string): Promise<QuoteOutcome> {
  const body: QuoteBody = formId === "quote-general" ? generalQuote(data, cart, PRIVACY_NOTICE_VERSION) : productQuote(data, PRIVACY_NOTICE_VERSION);
  let outcome = await submitForm<{ folio: string }>("quote", body, key);
  if (outcome.kind === "invalid" && outcome.errors.some((e) => e.code === "UNKNOWN_PRODUCT" || e.code === "UNKNOWN_VARIANT")) {
    outcome = await submitForm<{ folio: string }>("quote", withoutCatalogLinks(body), `${key}-libre`);
  }
  if (outcome.kind === "saved") return { kind: "saved", folio: outcome.data.folio };
  if (outcome.kind === "invalid") return { kind: "invalid", messages: outcome.errors.map((e) => e.message ?? "").filter(Boolean) };
  return { kind: outcome.kind };
}
