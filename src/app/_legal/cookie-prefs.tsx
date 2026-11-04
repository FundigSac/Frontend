"use client";

import { ArrowRight, BarChart3, Lock, MapPinned, ShieldCheck } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { expiresAt } from "@/modules/consent/consent";
import { isGpcEnabled, saveConsent, useConsent } from "@/modules/consent/store";
import { useLang } from "@/shared/layout/landing-prefs";
import { COOKIES } from "./copy";
import { useCopy } from "./use-copy";

type StatusKey = "" | "all" | "necessary" | "saved";

const CARD_KEYS = ["necessary", "thirdParty", "analytics"] as const;
const CARD_ICONS = [ShieldCheck, MapPinned, BarChart3] as const;

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="lg-switch" onClick={() => onChange?.(!checked)} />
  );
}

/** Panel de preferencias: lee y escribe la misma cookie de consentimiento que el aviso global. */
export function CookiePrefs() {
  const t = useCopy(COOKIES).prefs;
  const [lang] = useLang();
  const consent = useConsent();
  const uid = useId();
  const [thirdParty, setThirdParty] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [status, setStatus] = useState<StatusKey>("");
  const [gpc, setGpc] = useState(false);

  // Sincroniza con la decisión guardada (tras hidratar, o si cambia desde el aviso global).
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setThirdParty(consent?.thirdParty ?? false);
      setAnalytics(consent?.analytics ?? false);
      setGpc(isGpcEnabled());
    });
    return () => window.cancelAnimationFrame(id);
  }, [consent]);

  const decide = (next: { thirdParty: boolean; analytics: boolean }, key: Exclude<StatusKey, "">) => {
    saveConsent(next, "policy");
    setThirdParty(next.thirdParty);
    setAnalytics(next.analytics);
    setStatus(key);
  };
  const values = { thirdParty, analytics };
  const setters = { thirdParty: setThirdParty, analytics: setAnalytics };

  const statusText = status === "all" ? t.statusAll : status === "necessary" ? t.statusNecessary : status === "saved" ? t.statusSaved : "";
  const dateFmt = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-PE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="lg-prefs" aria-labelledby={`${uid}-title`}>
      <div className="lg-prefs__head">
        <p className="lg-eyebrow">{t.eyebrow}</p>
        <h2 id={`${uid}-title`}>{t.title}</h2>
        <p>{t.text}</p>
      </div>

      <ul className="lg-cookie-grid lg-cookie-grid--3">
        {t.cards.map((card, i) => {
          const key = CARD_KEYS[i];
          const Icon = CARD_ICONS[i];
          const locked = key === "necessary";
          const on = key === "necessary" ? true : values[key];
          return (
            <li className="lg-cookie" key={key}>
              <span className="lg-cookie__icon" aria-hidden="true"><Icon size={28} strokeWidth={1.5} /></span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <div className="lg-switch-row">
                {key === "necessary" ? (
                  <Switch checked={on} label={card.title} disabled />
                ) : (
                  <Switch checked={on} label={card.title} onChange={(next) => { setters[key](next); setStatus(""); }} />
                )}
                {locked ? (
                  <span className="lg-chip"><Lock aria-hidden="true" size={13} /> {t.always}</span>
                ) : (
                  <span className={`lg-chip${on ? " lg-chip--on" : ""}`}>{on ? t.on : t.off}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lg-prefs__actions">
        <button type="button" className="lp-btn lp-btn--solid" onClick={() => decide({ thirdParty: true, analytics: true }, "all")}>
          {t.acceptAll} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide({ thirdParty: false, analytics: false }, "necessary")}>
          {t.rejectOptional}
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide({ thirdParty, analytics }, "saved")}>
          {t.save}
        </button>
      </div>
      <p className="lg-prefs__status" role="status" aria-live="polite" style={{ marginTop: 14 }}>{statusText}</p>
      {gpc && <p className="lg-prefs__note lg-prefs__note--gpc">{t.gpc}</p>}
      {consent && (
        <p className="lg-prefs__note lg-prefs__note--saved">
          {t.saved} {dateFmt.format(new Date(consent.savedAt))}. {t.until} {dateFmt.format(expiresAt(consent))}.
        </p>
      )}
      <p className="lg-prefs__note">{t.note}</p>
    </section>
  );
}
