"use client";

import { useId, useState } from "react";
import { HINT, INPUT, LABEL } from "./styles";

type BaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Elemento al final de la etiqueta (p. ej. enlace "¿Olvidaste tu contraseña?"). */
  labelAside?: React.ReactNode;
};

/** Campo de texto accesible: label asociado, ayuda y error enlazados con aria-describedby. */
export function TextField({ name, label, error, hint, optional, labelAside, ...input }: BaseProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>
          {label}
          {optional ? <span className="font-normal text-text-muted"> (opcional)</span> : null}
        </label>
        {labelAside}
      </div>
      <input
        {...input}
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${INPUT} ${error ? "border-danger" : "border-border"}`}
      />
      {hint ? (
        <p id={hintId} className={`mt-1.5 ${HINT}`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 font-body-compact text-body-compact text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Contraseña con botón mostrar/ocultar accesible (aria-pressed + etiqueta que cambia). */
export function PasswordField(props: Omit<BaseProps, "type">) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const { name, label, error, hint, labelAside, optional, ...input } = props;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>
          {label}
          {optional ? <span className="font-normal text-text-muted"> (opcional)</span> : null}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          {...input}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${INPUT} pr-12 ${error ? "border-danger" : "border-border"}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {hint ? (
        <p id={hintId} className={`mt-1.5 ${HINT}`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 font-body-compact text-body-compact text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
