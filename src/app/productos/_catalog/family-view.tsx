"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpDown, Download, FileText, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { CatalogCell, CatalogDocument, CatalogFamily, CompareTable } from "@/modules/catalog/public-catalog";
import { documentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { BAND_TITLES, UI } from "./copy";
import { ProductCell } from "./product-cell";
import { useNewCells } from "./use-new-cells";
import styles from "./catalog.module.css";

type SortMode = "destacados" | "az" | "za";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const REGION: Record<CatalogFamily["slug"], { es: string; en: string }> = {
  valvulas: { es: "Catálogo de válvulas", en: "Valve catalog" },
  tuberias: { es: "Catálogo de tuberías", en: "Pipe catalog" },
  "marcos-y-tapas": { es: "Catálogo de marcos y tapas", en: "Frames and covers catalog" },
  "accesorios-hdpe": { es: "Catálogo de accesorios HDPE", en: "HDPE accessories catalog" },
  "conexiones-y-fittings": { es: "Catálogo de conexiones y fittings", en: "Connections and fittings catalog" },
  "equipos-termofusion": { es: "Catálogo de equipos de termofusión", en: "Fusion equipment catalog" },
  medidores: { es: "Catálogo de medidores", en: "Meter catalog" },
};

const SEARCH: Record<CatalogFamily["slug"], { es: string; en: string; ph: { es: string; en: string } }> = {
  valvulas: { es: "Buscar válvula por nombre o referencia", en: "Search valves by name or reference", ph: { es: "Buscar válvula por nombre o referencia…", en: "Search valves by name or reference…" } },
  tuberias: { es: "Buscar tubería por nombre, diámetro o referencia", en: "Search pipes by name, diameter or reference", ph: { es: "Buscar tubería por nombre o diámetro…", en: "Search pipes by name or diameter…" } },
  "marcos-y-tapas": { es: "Buscar tapa o marco por nombre o referencia", en: "Search covers or frames by name or reference", ph: { es: "Buscar tapa o marco…", en: "Search covers or frames…" } },
  "accesorios-hdpe": { es: "Buscar accesorio por nombre o medida", en: "Search accessories by name or size", ph: { es: "Buscar accesorio por nombre o medida…", en: "Search accessories by name or size…" } },
  "conexiones-y-fittings": { es: "Buscar conexión por nombre o código", en: "Search connections by name or code", ph: { es: "Buscar conexión por nombre o código…", en: "Search connections by name or code…" } },
  "equipos-termofusion": { es: "Buscar equipo por modelo o rango", en: "Search equipment by model or range", ph: { es: "Buscar equipo por modelo o rango…", en: "Search equipment by model or range…" } },
  medidores: { es: "Buscar medidor por tipo o medida", en: "Search meters by type or size", ph: { es: "Buscar medidor por tipo o medida…", en: "Search meters by type or size…" } },
};

const TAB_LABEL = { es: "Tipos de producto", en: "Product types" } as const;
const ALL_LABEL = { es: "Todas", en: "All" } as const;

export function FamilyView({ family, cells, compare, documents }: { family: CatalogFamily; cells: readonly CatalogCell[]; compare?: CompareTable; documents: readonly CatalogDocument[] }) {
  const [lang] = useLang();
  const t = UI[lang];
  const [line, setLine] = useState<string>("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("destacados");

  const lines = family.lines.filter((l) => cells.some((c) => c.line === l.id));

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = cells.filter((cell) => {
      if (line !== "todas" && cell.line !== line) return false;
      return terms.every((term) => cell.search.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
    if (sort === "za") return [...list].sort((a, b) => b.name[lang].localeCompare(a.name[lang], lang));
    return list;
  }, [cells, lang, line, query, sort]);

  const { filtered, fresh } = useNewCells(visible.map((c) => c.slug));
  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");
  const reset = () => { setQuery(""); setLine("todas"); };
  const titleId = "family-title";

  return (
    <main lang={lang} className={styles.page}>
      <header className={`${styles.shell} ${styles.head}`}>
        <nav aria-label={t.crumbs} className={styles.crumbs}>
          <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><Link href="/productos">{t.products}</Link><span aria-hidden="true">›</span><span aria-current="page">{family.name[lang]}</span>
        </nav>
        <div className={styles.headGrid}>
          <div>
            <h1 id={titleId}>{family.title[lang]}</h1>
            <p className={styles.lead}>{family.lead[lang]}</p>
          </div>
          <div className={styles.headAside} data-enter>
            <Link href="/contacto?motivo=documentacion" className="lp-btn lp-btn--outline"><FileText size={16} aria-hidden="true" /> {t.askDocs}</Link>
          </div>
        </div>
      </header>

      <section className={styles.results} aria-label={REGION[family.slug][lang]}>
        <div className={styles.shell}>
          <div className={styles.tabs} role="tablist" aria-label={TAB_LABEL[lang]} data-enter>
            <button type="button" role="tab" aria-selected={line === "todas"} className={styles.tab} onClick={() => setLine("todas")}>
              {ALL_LABEL[lang]}<span aria-hidden="true" className={styles.tabCount}>{cells.length}</span><span className="sr-only"> {t.productsCount(cells.length)}</span>
            </button>
            {lines.map((entry) => {
              const total = cells.filter((c) => c.line === entry.id).length;
              return (
                <button key={entry.id} type="button" role="tab" aria-selected={line === entry.id} className={styles.tab} onClick={() => setLine(line === entry.id ? "todas" : entry.id)}>
                  {entry.label[lang]}<span aria-hidden="true" className={styles.tabCount}>{total}</span><span className="sr-only"> {t.productsCount(total)}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="sr-only">{SEARCH[family.slug][lang]}</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={SEARCH[family.slug].ph[lang]} autoComplete="off" />
            </label>
            <label className={styles.sort}>
              <span className="sr-only">{t.sortLabel}</span>
              <ArrowUpDown size={17} strokeWidth={1.8} aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label={t.sortLabel}>
                <option value="destacados">{t.sorts.destacados}</option>
                <option value="az">{t.sorts.az}</option>
                <option value="za">{t.sorts.za}</option>
              </select>
            </label>
          </div>

          <div className={styles.count}>
            <p aria-live="polite">{t.productsCount(visible.length)}</p>
          </div>

          {visible.length ? (
            <div className={`celdas ${styles.grid}`}>
              {visible.map((cell, index) => <ProductCell key={cell.slug} cell={cell} lang={lang} index={index} filtered={filtered} isNew={fresh.has(cell.slug)} />)}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              <h3>{t.emptyTitle}</h3>
              <p>{t.emptyText}</p>
              <button type="button" className="lp-btn lp-btn--solid" onClick={reset}>{t.emptyAction} <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </section>

      {compare && (
        <section className={`${styles.shell} sec`} aria-labelledby="compare-title">
          <div className="cota" data-reveal>
            <h2 id="compare-title">{t.compareTitle}</h2>
            <p>{t.compareLead}</p>
          </div>
          <table className="tabla-tec" data-reveal>
            <thead>
              <tr><th scope="col">{t.compareModel}</th>{compare.head.map((h) => <th key={h.es} scope="col" className="num">{h[lang]}</th>)}</tr>
            </thead>
            <tbody>
              {compare.rows.map((row) => (
                <tr key={row.href}>
                  <th scope="row"><Link href={row.href} className={styles.tableLink}>{row.name[lang]}</Link></th>
                  {row.cells.map((value, i) => <td key={compare.head[i].es} data-label={compare.head[i][lang]} className="num">{value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className={`${styles.shell} ${compare ? styles.sectionTight : "sec"}`} aria-labelledby="family-docs-title">
        <div className="cota" data-reveal>
          <h2 id="family-docs-title">{t.docsTitle}</h2>
          <p>{t.docsLead}</p>
        </div>
        <ul className="filas" data-reveal>
          {documents.map((doc) => (
            <li className="fila" key={doc.href}>
              <span className={styles.docName}>{doc.name[lang]}</span>
              <span className={`dato ${styles.docFormat}`}>{doc.format}</span>
              <a href={doc.href} download className={styles.docAction}><Download size={16} aria-hidden="true" /> {t.docDownload}</a>
            </li>
          ))}
          <li className="fila">
            <span className={styles.docName}>{t.docCatalog}</span>
            <span className={`dato ${styles.docFormat}`}>{catalogDocument.download ? "PDF · 12 MB" : t.docMeta}</span>
            <Link href={catalogDocument.href} className={styles.docAction}>
              {catalogDocument.download ? <Download size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
              {catalogDocument.download ? t.download : t.request}
            </Link>
          </li>
        </ul>
      </section>

      <section className={`${styles.shell} ${styles.sectionTight}`} aria-labelledby="family-benefits-title">
        <div className="cota" data-reveal><h2 id="family-benefits-title">{t.benefitsTitle}</h2></div>
        <ul className={styles.benefits}>
          {t.benefits.map((b, i) => (
            <li key={b.title} data-reveal style={{ ["--d" as string]: `${i * 50}ms` }}>
              <strong>{b.title}</strong>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="banda-cierre on-dark" aria-labelledby="family-band">
        <div className={styles.shell}>
          <h2 id="family-band" data-reveal>{BAND_TITLES[lang][family.slug]}</h2>
          <Link href="/contacto" className="lp-btn lp-btn--solid">{t.bandAction} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
