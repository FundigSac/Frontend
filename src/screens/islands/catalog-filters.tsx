"use client";

import Link from "next/link";
import { ArrowRight, FileText, X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import styles from "./catalog-filters.module.css";

type Lang = "es" | "en";

export const FILTER_UI = {
  es: {
    active: "Filtros activos",
    remove: (label: string) => `Quitar filtro: ${label}`,
    reset: "Restablecer todo",
    search: (q: string) => `Búsqueda: «${q}»`,
    sort: (label: string) => `Orden: ${label}`,
    count: (n: number) => (n === 1 ? "1 producto" : `${n} productos`),
    searched: "Buscaste:",
    tipsTitle: "Prueba así:",
    tips: [
      "Revisa la ortografía o usa una sola palabra (por ejemplo, «compuerta»).",
      "Busca por tipo de producto o por medida, como «brida» o «DN150».",
      "Quita los filtros activos para ver todo el catálogo.",
    ],
    familiesTitle: "Familias más consultadas",
    quote: (q: string) => `Pedir cotización de «${q}»`,
    quoteGeneric: "Pedir una cotización",
    quoteNote: "Si no está en el catálogo web, el equipo comercial revisa si puede suministrarlo.",
  },
  en: {
    active: "Active filters",
    remove: (label: string) => `Remove filter: ${label}`,
    reset: "Reset all",
    search: (q: string) => `Search: “${q}”`,
    sort: (label: string) => `Sort: ${label}`,
    count: (n: number) => (n === 1 ? "1 product" : `${n} products`),
    searched: "You searched for:",
    tipsTitle: "Try this:",
    tips: [
      "Check the spelling or use a single word (for example, “gate”).",
      "Search by product type or size, such as “flange” or “DN150”.",
      "Remove the active filters to see the whole catalog.",
    ],
    familiesTitle: "Most viewed families",
    quote: (q: string) => `Request a quote for “${q}”`,
    quoteGeneric: "Request a quote",
    quoteNote: "If it is not in the web catalog, the sales team checks whether it can be supplied.",
  },
} as const;

/** Familias con página propia; los nombres son los de public-catalog.ts. */
const FAMILY_LINKS: readonly { href: string; name: Record<Lang, string> }[] = [
  { href: "/productos/valvulas", name: { es: "Válvulas", en: "Valves" } },
  { href: "/productos/tuberias", name: { es: "Tuberías", en: "Pipes" } },
  { href: "/productos/marcos-y-tapas", name: { es: "Marcos y tapas", en: "Frames and covers" } },
  { href: "/productos/accesorios-hdpe", name: { es: "Accesorios HDPE", en: "HDPE accessories" } },
  { href: "/productos/conexiones-y-fittings", name: { es: "Conexiones y fittings", en: "Connections and fittings" } },
];

/** Enlace a la cotización general con el texto buscado ya escrito (W16 lo muestra en «Producto que buscas»). */
export function quoteHrefFor(query: string) {
  const q = query.trim().slice(0, 120);
  return q ? `/cotizar?consulta=${encodeURIComponent(q)}` : "/cotizar";
}

export type FilterChip = { id: string; label: string; onRemove: () => void };

/**
 * Filtros activos como chips que se quitan uno a uno y «Restablecer todo» (X2-1). El número de resultados lo anuncia
 * cada pantalla en su encabezado (X1-1, <ResultCount>), así hay una sola región viva por listado.
 */
export function ActiveFilters({ lang, chips, onReset, focusFallback }: { lang: Lang; chips: readonly FilterChip[]; onReset: () => void; focusFallback?: () => void }) {
  const t = FILTER_UI[lang];
  const group = useRef<HTMLDivElement>(null);
  // El botón pulsado desaparece: el foco pasa al chip que ocupa su lugar o, si no queda ninguno, a la búsqueda.
  const refocus = (index: number) =>
    window.requestAnimationFrame(() => {
      const buttons = group.current?.querySelectorAll<HTMLButtonElement>("li button");
      if (buttons?.length) buttons[Math.min(index, buttons.length - 1)].focus();
      else focusFallback?.();
    });
  if (!chips.length) return null;
  return (
    <div ref={group} className={styles.chips} role="group" aria-label={t.active} data-active-filters>
      <ul>
        {chips.map((chip, index) => (
          <li key={chip.id} className={styles.chip}>
            <span>{chip.label}</span>
            <button type="button" onClick={() => { chip.onRemove(); refocus(index); }} aria-label={t.remove(chip.label)}>
              <X aria-hidden="true" size={14} strokeWidth={2.4} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.reset} onClick={() => { onReset(); window.requestAnimationFrame(() => focusFallback?.()); }}>{t.reset}</button>
    </div>
  );
}

/** Número de resultados que se anuncia al cambiar (aria-live polite, atómico). */
export function ResultCount({ lang, count, className }: { lang: Lang; count: number; className?: string }) {
  return <p className={className} aria-live="polite" aria-atomic="true" data-result-count={count}>{FILTER_UI[lang].count(count)}</p>;
}

/**
 * Búsqueda sin resultados (B30-3 / X5-7): repite lo buscado, da pistas, enlaza las familias y ofrece cotizar ese
 * texto. El contenedor (con su estilo) lo pone cada pantalla.
 */
export function EmptySearch({ lang, title, query, resetLabel, onReset, primaryClassName, secondaryClassName, children }: {
  lang: Lang;
  title: string;
  query: string;
  resetLabel: ReactNode;
  onReset: () => void;
  primaryClassName: string;
  secondaryClassName: string;
  children?: ReactNode;
}) {
  const t = FILTER_UI[lang];
  const q = query.trim();
  return (
    <div className={styles.empty} data-empty-search>
      <h3>{title}</h3>
      {q && <p className={styles.searched}>{t.searched} <strong>«{q}»</strong></p>}
      {children}
      <div className={styles.emptyGrid}>
        <div>
          <p className={styles.emptyLabel}>{t.tipsTitle}</p>
          <ul className={styles.tips}>{t.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        </div>
        <nav aria-label={t.familiesTitle}>
          <p className={styles.emptyLabel}>{t.familiesTitle}</p>
          <ul className={styles.families}>
            {FAMILY_LINKS.map((family) => (
              <li key={family.href}><Link href={family.href}>{family.name[lang]} <ArrowRight aria-hidden="true" size={14} /></Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.emptyActions}>
        <Link href={quoteHrefFor(q)} className={primaryClassName} data-quote-query>
          <FileText aria-hidden="true" size={16} /> {q ? t.quote(q) : t.quoteGeneric}
        </Link>
        <button type="button" className={secondaryClassName} onClick={onReset}>{resetLabel}</button>
      </div>
      <p className={styles.note}>{t.quoteNote}</p>
    </div>
  );
}
