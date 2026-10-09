"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import {
  CATEGORY_LABEL, HOMOLOGATION_LABEL, JOINT_LABEL, quoteHref,
  type CatalogProduct, type HomologationId, type JointId, type ResultView,
} from "@/modules/catalog/data";
import {
  EMPTY_FILTERS, activeFilterCount, facetCount, paginate, parseQuery, runSearch,
  type CatalogState, type Filters, type SortId,
} from "@/modules/catalog/search";
import { DocLink } from "@/shared/ui/doc-link";
import { Highlight } from "@/shared/ui/catalog-highlight";
import { useCatalogUrlState } from "@/shared/ui/catalog-url-state";

const PAGE_SIZE = 6;
const DN_STEPS = [25, 50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200];
const DN_MIN = DN_STEPS[0];
const DN_MAX = DN_STEPS[DN_STEPS.length - 1];

const SORTS: [SortId, string][] = [
  ["relevancia", "Relevancia Técnica (SEDAPAL/NTP)"],
  ["dn-asc", `Diámetro Nominal (DN ${DN_MIN} → DN ${DN_MAX})`],
  ["dn-desc", `Diámetro Nominal (DN ${DN_MAX} → DN ${DN_MIN})`],
  ["pn-desc", "Mayor Presión Nominal (PN 25 / PN 16)"],
  ["sku", "Código SKU"],
];

const CATS: ["valvulas" | "tuberias" | "marcos-y-tapas", string][] = [
  ["valvulas", "Válvulas de Línea"],
  ["tuberias", "Tuberías y Juntas"],
  ["marcos-y-tapas", "Marcos y Tapas Viales"],
];
const JOINTS: [JointId, string][] = [
  ["bridada-f4", "Bridada F4 (Corta ISO 5752)"],
  ["bridada-f5", "Bridada F5 (Larga DIN 3202)"],
  ["ranurada", "Ranurada / Vitaulic"],
  ["roscada", "Roscada NPT / BSP"],
];
const HOMS: HomologationId[] = ["sedapal", "otass", "wras"];

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") as ScrollBehavior;

/** Vista de tarjeta: la del diseño si existe; si no, se deriva de los campos del producto. */
function resultOf(p: CatalogProduct): ResultView & { rows: { label: string; value: string; kind: "plain" | "primary" | "hm"; icon?: string; className?: string }[] } {
  if (p.result) {
    const r = p.result;
    return { ...r, rows: [{ label: "Rango DN:", value: r.dn, kind: "plain" }, { label: "Presión Trabajo:", value: r.pn, kind: "primary" }, { label: "Homologación:", value: r.hm.text, kind: "hm", icon: r.hm.icon, className: r.hm.className }] };
  }
  const dn = p.dn ? `DN ${p.dn[0]} a DN ${p.dn[1]}` : "";
  const pn = p.pn?.length ? p.pn.map((n) => `PN ${n}`).join(" / ") : "";
  const rows: { label: string; value: string; kind: "plain" | "primary" | "hm"; icon?: string; className?: string }[] = p.dn
    ? [{ label: "Rango DN:", value: dn, kind: "plain" }, { label: "Presión Trabajo:", value: pn || "—", kind: "primary" }]
    : [{ label: `${p.specs[0][0]}:`, value: p.specs[0][1], kind: "plain" }, { label: `${p.specs[1][0]}:`, value: p.specs[1][1], kind: "primary" }];
  rows.push(
    p.homologation.length
      ? { label: "Homologación:", value: p.homologation.map((h) => ({ sedapal: "SEDAPAL", otass: "OTASS / EPS", wras: "WRAS" })[h]).join(" / "), kind: "hm", icon: "check_circle", className: "text-success font-bold flex items-center gap-1" }
      : { label: "Norma:", value: p.standards.slice(0, 2).join(" · "), kind: "plain" },
  );
  return {
    tag: p.kicker.toUpperCase(), tagClass: "bg-surface-container-highest text-on-surface-variant", norm: p.standards[0] ?? "", title: p.name, summary: p.summary,
    dn, pn, hm: { text: "", icon: "", className: "" }, rows,
  };
}

/* ───────────────────────── Componente principal ───────────────────────── */

export function W22Search({ initial }: { initial: CatalogState }) {
  const [state, update] = useCatalogUrlState(initial);
  const [draft, setDraft] = useState(initial.q);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const resultsId = useId();

  const { q, filters, sort, view } = state;
  const parsed = useMemo(() => parseQuery(q), [q]);
  const hits = useMemo(() => runSearch(q, filters, sort), [q, filters, sort]);
  const total = hits.length;
  const pg = paginate(hits, state.page, PAGE_SIZE);
  const nActive = activeFilterCount(filters);

  const setFilters = (patch: Partial<Filters>) => update((s) => ({ filters: { ...s.filters, ...patch } }));
  const applyQuery = (next: string) => {
    setDraft(next);
    update({ q: next });
  };
  const resetFilters = () => update({ filters: EMPTY_FILTERS });
  /* Criterios aplicados (chips): numéricos reconocidos en el texto + filtros activos */
  type Chip = { key: string; label: string; icon: string; tone: string; remove: () => void };
  const chips: Chip[] = [];
  parsed.pn.forEach((n) =>
    chips.push({ key: `qpn${n}`, label: `Presión: PN ${n}`, icon: "speed", tone: "bg-primary-fixed text-on-primary-fixed", remove: () => applyQuery(q.replace(new RegExp(`\\bpn\\s*-?\\s*${n}\\b`, "i"), " ").replace(/\s+/g, " ").trim()) }),
  );
  parsed.dn.forEach((n) =>
    chips.push({ key: `qdn${n}`, label: `Diámetro: DN ${n}`, icon: "straighten", tone: "bg-secondary-fixed text-on-secondary-fixed", remove: () => applyQuery(q.replace(new RegExp(`\\bdn\\s*-?\\s*${n}\\b`, "i"), " ").replace(/\s+/g, " ").trim()) }),
  );
  filters.cat.forEach((c) => chips.push({ key: `cat${c}`, label: `Tipo: ${CATEGORY_LABEL[c as keyof typeof CATEGORY_LABEL] ?? c}`, icon: "valve", tone: "bg-secondary-fixed text-on-secondary-fixed", remove: () => setFilters({ cat: filters.cat.filter((x) => x !== c) }) }));
  filters.pn.forEach((n) => chips.push({ key: `pn${n}`, label: `Presión: PN ${n}`, icon: "speed", tone: "bg-primary-fixed text-on-primary-fixed", remove: () => setFilters({ pn: filters.pn.filter((x) => x !== n) }) }));
  filters.joint.forEach((j) => chips.push({ key: `j${j}`, label: JOINT_LABEL[j], icon: "science", tone: "bg-surface-container-highest text-on-surface-variant", remove: () => setFilters({ joint: filters.joint.filter((x) => x !== j) }) }));
  filters.hom.forEach((h) => chips.push({ key: `h${h}`, label: HOMOLOGATION_LABEL[h], icon: "science", tone: "bg-surface-container-highest text-on-surface-variant", remove: () => setFilters({ hom: filters.hom.filter((x) => x !== h) }) }));
  if (filters.dnMin !== undefined || filters.dnMax !== undefined)
    chips.push({ key: "dn", label: `DN ${filters.dnMin ?? DN_MIN} – DN ${filters.dnMax ?? DN_MAX}`, icon: "straighten", tone: "bg-secondary-fixed text-on-secondary-fixed", remove: () => setFilters({ dnMin: undefined, dnMax: undefined }) });

  /* Conteos de facetas (ignoran la propia faceta) */
  const catCount = (c: string) => facetCount(q, filters, "cat", (p) => p.category === c);
  const jointCount = (j: JointId) => facetCount(q, filters, "joint", (p) => p.joint === j);
  const homCount = (h: HomologationId) => facetCount(q, filters, "hom", (p) => p.homologation.includes(h));

  const dnLo = filters.dnMin ?? DN_MIN;
  const dnHi = filters.dnMax ?? DN_MAX;
  const pct = (v: number) => ((v - DN_MIN) / (DN_MAX - DN_MIN)) * 100;
  const setDn = (lo: number, hi: number) => {
    const a = Math.min(lo, hi);
    const b = Math.max(lo, hi);
    setFilters({ dnMin: a <= DN_MIN ? undefined : a, dnMax: b >= DN_MAX ? undefined : b });
  };

  const goto = (n: number) => {
    update({ page: n }, true);
    document.getElementById(resultsId)?.scrollIntoView({ behavior: smooth(), block: "start" });
  };

  const countLine =
    q.trim() === "" ? (
      <>
        Mostrando{" "}
        <strong className="text-on-surface font-semibold">
          {total} {total === 1 ? "producto" : "productos"}
        </strong>
        {" "}del catálogo
      </>
    ) : (
      <>
        {total === 0 ? "No se encontraron resultados" : <>Se {total === 1 ? "encontró" : "encontraron"}{" "}
        <strong className="text-on-surface font-semibold">
          {total} {total === 1 ? "resultado" : "resultados"} de ingeniería
        </strong></>}
        {" "}para{" "}
        <span className="italic text-primary font-medium">
          &quot;{q}&quot;
        </span>
      </>
    );

  return (
    <>
      <section className="w-full bg-surface-container-low py-4">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 font-ui-label text-ui-label text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                home
              </span>
              <span>
                Inicio
              </span>
            </Link>
            <span className="material-symbols-outlined text-[13px] text-outline" aria-hidden="true">
              chevron_right
            </span>
            <Link href="/productos" className="hover:text-primary transition-colors">
              Catálogo Técnico
            </Link>
            <span className="material-symbols-outlined text-[13px] text-outline" aria-hidden="true">
              chevron_right
            </span>
            <span className="text-on-surface font-semibold truncate" aria-current="page">
              {q.trim() ? `Búsqueda: "${q}"` : "Búsqueda"}
            </span>
          </nav>
        </div>
      </section>
      <section className="w-full bg-surface-container-lowest py-8">
        <div className="max-w-[1200px] mx-auto px-6 space-y-6">
          <div className="relative bg-surface rounded-xl p-3 shadow-sm">
            <form
              action="/buscar"
              method="get"
              role="search"
              className="flex flex-col md:flex-row items-stretch md:items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                applyQuery(draft.trim());
              }}
            >
              <div className="relative flex-1 flex items-center bg-surface-elevated rounded-lg px-4 h-12 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mr-3" aria-hidden="true">
                  manage_search
                </span>
                <input
                  ref={inputRef}
                  className="w-full bg-transparent border-none text-on-surface font-body-default text-body-default placeholder-text-muted focus:outline-none"
                  id="search-input"
                  name="q"
                  aria-label="Buscar productos"
                  placeholder="Buscar por DN, norma, código de producto o aplicación..."
                  type="search"
                  autoComplete="off"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                {draft ? (
                  <button
                    className="p-1 text-text-muted hover:text-on-surface ml-2"
                    type="button"
                    aria-label="Borrar búsqueda"
                    onClick={() => {
                      applyQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      cancel
                    </span>
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="flex-1 md:flex-none h-12 px-5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-variant font-button-text text-button-text flex items-center justify-center gap-2 transition-colors"
                  type="button"
                  onClick={() => {
                    filtersRef.current?.scrollIntoView({ behavior: smooth(), block: "start" });
                    filtersRef.current?.focus({ preventScroll: true });
                  }}
                >
                  <span className="material-symbols-outlined text-[19px] text-primary" aria-hidden="true">
                    tune
                  </span>
                  <span>
                    Parámetros de Norma
                  </span>
                </button>
                <button className="flex-1 md:flex-none h-12 px-7 rounded-lg bg-primary text-brand-on hover:bg-primary-container font-button-text text-button-text flex items-center justify-center gap-2 transition-all shadow-sm" type="submit">
                  <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                    search
                  </span>
                  <span>
                    Re-ejecutar
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse motion-reduce:animate-none" />
              <p className="font-body-compact text-body-compact text-on-surface-variant" role="status" aria-live="polite" aria-atomic="true">
                {countLine}
                {" "}
                <span className="text-text-muted">
                  (coincidencia por texto, DN y PN)
                </span>
              </p>
            </div>
            {chips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 font-ui-label text-ui-label">
                <span className="text-text-muted mr-1 uppercase tracking-wider text-[11px]">
                  Criterios aplicados:
                </span>
                {chips.map((c) => (
                  <div key={c.key} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full ${c.tone}`}>
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      {c.icon}
                    </span>
                    <span>
                      {c.label}
                    </span>
                    <button type="button" className="hover:text-error transition-colors ml-0.5" aria-label={`Quitar criterio: ${c.label}`} onClick={c.remove}>
                      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                <button type="button" className="text-danger hover:underline font-semibold ml-2 text-[11px] uppercase tracking-wider" onClick={() => { setDraft(""); update({ q: "", filters: EMPTY_FILTERS }); }}>
                  Restablecer todos los filtros
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <div className="w-full bg-background py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-3 space-y-6">
              <div ref={filtersRef} tabIndex={-1} id="filtros-tecnicos" aria-label="Filtros técnicos" className="bg-surface rounded-xl p-5 shadow-sm space-y-6 outline-none">
                <div className="flex items-center justify-between pb-3 bg-surface-container-high -mx-5 -mt-5 p-5 rounded-t-xl">
                  <span className="font-headline-card text-[17px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
                      filter_alt
                    </span>
                    Filtros Técnicos
                  </span>
                  <span className="font-ui-label text-ui-label bg-surface-container-lowest text-primary px-2 py-0.5 rounded-full font-bold">
                    {nActive} {nActive === 1 ? "activo" : "activos"}
                  </span>
                </div>
                <fieldset className="space-y-3 min-w-0">
                  <legend className="flex items-center justify-between font-ui-label text-ui-label text-on-surface font-semibold w-full mb-3">
                    <span>
                      FAMILIA MATRIZ
                    </span>
                  </legend>
                  <div className="space-y-2 font-body-compact text-body-compact">
                    {CATS.map(([id, label]) => {
                      const n = catCount(id);
                      const on = filters.cat.includes(id);
                      const disabled = n === 0 && !on;
                      return (
                        <FacetOption key={id} label={label} count={n} checked={on} disabled={disabled} onChange={() => setFilters({ cat: toggle(filters.cat, id) })} />
                      );
                    })}
                  </div>
                </fieldset>
                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between font-ui-label text-ui-label text-on-surface font-semibold">
                    <span>
                      RANGO DE DIÁMETRO (DN)
                    </span>
                    <span className="text-[11px] text-primary font-bold">
                      DN {dnLo} - DN {dnHi}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-ui-label text-text-muted" aria-hidden="true">
                      <span>
                        DN {DN_MIN}
                      </span>
                      <span>
                        DN 600
                      </span>
                      <span>
                        DN {DN_MAX}
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full relative" aria-hidden="true">
                      <div className="absolute h-2 bg-primary rounded-full" style={{ left: `${pct(dnLo)}%`, right: `${100 - pct(dnHi)}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-brand-on rounded-full shadow-md ring-2 ring-primary" style={{ left: `${pct(dnLo)}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-brand-on rounded-full shadow-md ring-2 ring-primary" style={{ left: `${pct(dnHi)}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <select
                        aria-label="Diámetro nominal mínimo"
                        className="bg-surface-elevated rounded px-2.5 py-1.5 shadow-sm text-center [text-align-last:center] font-ui-label text-ui-label text-on-surface font-bold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus"
                        value={dnLo}
                        onChange={(e) => setDn(Number(e.target.value), dnHi)}
                      >
                        {DN_STEPS.map((n) => (
                          <option key={n} value={n}>
                            Mín: DN {n}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Diámetro nominal máximo"
                        className="bg-surface-elevated rounded px-2.5 py-1.5 shadow-sm text-center [text-align-last:center] font-ui-label text-ui-label text-on-surface font-bold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus"
                        value={dnHi}
                        onChange={(e) => setDn(dnLo, Number(e.target.value))}
                      >
                        {DN_STEPS.map((n) => (
                          <option key={n} value={n}>
                            Máx: DN {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <fieldset className="space-y-3 pt-3 min-w-0">
                  <legend className="flex items-center justify-between font-ui-label text-ui-label text-on-surface font-semibold w-full mb-3">
                    <span>
                      CONEXIÓN Y LONGITUD
                    </span>
                  </legend>
                  <div className="space-y-2 font-body-compact text-body-compact">
                    {JOINTS.map(([id, label]) => {
                      const n = jointCount(id);
                      const on = filters.joint.includes(id);
                      return <FacetOption key={id} label={label} count={n} checked={on} disabled={n === 0 && !on} onChange={() => setFilters({ joint: toggle(filters.joint, id) })} />;
                    })}
                  </div>
                </fieldset>
                <fieldset className="space-y-3 pt-3 min-w-0">
                  <legend className="flex items-center justify-between font-ui-label text-ui-label text-on-surface font-semibold w-full mb-3">
                    <span>
                      HOMOLOGACIÓN EN PERÚ
                    </span>
                  </legend>
                  <div className="space-y-2 font-body-compact text-body-compact">
                    {HOMS.map((id) => {
                      const n = homCount(id);
                      const on = filters.hom.includes(id);
                      return <FacetOption key={id} label={HOMOLOGATION_LABEL[id]} count={n} checked={on} disabled={n === 0 && !on} onChange={() => setFilters({ hom: toggle(filters.hom, id) })} />;
                    })}
                  </div>
                </fieldset>
                <div className="pt-2">
                  <button type="button" onClick={resetFilters} disabled={nActive === 0} className="w-full py-2.5 px-3 rounded-lg bg-surface-container-high text-primary hover:bg-surface-variant font-button-text text-button-text transition-colors flex items-center justify-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                      restart_alt
                    </span>
                    <span>
                      Limpiar Selección
                    </span>
                  </button>
                </div>
              </div>
              <div className="bg-primary text-brand-on rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary-container text-[22px]" aria-hidden="true">
                      verified
                    </span>
                  </div>
                  <div>
                    <p className="font-headline-card text-[15px] font-bold leading-tight">
                      Garantía Fundición GGG-50
                    </p>
                    <p className="font-ui-label text-[11px] text-on-primary-container">
                      ISO 1083 / EN 1563
                    </p>
                  </div>
                </div>
                <p className="font-body-compact text-body-compact text-surface-container-low">
                  Todas las válvulas PN 16 cuentan con recubrimiento epóxico electrostático azul RAL 5005 ≥ 250 µm conforme a norma EN 1074-1/2.
                </p>
                <div className="p-3 bg-primary-container rounded-lg font-ui-label text-ui-label flex items-center gap-2 text-surface-container-lowest">
                  <span className="material-symbols-outlined text-[16px] text-on-primary-container" aria-hidden="true">
                    warehouse
                  </span>
                  <span>
                    Lurín: 4,200 unds en Stock Activo
                  </span>
                </div>
              </div>
            </aside>
            <section id={resultsId} aria-label="Resultados de búsqueda" className="lg:col-span-9 space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <label htmlFor="w22-orden" className="font-ui-label text-ui-label text-text-muted uppercase tracking-wider">
                    Ordenar por:
                  </label>
                  <div className="relative inline-block">
                    <select
                      id="w22-orden"
                      className="appearance-none bg-surface-elevated text-on-surface font-body-compact text-body-compact rounded-lg pl-3 pr-8 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-focus font-medium cursor-pointer"
                      value={sort}
                      onChange={(e) => update({ sort: e.target.value as SortId })}
                    >
                      {SORTS.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    {" "}
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[18px]" aria-hidden="true">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="font-ui-label text-ui-label text-text-muted mr-1" id="w22-vista">
                    Vista:
                  </span>
                  <div role="group" aria-labelledby="w22-vista" className="flex items-center bg-surface-container p-0.5 rounded-lg">
                    <button
                      type="button"
                      aria-pressed={view === "tarjetas"}
                      className={view === "tarjetas" ? "p-1.5 rounded-md bg-surface-elevated text-primary shadow-sm" : "p-1.5 rounded-md text-on-surface-variant hover:text-on-surface"}
                      title="Vista en Mosaico (Cards)"
                      aria-label="Vista en mosaico"
                      onClick={() => update({ view: "tarjetas" }, true)}
                    >
                      <span className="material-symbols-outlined text-[20px] block" aria-hidden="true">
                        grid_view
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === "tabla"}
                      className={view === "tabla" ? "p-1.5 rounded-md bg-surface-elevated text-primary shadow-sm" : "p-1.5 rounded-md text-on-surface-variant hover:text-on-surface"}
                      title="Vista en Tabla de Especificaciones"
                      aria-label="Vista en tabla de especificaciones"
                      onClick={() => update({ view: "tabla" }, true)}
                    >
                      <span className="material-symbols-outlined text-[20px] block" aria-hidden="true">
                        table_rows
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {total === 0 ? (
                <div className="rounded-xl bg-surface-elevated shadow-sm p-10 flex flex-col items-center text-center gap-3">
                  <span className="material-symbols-outlined text-[40px] text-outline" aria-hidden="true">
                    manage_search
                  </span>
                  <h2 className="font-headline-card text-headline-card text-on-surface">
                    {q.trim() ? `Sin resultados para «${q}»` : "Sin resultados con estos filtros"}
                  </h2>
                  <p className="font-body-compact text-body-compact text-text-secondary max-w-md">
                    Revise la ortografía, pruebe con un código, una norma o un diámetro (ej. «DN 200», «EN 124»), o quite algunos filtros.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button type="button" onClick={() => { setDraft(""); update({ q: "", filters: EMPTY_FILTERS }); }} className="h-10 px-5 rounded-lg bg-primary text-brand-on font-button-text text-button-text hover:bg-primary-container transition-colors">
                      Restablecer todos los filtros
                    </button>
                    <Link href="/productos" className="h-10 px-5 rounded-lg bg-surface-container text-primary font-button-text text-button-text hover:bg-surface-container-high transition-colors flex items-center">
                      Ver catálogo completo
                    </Link>
                    <Link href="/contacto" className="h-10 px-5 rounded-lg bg-surface-container text-primary font-button-text text-button-text hover:bg-surface-container-high transition-colors flex items-center">
                      Consultar a ingeniería
                    </Link>
                  </div>
                </div>
              ) : view === "tabla" ? (
                <div className="overflow-x-auto rounded-xl bg-surface-elevated shadow-sm">
                  <table className="w-full text-left font-body-compact text-body-compact border-collapse">
                    <caption className="sr-only">
                      Especificaciones técnicas de los productos encontrados
                    </caption>
                    <thead>
                      <tr className="bg-surface-container text-on-surface font-semibold font-ui-label text-ui-label uppercase">
                        <th scope="col" className="p-3">
                          Producto
                        </th>
                        <th scope="col" className="p-3">
                          SKU
                        </th>
                        <th scope="col" className="p-3">
                          Rango DN
                        </th>
                        <th scope="col" className="p-3">
                          PN
                        </th>
                        <th scope="col" className="p-3">
                          Normas
                        </th>
                        <th scope="col" className="p-3 text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pg.items.map(({ product: p }) => (
                        <tr key={p.id} className="hover:bg-surface-container-low transition-colors align-top">
                          <th scope="row" className="p-3 font-medium text-on-surface">
                            <Link href={p.href} className="hover:text-primary transition-colors">
                              <Highlight text={p.name} terms={parsed.terms} />
                            </Link>
                          </th>
                          <td className="p-3 font-mono text-[12px] text-text-muted whitespace-nowrap">
                            {p.sku ?? "—"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {p.dn ? `DN ${p.dn[0]} – DN ${p.dn[1]}` : "—"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {p.pn?.length ? p.pn.map((n) => `PN ${n}`).join(" / ") : "—"}
                          </td>
                          <td className="p-3">
                            {p.standards.slice(0, 2).join(" · ")}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <DocLink title={`Ficha técnica: ${p.name}`} className="h-9 px-3 rounded-lg bg-surface-container text-primary font-button-text text-ui-label flex items-center gap-1 hover:bg-surface-variant transition-colors">
                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                  picture_as_pdf
                                </span>
                                <span>
                                  Ficha PDF
                                </span>
                              </DocLink>
                              <Link href={quoteHref(p)} className="h-9 px-3 rounded-lg bg-primary text-brand-on font-button-text text-ui-label flex items-center gap-1 hover:bg-primary-container transition-colors">
                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                  add_shopping_cart
                                </span>
                                <span>
                                  Cotizar Lote
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pg.items.map(({ product: p }) => (
                    <ResultCard key={p.id} p={p} terms={parsed.terms} />
                  ))}
                </div>
              )}
              {total > 0 ? (
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="font-ui-label text-ui-label text-text-muted">
                    Mostrando {pg.items.length} de {total} especificaciones técnicas activas
                  </span>
                  <nav aria-label="Paginación" className="flex items-center gap-1">
                    <button type="button" aria-label="Página anterior" disabled={pg.page <= 1} onClick={() => goto(pg.page - 1)} className="w-9 h-9 rounded-lg bg-surface text-text-muted flex items-center justify-center enabled:hover:bg-surface-container enabled:text-on-surface transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        chevron_left
                      </span>
                    </button>
                    {Array.from({ length: pg.pages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`Página ${n}`}
                        aria-current={n === pg.page ? "page" : undefined}
                        onClick={() => goto(n)}
                        className={n === pg.page ? "w-9 h-9 rounded-lg bg-primary text-brand-on font-bold font-ui-label text-ui-label flex items-center justify-center shadow-sm" : "w-9 h-9 rounded-lg bg-surface text-on-surface-variant font-medium font-ui-label text-ui-label flex items-center justify-center hover:bg-surface-container transition-colors"}
                      >
                        {n}
                      </button>
                    ))}
                    <button type="button" aria-label="Página siguiente" disabled={pg.page >= pg.pages} onClick={() => goto(pg.page + 1)} className="w-9 h-9 rounded-lg bg-surface text-text-muted flex items-center justify-center enabled:hover:bg-surface-container enabled:text-on-surface transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        chevron_right
                      </span>
                    </button>
                  </nav>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Piezas ───────────────────────── */

function FacetOption({ label, count, checked, disabled, onChange }: { label: string; count: number; checked: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center justify-between group ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
      <span className={`flex items-center gap-2.5 ${disabled ? "text-text-muted" : "text-on-surface"}`}>
        <input className="w-4 h-4 rounded text-primary focus:ring-focus accent-primary" type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
        <span>
          {label}
        </span>
      </span>
      <span className={`font-ui-label text-ui-label px-2 py-0.5 rounded ${disabled ? "bg-surface-variant text-text-muted" : "bg-surface-container text-on-surface-variant font-semibold"}`}>
        {count}
      </span>
    </label>
  );
}

function ResultCard({ p, terms }: { p: CatalogProduct; terms: readonly string[] }) {
  const r = resultOf(p);
  return (
    <article className="bg-surface-elevated rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      <div className="relative bg-surface aspect-[4/3] overflow-hidden flex items-center justify-center p-4">
        <Image src={p.resultImage ?? p.image} alt={p.imageAlt} width={1408} height={768} sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 100vw" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <span className={`absolute top-3 left-3 ${r.tagClass} font-ui-label text-ui-label px-2 py-0.5 rounded uppercase font-bold tracking-wide`}>
          {r.tag}
        </span>
        {r.chip ? (
          <span className={`absolute top-3 right-3 ${r.chipClass ?? "bg-surface-container text-on-surface-variant"} font-ui-label text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm`}>
            {r.chipDot ? <span className="w-1.5 h-1.5 rounded-full bg-success" /> : null}
            {r.chip}
          </span>
        ) : null}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-ui-label text-text-muted">
            <span className="font-mono">
              {p.sku ? `SKU: ${p.sku}` : "Sin SKU asignado"}
            </span>
            {r.norm ? (
              <span className="bg-surface-container-high px-1.5 py-0.2 rounded text-on-surface-variant">
                {r.norm}
              </span>
            ) : null}
          </div>
          <h3 className="font-headline-card text-[17px] text-on-surface font-bold leading-snug group-hover:text-primary transition-colors">
            <Link href={p.href}>
              <Highlight text={r.title} terms={terms} />
            </Link>
          </h3>
          <p className="font-body-compact text-body-compact text-on-surface-variant line-clamp-2">
            <Highlight text={r.summary} terms={terms} />
          </p>
        </div>
        <div className="bg-surface p-3 rounded-lg space-y-1.5 text-[12px] font-ui-label">
          {r.rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-text-muted shrink-0">
                {row.label}
              </span>
              {row.kind === "hm" ? (
                <span className={`${row.className ?? ""} text-right`}>
                  {row.icon ? (
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                      {row.icon}
                    </span>
                  ) : null}
                  {row.value}
                </span>
              ) : (
                <strong className={`${row.kind === "primary" ? "text-primary" : "text-on-surface"} font-semibold text-right`}>
                  {row.value}
                </strong>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <DocLink title={`Ficha técnica: ${p.name}`} className="h-10 rounded-lg bg-surface-container text-primary font-button-text text-button-text flex items-center justify-center gap-1 hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              picture_as_pdf
            </span>
            <span>
              Ficha PDF
            </span>
          </DocLink>
          <Link href={quoteHref(p)} aria-label={`Cotizar lote: ${p.name}`} className="h-10 rounded-lg bg-primary text-brand-on font-button-text text-button-text flex items-center justify-center gap-1 hover:bg-primary-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              add_shopping_cart
            </span>
            <span>
              Cotizar Lote
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
