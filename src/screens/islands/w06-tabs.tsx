"use client";

import { useRef, useState } from "react";
import { rovingKeyIndex } from "@/shared/ui/products-keys";

const TABS = [
  { id: "specs", label: "1. Metalurgia y Componentes" },
  { id: "conditions", label: "2. Condiciones Operativas e Hidrostática" },
  { id: "standards", label: "3. Normas y documentación" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const BASE = "tech-tab-btn px-5 py-2.5 rounded-lg font-ui-label text-ui-label uppercase tracking-wider font-bold transition-all whitespace-nowrap";
const ACTIVE = "bg-primary text-on-primary shadow-sm";
const INACTIVE = "bg-surface-container text-on-surface-variant hover:bg-surface-container-high";

/** Pestañas ARIA de la ficha técnica; los paneles llegan renderizados desde el servidor. */
export function W06Tabs({ panels }: { panels: Record<TabId, React.ReactNode> }) {
  const [active, setActive] = useState<TabId>("specs");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = rovingKeyIndex(event.key, index, TABS.length);
    if (next === null) return;
    event.preventDefault();
    setActive(TABS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <>
      {/* Tab Header Container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6" role="tablist" aria-label="Ficha técnica de la válvula">
        {TABS.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`tabContent-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`${BASE} ${selected ? ACTIVE : INACTIVE}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {TABS.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`tabContent-${tab.id}`} aria-labelledby={`tab-${tab.id}`} tabIndex={0} className={tab.id === active ? "block" : "hidden"}>
          {panels[tab.id]}
        </div>
      ))}
    </>
  );
}
