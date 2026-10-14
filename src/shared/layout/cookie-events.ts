/** Evento para reabrir el panel de preferencias de cookies desde cualquier parte (p. ej. el pie de página). */
export const OPEN_COOKIE_PREFS_EVENT = "fundigsac:open-cookie-prefs";

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFS_EVENT));
}
