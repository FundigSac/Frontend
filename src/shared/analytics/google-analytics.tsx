"use client";

import { useEffect } from "react";
import { useConsent } from "@/modules/consent/store";
import { SITE } from "@/shared/config/site";
import { GA_MEASUREMENT_ID, setAnalyticsActive, track } from "./track";

/** 13 meses, lo mismo que dice la política de cookies (el valor por omisión de Google es 2 años). */
const COOKIE_EXPIRES_SECONDS = 395 * 24 * 60 * 60;
const SCRIPT_ID = "ga4-gtag";

/** Solo se mide el dominio canónico: localhost y las URLs de despliegue de Vercel no ensucian los datos. */
const isCanonicalHost = () => window.location.host === new URL(SITE.url).host;

function load() {
  window.dataLayer = window.dataLayer || [];
  // gtag.js necesita el objeto `arguments`, no un arreglo: por eso no es una función flecha.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // Modo de consentimiento v2: solo almacenamiento de analítica (aceptado); nada de publicidad.
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    cookie_expires: COOKIE_EXPIRES_SECONDS,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // ?ga_debug=1 muestra los eventos en DebugView para verificar la instalación.
    ...(new URLSearchParams(window.location.search).has("ga_debug") ? { debug_mode: true } : {}),
  });
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** Retira la analítica: deniega el almacenamiento, desactiva el envío y borra las cookies _ga del dominio. */
function revoke() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  const host = window.location.hostname;
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of ["", `; domain=${host}`, `; domain=.${host}`]) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

/** Clics que cuentan como conversión: WhatsApp y apertura de /cotizar. Escucha en captura para no depender de cada botón. */
function onClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return;
  let url: URL;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return;
  }
  const label = (link.getAttribute("aria-label") || link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com") {
    track("whatsapp_click", { link_text: label, page_path: window.location.pathname });
  } else if (url.origin === window.location.origin && url.pathname.startsWith("/cotizar") && !url.pathname.startsWith("/cotizar/confirmacion")) {
    track("product_quote_click", { method: "quote_link", item_id: url.searchParams.get("producto") ?? "general", link_text: label, page_path: window.location.pathname });
  }
}

/** Google Analytics 4 condicionado al consentimiento de analítica (ver src/modules/consent). */
export function GoogleAnalytics() {
  const consent = useConsent();
  const allowed = consent?.analytics === true;

  useEffect(() => {
    if (!isCanonicalHost()) return;
    if (allowed) {
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      if (!document.getElementById(SCRIPT_ID)) load();
      else window.gtag?.("consent", "update", { analytics_storage: "granted" });
      setAnalyticsActive(true);
      document.addEventListener("click", onClick, { capture: true });
      return () => document.removeEventListener("click", onClick, { capture: true });
    }
    if (document.getElementById(SCRIPT_ID)) revoke();
    setAnalyticsActive(false);
  }, [allowed]);

  return null;
}
