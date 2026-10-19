"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Download, Filter, Mail, MessageCircleMore, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { documentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { GROUP_LABELS, ITEM_TEXT, UI, type GroupId } from "./w04-tuberias-copy";
import styles from "./w04-tuberias.module.css";

/** Sin ficha publicada: la tarjeta pide la ficha por Contacto (con el producto ya indicado) en vez de prometer verla. */
const sheetHref = (item: { href: string }, name: string) =>
  item.href === "/contacto" ? `/contacto?motivo=documentacion&documento=${encodeURIComponent(name)}` : item.href;

type Group = "todas" | GroupId;
type SortMode = "destacados" | "az" | "za";

const GROUPS: readonly { id: GroupId; image: string }[] = [
  { id: "junta", image: "/media/tuberias-page/union-junta.webp" },
  { id: "mecanica", image: "/media/tuberias-page/union-mecanica.webp" },
  { id: "accesorios", image: "/media/tuberias-page/bridas.webp" },
];

const VALVES: readonly { id: string; group: GroupId; image: string; href: string }[] = [
  { id: "hdpe", group: "junta", image: "/media/tuberias-page/hdpe.webp", href: "/productos/tuberias/tuberia-tyton" },
  { id: "revestimiento", group: "mecanica", image: "/media/tuberias-page/revestimiento.webp", href: "/contacto" },
  { id: "bridas", group: "accesorios", image: "/media/tuberias-page/bridas.webp", href: "/contacto" },
  { id: "union-junta", group: "junta", image: "/media/tuberias-page/union-junta.webp", href: "/contacto" },
  { id: "union-mecanica", group: "mecanica", image: "/media/tuberias-page/union-mecanica.webp", href: "/contacto" },
  { id: "mortero", group: "junta", image: "/media/tuberias-page/mortero.webp", href: "/contacto" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function W04Tuberias() {
  const [lang] = useLang();
  const t = UI[lang];
  const [group, setGroup] = useState<Group>("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("destacados");

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = VALVES.filter((valve) => {
      if (group !== "todas" && valve.group !== group) return false;
      // Se busca en los dos idiomas: da igual con qué idioma se vea el sitio.
      const haystack = normalize([ITEM_TEXT.es[valve.id].name, ITEM_TEXT.es[valve.id].description, ITEM_TEXT.en[valve.id].name, ITEM_TEXT.en[valve.id].description].join(" "));
      return terms.every((term) => haystack.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => ITEM_TEXT[lang][a.id].name.localeCompare(ITEM_TEXT[lang][b.id].name, lang));
    if (sort === "za") return [...list].sort((a, b) => ITEM_TEXT[lang][b.id].name.localeCompare(ITEM_TEXT[lang][a.id].name, lang));
    return list;
  }, [group, query, sort, lang]);

  const count = (id: GroupId) => VALVES.filter((valve) => valve.group === id).length;
  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");

  return (
    <main lang={lang} className={styles.page}>
      {/* La foto del hero es un fondo CSS: se precarga con prioridad para que el LCP no espere a descubrirla en el CSS. */}
      <link rel="preload" as="image" href="/media/tuberias-page/hero-w1920.webp" media="(min-width: 761px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/media/tuberias-page/hero-w1200.webp" media="(max-width: 760px)" fetchPriority="high" />
      <section className={styles.hero} aria-labelledby="tuberias-title">
        <span className={styles.topVeil} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav aria-label={t.crumbsLabel} className={styles.breadcrumbs}>
            <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><Link href="/productos">{t.products}</Link><span aria-hidden="true">›</span><span aria-current="page">{t.pipes}</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1 id="tuberias-title">{t.title[0]}<br />{t.title[1]}</h1>
            <p className={styles.heroDescription}>{t.lead}</p>
          </div>
          <div className={styles.qualityStamp}>{t.quality.map((word) => <span key={word}>{word}</span>)}</div>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label={t.region}>
        <div className={styles.contentWidth}>
          <div className={styles.tabs} role="tablist" aria-label={t.tabsLabel}>
            <button type="button" role="tab" aria-selected={group === "todas"} className={group === "todas" ? styles.tabActive : styles.tab} onClick={() => setGroup("todas")}>
              <span className={styles.tabThumb}><Image src="/media/tuberias-page/hdpe.webp" alt="" width={56} height={56} /></span>
              <span className={styles.tabText}><strong>{t.all}</strong><small>{t.allSub}</small></span>
            </button>
            {GROUPS.map((entry) => {
              const total = count(entry.id);
              return (
                <button key={entry.id} type="button" role="tab" aria-selected={group === entry.id} className={group === entry.id ? styles.tabActive : styles.tab} onClick={() => setGroup(group === entry.id ? "todas" : entry.id)}>
                  <span className={styles.tabThumb}><Image src={entry.image} alt="" width={56} height={56} /></span>
                  <span className={styles.tabText}><strong>{GROUP_LABELS[lang][entry.id]}</strong><small>{total} {total === 1 ? t.one : t.many}</small></span>
                </button>
              );
            })}
          </div>

          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="sr-only">{t.searchLabel}</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" />
            </label>
            <label className={styles.select}>
              <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{t.filter}</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={group} onChange={(event) => setGroup(event.target.value as Group)} aria-label={t.filterLabel}>
                <option value="todas">{t.allProducts}</option>
                {GROUPS.map((entry) => <option key={entry.id} value={entry.id}>{GROUP_LABELS[lang][entry.id]}</option>)}
              </select>
            </label>
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

          <div className={styles.sectionHeading}>
            <h2>{t.explore}</h2>
            <p aria-live="polite">{visible.length} {visible.length === 1 ? t.one : t.many}</p>
          </div>

          {visible.length ? (
            <div className={styles.grid}>
              {visible.map((valve) => (
                <article key={valve.id} className={styles.card}>
                  <Link href={sheetHref(valve, ITEM_TEXT[lang][valve.id].name)} className={styles.cardImage} aria-label={(valve.href === "/contacto" ? t.requestSheetOf : t.viewSheetOf) + ITEM_TEXT[lang][valve.id].name}>
                    <Image src={valve.image} alt={ITEM_TEXT[lang][valve.id].name} fill sizes="(min-width: 1100px) 28vw, (min-width: 640px) 44vw, 92vw" />
                  </Link>
                  <div className={styles.cardBody}>
                    <h3>{ITEM_TEXT[lang][valve.id].name}</h3>
                    <p>{ITEM_TEXT[lang][valve.id].description}</p>
                    <Link href={sheetHref(valve, ITEM_TEXT[lang][valve.id].name)} className={styles.cardButton}>{valve.href === "/contacto" ? t.requestSheet : t.viewSheet} <ArrowRight size={15} aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              <h3>{t.emptyTitle}</h3>
              <p>{t.emptyText}</p>
              <button type="button" className={styles.darkButton} onClick={() => { setQuery(""); setGroup("todas"); }}>{t.emptyAction} <ArrowRight size={15} aria-hidden="true" /></button>
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
          <div className={styles.adviceCopy}>
            <h2 id="advice-title">{t.adviceTitle}</h2>
            <p>{t.adviceText}</p>
          </div>
          <Link href="/contacto" className={styles.darkButton}>{t.adviceCta} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="tuberias-resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>{t.resEyebrow}</p>
            <h2 id="tuberias-resources-title">{t.resTitle}</h2>
            <p>{t.resText}</p>
            <Link href="/contacto?motivo=documentacion" className={styles.darkButton}>{t.resCta} <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.book}>
            <Image src="/media/tuberias-page/libro.webp" alt={t.coverAlt} fill sizes="(min-width: 1100px) 420px, 70vw" />
          </div>
          <article className={styles.downloadCard}>
            <h3>{t.cardTitle[0]}<br />{t.cardTitle[1]}</h3>
            <p>{t.cardText}</p>
            <Link href={catalogDocument.href} className={styles.downloadButton}>
              {catalogDocument.download ? <Download size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
              {catalogDocument.download ? t.download : t.request}
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
