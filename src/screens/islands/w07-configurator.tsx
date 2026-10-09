"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { BUTTERFLY_DEFAULT_DN, BUTTERFLY_DNS, butterflyOptionLabel, butterflySummary, findButterflyDn } from "@/modules/products/valve-butterfly";

type Ctx = { dn: number; setDn: (dn: number) => void };
const ConfiguratorContext = createContext<Ctx | null>(null);
function useConfigurator(): Ctx {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("W07Provider requerido");
  return ctx;
}

/** Comparte el DN elegido entre el selector técnico, el SKU y el formulario de cotización (no renderiza DOM propio). */
export function W07Provider({ children }: { children: React.ReactNode }) {
  const [dn, setDn] = useState<number>(BUTTERFLY_DEFAULT_DN);
  const value = useMemo(() => ({ dn, setDn }), [dn]);
  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

export function W07SkuDisplay({ className }: { className: string }) {
  const { dn } = useConfigurator();
  return (
    <span className={className} id="sku-display">
      {butterflySummary(findButterflyDn(dn)).sku}
    </span>
  );
}

const BTN_BASE = "dn-btn py-2 px-1 text-center font-ui-label text-[12px] rounded transition-all";

export function W07DnSelector() {
  const { dn, setDn } = useConfigurator();
  const summary = butterflySummary(findButterflyDn(dn));
  return (
    <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
      <div className="flex items-center justify-between">
        <span id="dn-selector-label" className="font-ui-label text-[11px] font-bold text-on-surface uppercase tracking-wider">
          Calibre Nominal (DN mm):
        </span>
        <span className="font-ui-label text-[11px] text-primary font-semibold" id="inch-display" aria-live="polite">
          {summary.inch}
        </span>
      </div>
      {/* Grilla de Botones Calibre DN */}
      <div className="grid grid-cols-5 gap-1.5" id="dn-selector-group" role="group" aria-labelledby="dn-selector-label">
        {BUTTERFLY_DNS.map((item) => {
          const active = item.dn === dn;
          return (
            <button
              key={item.dn}
              type="button"
              aria-pressed={active}
              onClick={() => setDn(item.dn)}
              className={`${BTN_BASE} ${active ? "bg-primary text-on-primary font-bold shadow-sm" : "bg-surface text-on-surface hover:bg-surface-container"}`}
            >
              DN {item.dn}
            </button>
          );
        })}
      </div>
      {/* Indicadores de Maniobra y Par Dinámico Calculado */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border" aria-live="polite" aria-atomic="true">
        <div className="p-2.5 rounded bg-surface-container-lowest">
          <span className="block font-ui-label text-[10px] text-text-muted uppercase">Torque Cierre (ΔP=16b)</span>{" "}
          <span className="font-headline-card text-[18px] text-primary font-bold" id="val-torque">
            {summary.torque}
          </span>
        </div>
        <div className="p-2.5 rounded bg-surface-container-lowest">
          <span className="block font-ui-label text-[10px] text-text-muted uppercase">Vueltas Reductor</span>{" "}
          <span className="font-headline-card text-[18px] text-on-surface font-bold" id="val-turns">
            {summary.turns}
          </span>
        </div>
        <div className="p-2.5 rounded bg-surface-container-lowest">
          <span className="block font-ui-label text-[10px] text-text-muted uppercase">Masa en Seco</span>{" "}
          <span className="font-headline-card text-[18px] text-on-surface font-bold" id="val-weight">
            {summary.weight}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Selector de calibre del formulario: arranca con el DN elegido arriba y se mantiene sincronizado. */
export function W07FormDnSelect({ className, id, name }: { className: string; id: string; name: string }) {
  const { dn, setDn } = useConfigurator();
  return (
    <select className={className} id={id} name={name} value={dn} onChange={(event) => setDn(Number(event.target.value))}>
      {BUTTERFLY_DNS.map((item) => (
        <option key={item.dn} value={item.dn}>
          {butterflyOptionLabel(item)}
        </option>
      ))}
    </select>
  );
}
