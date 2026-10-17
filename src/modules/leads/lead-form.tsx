"use client";

import { useRouter } from "next/navigation";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { mailtoUrl, whatsappUrl } from "@/app/_legal/claim-message";
import { site } from "@/lib/site-info";
import { cartSummary, useCart } from "@/modules/cart/cart-store";
import { PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { SITE } from "@/shared/config/site";
import { submitLead } from "./actions";
import { LEAD_FORMS, type LeadFormId } from "./forms";
import { buildLeadMessage, formEntries, type LeadMessage } from "./lead-message";

/** `offline`: datos válidos, pero aún no hay registro en línea; la solicitud queda lista para enviarse por correo o WhatsApp. */
type Status = "idle" | "pending" | "success" | "error" | "offline";
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
  const [state, setState] = useState<LeadState>({ status: "idle" });
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const cart = useCart();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (state.status === "pending") return; // evita dobles envíos
      const data = new FormData(form);
      setState({ status: "pending" });
      startTransition(async () => {
        const result = await submitLead(formId, data);
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
            router.push(`${confirmation}?ref=${encodeURIComponent(result.reference)}`);
            return;
          }
          setState({ status: "success", reference: result.reference });
          return;
        }
        setState({ status: "error", message: result.message });
        const first = Object.entries(result.fieldErrors ?? {})[0];
        if (first) {
          const el = form.elements.namedItem(first[0]);
          if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            el.setCustomValidity(first[1]);
            el.reportValidity();
            el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
          }
        }
      });
    },
    [cart, formId, router, state.status],
  );

  const value = useMemo(() => state, [state]);
  return (
    <LeadContext.Provider value={value}>
      <form {...rest} id={id} ref={formRef} onSubmit={onSubmit} aria-busy={state.status === "pending"}>
        {/* Honeypot: invisible para personas, atractivo para bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>
            No completar este campo
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

export function LeadSubmit({ idle, pending, success, successClassName, baseClassName, className, ...rest }: LeadSubmitProps) {
  const { status } = useLeadState();
  const ok = status === "success" && success;
  return (
    <button
      {...rest}
      type="submit"
      disabled={status === "pending"}
      className={`${ok && successClassName ? successClassName : (baseClassName ?? className ?? "")}${status === "pending" ? " opacity-80 cursor-wait" : ""}`}
    >
      {status === "pending" ? pending : ok ? success : idle}
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
        Tu solicitud está lista para enviar
      </h2>
      <p className="mt-2 max-w-2xl font-body-compact text-body-compact leading-relaxed text-text-secondary">
        El envío en línea aún no está conectado, así que todavía no se registró. Envíala por correo o WhatsApp: el mensaje ya incluye todos los datos del formulario.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={`${action} bg-primary text-on-primary hover:bg-primary-container hover:text-brand-on`} href={mailtoUrl(SITE.email, prepared.subject, prepared.body)}>
          <Mail aria-hidden="true" size={18} strokeWidth={1.8} /> Enviar por correo
        </a>
        <a className={`${action} border border-border bg-surface text-on-surface hover:bg-surface-container-low`} href={whatsappUrl(site.whatsappNumber, prepared.body)} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" size={18} strokeWidth={1.8} /> Enviar por WhatsApp
        </a>
        <button type="button" className={`${action} border border-border bg-surface text-on-surface hover:bg-surface-container-low`} onClick={copy}>
          {copied ? <Check aria-hidden="true" size={18} strokeWidth={1.8} /> : <Copy aria-hidden="true" size={18} strokeWidth={1.8} />}
          {copied ? "Texto copiado" : "Copiar texto"}
        </button>
      </div>
      <details className="mt-5 rounded-lg border border-border bg-surface-container-low">
        <summary className="cursor-pointer px-4 py-3 font-button-text text-button-text font-semibold text-on-surface">Ver el mensaje</summary>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words border-t border-border px-4 py-3 font-body-compact text-body-compact text-text-secondary">{prepared.body}</pre>
      </details>
      <p className="mt-4 font-ui-label text-ui-label leading-relaxed text-text-muted">
        Correo de destino: {SITE.email}. Si cambias algún dato, vuelve a enviar el formulario para actualizar el mensaje.
      </p>
    </section>
  );
}
