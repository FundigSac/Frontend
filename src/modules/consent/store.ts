"use client";

import { useSyncExternalStore } from "react";
import { submitForm } from "@/modules/backend/client";
import {
  CONSENT_COOKIE,
  buildConsentCookie,
  createRecord,
  isCategoryAllowed,
  readConsentFromCookieString,
  type ConsentChoices,
  type ConsentRecord,
  type ConsentSource,
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

/** Atajo para condicionar herramientas opcionales: `if (hasConsent("thirdParty")) { ... }`. */
export const hasConsent = (category: OptionalCategory): boolean => isCategoryAllowed(getConsent(), category);

/** Guarda la elección en la cookie propia `fundigsac-consent` y avisa a los suscriptores. */
export function saveConsent(choices: ConsentChoices, source: ConsentSource = "banner"): ConsentRecord {
  const record = createRecord(choices, source);
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = buildConsentCookie(record, { secure });
  cachedRaw = null;
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent<ConsentRecord>(EVENT, { detail: record }));
  // Con Backend, cada decisión queda además registrada como evidencia (fecha, versión de la política, origen y
  // elecciones), sin identificador del navegador. Si no hay Backend, la cookie sigue siendo la constancia.
  void submitForm("consent", {
    choices: { necessary: true, thirdParty: record.thirdParty },
    policyVersion: record.policy,
    source: record.source.toUpperCase(),
  });
  return record;
}

/** ¿El navegador envía la señal Global Privacy Control? Si es así, nada opcional se activa sin una acción expresa. */
export function isGpcEnabled(): boolean {
  return typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
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
