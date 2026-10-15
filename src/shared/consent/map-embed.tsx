"use client";

import { ExternalLink, MapPinned, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { saveConsent, useConsent } from "@/modules/consent/store";
import { MAP_EMBED, MAP_VIEW } from "@/shared/config/location";
import { openCookiePreferences } from "@/shared/layout/cookie-events";
import { useLang } from "@/shared/layout/landing-prefs";
import "./consent-embed.css";

const COPY = {
  es: {
    title: "Mapa de Google Maps",
    text: "Para mostrarlo, Google puede instalar cookies y recibir tu dirección IP. Solo se carga con tu permiso.",
    once: "Cargar este mapa",
    always: "Aceptar contenido de terceros",
    open: "Abrir en Google Maps",
    settings: "Preferencias de cookies",
  },
  en: {
    title: "Google Maps map",
    text: "To show it, Google may set cookies and receive your IP address. It only loads with your permission.",
    once: "Load this map",
    always: "Accept third-party content",
    open: "Open in Google Maps",
    settings: "Cookie preferences",
  },
} as const;

/**
 * Mapa incrustado de Google condicionado al consentimiento de contenido de terceros.
 * Sin permiso no se hace ninguna petición a Google: se muestra un recuadro con tres salidas (cargar sólo este mapa,
 * aceptar y recordar, o abrirlo en Google Maps en otra pestaña). Debe ir en un contenedor con `position: relative`.
 */
export function MapEmbed({ title }: { title: string }) {
  const [lang] = useLang();
  const consent = useConsent();
  const [once, setOnce] = useState(false);
  const t = COPY[lang];

  if (consent?.thirdParty || once) {
    return <iframe src={MAP_EMBED} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />;
  }

  return (
    <div className="ce" role="group" aria-label={t.title}>
      <span className="ce__icon" aria-hidden="true"><MapPinned size={26} strokeWidth={1.6} /></span>
      <div className="ce__copy">
        <strong>{t.title}</strong>
        <p>{t.text}</p>
      </div>
      <div className="ce__actions">
        <button type="button" className="ce__btn ce__btn--solid" onClick={() => setOnce(true)}>{t.once}</button>
        <button type="button" className="ce__btn ce__btn--outline" onClick={() => saveConsent({ thirdParty: true }, "embed")}>
          <ShieldCheck size={15} aria-hidden="true" /> {t.always}
        </button>
      </div>
      <div className="ce__links">
        <a href={MAP_VIEW} target="_blank" rel="noopener noreferrer">{t.open} <ExternalLink size={13} aria-hidden="true" /></a>
        <button type="button" onClick={openCookiePreferences}>{t.settings}</button>
      </div>
    </div>
  );
}
