"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/shared/ui/products-keys";
import { appendAccessory, GATE_VALVE_DEFAULT_DN, GATE_VALVE_DNS, findGateValveDn, gateValveSummary } from "@/modules/products/valve-gate";

type Ctx = {
  dn: number;
  setDn: (dn: number) => void;
  accessories: string;
  setAccessories: (value: string) => void;
  addAccessory: (item: string) => void;
  registerAccessories: (el: HTMLTextAreaElement | null) => void;
};

const ConfiguratorContext = createContext<Ctx | null>(null);
function useConfigurator(): Ctx {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("W06Provider requerido");
  return ctx;
}

/** Estado compartido entre el selector de DN, el SKU del formulario y los accesorios (no renderiza DOM propio). */
export function W06Provider({ children }: { children: React.ReactNode }) {
  const [dn, setDn] = useState<number>(GATE_VALVE_DEFAULT_DN);
  const [accessories, setAccessories] = useState("");
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const addAccessory = useCallback((item: string) => {
    setAccessories((current) => appendAccessory(current, item));
    document.getElementById("solicitud-tecnica")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    areaRef.current?.focus({ preventScroll: true });
  }, []);
  const registerAccessories = useCallback((el: HTMLTextAreaElement | null) => {
    areaRef.current = el;
  }, []);

  const value = useMemo<Ctx>(() => ({ dn, setDn, accessories, setAccessories, addAccessory, registerAccessories }), [dn, accessories, addAccessory, registerAccessories]);
  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

export function W06SkuBadge({ className }: { className: string }) {
  const { dn } = useConfigurator();
  return (
    <span className={className} id="skuBadge">
      {gateValveSummary(findGateValveDn(dn)).skuBadge}
    </span>
  );
}

const PILL_BASE = "dn-btn py-2.5 px-3 rounded-lg font-ui-label text-[13px] font-semibold text-center transition-all";

export function W06DnSelector() {
  const { dn, setDn } = useConfigurator();
  const current = findGateValveDn(dn);
  const summary = gateValveSummary(current);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span id="dnSelectorLabel" className="font-ui-label text-ui-label uppercase font-bold text-on-surface tracking-wider">
          Selección de Diámetro Nominal (DN)
        </span>
        <span className="font-ui-label text-[12px] text-text-muted">Norma Serie F4 / EN 558-1 Serie 14</span>
      </div>
      {/* Diameter Pills */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2" id="dnSelectorGroup" role="group" aria-labelledby="dnSelectorLabel">
        {GATE_VALVE_DNS.map((item) => {
          const active = item.dn === dn;
          return (
            <button
              key={item.dn}
              type="button"
              aria-pressed={active}
              onClick={() => setDn(item.dn)}
              className={`${PILL_BASE} ${active ? "bg-primary text-on-primary shadow-sm" : "bg-surface text-on-surface hover:bg-surface-container"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {/* Dynamic Parameter Preview Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-lg mt-1 text-center" aria-live="polite" aria-atomic="true">
        <div>
          <span className="font-ui-label text-[10px] text-text-muted uppercase">Dist. Entre Caras (L)</span>
          <p className="font-body-compact text-[15px] font-bold text-primary" id="dispF4">
            {summary.f4}
          </p>
        </div>
        <div>
          <span className="font-ui-label text-[10px] text-text-muted uppercase">Taladros de Brida</span>
          <p className="font-body-compact text-[15px] font-bold text-primary" id="dispHoles">
            {summary.holes}
          </p>
        </div>
        <div>
          <span className="font-ui-label text-[10px] text-text-muted uppercase">Peso Estimado Neto</span>
          <p className="font-body-compact text-[15px] font-bold text-primary" id="dispWeight">
            {summary.weight}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Campo de solo lectura con el SKU seleccionado (se envía con el formulario). */
export function W06SkuField({ className }: { className: string }) {
  const { dn } = useConfigurator();
  return <input className={className} id="formSkuInput" name="formSkuInput" readOnly type="text" value={gateValveSummary(findGateValveDn(dn)).formSku} />;
}

export function W06AccessoriesField({ className, placeholder }: { className: string; placeholder: string }) {
  const { accessories, setAccessories, registerAccessories } = useConfigurator();
  return (
    <textarea
      ref={registerAccessories}
      className={className}
      id="formAccessoriesInput"
      name="formAccessoriesInput"
      placeholder={placeholder}
      rows={2}
      maxLength={1000}
      value={accessories}
      onChange={(event) => setAccessories(event.target.value)}
    />
  );
}

export function W06AccessoryButton({ item, className, children }: { item: string; className: string; children: React.ReactNode }) {
  const { addAccessory } = useConfigurator();
  return (
    <button type="button" className={className} onClick={() => addAccessory(item)}>
      {children}
    </button>
  );
}
