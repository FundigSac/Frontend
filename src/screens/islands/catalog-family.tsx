"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Filter, MessageCircleMore, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CatalogCell, CatalogFamily } from "@/modules/catalog/public-catalog";
import { useLang } from "@/shared/layout/landing-prefs";
import { FAMILY_UI } from "./catalog-family-copy";
import { ActiveFilters, EmptySearch, FILTER_UI, ResultCount, type FilterChip } from "./catalog-filters";
import extra from "./catalog-family.module.css";
import styles from "./w04-tuberias.module.css";

type SortMode = "destacados" | "az" | "za";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Familias del catálogo sin pantalla propia en el diseño del 4 de noviembre (accesorios HDPE, conexiones, equipos de
 * termofusión y medidores). Usa la misma composición y estilos que la pantalla de tuberías: hero con foto, pestañas por
 * línea, buscador, tarjetas con foto y asesoría. Los productos y sus textos salen de public-catalog.ts; aquí no se añade
 * ningún dato.
 */
export function CatalogFamilyView({ family, cells }: { family: CatalogFamily; cells: readonly CatalogCell[] }) {
  const [lang] = useLang();
  const t = FAMILY_UI[lang];
  const [line, setLineState] = useState<string>("todas");
  const [query, setQueryState] = useState("");
  const [sort, setSortState] = useState<SortMode>("destacados");
  const [filtered, setFiltered] = useState(false);
  const setLine = (next: string) => { setFiltered(true); setLineState(next); };
  const setQuery = (next: string) => { setFiltered(true); setQueryState(next); };
  const setSort = (next: SortMode) => { setFiltered(true); setSortState(next); };

  // Solo las líneas que tienen productos; la miniatura de cada pestaña es la foto del primero.
  const lines = family.lines
    .map((l) => ({ ...l, cells: cells.filter((c) => c.line === l.id) }))
    .filter((l) => l.cells.length > 0);

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = cells.filter((cell) => {
      if (line !== "todas" && cell.line !== line) return false;
      return terms.every((term) => cell.search.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
    if (sort === "za") return [...list].sort((a, b) => b.name[lang].localeCompare(a.name[lang], lang));
    return list;
  }, [cells, line, query, sort, lang]);

  const name = family.name[lang];
  const searchRef = useRef<HTMLInputElement>(null);
  const f = FILTER_UI[lang];
  const lineLabel = lines.find((entry) => entry.id === line)?.label[lang];
  const chips: FilterChip[] = [
    ...(query.trim() ? [{ id: "q", label: f.search(query.trim()), onRemove: () => setQuery("") }] : []),
    ...(line !== "todas" && lineLabel ? [{ id: "line", label: lineLabel, onRemove: () => setLine("todas") }] : []),
    ...(sort !== "destacados" ? [{ id: "sort", label: f.sort(t.sorts[sort]), onRemove: () => setSort("destacados") }] : []),
  ];
  const resetAll = () => { setQuery(""); setLine("todas"); setSort("destacados"); };

  return (
    <main lang={lang} className={styles.page}>
      <link rel="preload" as="image" href="/media/tuberias-page/hero-w1920.webp" media="(min-width: 761px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/media/tuberias-page/hero-w1200.webp" media="(max-width: 760px)" fetchPriority="high" />
      <section className={styles.hero} aria-labelledby="familia-title">
        <span className={styles.topVeil} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav aria-label={t.crumbsLabel} className={styles.breadcrumbs}>
            <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><Link href="/productos">{t.products}</Link><span aria-hidden="true">›</span><span aria-current="page">{name}</span>
          </nav>
          <div className={styles.heroCopy} data-enter>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1 id="familia-title">{family.title[lang]}</h1>
            <p className={styles.heroDescription}>{family.lead[lang]}</p>
          </div>
          <div className={styles.qualityStamp}>{t.quality.map((word) => <span key={word}>{word}</span>)}</div>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label={t.region(name)}>
        <div className={styles.contentWidth}>
          {lines.length > 1 && (
            <div className={styles.tabs} data-reveal="stagger" role="tablist" aria-label={t.tabsLabel}>
              <button type="button" role="tab" aria-selected={line === "todas"} className={line === "todas" ? styles.tabActive : styles.tab} onClick={() => setLine("todas")}>
                <span className={`${styles.tabThumb} ${extra.contain}`}><Image src={cells[0].image} alt="" width={56} height={56} /></span>
                <span className={styles.tabText}><strong>{t.all}</strong><small>{cells.length} {cells.length === 1 ? t.one : t.many}</small></span>
              </button>
              {lines.map((entry) => (
                <button key={entry.id} type="button" role="tab" aria-selected={line === entry.id} className={line === entry.id ? styles.tabActive : styles.tab} onClick={() => setLine(line === entry.id ? "todas" : entry.id)}>
                  <span className={`${styles.tabThumb} ${extra.contain}`}><Image src={entry.cells[0].image} alt="" width={56} height={56} /></span>
                  <span className={styles.tabText}><strong>{entry.label[lang]}</strong><small>{entry.cells.length} {entry.cells.length === 1 ? t.one : t.many}</small></span>
                </button>
              ))}
            </div>
          )}

          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="sr-only">{t.searchLabel}</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" />
            </label>
            {lines.length > 1 && (
              <label className={styles.select}>
                <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{t.filter}</span>
                <ChevronDown size={16} aria-hidden="true" />
                <select value={line} onChange={(event) => setLine(event.target.value)} aria-label={t.filterLabel}>
                  <option value="todas">{t.allProducts}</option>
                  {lines.map((entry) => <option key={entry.id} value={entry.id}>{entry.label[lang]}</option>)}
                </select>
              </label>
            )}
            <label className={styles.select}>
              <ArrowUpDown size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{t.sort}</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label={t.sortLabel}>
                <option value="destacados">{t.sorts.destacados}</option>
                <option value="az">{t.sorts.az}</option>
                <option value="za">{t.sorts.za}</option>
              </select>
            </label>
          </div>

          <ActiveFilters lang={lang} chips={chips} onReset={resetAll} focusFallback={() => searchRef.current?.focus()} />

          <div className={styles.sectionHeading}>
            <h2>{t.explore(name)}</h2>
            <ResultCount lang={lang} count={visible.length} />
          </div>

          {visible.length ? (
            <div className={styles.grid} data-results data-filtered={filtered ? "" : undefined}>
              {visible.map((cell) => (
                <article key={cell.slug} className={styles.card} data-cell={cell.slug}>
                  <Link href={cell.href} className={`${styles.cardImage} ${extra.contain}`} aria-label={t.viewSheetOf + cell.name[lang]}>
                    <Image src={cell.image} alt={cell.alt[lang]} fill sizes="(min-width: 1100px) 28vw, (min-width: 640px) 44vw, 92vw" />
                    {cell.status === "por-confirmar" && <span className={extra.badge}>{t.pending}</span>}
                  </Link>
                  <div className={styles.cardBody}>
                    <h3>{cell.name[lang]}</h3>
                    {(cell.code || cell.range) && <small className={extra.meta}>{[cell.code, cell.range].filter(Boolean).join(" · ")}</small>}
                    <p>{cell.note[lang]}</p>
                    <Link href={cell.href} className={styles.cardButton}>{t.viewSheet} <ArrowRight size={15} aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              <EmptySearch
                lang={lang}
                title={t.emptyTitle}
                query={query}
                resetLabel={<>{t.emptyAction} <ArrowRight size={15} aria-hidden="true" /></>}
                onReset={resetAll}
                primaryClassName={styles.darkButton}
                secondaryClassName={styles.cardButton}
              >
                <p>{t.emptyText}</p>
              </EmptySearch>
            </div>
          )}
        </div>
      </section>

      <section className={styles.adviceSection} aria-labelledby="advice-title">
        <div className={styles.adviceBackdrop} aria-hidden="true">
          <Image src="/media/tuberias-page/asesoria.webp" alt="" fill sizes="45vw" />
        </div>
        <div className={styles.contentWidth + " " + styles.adviceInner}>
          <span className={styles.adviceIcon} aria-hidden="true"><MessageCircleMore size={46} strokeWidth={1.6} /></span>
          <div className={styles.adviceCopy} data-reveal>
            <h2 id="advice-title">{t.adviceTitle}</h2>
            <p>{t.adviceText}</p>
          </div>
          <Link href="/cotizar" className={styles.darkButton}>{t.adviceCta} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
