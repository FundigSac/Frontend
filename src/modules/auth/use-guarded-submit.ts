"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Evita dobles envíos: un ref bloquea reentradas síncronas (clic doble) y `pending` refleja el estado en la UI
 * (aria-busy / botón deshabilitado).
 */
export function useGuardedSubmit() {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const run = useCallback(async (task: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      await task();
    } finally {
      lock.current = false;
      setPending(false);
    }
  }, []);
  return { pending, run };
}

/** Enfoca el primer campo con error tras renderizar (accesibilidad de teclado/lector de pantalla). */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  if (!form) return;
  requestAnimationFrame(() => {
    const el = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  });
}
