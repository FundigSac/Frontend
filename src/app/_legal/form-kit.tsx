"use client";

import { CircleAlert, Loader2 } from "lucide-react";
import { cloneElement, createContext, useCallback, useContext, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { FormErrorCopy } from "./sheet-copy";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type FormProblem = { id: string; label: string; message: string };

const ErrorsContext = createContext<Record<string, string>>({});

const isControl = (target: EventTarget | Element): target is Control =>
  target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;

function messageFor(el: Control, copy: FormErrorCopy): string {
  const v = el.validity;
  if (v.valueMissing) return el instanceof HTMLInputElement && el.type === "checkbox" ? copy.accept : copy.required;
  if (v.typeMismatch && el.type === "email") return copy.email;
  if (v.tooShort && !(el instanceof HTMLSelectElement)) return copy.short.replace("{n}", String(el.minLength));
  if (v.rangeOverflow) return copy.date;
  if (v.patternMismatch) return el.title || copy.format;
  return el.validationMessage || copy.format;
}

function labelFor(el: Control): string {
  const text = el.dataset.errorLabel ?? el.labels?.[0]?.textContent ?? el.name;
  return text.replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Validación de formularios: cada campo se comprueba al salir de él y, al enviar con errores, aparece un resumen
 * arriba con enlaces y el foco va a ese resumen. Solo se usan las reglas nativas del propio campo (`required`,
 * `pattern`, `minLength`...), así que las reglas siguen en el marcado.
 */
export function useFormErrors(copy: FormErrorCopy) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<readonly FormProblem[]>([]);
  const current = useRef<Record<string, string>>({});
  const dirty = useRef(new Set<string>());
  const summaryRef = useRef<HTMLDivElement>(null);

  const commit = useCallback((next: Record<string, string>) => {
    current.current = next;
    setErrors(next);
  }, []);

  const check = useCallback((el: Control) => {
    if (!el.id) return;
    const message = el.validity.valid ? "" : messageFor(el, copy);
    if ((current.current[el.id] ?? "") === message) return;
    const next = { ...current.current };
    if (message) next[el.id] = message;
    else delete next[el.id];
    commit(next);
  }, [copy, commit]);

  const onBlur = useCallback((event: React.FocusEvent<HTMLFormElement>) => {
    const el = event.target;
    if (!isControl(el) || el.type === "radio") return;
    // Pasar por un campo vacío sin escribir no es un error todavía: se avisa al enviar.
    const untouched = !dirty.current.has(el.id) && (el.type === "checkbox" || !el.value);
    if (!untouched) check(el);
  }, [check]);

  const onInput = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const el = event.target;
    if (!isControl(el)) return;
    dirty.current.add(el.id);
    // El error se retira en cuanto el dato ya es válido. Sin error previo no hay nada que actualizar al teclear.
    if (current.current[el.id]) check(el);
  }, [check]);

  /** Valida todo el formulario. Devuelve `true` si puede enviarse. */
  const validate = useCallback((form: HTMLFormElement) => {
    const invalid = Array.from(form.elements).filter((el): el is Control => isControl(el) && el.willValidate && !el.validity.valid && Boolean(el.id));
    const next: Record<string, string> = {};
    const items: FormProblem[] = [];
    for (const el of invalid) {
      const message = messageFor(el, copy);
      next[el.id] = message;
      items.push({ id: el.id, label: labelFor(el), message });
    }
    commit(next);
    setSummary(items);
    if (items.length) {
      window.requestAnimationFrame(() => {
        const summaryBox = summaryRef.current;
        summaryBox?.focus({ preventScroll: true });
        summaryBox?.scrollIntoView({ block: "start" });
      });
    }
    return items.length === 0;
  }, [copy, commit]);

  const clear = useCallback(() => {
    dirty.current.clear();
    commit({});
    setSummary([]);
  }, [commit]);

  /** Olvida los campos que dejan de existir (por ejemplo, los del representante al desmarcar la casilla). */
  const forget = useCallback((ids: readonly string[]) => {
    const next = { ...current.current };
    for (const id of ids) delete next[id];
    commit(next);
  }, [commit]);

  const problems = summary.filter((p) => errors[p.id]).map((p) => ({ ...p, message: errors[p.id] }));

  return { errors, problems, summaryRef, onBlur, onInput, validate, clear, forget };
}

export function ErrorsProvider({ errors, children }: { errors: Record<string, string>; children: ReactNode }) {
  return <ErrorsContext value={errors}>{children}</ErrorsContext>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="ls-error mo-pop" id={id}>
      <CircleAlert aria-hidden="true" size={16} strokeWidth={2} /> {message}
    </span>
  );
}

type ControlProps = { "aria-invalid"?: boolean; "aria-describedby"?: string };

/** Campo con rótulo visible arriba, ayuda opcional y error debajo, con icono y texto. */
export function Field({ id, label, required, full, hint, counter, children }: {
  id: string;
  label: ReactNode;
  required?: boolean;
  full?: boolean;
  hint?: ReactNode;
  counter?: ReactNode;
  children: ReactElement<ControlProps>;
}) {
  const error = useContext(ErrorsContext)[id];
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`ls-field${full ? " ls-field--full" : ""}${error ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {cloneElement(children, { "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint || counter ? (
        <span className="ls-field__meta">
          {hint ? <span id={`${id}-hint`}>{hint}</span> : <span />}
          {counter ?? null}
        </span>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Casilla obligatoria (declaraciones): el error va debajo, igual que en los demás campos. */
export function CheckField({ id, name, value, errorLabel, children }: { id: string; name: string; value?: string; errorLabel: string; children: ReactNode }) {
  const error = useContext(ErrorsContext)[id];
  return (
    <div className={`ls-consent${error ? " is-invalid" : ""}`}>
      <label>
        <input id={id} type="checkbox" name={name} value={value} required data-error-label={errorLabel} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
        <span>{children}</span>
      </label>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Resumen de errores: recibe el foco al enviar y enlaza a cada campo. */
export function ErrorSummary({ problems, copy, summaryRef }: { problems: readonly FormProblem[]; copy: FormErrorCopy; summaryRef: React.Ref<HTMLDivElement> }) {
  if (!problems.length) return null;
  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.focus();
  };
  return (
    <div className="ls-errors" role="alert" tabIndex={-1} ref={summaryRef}>
      <strong>
        <CircleAlert aria-hidden="true" size={18} strokeWidth={2} />{" "}
        {problems.length === 1 ? copy.one : copy.many.replace("{n}", String(problems.length))}
      </strong>
      <ul>
        {problems.map((p) => (
          <li key={p.id}>
            <a href={`#${p.id}`} onClick={(e) => go(e, p.id)}>{p.label}</a>: {p.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Botón de envío: mantiene su ancho al cambiar al estado "enviando" porque ambos textos ocupan la misma celda. */
export function SubmitButton({ sending, idle, pending }: { sending: boolean; idle: ReactNode; pending: string }) {
  return (
    <button type="submit" className="lp-btn lp-btn--solid lp-btn--lg ls-submit" disabled={sending} aria-busy={sending || undefined}>
      <span data-hidden={sending || undefined}>{idle}</span>
      <span data-hidden={sending ? undefined : true}>
        <Loader2 className="mo-spin" aria-hidden="true" size={18} strokeWidth={2} /> {pending}
      </span>
    </button>
  );
}
