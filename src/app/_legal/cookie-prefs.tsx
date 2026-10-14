"use client";

import { ArrowRight, BarChart3, Lock, Megaphone, Settings, ShieldCheck } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { saveConsent, useConsent } from "@/modules/consent/store";

type Choices = { performance: boolean; customization: boolean };

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="lg-switch" onClick={() => onChange?.(!checked)} />
  );
}

/** Panel de preferencias: lee y escribe la misma cookie de consentimiento que el aviso global. */
export function CookiePrefs() {
  const consent = useConsent();
  const uid = useId();
  const [choices, setChoices] = useState<Choices>({ performance: false, customization: false });
  const [status, setStatus] = useState("");

  // Sincroniza con la decisión guardada (tras hidratar, o si cambia desde el aviso global).
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setChoices({ performance: consent?.performance ?? false, customization: consent?.customization ?? false }));
    return () => window.cancelAnimationFrame(id);
  }, [consent]);

  const decide = (next: Choices, message: string) => {
    saveConsent(next);
    setChoices(next);
    setStatus(message);
  };

  const cards = [
    { key: "necessary", icon: ShieldCheck, title: "Cookies necesarias", text: "Son esenciales para el funcionamiento del sitio web. Permiten la navegación segura, el acceso a áreas protegidas y el correcto funcionamiento de sus funcionalidades." },
    { key: "performance", icon: BarChart3, title: "Cookies analíticas", text: "Nos ayudan a entender cómo los visitantes utilizan el sitio web, mediante la recopilación de información anónima. Nos permite mejorar su rendimiento y contenido." },
    { key: "customization", icon: Settings, title: "Cookies funcionales", text: "Permiten recordar tus preferencias de navegación, como el idioma o la región, para ofrecerte una experiencia más personalizada." },
    { key: "ads", icon: Megaphone, title: "Cookies publicitarias", text: "Se utilizan para mostrarte contenidos y anuncios relevantes en función de tus intereses. Actualmente este sitio no las utiliza." },
  ] as const;

  return (
    <section className="lg-prefs" aria-labelledby={`${uid}-title`}>
      <div className="lg-prefs__head">
        <p className="lg-eyebrow">Gestiona tus preferencias</p>
        <h2 id={`${uid}-title`}>Preferencias de cookies</h2>
        <p>Puedes aceptar todas las cookies, rechazar las opcionales o personalizar tus preferencias. En cualquier momento podrás cambiar tu selección desde la configuración de tu navegador.</p>
      </div>

      <ul className="lg-cookie-grid">
        {cards.map(({ key, icon: Icon, title, text }) => {
          const locked = key === "necessary";
          const unused = key === "ads";
          const on = locked ? true : unused ? false : choices[key];
          return (
            <li className="lg-cookie" key={key}>
              <span className="lg-cookie__icon" aria-hidden="true"><Icon size={28} strokeWidth={1.5} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="lg-switch-row">
                {locked || unused ? (
                  <Switch checked={on} label={title} disabled />
                ) : (
                  <Switch checked={on} label={title} onChange={(next) => { setChoices((c) => ({ ...c, [key]: next })); setStatus(""); }} />
                )}
                {locked ? (
                  <span className="lg-chip"><Lock aria-hidden="true" size={13} /> Siempre activas</span>
                ) : unused ? (
                  <span className="lg-chip">No utilizadas</span>
                ) : (
                  <span className={`lg-chip${on ? " lg-chip--on" : ""}`}>{on ? "Activadas" : "Desactivadas"}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lg-prefs__actions">
        <button type="button" className="lp-btn lp-btn--solid" onClick={() => decide({ performance: true, customization: true }, "Aceptaste todas las cookies.")}>
          Aceptar todas <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide({ performance: false, customization: false }, "Solo se usarán las cookies necesarias.")}>
          Rechazar opcionales
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide(choices, "Preferencias guardadas.")}>
          Guardar preferencias
        </button>
      </div>
      <p className="lg-prefs__status" role="status" aria-live="polite" style={{ marginTop: 14 }}>{status}</p>
      <p className="lg-prefs__note">Al hacer clic en “Aceptar todas”, consientes el uso de todas las cookies. Puedes cambiar tus preferencias en cualquier momento.</p>
    </section>
  );
}
