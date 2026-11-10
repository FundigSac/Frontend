"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import "./form-error-summary.css";

/**
 * Resumen de errores al enviar (X11-3). El formulario sigue usando la validación nativa (required, pattern, type…), pero
 * en lugar de la burbuja del navegador sobre un solo campo, al intentar enviar se listan arriba todos los campos por
 * corregir, cada uno enlazado a su campo, y el foco pasa al resumen. Los campos quedan con aria-invalid hasta que se
 * corrigen. Patrón de GOV.UK Design System («Error summary»).
 */
export type FieldIssue = { id: string; label: string; message: string };
type Lang = "es" | "en";
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const COPY = {
  es: {
    title: (n: number) => (n === 1 ? "Revisa 1 campo antes de enviar" : `Revisa ${n} campos antes de enviar`),
    required: "Completa este campo.",
    choose: "Elige una opción.",
    check: "Marca esta casilla para continuar.",
    email: "Escribe un correo válido, por ejemplo nombre@empresa.com.",
    pattern: "Revisa el formato.",
    tooShort: (n: number) => `Escribe al menos ${n} caracteres.`,
    tooLong: (n: number) => `Usa como máximo ${n} caracteres.`,
    max: "La fecha no puede ser posterior a hoy.",
    min: "El valor es menor que el permitido.",
    invalid: "Revisa este dato.",
  },
  en: {
    title: (n: number) => (n === 1 ? "Check 1 field before sending" : `Check ${n} fields before sending`),
    required: "Fill in this field.",
    choose: "Choose an option.",
    check: "Tick this box to continue.",
    email: "Enter a valid email, for example name@company.com.",
    pattern: "Check the format.",
    tooShort: (n: number) => `Enter at least ${n} characters.`,
    tooLong: (n: number) => `Use at most ${n} characters.`,
    max: "The date cannot be later than today.",
    min: "The value is lower than allowed.",
    invalid: "Check this value.",
  },
} as const;

const isControl = (el: Element): el is Control => el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
const clean = (text: string | null | undefined) => (text ?? "").replace(/\s*\*\s*/g, " ").replace(/\s+/g, " ").trim();

function labelOf(el: Control): string {
  if (el instanceof HTMLInputElement && el.type === "radio") {
    const group = el.closest("fieldset")?.querySelector("legend")?.textContent ?? el.closest("[role='radiogroup']")?.getAttribute("aria-label");
    if (group) return clean(group).replace(/^\d+\s+/, "");
  }
  const label = el.labels?.[0];
  if (label) {
    // Sin el texto de los enlaces internos (p. ej. «política de privacidad») si la etiqueta es larga.
    const text = clean(label.textContent);
    return text.length > 90 ? text.slice(0, 87).trimEnd() + "…" : text;
  }
  return clean(el.getAttribute("aria-label")) || el.name;
}

/** Mensaje propio según el tipo de error: el del navegador cambia de idioma con el sistema y no con el sitio. */
export function messageFor(el: Control, lang: Lang): string {
  const t = COPY[lang];
  const v = el.validity;
  if (v.customError) return el.validationMessage;
  if (v.valueMissing) {
    if (el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && el.type === "radio")) return t.choose;
    if (el instanceof HTMLInputElement && el.type === "checkbox") return t.check;
    return t.required;
  }
  if (v.typeMismatch && el instanceof HTMLInputElement && el.type === "email") return t.email;
  if (v.patternMismatch) return clean(el.getAttribute("title")) || t.pattern;
  if (v.tooShort && "minLength" in el) return t.tooShort(el.minLength);
  if (v.tooLong && "maxLength" in el) return t.tooLong(el.maxLength);
  if (v.rangeOverflow) return t.max;
  if (v.rangeUnderflow) return t.min;
  return t.invalid;
}

/** Campos inválidos del formulario, uno por grupo de radios, en orden de aparición. */
export function collectIssues(form: HTMLFormElement, lang: Lang): FieldIssue[] {
  const seen = new Set<string>();
  const issues: FieldIssue[] = [];
  for (const el of Array.from(form.elements)) {
    if (!isControl(el) || !el.willValidate || el.validity.valid) continue;
    if (el.closest("[aria-hidden='true']")) continue;
    const key = el instanceof HTMLInputElement && el.type === "radio" ? `radio:${el.name}` : el.id || el.name;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!el.id) el.id = `${form.id || "form"}-${el.name || issues.length}`;
    issues.push({ id: el.id, label: labelOf(el), message: messageFor(el, lang) });
  }
  return issues;
}

/**
 * Se engancha con `onInvalidCapture` en el <form>: el navegador avisa de cada campo inválido al intentar enviar; se
 * evita su burbuja, se arma la lista y se mueve el foco al resumen. `clear()` se llama al enviar con éxito.
 */
export function useFormErrorSummary(lang: Lang) {
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [version, setVersion] = useState(0);
  const pending = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const onInvalidCapture = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const target = event.target;
      if (isControl(target as Element)) (target as Control).setAttribute("aria-invalid", "true");
      if (pending.current) return;
      pending.current = true;
      // Todos los `invalid` de un mismo intento llegan seguidos: se agrupan en una sola actualización.
      window.setTimeout(() => {
        pending.current = false;
        const next = collectIssues(form, lang);
        for (const issue of next) {
          const el = form.ownerDocument.getElementById(issue.id);
          el?.setAttribute("aria-invalid", "true");
          el?.addEventListener("input", () => el.removeAttribute("aria-invalid"), { once: true });
          el?.addEventListener("change", () => el.removeAttribute("aria-invalid"), { once: true });
        }
        setIssues(next);
        setVersion((n) => n + 1);
      }, 0);
    },
    [lang],
  );

  useEffect(() => {
    if (!version || !issues.length) return;
    summaryRef.current?.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    summaryRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [version, issues.length]);

  const clear = useCallback(() => setIssues([]), []);
  return { issues, onInvalidCapture, clear, summaryRef };
}

export function FormErrorSummary({ issues, lang, summaryRef, className = "" }: { issues: readonly FieldIssue[]; lang: Lang; summaryRef: RefObject<HTMLDivElement | null>; className?: string }) {
  if (!issues.length) return null;
  const t = COPY[lang];
  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  };
  return (
    <div ref={summaryRef} className={`fes ${className}`} tabIndex={-1} role="group" aria-labelledby="fes-title" data-error-summary>
      <h2 id="fes-title" className="fes__title">
        <AlertCircle aria-hidden="true" size={20} strokeWidth={2} /> {t.title(issues.length)}
      </h2>
      <ul className="fes__list">
        {issues.map((issue) => (
          <li key={issue.id}>
            <a href={`#${issue.id}`} onClick={(event) => go(event, issue.id)}>
              <strong>{issue.label}:</strong> {issue.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
