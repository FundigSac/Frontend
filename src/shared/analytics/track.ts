/**
 * Eventos de Google Analytics 4. Sin consentimiento de analítica no se carga gtag.js y `track` no hace nada:
 * los eventos anteriores a la aceptación se descartan (no se guardan para enviarlos después).
 *
 * Eventos del sitio (todos ligados a una acción real de la persona):
 *  - whatsapp_click: clic en un enlace a WhatsApp (wa.me).
 *  - product_quote_click: agregar un producto a la cotización o abrir /cotizar.
 *  - contact_form_submit_success: el sistema confirmó el registro de un formulario (folio del Backend). Si no hay Backend,
 *    el formulario solo prepara un correo o WhatsApp y este evento no se envía.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-8867SXGEH3";

export type AnalyticsEvent = "whatsapp_click" | "product_quote_click" | "contact_form_submit_success";
type Params = Record<string, string | number | boolean | undefined>;

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** true mientras gtag.js está cargado y la analítica sigue aceptada. */
let active = false;
export const setAnalyticsActive = (value: boolean) => {
  active = value;
};

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (!active || typeof window === "undefined" || typeof window.gtag !== "function") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  window.gtag("event", event, clean);
}
