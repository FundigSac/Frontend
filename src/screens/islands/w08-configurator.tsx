"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { TYTON_DEFAULT_DN, TYTON_DNS, TYTON_INCHES, findTytonDn, tytonDnFromFormValue, tytonFormValue, tytonSummary } from "@/modules/products/pipe-tyton";

/** `dn` es el DN del selector técnico; `formValue` el valor del select del formulario (incluye "Varios"). */
type Ctx = { dn: number; formValue: string; selectDn: (dn: number) => void; setFormValue: (value: string) => void };
const ConfiguratorContext = createContext<Ctx | null>(null);
function useConfigurator(): Ctx {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("W08Provider requerido");
  return ctx;
}

export function W08Provider({ children }: { children: React.ReactNode }) {
  const [dn, setDn] = useState<number>(TYTON_DEFAULT_DN);
  const [formValue, setFormValue] = useState(tytonFormValue(TYTON_DEFAULT_DN));
  const value = useMemo<Ctx>(
    () => ({
      dn,
      formValue,
      // Elegir un DN arriba sincroniza el select del formulario (como `selectDN` del diseño).
      selectDn: (next) => {
        setDn(next);
        setFormValue(tytonFormValue(next));
      },
      // Cambiar el select del formulario sólo mueve el selector técnico si el valor es un DN concreto.
      setFormValue: (v) => {
        setFormValue(v);
        const parsed = tytonDnFromFormValue(v);
        if (parsed !== null) setDn(parsed);
      },
    }),
    [dn, formValue],
  );
  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

const BTN_BASE = "dn-btn py-2 px-1 text-center font-ui-label text-ui-label rounded";

/** Rótulo, botones DN y tarjeta de parámetros dinámicos (los tres bloques comparten el DN elegido). */
export function W08DnPicker() {
  const { dn, selectDn } = useConfigurator();
  const summary = tytonSummary(findTytonDn(dn));
  return (
    <>
      {/* Nominal Diameter Selector Grid */}
      <div className="flex flex-col gap-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span id="dn-picker-label" className="font-ui-label text-ui-label uppercase tracking-wider text-on-surface font-bold">
            Diámetro Nominal (DN mm)
          </span>
          <span className="font-ui-label text-ui-label text-primary font-bold" id="selected-dn-display" aria-live="polite">
            {summary.selected}
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" id="dn-btn-container" role="group" aria-labelledby="dn-picker-label">
          {TYTON_DNS.map((item) => {
            const active = item.dn === dn;
            return (
              <button
                key={item.dn}
                type="button"
                aria-pressed={active}
                onClick={() => selectDn(item.dn)}
                className={`${BTN_BASE} ${active ? "bg-primary text-on-primary font-bold shadow-sm" : "bg-surface text-on-surface hover:bg-surface-container transition-all"}`}
              >
                DN {item.dn}
              </button>
            );
          })}
        </div>
      </div>
      {/* Dynamic Specification Live Readout Card */}
      <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
        <span className="font-ui-label text-ui-label text-text-muted uppercase tracking-wider font-semibold">Parámetros Dinámicos del Tramo Estándar (6.0m)</span>
        <div className="grid grid-cols-3 gap-3" aria-live="polite" aria-atomic="true">
          <div className="bg-surface-container-lowest p-3 rounded-lg flex flex-col items-start shadow-sm">
            <span className="font-ui-label text-ui-label text-text-muted">Espesor Pared (e)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-card text-headline-card font-bold text-primary" id="metric-thickness">
                {summary.thickness}
              </span>
              <span className="font-ui-label text-ui-label text-text-muted">mm</span>
            </div>
            <span className="font-ui-label text-[10px] text-text-muted mt-1">Clase C40 nominal</span>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-lg flex flex-col items-start shadow-sm">
            <span className="font-ui-label text-ui-label text-text-muted">Deflexión Angular</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-card text-headline-card font-bold text-primary" id="metric-deflection">
                {summary.deflection}
              </span>
              <span className="font-ui-label text-ui-label text-text-muted">grados</span>
            </div>
            <span className="font-ui-label text-[10px] text-text-muted mt-1">Junta flexible Tyton</span>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-lg flex flex-col items-start shadow-sm">
            <span className="font-ui-label text-ui-label text-text-muted">Peso Total / Tubo</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-card text-headline-card font-bold text-primary" id="metric-weight">
                {summary.weight}
              </span>
              <span className="font-ui-label text-ui-label text-text-muted">kg</span>
            </div>
            <span className="font-ui-label text-[10px] text-text-muted mt-1">Inc. mortero int.</span>
          </div>
        </div>
        {/* Calculated Pipe Trenching Capacity */}
        <div className="flex items-center justify-between text-body-compact font-body-compact text-text-secondary pt-1">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
              architecture
            </span>
            <span>Radio de curvatura natural de zanja:</span>
          </span>
          <span className="font-bold text-on-surface" id="metric-radius" aria-live="polite">
            {summary.radius}
          </span>
        </div>
      </div>
    </>
  );
}

export function W08FormDnSelect({ className, id, name }: { className: string; id: string; name: string }) {
  const { formValue, setFormValue } = useConfigurator();
  return (
    <select className={className} id={id} name={name} value={formValue} onChange={(event) => setFormValue(event.target.value)}>
      {TYTON_DNS.map((item) => (
        <option key={item.dn} value={tytonFormValue(item.dn)}>
          {`DN ${item.dn} mm (${TYTON_INCHES[item.dn]}")`}
        </option>
      ))}
      <option value="Varios">Múltiples diámetros (ver metrado)</option>
    </select>
  );
}
