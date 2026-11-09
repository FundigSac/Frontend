"use client";

import { Lock } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { expiresAt } from "@/modules/consent/consent";
import { isGpcEnabled, saveConsent, useConsent } from "@/modules/consent/store";
import { useLang } from "@/shared/layout/landing-prefs";
import { COOKIES } from "./copy";
import { useCopy } from "./use-copy";

type StatusKey = "" | "all" | "necessary" | "saved";

const CARD_KEYS = ["necessary", "thirdParty", "analytics"] as const;

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
    <section className="ls-section ls-section--first lg-prefs" id="preferencias" aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`}>{t.title}</h2>
      <p>{t.text}</p>

      <ul className="lg-cookies">
        {t.cards.map((card, i) => {
          const key = CARD_KEYS[i];
          const locked = key === "necessary";
          const on = key === "necessary" ? true : values[key];
          return (
            <li className="lg-cookie" key={key}>
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
              <div className="lg-switch-row">
                {locked ? (
                  <span className="lg-chip"><Lock aria-hidden="true" size={14} /> {t.always}</span>
                ) : (
                  <span className={`lg-chip${on ? " lg-chip--on" : ""}`}>{on ? t.on : t.off}</span>
                )}
                {key === "necessary" ? (
                  <Switch checked={on} label={card.title} disabled />
                ) : (
                  <Switch checked={on} label={card.title} onChange={(next) => { setters[key](next); setStatus(""); }} />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lg-prefs__actions">
        <button type="button" className="lp-btn lp-btn--solid" onClick={() => decide({ thirdParty, analytics }, "saved")}>
          {t.save}
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide({ thirdParty: true, analytics: true }, "all")}>
          {t.acceptAll}
        </button>
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => decide({ thirdParty: false, analytics: false }, "necessary")}>
          {t.rejectOptional}
        </button>
      </div>
      <span className="lg-prefs__status" role="status" aria-live="polite">{statusText}</span>
      {gpc && <span className="lg-prefs__note">{t.gpc}</span>}
      {consent && (
        <span className="lg-prefs__note">
          {t.saved} {dateFmt.format(new Date(consent.savedAt))}. {t.until} {dateFmt.format(expiresAt(consent))}.
        </span>
      )}
      <span className="lg-prefs__note">{t.note}</span>
    </section>
  );
}
