"use client";

import { useEffect, useRef, useState } from "react";
import { statusOf, type ConsentChoices } from "@/modules/consent/consent";
import { saveConsent, useConsent } from "@/modules/consent/store";

const TOGGLE_LABELS = {
  performance: "Rendimiento y métricas técnicas",
  customization: "Personalización de consulta B2B",
} as const;

// Sin preferencia guardada se muestran los valores del diseño como borrador; NO se activa nada opcional hasta guardar.
const DEFAULT_DRAFT: ConsentChoices = { performance: true, customization: true };

const NOTICE_MS = 5000;

/** Panel de preferencias de cookies (W20): borrador local + persistencia en la cookie propia `fundigsac-consent`. */
export function W20Preferences() {
  const stored = useConsent();
  const [edits, setEdits] = useState<ConsentChoices | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draft: ConsentChoices = edits ?? (stored ? { performance: stored.performance, customization: stored.customization } : DEFAULT_DRAFT);
  const setDraft = (next: ConsentChoices) => setEdits(next);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const announce = (text: string) => {
    setNotice(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  };

  const commit = (choices: ConsentChoices, text: string) => {
    saveConsent(choices);
    setEdits(null);
    announce(text);
  };
  const save = () => commit(draft, "Preferencias de cookies actualizadas y guardadas con éxito en su navegador.");
  const reject = () => commit({ performance: false, customization: false }, "Se rechazaron las cookies opcionales. Solo permanecen las técnicas necesarias.");

  // Estado mostrado: lo guardado; sin decisión, se indica que no hay preferencias guardadas.
  const status = stored ? statusOf(stored) : null;
  const badge = (
    <div className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest font-ui-label text-ui-label text-primary border border-border" id="consentStatusBadge" role="status">
      <span className={`w-2 h-2 rounded-full ${status === "all" ? "bg-success" : status === "necessary-only" ? "bg-outline" : status === "custom" ? "bg-primary-container" : "bg-outline-variant"}`} />
      <span>
        {status === "all" ? "Estado: Todas las Cookies Habilitadas" : status === "necessary-only" ? "Estado: Solo Necesarias Activas" : status === "custom" ? "Estado: Configuración Personalizada" : "Estado: Sin preferencias guardadas"}
      </span>
    </div>
  );

  return (
    <section className="bg-surface rounded-xl p-6 sm:p-8 space-y-8 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                tune
              </span>
              <h2 className="font-headline-card text-headline-card text-on-surface">
                Panel de Configuración de Consentimiento B2B
              </h2>
            </div>
            <p className="font-body-compact text-body-compact text-text-secondary mt-1">
              Controle la parametrización de almacenamiento local y cookies en su sesión técnica de cálculo hidráulico.
            </p>
          </div>
          {badge}
        </div>
        {/* Toggle Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Technical / Essential Cookies */}
          <div className="bg-surface-elevated p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-ui-label text-ui-label text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    lock
                  </span>
                  Categoría Obligatoria
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                  SIEMPRE ACTIVAS
                </span>
              </div>
              <h3 className="font-button-text text-button-text text-on-surface font-semibold">
                Cookies Técnicas Necesarias
              </h3>
              <p className="font-body-compact text-body-compact text-text-secondary">
                Esenciales para el selector de tema (claro/oscuro), persistencia del carrito de cotización de metrados DN 50–1200 y seguridad tokenizada en mesa de partes.
              </p>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-ui-label text-ui-label text-text-muted">
                fundigsac_token, session_theme
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]" aria-hidden="true">
                check_box
              </span>
            </div>
          </div>
          {/* Performance & Metrics Cookies */}
          <div className="bg-surface-elevated p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-ui-label text-ui-label text-text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    speed
                  </span>
                  Telemetría de Red
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" id="cookiePerformanceToggle" type="checkbox" role="switch" aria-label={TOGGLE_LABELS.performance} checked={draft.performance} onChange={(e) => setDraft({ ...draft, performance: e.target.checked })} />
                  <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                </label>
              </div>
              <h3 className="font-button-text text-button-text text-on-surface font-semibold">
                Rendimiento y Métricas Técnicas
              </h3>
              <p className="font-body-compact text-body-compact text-text-secondary">
                Análisis anónimo de tiempos de descarga de planos DWG/PDF, latencia de visualización del catálogo de válvulas y detección de cuellos de botella en red local de obra.
              </p>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-ui-label text-ui-label text-text-muted">
                _ga_technical, _perf_load
              </span>
              <span className="font-ui-label text-ui-label text-text-secondary">
                Configurable
              </span>
            </div>
          </div>
          {/* B2B Engineering Personalization */}
          <div className="bg-surface-elevated p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-ui-label text-ui-label text-text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    settings_input_component
                  </span>
                  Preferencia Proyectista
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" id="cookieCustomizationToggle" type="checkbox" role="switch" aria-label={TOGGLE_LABELS.customization} checked={draft.customization} onChange={(e) => setDraft({ ...draft, customization: e.target.checked })} />
                  <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                </label>
              </div>
              <h3 className="font-button-text text-button-text text-on-surface font-semibold">
                Personalización de Consulta B2B
              </h3>
              <p className="font-body-compact text-body-compact text-text-secondary">
                Recordar filtros de ingeniería frecuentes (diámetros nominales DN y rangos de presión PN 10/16/25) en visitas recurrentes de consultores de saneamiento.
              </p>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-ui-label text-ui-label text-text-muted">
                fundigsac_dn_pref, filter_state
              </span>
              <span className="font-ui-label text-ui-label text-text-secondary">
                Configurable
              </span>
            </div>
          </div>
        </div>
        {/* Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="font-body-compact text-body-compact text-text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
              info
            </span>
            Sus selecciones se almacenarán en una cookie propia del sitio (fundigsac-consent) por un periodo máximo de 180 días.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button className="h-11 px-5 rounded-lg border border-border bg-transparent text-on-surface font-button-text text-button-text hover:bg-surface-elevated transition-colors text-center" id="btnRejectOptional" type="button" onClick={reject}>
              Permitir solo estrictamente necesarias
            </button>
            <button className="h-11 px-6 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-colors shadow-sm text-center" id="btnSavePreferences" type="button" onClick={save}>
              Guardar preferencias seleccionadas
            </button>
          </div>
        </div>
        {/* Aviso (se oculta solo a los 5 s). El contenedor aria-live permanece montado para que se anuncie. */}
        <div role="status" aria-live="polite" className={notice ? "" : "sr-only"}>
          {notice && (
            <div className="p-4 rounded-lg bg-surface-container-low border border-border flex items-center justify-between gap-3 text-primary" id="consentNotification">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              check_circle
            </span>
            <span className="font-body-compact text-body-compact font-medium">
              {notice}
            </span>
          </div>
          <button className="text-text-muted hover:text-on-surface" id="dismissAlert" type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>
          )}
        </div>
      </section>
  );
}
