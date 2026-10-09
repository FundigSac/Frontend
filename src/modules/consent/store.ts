"use client";

import { useSyncExternalStore } from "react";
import {
  CONSENT_COOKIE,
  buildConsentCookie,
  createRecord,
  isCategoryAllowed,
  readConsentFromCookieString,
  type ConsentChoices,
  type ConsentRecord,
  type OptionalCategory,
} from "./consent";

const EVENT = "fundigsac:consent";
const listeners = new Set<() => void>();

// useSyncExternalStore exige un snapshot estable: se cachea por el valor crudo de la cookie.
let cachedRaw: string | null = null;
let cachedRecord: ConsentRecord | null = null;

function rawCookie(): string {
  return typeof document === "undefined" ? "" : document.cookie;
}

/** Preferencia guardada, o `null` si la persona aún no decidió (o estamos en el servidor). */
export function getConsent(): ConsentRecord | null {
  const raw = rawCookie();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecord = readConsentFromCookieString(raw);
  }
  return cachedRecord;
}

/** Atajo para condicionar herramientas opcionales: `if (hasConsent("performance")) { ... }`. */
export const hasConsent = (category: OptionalCategory): boolean => isCategoryAllowed(getConsent(), category);

/** Guarda la elección en la cookie propia `fundigsac-consent` y avisa a los suscriptores. */
export function saveConsent(choices: ConsentChoices): ConsentRecord {
  const record = createRecord(choices);
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = buildConsentCookie(record, { secure });
  cachedRaw = null;
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent<ConsentRecord>(EVENT, { detail: record }));
  return record;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener(EVENT, onChange);
  // Otra pestaña puede cambiar la cookie: se revalida al volver a enfocar.
  window.addEventListener("focus", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

/** Hook: registro guardado o `null` (en el servidor y en la hidratación siempre `null`). */
export function useConsent(): ConsentRecord | null {
  return useSyncExternalStore(subscribe, getConsent, () => null);
}

export { CONSENT_COOKIE };
