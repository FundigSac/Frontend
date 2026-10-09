"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useTransition } from "react";
import { submitLead } from "./actions";
import { LEAD_FORMS, type LeadFormId } from "./forms";

type Status = "idle" | "pending" | "success" | "error";
type LeadState = { status: Status; reference?: string; message?: string };
const LeadContext = createContext<LeadState>({ status: "idle" });
export const useLeadState = () => useContext(LeadContext);

type LeadFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "action" | "id"> & {
  formId: LeadFormId;
  id?: string;
};

/**
 * Formulario público con validación nativa + validación de servidor y persistencia real.
 * Los hijos (renderizados en servidor) acceden al estado con <LeadSubmit>, <LeadWhen>.
 */
export function LeadForm({ formId, id, children, ...rest }: LeadFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LeadState>({ status: "idle" });
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (state.status === "pending") return; // evita dobles envíos
      const data = new FormData(form);
      setState({ status: "pending" });
      startTransition(async () => {
        const result = await submitLead(formId, data);
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
    [formId, router, state.status],
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
