"use client";

import Link from "next/link";
import { BarChart3, Cookie, Lock, Palette, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { saveConsent, useConsent } from "@/modules/consent/store";
import { OPEN_COOKIE_PREFS_EVENT } from "./cookie-events";
import { useLang } from "./landing-prefs";
import "./cookie-banner.css";

const COPY = {
  es: {
    title: "Tu privacidad importa",
    text: "Usamos cookies necesarias para que el sitio funcione y recuerde tu sesión. Las opcionales (rendimiento y personalización) solo se activan si tú lo autorizas. Puedes aceptarlas, rechazarlas o elegir cuáles.",
    policy: "Política de cookies",
    acceptAll: "Aceptar todas",
    rejectAll: "Rechazar todas",
    customize: "Configurar",
    label: "Aviso de cookies",
    prefsTitle: "Preferencias de cookies",
    prefsIntro: "Elige qué cookies permites. Puedes cambiar tu decisión cuando quieras desde “Preferencias de cookies”, al pie de la página.",
    save: "Guardar preferencias",
    close: "Cerrar",
    always: "Siempre activas",
    on: "Activadas",
    off: "Desactivadas",
    categories: {
      necessary: { title: "Necesarias", text: "Permiten iniciar sesión, mantener tu cotización y recordar tu elección de cookies. No se pueden desactivar." },
      performance: { title: "Rendimiento", text: "Nos ayudarían a medir qué páginas se visitan y mejorar el sitio, sin identificarte. Hoy no usamos ninguna; si las habilitamos, solo con tu permiso." },
      customization: { title: "Personalización", text: "Recordarían preferencias adicionales (por ejemplo, ajustes de visualización). Hoy no usamos ninguna; si las habilitamos, solo con tu permiso." },
    },
  },
  en: {
    title: "Your privacy matters",
    text: "We use necessary cookies so the site works and remembers your session. Optional ones (performance and personalization) are only enabled if you allow them. You can accept them, reject them or choose which ones.",
    policy: "Cookie policy",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    label: "Cookie notice",
    prefsTitle: "Cookie preferences",
    prefsIntro: "Choose which cookies you allow. You can change your decision at any time from “Cookie preferences” at the bottom of the page.",
    save: "Save preferences",
    close: "Close",
    always: "Always on",
    on: "On",
    off: "Off",
    categories: {
      necessary: { title: "Necessary", text: "They let you sign in, keep your quote and remember your cookie choice. They cannot be turned off." },
      performance: { title: "Performance", text: "They would help us measure which pages are visited and improve the site, without identifying you. We use none today; if we enable them, only with your permission." },
      customization: { title: "Personalization", text: "They would remember extra preferences (for example, display settings). We use none today; if we enable them, only with your permission." },
    },
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
  const [performance, setPerformance] = useState(false);
  const [customization, setCustomization] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const uid = useId();

  useEffect(() => {
    // Espera a la hidratación: así quien ya decidió nunca ve parpadear el aviso.
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const openPrefs = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPerformance(consent?.performance ?? false);
    setCustomization(consent?.customization ?? false);
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

  const decide = (choices: { performance: boolean; customization: boolean }) => {
    saveConsent(choices);
    closePrefs();
  };

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
            <button type="button" className="ck__btn ck__btn--accept" onClick={() => decide({ performance: true, customization: true })}>
              {t.acceptAll}
            </button>
            <button type="button" className="ck__btn ck__btn--reject" onClick={() => decide({ performance: false, customization: false })}>
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
                <span className="ck-cat__icon" aria-hidden="true"><BarChart3 size={18} strokeWidth={1.8} /></span>
                <div className="ck-cat__text">
                  <strong id={`${uid}-p`}>{t.categories.performance.title}</strong>
                  <p>{t.categories.performance.text}</p>
                </div>
                <Switch checked={performance} onChange={setPerformance} labelledBy={`${uid}-p`} label={performance ? t.on : t.off} />
              </li>
              <li className="ck-cat">
                <span className="ck-cat__icon" aria-hidden="true"><Palette size={18} strokeWidth={1.8} /></span>
                <div className="ck-cat__text">
                  <strong id={`${uid}-c`}>{t.categories.customization.title}</strong>
                  <p>{t.categories.customization.text}</p>
                </div>
                <Switch checked={customization} onChange={setCustomization} labelledBy={`${uid}-c`} label={customization ? t.on : t.off} />
              </li>
            </ul>

            <footer className="ck-dialog__actions">
              <button type="button" className="ck__btn ck__btn--reject" onClick={() => decide({ performance: false, customization: false })}>
                {t.rejectAll}
              </button>
              <button type="button" className="ck__btn ck__btn--outline" onClick={() => decide({ performance, customization })}>
                {t.save}
              </button>
              <button type="button" className="ck__btn ck__btn--accept" onClick={() => decide({ performance: true, customization: true })}>
                {t.acceptAll}
              </button>
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}
