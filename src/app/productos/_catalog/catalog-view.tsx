"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ArrowUpDown, Check, Download, Mail, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogCell, FamilySlug, Localized } from "@/modules/catalog/public-catalog";
import { documentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { UI } from "./copy";
import { ProductCell } from "./product-cell";
import { useNewCells } from "./use-new-cells";
import styles from "./catalog.module.css";

export type FamilyFilter = "todas" | FamilySlug;
type SortMode = "destacados" | "az" | "za";

export type FamilyIndexEntry = { slug: FamilySlug; href: string; name: Localized; blurb: Localized; count: number };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es-PE").trim();
}

/** Parámetros de dirección que corresponden a un estado (los espacios al teclear no llegan a la URL). */
function addressSearch(query: string, family: FamilyFilter) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (family !== "todas") params.set("familia", family);
  return params.toString();
}

function updateAddress(query: string, family: FamilyFilter) {
  const search = addressSearch(query, family);
  const next = window.location.pathname + (search ? "?" + search : "") + window.location.hash;
  // Con `null` Next.js completa su propio estado e informa al router de la nueva URL (useSearchParams).
  window.history.replaceState(null, "", next);
}

export function CatalogView({ cells, families, initialQuery = "", initialFamily = "todas" }: { cells: readonly CatalogCell[]; families: readonly FamilyIndexEntry[]; initialQuery?: string; initialFamily?: FamilyFilter }) {
  const [lang] = useLang();
  const t = UI[lang];
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState<FamilyFilter>(initialFamily);
  const [sort, setSort] = useState<SortMode>("destacados");
  // Cambia al navegar con un enlace de la propia página: el componente sigue montado y el estado inicial no se vuelve a leer.
  const addressKey = useSearchParams().toString();
  const seenAddressKey = useRef(addressKey);
  const latest = useRef({ query, family });

  useEffect(() => {
    latest.current = { query, family };
    updateAddress(query, family);
  }, [query, family]);

  const readAddress = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q") ?? "";
    setQuery((current) => (current.trim() === nextQuery.trim() ? current : nextQuery));
    const nextFamily = params.get("familia");
    setFamily(families.some((f) => f.slug === nextFamily) ? (nextFamily as FamilySlug) : "todas");
  }, [families]);

  useEffect(() => {
    window.addEventListener("popstate", readAddress);
    return () => window.removeEventListener("popstate", readAddress);
  }, [readAddress]);

  useEffect(() => {
    if (seenAddressKey.current === addressKey) return;
    seenAddressKey.current = addressKey;
    // Si la dirección real ya es otra (se siguió tecleando), el aviso es viejo y releerlo pisaría lo escrito.
    const location = new URLSearchParams(window.location.search).toString();
    if (location !== addressKey) return;
    if (location === addressSearch(latest.current.query, latest.current.family)) return;
    readAddress();
  }, [addressKey, readAddress]);

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = cells.filter((cell) => {
      if (family !== "todas" && cell.family !== family) return false;
      const familyInfo = families.find((f) => f.slug === cell.family);
      const haystack = normalize([cell.search, familyInfo?.name.es ?? "", familyInfo?.name.en ?? ""].join(" "));
      return terms.every((term) => haystack.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
    if (sort === "za") return [...list].sort((a, b) => b.name[lang].localeCompare(a.name[lang], lang));
    return list;
  }, [cells, families, family, lang, query, sort]);

  const { filtered, fresh } = useNewCells(visible.map((c) => c.slug));

  function pickFamily(next: FamilyFilter) {
    setFamily(next);
    // Si la persona ya bajó, vuelve al inicio de los resultados.
    const top = document.getElementById("productos-destacados")?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      document.getElementById("productos-destacados")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }

  const reset = () => {
    setQuery("");
    setFamily("todas");
  };

  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");
  const familyPage = families.find((f) => f.slug === family);

  return (
    <main lang={lang} className={styles.page}>
      <header className={`${styles.shell} ${styles.head}`}>
        <nav aria-label={t.crumbs} className={styles.crumbs}>
          <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><span aria-current="page">{t.products}</span>
        </nav>
        <div className={styles.headGrid}>
          <div>
            <h1 id="catalog-title">{t.title}</h1>
            <p className={styles.lead}>{t.lead}</p>
          </div>
          <ul className={styles.headStats} data-enter>
            <li><strong className="dato">{cells.length}</strong><span>{t.productsCount(cells.length).split(" ")[1]}</span></li>
            <li><strong className="dato">{families.length}</strong><span>{t.familiesCount(families.length).split(" ")[1]}</span></li>
          </ul>
        </div>
      </header>

      <section id="productos-destacados" className={styles.results} aria-labelledby="catalog-title">
        <div className={styles.controls}>
          <form role="search" className={styles.searchRow} onSubmit={(event) => event.preventDefault()}>
            <label className={styles.search}>
              <span className="sr-only">{t.searchLabel}</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" />
            </label>
          </form>
          <div className={styles.filterRow}>
            <div className={styles.pills} role="group" aria-label={t.filterAria}>
              <button type="button" aria-pressed={family === "todas"} className={family === "todas" ? styles.pillOn : styles.pill} onClick={() => pickFamily("todas")}>
                {family === "todas" && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}{t.all}
              </button>
              {families.map((entry) => (
                <button key={entry.slug} type="button" aria-pressed={family === entry.slug} className={family === entry.slug ? styles.pillOn : styles.pill} onClick={() => pickFamily(family === entry.slug ? "todas" : entry.slug)}>
                  {family === entry.slug && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}{entry.name[lang]}
                </button>
              ))}
            </div>
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
        </div>

        <div className={styles.shell}>
          <div className={styles.count}>
            <p aria-live="polite">{t.productsCount(visible.length)}</p>
            {familyPage && <Link href={familyPage.href} className={styles.textLink}>{t.openFamily(familyPage.name[lang])} <ArrowRight size={15} aria-hidden="true" /></Link>}
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

      <section className={`${styles.shell} sec`} aria-labelledby="families-title">
        <div className="cota" data-reveal><h2 id="families-title">{t.familiesTitle}</h2></div>
        <div className={styles.familyRows}>
          {families.map((entry, i) => (
            <article key={entry.slug} className={styles.familyRow} data-reveal style={{ ["--d" as string]: `${Math.min(i, 5) * 50}ms` }}>
              <h3><Link href={entry.href} aria-label={t.explore + entry.name[lang]}>{entry.name[lang]}</Link></h3>
              <span className={styles.familyBlurb}>{entry.blurb[lang]}</span>
              <span className={`dato ${styles.familyCount}`}>{t.productsCount(entry.count)}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.shell} ${styles.sectionTight}`} aria-labelledby="documentos-title">
        <div className="cota" data-reveal>
          <h2 id="documentos-title">{t.docsTitle}</h2>
          <p>{t.docsLead}</p>
        </div>
        <ul className="filas" data-reveal>
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

      <section className="banda-cierre on-dark" aria-labelledby="catalog-band">
        <div className={styles.shell}>
          <h2 id="catalog-band" data-reveal>{t.catalogBandTitle}</h2>
          <Link href="/contacto" className="lp-btn lp-btn--solid">{t.bandAction} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
