"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, BadgeCheck, ChevronDown, Download, Filter, Headset, Layers, Mail, MessageCircleMore, PackageCheck, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { CardMedia } from "./w03-valve-media";
import { documentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { DATASHEETS } from "./w06-ficha-data";
import { GROUP_LABELS, UI, VALVE_TEXT, type GroupId } from "./w03-valvulas-copy";
import { blurBackdrop } from "@/shared/media/blur-backdrop";
import { BLUR_VALVULAS } from "@/shared/media/blur-valvulas";
import styles from "./w03-valvulas.module.css";

/** Sin ficha publicada: se pide por Contacto con el producto ya indicado, en vez de prometer verla. */
const sheetHref = (href: string, name: string) => (href === "/contacto" ? `/contacto?motivo=documentacion&documento=${encodeURIComponent(name)}` : href);

type Group = "todas" | GroupId;
type SortMode = "destacados" | "az" | "za";

const GROUPS: readonly { id: GroupId; image: string }[] = [
  { id: "compuerta", image: "/media/valvula-hd/v-01.webp" },
  { id: "mariposa", image: "/media/valvulas-page/mariposa.webp" },
  { id: "reduccion", image: "/media/valvulas-page/valvula-reductora.webp" },
  { id: "aire", image: "/media/valvulas-page/valvula-aire.webp" },
  { id: "control", image: "/media/valvulas-page/check-swing.webp" },
];

/** Fotos reales de cada compuerta (recortes con transparencia), las mismas de su ficha: el carrusel de la tarjeta las recorre. */
const photos = (dir: string, files: readonly string[]) => files.map((file) => `/media/${dir}/${file}.webp`);

const VALVES: readonly { id: string; group: GroupId; images: readonly string[]; href: string }[] = [
  { id: "compuerta", group: "compuerta", images: photos("valvula-hd", ["v-01", "v-02", "v-03", "v-04", "v-05"]), href: "/productos/valvulas/valvula-compuerta" },
  { id: "compuerta-fundigsac", group: "compuerta", images: photos("valvula-fundigsac", ["f-07", "f-02", "f-03", "f-04", "f-06"]), href: "/productos/valvulas/valvula-compuerta-fundigsac" },
  { id: "compuerta-garantia-extendida", group: "compuerta", images: photos("valvula-fundigsac-cuadrante", ["g-01", "g-02", "g-03", "g-04", "q-05"]), href: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida" },
  { id: "mariposa", group: "mariposa", images: ["/media/valvulas-page/mariposa.webp"], href: "/productos/valvulas/valvula-mariposa" },
  { id: "check-swing", group: "control", images: ["/media/valvulas-page/check-swing.webp"], href: "/contacto" },
  { id: "check-flex", group: "control", images: ["/media/valvulas-page/check-flex.webp"], href: "/contacto" },
  { id: "reductora", group: "reduccion", images: ["/media/valvulas-page/valvula-reductora.webp"], href: "/contacto" },
  { id: "aire", group: "aire", images: ["/media/valvulas-page/valvula-aire.webp"], href: "/contacto" },
];

/** Rango de diámetros de las fichas que ya tienen datos aprobados. */
const RANGES: Record<string, string> = {
  compuerta: DATASHEETS.base.sizeRange,
  "compuerta-fundigsac": DATASHEETS.fundigsac.sizeRange,
  "compuerta-garantia-extendida": DATASHEETS.extendida.sizeRange,
};
const HERO_ICONS = [ShieldCheck, BadgeCheck, Layers, Headset] as const;
const BENEFIT_ICONS = [Headset, ShieldCheck, PackageCheck, SlidersHorizontal] as const;

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function W03Valvulas() {
  const [lang] = useLang();
  const t = UI[lang];
  const text = VALVE_TEXT[lang];
  const groupLabel = GROUP_LABELS[lang];
  const [group, setGroup] = useState<Group>("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("destacados");

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = VALVES.filter((valve) => {
      if (group !== "todas" && valve.group !== group) return false;
      const haystack = normalize(text[valve.id].name + " " + text[valve.id].description);
      return terms.every((term) => haystack.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => text[a.id].name.localeCompare(text[b.id].name, lang));
    if (sort === "za") return [...list].sort((a, b) => text[b.id].name.localeCompare(text[a.id].name, lang));
    return list;
  }, [group, query, sort, text, lang]);

  const count = (id: GroupId) => VALVES.filter((valve) => valve.group === id).length;
  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");
  const unit = (n: number) => (n === 1 ? t.one : t.many);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="valvulas-title">
        <Image className={styles.heroPhoto} src="/media/valvulas-page/hero-valvula.webp" alt="" fill priority fetchPriority="high" sizes="100vw" quality={85} style={blurBackdrop(BLUR_VALVULAS["/media/valvulas-page/hero-valvula.webp"], "center 10%")} />
        <span className={styles.topVeil} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav aria-label={t.crumbsLabel} className={styles.breadcrumbs}>
            <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><Link href="/productos">{t.products}</Link><span aria-hidden="true">›</span><span aria-current="page">{t.title}</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>{t.eyebrow}</p>
            <h1 id="valvulas-title">{t.title}</h1>
            <p className={styles.heroDescription}>{t.lead}</p>
          </div>
        </div>
      </section>

      <ul className={styles.heroFeatures}>
        {t.features.map((label, i) => {
          const Icon = HERO_ICONS[i];
          return (
            <li key={label} style={{ ["--i" as string]: i }}>
              <span className={styles.featureIcon}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
              <span className={styles.featureText}>{label}</span>
            </li>
          );
        })}
      </ul>

      <section className={styles.catalogSection} aria-label={t.region}>
        <div className={styles.contentWidth}>
          <div className={styles.tabs} role="tablist" aria-label={t.tabsLabel}>
            <button type="button" role="tab" aria-selected={group === "todas"} className={group === "todas" ? styles.tabActive : styles.tab} onClick={() => setGroup("todas")}>
              <span className={styles.tabThumb}><Image src="/media/valvula-hd/v-01.webp" alt="" width={56} height={56} /></span>
              <span className={styles.tabText}><strong>{t.all}</strong><small>{t.allSub}</small></span>
            </button>
            {GROUPS.map((entry) => {
              const total = count(entry.id);
              return (
                <button key={entry.id} type="button" role="tab" aria-selected={group === entry.id} className={group === entry.id ? styles.tabActive : styles.tab} onClick={() => setGroup(group === entry.id ? "todas" : entry.id)}>
                  <span className={styles.tabThumb}><Image src={entry.image} alt="" width={56} height={56} /></span>
                  <span className={styles.tabText}><strong>{groupLabel[entry.id]}</strong><small>{total} {unit(total)}</small></span>
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
                <option value="todas">{t.allValves}</option>
                {GROUPS.map((entry) => <option key={entry.id} value={entry.id}>{groupLabel[entry.id]}</option>)}
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
            <p aria-live="polite">{visible.length} {unit(visible.length)}</p>
          </div>

          {visible.length ? (
            <div className={styles.grid} key={group + sort}>
              {visible.map((valve, index) => {
                const info = text[valve.id];
                const range = RANGES[valve.id];
                return (
                <article key={valve.id} className={styles.card} style={{ ["--i" as string]: index % 3, ["--n" as string]: index }}>
                  <CardMedia
                    href={sheetHref(valve.href, info.name)}
                    label={(valve.href === "/contacto" ? t.requestSheetOf : t.viewSheetOf) + info.name + (info.badge ? " · " + info.badge : "")}
                    images={valve.images}
                    flat={valve.group !== "compuerta"}
                    index={index}
                    sizes="(min-width: 1100px) 28vw, (min-width: 640px) 44vw, 92vw"
                    arrowLabels={lang === "en" ? ["Previous photo", "Next photo"] : ["Foto anterior", "Foto siguiente"]}
                    dotLabel={(position, total) => (lang === "en" ? `Photo ${position} of ${total}` : `Foto ${position} de ${total}`)}
                  >
                    {info.badge && <span className={styles.cardBadge}>{info.badge}</span>}
                  </CardMedia>
                  <div className={styles.cardBody}>
                    <h3>{info.name}</h3>
                    <p>{info.description}</p>
                    {range && <p className={styles.cardMeta}>{range}</p>}
                    <Link href={sheetHref(valve.href, info.name)} className={styles.cardButton}>{valve.href === "/contacto" ? t.requestSheet : t.viewSheet} <ArrowRight size={15} aria-hidden="true" /></Link>
                  </div>
                </article>
                );
              })}
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
          <Image src="/media/valvulas-page/asesoria.webp" alt="" fill sizes="45vw" />
        </div>
        <div className={styles.contentWidth + " " + styles.adviceInner}>
          <span className={styles.adviceIcon} aria-hidden="true"><MessageCircleMore size={46} strokeWidth={1.6} /></span>
          <div className={styles.adviceCopy}>
            <h2 id="advice-title">{t.adviceTitle}</h2>
            <p>{t.adviceText}</p>
          </div>
          <div className={styles.adviceActions}>
            <Link href="/contacto" className={styles.orangeButton}>{t.adviceCta} <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/contacto" className={styles.ghostButton}>{t.adviceCta2}</Link>
          </div>
        </div>
      </section>

      <ul className={styles.benefits} data-reveal="stagger">
        {t.benefits.map((label, i) => {
          const Icon = BENEFIT_ICONS[i];
          return (
            <li key={label} style={{ ["--i" as string]: i }}>
              <span className={styles.featureIcon}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
              <span className={styles.featureText}>{label}</span>
            </li>
          );
        })}
      </ul>

      <section className={styles.resourcesSection} aria-labelledby="valvulas-resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>{t.resEyebrow}</p>
            <h2 id="valvulas-resources-title">{t.resTitle}</h2>
            <p>{t.resText}</p>
            <Link href="/contacto?motivo=documentacion" className={styles.darkButton}>{t.resCta} <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.book}>
            <Image src="/media/productos-page/catalogo-general-cover-cutout.png" alt={t.coverAlt} fill sizes="(min-width: 1100px) 420px, 70vw" />
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
