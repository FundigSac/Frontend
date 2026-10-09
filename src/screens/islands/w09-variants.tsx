"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { DEFAULT_FRAME_VARIANT, FRAME_VARIANTS, findFrameVariant, type FrameVariant } from "@/modules/products/frame-d400";
import { rovingKeyIndex } from "@/shared/ui/products-keys";

type Ctx = { variant: FrameVariant["id"]; setVariant: (id: FrameVariant["id"]) => void };
const VariantContext = createContext<Ctx | null>(null);
function useVariant(): Ctx {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error("W09Provider requerido");
  return ctx;
}

/** Comparte la variante elegida entre el selector del producto y el formulario de cotización. */
export function W09Provider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<FrameVariant["id"]>(DEFAULT_FRAME_VARIANT);
  const value = useMemo(() => ({ variant, setVariant }), [variant]);
  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

/** Grupo de radios accesible: flechas mueven y seleccionan; sólo la opción elegida entra en el orden de tabulación. */
export function W09Variants() {
  const { variant, setVariant } = useVariant();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = rovingKeyIndex(event.key, index, FRAME_VARIANTS.length, "both");
    if (next === null) return;
    event.preventDefault();
    setVariant(FRAME_VARIANTS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="space-y-3">
      <span id="variant-selector-label" className="block font-ui-label text-ui-label text-on-surface font-bold uppercase">
        Selección de Configuración y Seguridad:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="variant-selector" role="radiogroup" aria-labelledby="variant-selector-label">
        {FRAME_VARIANTS.map((item, index) => {
          const checked = item.id === variant;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => setVariant(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`variant-card text-left p-3.5 rounded-lg bg-surface hover:bg-surface-container ${checked ? "ring-2 ring-primary " : ""}transition-all`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-ui-label text-ui-label font-bold text-on-surface">{item.title}</span>
                <span className={`material-symbols-outlined text-[16px] ${checked ? "text-primary" : "text-outline-variant"}`} aria-hidden="true">
                  {checked ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>
              <p className="font-body-compact text-[13px] text-text-muted leading-tight">{item.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Campo oculto del formulario: la variante viaja con la solicitud de cotización. */
export function W09VariantField() {
  const { variant } = useVariant();
  return <input type="hidden" name="configuracion" value={findFrameVariant(variant).title} />;
}
