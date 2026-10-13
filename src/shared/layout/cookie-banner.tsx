"use client";

import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { saveConsent, useConsent } from "@/modules/consent/store";
import { useLang } from "./landing-prefs";
import "./cookie-banner.css";

const COPY = {
  es: {
    title: "Tu privacidad importa",
    text: "Usamos cookies necesarias para que el sitio funcione y recuerde tu sesión y preferencias. Las cookies opcionales de rendimiento y personalización solo se activarán si tú lo autorizas.",
    policy: "Política de cookies",
    accept: "Aceptar todas",
    necessary: "Solo necesarias",
    configure: "Configurar",
    label: "Aviso de cookies",
  },
  en: {
    title: "Your privacy matters",
    text: "We use necessary cookies so the site works and remembers your session and preferences. Optional performance and personalization cookies are only enabled if you allow them.",
    policy: "Cookie policy",
    accept: "Accept all",
    necessary: "Necessary only",
    configure: "Customize",
    label: "Cookie notice",
  },
} as const;

export function CookieBanner() {
  const [lang] = useLang();
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    // Espera a la hidratación: así quien ya decidió nunca ve parpadear el aviso.
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!mounted || consent) return null;

  return (
    <section className="ck" role="region" aria-label={t.label} aria-live="polite">
      <div className="ck__icon" aria-hidden="true">
        <Cookie size={22} strokeWidth={1.7} />
      </div>
      <div className="ck__body">
        <h2>
          {t.title} <ShieldCheck aria-hidden="true" size={16} strokeWidth={2} />
        </h2>
        <p>
          {t.text}{" "}
          <Link href="/cookies">{t.policy}</Link>
        </p>
      </div>
      <div className="ck__actions">
        <button type="button" className="ck__btn ck__btn--solid" onClick={() => saveConsent({ performance: true, customization: true })}>
          {t.accept}
        </button>
        <button type="button" className="ck__btn ck__btn--outline" onClick={() => saveConsent({ performance: false, customization: false })}>
          {t.necessary}
        </button>
        <Link href="/cookies" className="ck__link">
          {t.configure}
        </Link>
      </div>
    </section>
  );
}
