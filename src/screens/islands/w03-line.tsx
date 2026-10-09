"use client";

import Link from "next/link";
import { useId, useState } from "react";

type W03FamilyId = "valvulas";
export type W03Item = { id: string; family: W03FamilyId; node: React.ReactNode };
export type W03Chip = { id: W03FamilyId | "all"; label: string };

/**
 * Chips de subcategoría + grilla de modelos (W03). Los contadores se calculan a partir de los modelos
 * realmente listados; el filtro oculta/muestra las referencias visuales sin exponer datos técnicos pendientes.
 */
export function W03Line({ chips, items }: { chips: W03Chip[]; items: W03Item[] }) {
  const [active, setActive] = useState<W03Chip["id"]>("all");
  const gridId = useId();
  const count = (id: W03Chip["id"]) => (id === "all" ? items.length : items.filter((i) => i.family === id).length);
  const visible = active === "all" ? items : items.filter((i) => i.family === active);
  const activeLabel = chips.find((c) => c.id === active)?.label ?? "";

  return (
    <>
      {/* SECTION 2: SUBCATEGORY VISUAL FILTER & CONTROLS */}
      <section className="w-full bg-surface-bright py-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div role="group" aria-label="Filtrar por tipo de válvula" className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full lg:w-auto">
              {chips.map((chip) => {
                const on = chip.id === active;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-pressed={on}
                    aria-controls={gridId}
                    onClick={() => setActive(chip.id)}
                    className={
                      on
                        ? "inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-brand-on font-button-text text-button-text shadow-sm shrink-0"
                        : "inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-button-text text-button-text shrink-0"
                    }
                  >
                    <span>
                      {chip.label}
                    </span>
                    <span
                      className={
                        on
                          ? "inline-flex items-center justify-center text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary-container text-brand-on"
                          : "inline-flex items-center justify-center text-[11px] font-bold px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant"
                      }
                    >
                      {count(chip.id)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="hidden xl:flex items-center gap-2 text-text-muted font-ui-label text-ui-label">
              <span className="material-symbols-outlined text-[16px] text-success" aria-hidden="true">
                tune
              </span>
              {" "}
              <span>
                {active === "all" ? "Filtro activo: todas las referencias" : `Filtro activo: ${activeLabel}`}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 3: PRODUCT GRID */}
      <section className="w-full py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline-section text-headline-section text-on-surface font-semibold tracking-tight">
                Referencias visuales
              </h2>
              <p className="font-body-compact text-body-compact text-text-secondary mt-1">
                Las imágenes ilustran la familia y no identifican modelos comerciales.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-text-secondary font-ui-label text-ui-label font-bold">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                inventory_2
              </span>
              {" "}
              <span role="status" aria-live="polite">
                {visible.length} de {items.length} imágenes mostradas
              </span>
            </div>
          </div>
          {visible.length > 0 ? (
            <div id={gridId} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((i) => (
                <div key={i.id} className="contents">
                  {i.node}
                </div>
              ))}
            </div>
          ) : (
            <div id={gridId} className="rounded-xl bg-surface-elevated shadow-sm p-10 flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-[40px] text-outline" aria-hidden="true">
                manage_search
              </span>
              <h3 className="font-headline-card text-headline-card text-on-surface">
                Sin imágenes para esta selección
              </h3>
              <p className="font-body-compact text-body-compact text-text-secondary max-w-md">
                No hay imágenes de «{activeLabel}» en esta selección. La información de producto sigue pendiente de validación.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button type="button" onClick={() => setActive("all")} className="h-10 px-5 rounded-lg bg-primary text-brand-on font-button-text text-button-text hover:bg-primary-container transition-colors">
                  Ver todas las válvulas
                </button>
                <Link href="/contacto" className="h-10 px-5 rounded-lg bg-surface-container text-primary font-button-text text-button-text hover:bg-surface-container-high transition-colors flex items-center">
                  Consultar al equipo
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
