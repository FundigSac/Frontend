"use client";

import Link from "next/link";
import { Cookie, Lock, MapPinned, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { expiresAt, type ConsentSource } from "@/modules/consent/consent";
import { isGpcEnabled, saveConsent, useConsent } from "@/modules/consent/store";
import { OPEN_COOKIE_PREFS_EVENT } from "./cookie-events";
import { useLang } from "./landing-prefs";
import "./cookie-banner.css";

const COPY = {
  es: {
    title: "Tu privacidad importa",
    text: "Guardamos solo lo necesario para que el sitio funcione (tu idioma, tema y cotización). El contenido de terceros, como el mapa de Google Maps, únicamente se carga si lo autorizas. Puedes aceptar, rechazar o configurar.",
    policy: "Política de cookies",
    acceptAll: "Aceptar todas",
    rejectAll: "Rechazar todas",
    customize: "Configurar",
    label: "Aviso de cookies",
    prefsTitle: "Preferencias de cookies",
    prefsIntro: "Elige qué permites. Rechazar es tan fácil como aceptar y puedes cambiar tu decisión cuando quieras desde “Preferencias de cookies”, al pie de la página.",
    save: "Guardar preferencias",
    close: "Cerrar",
    always: "Siempre activas",
    on: "Activadas",
    off: "Desactivadas",
    categories: {
      necessary: { title: "Necesarias", text: "Recuerdan tu elección de cookies, tu idioma y tema, los productos de tu cotización y la conversación con el asistente. No se pueden desactivar." },
      thirdParty: { title: "Contenido de terceros", text: "Muestra el mapa de Google Maps. Google puede instalar sus propias cookies y recibir tu dirección IP. Desactivado, verás un botón para cargarlo cuando quieras." },
    },
    gpc: "Tu navegador envía la señal Global Privacy Control: no activamos nada opcional hasta que tú lo autorices.",
    saved: "Decisión guardada el",
    until: "Vale hasta el",
  },
  en: {
    title: "Your privacy matters",
    text: "We only store what the site needs to work (your language, theme and quote). Third-party content, such as the Google Maps map, only loads if you allow it. You can accept, reject or customize.",
    policy: "Cookie policy",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    label: "Cookie notice",
    prefsTitle: "Cookie preferences",
    prefsIntro: "Choose what you allow. Rejecting is as easy as accepting and you can change your decision at any time from “Cookie preferences” at the bottom of the page.",
    save: "Save preferences",
    close: "Close",
    always: "Always on",
    on: "On",
    off: "Off",
    categories: {
      necessary: { title: "Necessary", text: "They remember your cookie choice, your language and theme, the products in your quote and your conversation with the assistant. They cannot be turned off." },
      thirdParty: { title: "Third-party content", text: "It shows the Google Maps map. Google may set its own cookies and receive your IP address. Turned off, you will see a button to load it whenever you want." },
    },
    gpc: "Your browser sends the Global Privacy Control signal: we do not enable anything optional until you allow it.",
    saved: "Decision saved on",
    until: "Valid until",
  },
} as const;

function Switch({ checked, onChange, label, labelledBy }: { checked: boolean; onChange: (v: boolean) => void; label: string; labelledBy: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} className={`ck-switch${checked ? " is-on" : ""}`} onClick={() => onChange(!checked)}>
      <span className="ck-switch__knob" aria-hidden="true" />
      <span className="ck-sr">{label}</span>
    </button>
  );
}

export function CookieBanner() {
  const [lang] = useLang();
  const consent = useConsent();
  const t = COPY[lang];
  const [mounted, setMounted] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [gpc, setGpc] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const uid = useId();

  useEffect(() => {
    // Espera a la hidratación: así quien ya decidió nunca ve parpadear el aviso.
    const id = window.requestAnimationFrame(() => {
      setMounted(true);
      setGpc(isGpcEnabled());
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const openPrefs = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setThirdParty(consent?.thirdParty ?? false);
    setPrefsOpen(true);
  }, [consent]);

  // Reabrir las preferencias desde el pie de página.
  useEffect(() => {
    window.addEventListener(OPEN_COOKIE_PREFS_EVENT, openPrefs);
    return () => window.removeEventListener(OPEN_COOKIE_PREFS_EVENT, openPrefs);
  }, [openPrefs]);

  // <dialog> modal: atrapa el foco, inertiza el fondo y cierra con Escape.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (prefsOpen && !d.open) {
      d.showModal();
      document.documentElement.classList.add("ck-lock");
    }
    if (!prefsOpen && d.open) d.close();
    return () => document.documentElement.classList.remove("ck-lock");
  }, [prefsOpen]);

  const closePrefs = useCallback(() => {
    setPrefsOpen(false);
    document.documentElement.classList.remove("ck-lock");
    window.setTimeout(() => returnFocus.current?.focus?.(), 0);
  }, []);

  const decide = (choices: { thirdParty: boolean }, source: ConsentSource) => {
    saveConsent(choices, source);
    closePrefs();
  };
  const dateFmt = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-PE", { day: "numeric", month: "long", year: "numeric" });

  const showBanner = mounted && !consent && !prefsOpen;

  return (
    <>
      {showBanner && (
        <section className="ck" role="region" aria-label={t.label}>
          <div className="ck__icon" aria-hidden="true">
            <Cookie size={22} strokeWidth={1.7} />
          </div>
          <div className="ck__body">
            <h2>
              {t.title} <ShieldCheck aria-hidden="true" size={16} strokeWidth={2} />
            </h2>
            <p>
              {t.text} <Link href="/cookies">{t.policy}</Link>
            </p>
          </div>
          <div className="ck__actions">
            <button type="button" className="ck__btn ck__btn--accept" onClick={() => decide({ thirdParty: true }, "banner")}>
              {t.acceptAll}
            </button>
            <button type="button" className="ck__btn ck__btn--reject" onClick={() => decide({ thirdParty: false }, "banner")}>
              {t.rejectAll}
            </button>
            <button type="button" className="ck__btn ck__btn--outline" onClick={openPrefs}>
              {t.customize}
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        className="ck-dialog"
        aria-labelledby={`${uid}-title`}
        onCancel={(e) => {
          e.preventDefault();
          closePrefs();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePrefs();
        }}
      >
        {prefsOpen && (
          <div className="ck-dialog__panel">
            <header className="ck-dialog__head">
              <span className="ck__icon" aria-hidden="true">
                <Cookie size={20} strokeWidth={1.7} />
              </span>
              <h2 id={`${uid}-title`}>{t.prefsTitle}</h2>
              <button type="button" className="ck-dialog__close" onClick={closePrefs} aria-label={t.close}>
                <X aria-hidden="true" size={18} strokeWidth={2} />
              </button>
            </header>
            <p className="ck-dialog__intro">
              {t.prefsIntro} <Link href="/cookies" onClick={closePrefs}>{t.policy}</Link>
            </p>

            <ul className="ck-cats">
              <li className="ck-cat">
                <span className="ck-cat__icon" aria-hidden="true"><Lock size={18} strokeWidth={1.8} /></span>
                <div className="ck-cat__text">
                  <strong id={`${uid}-n`}>{t.categories.necessary.title}</strong>
                  <p>{t.categories.necessary.text}</p>
                </div>
                <span className="ck-cat__fixed">{t.always}</span>
              </li>
              <li className="ck-cat">
                <span className="ck-cat__icon" aria-hidden="true"><MapPinned size={18} strokeWidth={1.8} /></span>
                <div className="ck-cat__text">
                  <strong id={`${uid}-t`}>{t.categories.thirdParty.title}</strong>
                  <p>{t.categories.thirdParty.text}</p>
                </div>
                <Switch checked={thirdParty} onChange={setThirdParty} labelledBy={`${uid}-t`} label={thirdParty ? t.on : t.off} />
              </li>
            </ul>

            {gpc && <p className="ck-dialog__note">{t.gpc}</p>}
            {consent && (
              <p className="ck-dialog__note">
                {t.saved} {dateFmt.format(new Date(consent.savedAt))}. {t.until} {dateFmt.format(expiresAt(consent))}.
              </p>
            )}

            <footer className="ck-dialog__actions">
              <button type="button" className="ck__btn ck__btn--reject" onClick={() => decide({ thirdParty: false }, "preferences")}>
                {t.rejectAll}
              </button>
              <button type="button" className="ck__btn ck__btn--outline" onClick={() => decide({ thirdParty }, "preferences")}>
                {t.save}
              </button>
              <button type="button" className="ck__btn ck__btn--accept" onClick={() => decide({ thirdParty: true }, "preferences")}>
                {t.acceptAll}
              </button>
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}
