"use client";

import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { LeadSubmit, useLeadState } from "@/modules/leads/lead-form";

/** Mensajes de error por campo: qué pasó y qué hacer. La validez la sigue decidiendo el navegador (`required`, `pattern`, `type`). */
export type FieldRules = Record<string, { required: string; invalid?: string }>;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isControl = (target: EventTarget | null): target is Control =>
  target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;

function messageFor(el: Control, rules: FieldRules): string | null {
  if (el.validity.valid) return null;
  if (el.validity.customError) return el.validationMessage;
  const rule = rules[el.name];
  if (!rule) return null;
  return el.validity.valueMissing ? rule.required : (rule.invalid ?? rule.required);
}

const labelOf = (el: Control) => (el.labels?.[0]?.textContent ?? el.name).replace(/\s*\(.*\)\s*$/, "").trim();

const ErrorsContext = createContext<Record<string, string>>({});

type SummaryItem = { id: string; label: string };

/**
 * Valida al salir de cada campo y, al enviar con errores, muestra un resumen con enlaces y deja el foco en él.
 * Va por captura para frenar el envío antes de que `LeadForm` lo procese, sin tocar su lógica.
 */
export function useFormErrors(rules: FieldRules) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);
  const touched = useRef(new Set<string>());

  useEffect(() => {
    if (summary.length) summaryRef.current?.focus();
  }, [summary]);

  const form = useMemo(() => {
    const setOne = (name: string, message: string | null) =>
      setErrors((prev) => {
        if ((prev[name] ?? null) === message) return prev;
        const next = { ...prev };
        if (message) next[name] = message;
        else delete next[name];
        return next;
      });

    return {
      noValidate: true,
      onInputCapture(event: FormEvent<HTMLFormElement>) {
        if (!isControl(event.target) || !rules[event.target.name]) return;
        const el = event.target;
        touched.current.add(el.name);
        // Mientras se corrige, el error se actualiza; un campo sin error no se juzga hasta salir de él.
        setErrors((prev) => {
          if (!prev[el.name]) return prev;
          const message = messageFor(el, rules);
          if (message === prev[el.name]) return prev;
          const next = { ...prev };
          if (message) next[el.name] = message;
          else delete next[el.name];
          return next;
        });
      },
      onBlurCapture(event: FormEvent<HTMLFormElement>) {
        if (!isControl(event.target) || !rules[event.target.name]) return;
        const el = event.target;
        // Pasar por un campo vacío con el tabulador no es un error todavía.
        if (el.type !== "checkbox" && !el.value.trim() && !touched.current.has(el.name)) return;
        if (el.type === "checkbox" && !touched.current.has(el.name)) return;
        setOne(el.name, messageFor(el, rules));
      },
      onSubmitCapture(event: FormEvent<HTMLFormElement>) {
        const controls = Array.from(event.currentTarget.elements).filter(isControl).filter((el) => el.name && rules[el.name]);
        const invalid = controls.flatMap((el) => {
          const message = messageFor(el, rules);
          return message ? [{ el, message }] : [];
        });
        if (!invalid.length) {
          setErrors({});
          setSummary([]);
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setErrors(Object.fromEntries(invalid.map(({ el, message }) => [el.name, message])));
        setSummary(invalid.map(({ el }) => ({ id: el.id, label: labelOf(el) })));
      },
    };
  }, [rules]);

  return { errors, summary, summaryRef, form };
}

export function ErrorsProvider({ value, children }: { value: Record<string, string>; children: ReactNode }) {
  return <ErrorsContext.Provider value={value}>{children}</ErrorsContext.Provider>;
}

function goToField(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const field = document.getElementById(id);
  if (!field) return;
  event.preventDefault();
  field.focus({ preventScroll: true });
  field.scrollIntoView({ block: "center" });
}

export function ErrorSummary({ items, title, innerRef }: { items: SummaryItem[]; title: (n: number) => string; innerRef: React.RefObject<HTMLDivElement | null> }) {
  if (!items.length) return null;
  return (
    <div className="hj-errores" role="alert" tabIndex={-1} ref={innerRef}>
      <div className="hj-errores__titulo">
        <AlertCircle aria-hidden="true" size={18} />
        <span>{title(items.length)}</span>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} onClick={(e) => goToField(e, item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Common = { name: string; label: ReactNode; hint?: ReactNode; optional?: string; full?: boolean };

function FieldShell({ id, name, label, hint, optional, full, children }: Common & { id: string; children: (a11y: { "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode }) {
  const error = useContext(ErrorsContext)[name];
  const messageId = `${id}-msg`;
  return (
    <div className={`campo hj-campo${full ? " hj-campo--full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="hj-campo__opc"> ({optional})</span>}
      </label>
      {children({ "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? messageId : undefined })}
      {error ? (
        <div className="campo__error" id={messageId} role="alert">
          <AlertCircle aria-hidden="true" size={16} />
          <span>{error}</span>
        </div>
      ) : (
        hint && (
          <div className="hj-ayuda" id={messageId}>
            {hint}
          </div>
        )
      )}
    </div>
  );
}

export function QInput({ name, id = name, label, hint, optional, full, ...input }: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} optional={optional} full={full}>
      {(a11y) => <input id={id} name={name} {...input} {...a11y} />}
    </FieldShell>
  );
}

export function QSelect({ name, id = name, label, hint, optional, full, children, ...select }: Common & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} optional={optional} full={full}>
      {(a11y) => (
        <div className="hj-select">
          <select id={id} name={name} {...select} {...a11y}>
            {children}
          </select>
          <ChevronDown aria-hidden="true" size={18} />
        </div>
      )}
    </FieldShell>
  );
}

export function QTextarea({ name, id = name, label, hint, optional, full, ...area }: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} optional={optional} full={full}>
      {(a11y) => <textarea id={id} name={name} {...area} {...a11y} />}
    </FieldShell>
  );
}

export function QCheck({ name, id = name, children, required }: { name: string; id?: string; children: ReactNode; required?: boolean }) {
  const error = useContext(ErrorsContext)[name];
  const messageId = `${id}-msg`;
  return (
    <div>
      <label className="hj-acepta">
        <input id={id} name={name} type="checkbox" required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? messageId : undefined} />
        <span>{children}</span>
      </label>
      {error && (
        <div className="campo__error" id={messageId} role="alert">
          <AlertCircle aria-hidden="true" size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/** Botón de envío: indicador y texto mientras se envía; ocupa la columna, así que conserva su ancho. */
export function QuoteSubmit({ idle, pending }: { idle: string; pending: string }) {
  return (
    <LeadSubmit
      className="lp-btn lp-btn--solid hj-btn"
      idle={idle}
      pending={
        <>
          <Loader2 className="mo-spin" aria-hidden="true" size={18} />
          {pending}
        </>
      }
    />
  );
}

/** Error del servidor o de la conexión. Lo escrito no se borra. */
export function QuoteError() {
  const { status, message } = useLeadState();
  if (status !== "error") return null;
  return (
    <div className="hj-aviso" role="alert">
      <AlertCircle aria-hidden="true" size={18} />
      <span>{message}</span>
    </div>
  );
}

// ───────── Progreso del formulario ─────────

export type ProgressField = { name: string; display?: (value: string) => string };
type Progress = { values: Record<string, string>; ok: Record<string, boolean> };

const EMPTY_PROGRESS: Progress = { values: {}, ok: {} };

function readProgress(form: HTMLFormElement, names: string[]): Progress {
  const values: Record<string, string> = {};
  const ok: Record<string, boolean> = {};
  for (const name of names) {
    const el = form.elements.namedItem(name);
    if (!(el instanceof HTMLElement) || !isControl(el)) continue;
    const raw = el instanceof HTMLSelectElement && el.value ? (el.selectedOptions[0]?.textContent ?? "") : el.type === "checkbox" ? ((el as HTMLInputElement).checked ? "1" : "") : el.value;
    values[name] = raw.trim();
    ok[name] = el.validity.valid && Boolean(values[name]);
  }
  return { values, ok };
}

const sameProgress = (a: Progress, b: Progress) => JSON.stringify(a) === JSON.stringify(b);

/** Lee el formulario al escribir, sin volver a pintarlo: solo se actualizan el cajetín, los pasos y el aviso. */
export function useFormProgress(formId: string, names: string[], version = "") {
  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  const key = names.join("|");
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    const list = key.split("|");
    const read = () => {
      const next = readProgress(form, list);
      setProgress((prev) => (sameProgress(prev, next) ? prev : next));
    };
    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
    };
  }, [formId, key, version]);
  return progress;
}

export type StepDef = { id: string; label: string; names: string[] };

export function FormSteps({ formId, steps, label, version }: { formId: string; steps: StepDef[]; label: string; version?: string }) {
  const { ok } = useFormProgress(formId, steps.flatMap((s) => s.names), version);
  return (
    <ol className="hj-pasos" aria-label={label} data-enter>
      {steps.map((step, i) => {
        const done = step.names.length > 0 && step.names.every((n) => ok[n]);
        return (
          <li key={step.id}>
            <a
              className="hj-paso"
              href={`#${step.id}`}
              data-done={done || undefined}
              onClick={(e) => {
                const target = document.getElementById(step.id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView();
              }}
            >
              <span className="hj-paso__n" aria-hidden="true">
                {done ? <Check className="mo-check" size={14} strokeWidth={2.4} /> : i + 1}
              </span>
              <span>{step.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Aviso de cuántos datos faltan: junto al botón y en el pie del cajetín. */
function missingText(missing: number, t: { missing: (n: number) => string; ready: string }) {
  return missing > 0 ? t.missing(missing) : t.ready;
}

export function MissingNote({ formId, names, version, labels, className = "" }: { formId: string; names: string[]; version?: string; labels: { missing: (n: number) => string; ready: string }; className?: string }) {
  const { ok } = useFormProgress(formId, names, version);
  const missing = names.filter((n) => !ok[n]).length;
  return (
    <div className={`hj-falta ${className}`} data-ready={missing === 0 || undefined} aria-live="polite">
      {missing === 0 && <Check aria-hidden="true" size={16} strokeWidth={2.4} />}
      <span>{missingText(missing, labels)}</span>
    </div>
  );
}

export type CajetinRow = { label: string; name?: string; value?: string; full?: boolean };

/** Resumen vivo con la forma del rótulo de una lámina: cada dato se llena a medida que se escribe. */
export function Cajetin({ formId, title, rows, names, emptyLabel, labels, version }: { formId: string; title: string; rows: CajetinRow[]; names: string[]; emptyLabel: string; labels: { missing: (n: number) => string; ready: string }; version?: string }) {
  const { values, ok } = useFormProgress(formId, names, version);
  const missing = names.filter((n) => !ok[n]).length;
  return (
    <section className="hj-cajetin" aria-label={title}>
      <h2 className="hj-cajetin__titulo on-dark">{title}</h2>
      <dl>
        {rows.map((row) => {
          const value = row.value ?? (row.name ? values[row.name] : "");
          return (
            <div key={row.label} className={row.full ? "hj-celda--full" : undefined}>
              <dt>{row.label}</dt>
              <dd data-empty={value ? undefined : ""}>{value || emptyLabel}</dd>
            </div>
          );
        })}
      </dl>
      <div className="hj-cajetin__pie">
        <div className="hj-falta" data-ready={missing === 0 || undefined}>
          {missing === 0 && <Check aria-hidden="true" size={16} strokeWidth={2.4} />}
          <span>{missingText(missing, labels)}</span>
        </div>
      </div>
    </section>
  );
}
