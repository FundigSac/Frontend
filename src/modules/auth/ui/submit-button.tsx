"use client";

import { BTN_PRIMARY } from "./styles";

/** Botón de envío: deshabilitado mientras `pending` (sin dobles envíos) y con spinner accesible. */
export function SubmitButton({
  pending,
  children,
  pendingLabel = "Procesando…",
  className = BTN_PRIMARY,
  disabled = false,
  disabledLabel,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  /** Deshabilitado sin spinner (p. ej. enfriamiento entre reenvíos). */
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const off = pending || disabled;
  return (
    <button type="submit" disabled={off} aria-disabled={off} className={className}>
      {pending ? (
        <>
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">
            progress_activity
          </span>
          <span>{pendingLabel}</span>
        </>
      ) : disabled && disabledLabel ? (
        disabledLabel
      ) : (
        children
      )}
    </button>
  );
}
