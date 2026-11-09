"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, CircleDashed, FileText, MessageCircleMore, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/site-info";
import { addToCart, openCart } from "@/modules/cart/cart-store";
import type { CatalogSheet } from "@/modules/catalog/public-catalog";
import { requestDocumentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { UI } from "./copy";
import { ProductCell } from "./product-cell";
import { SectorLinks } from "./sector-links";
import styles from "./catalog.module.css";

/** Ficha de producto del catálogo: datos en public-catalog.ts. El HTML del servidor sale en español. */
export function SheetView({ sheet }: { sheet: CatalogSheet }) {
  const [lang] = useLang();
  const t = UI[lang];
  const name = sheet.name[lang];
  const variants = sheet.variants[lang];
  const [variant, setVariant] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = () => {
    addToCart({ slug: sheet.slug, name: sheet.name.es, variant: sheet.variants.es[variant], image: sheet.image, href: sheet.href });
    openCart();
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  const pending = sheet.status === "por-confirmar";
  const paragraphs = sheet.paragraphs[lang];
  const features = sheet.features[lang];
  const applications = sheet.applications[lang];

  return (
    <main lang={lang} className={styles.page}>
      <div className={styles.shell}>
        <nav aria-label={t.crumbs} className={`${styles.crumbs} ${styles.sheetCrumbs}`}>
          <Link href="/">{t.home}</Link><span aria-hidden="true">›</span>
          <Link href="/productos">{t.products}</Link><span aria-hidden="true">›</span>
          <Link href={sheet.familyHref}>{sheet.familyName[lang]}</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{name}</span>
        </nav>

        <div className={styles.sheet}>
          <header className={styles.sheetTitle}>
            {sheet.code && <span className={`dato ${styles.sheetCode}`}>{sheet.code}</span>}
            <h1 id="ficha-title">{name}</h1>
            {sheet.technicalName && <span className={styles.sheetTechnical}>{sheet.technicalName[lang]}</span>}
            <p className={styles.lead}>{sheet.note[lang]}</p>
          </header>

          <figure className={styles.sheetPhoto} data-lcp>
            <Image src={sheet.image} alt={sheet.alt[lang]} width={768} height={768} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, (min-width: 481px) 88vw, 52vw" />
            {pending && <figcaption className={styles.photoNote}>{t.referencePhoto}</figcaption>}
          </figure>

          <aside className={styles.panel} aria-label={t.addSheet} data-enter>
            {pending && (
              <div className={styles.pendingBox}>
                <CircleDashed size={18} aria-hidden="true" />
                <span>{t.pendingNote}</span>
              </div>
            )}
            {(sheet.code || sheet.range) && (
              <dl className={styles.panelFacts}>
                {sheet.code && <div><dt>{t.code}</dt><dd className="dato">{sheet.code}</dd></div>}
                {sheet.range && <div><dt>{t.sizes}</dt><dd className="dato">{sheet.range}</dd></div>}
              </dl>
            )}
            {variants.length > 0 && (
              <label className={styles.field}>
                <span>{t.size}</span>
                <span className={styles.selectBox}>
                  <select value={variant} onChange={(event) => setVariant(Number(event.target.value))} aria-label={t.sizeHint}>
                    {variants.map((label, i) => <option key={label} value={i}>{label}</option>)}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>
            )}
            <div className={styles.panelActions}>
              <button type="button" className="lp-btn lp-btn--solid lp-btn--lg" onClick={add} aria-live="polite">
                {added ? <Check key="ok" size={18} aria-hidden="true" className="mo-check" /> : <ShoppingCart key="cart" size={18} aria-hidden="true" />}
                {added ? t.addedSheet : t.addSheet}
              </button>
              <Link href={requestDocumentHref(`Ficha técnica · ${sheet.name.es}`)} className="lp-btn lp-btn--outline lp-btn--lg"><FileText size={18} aria-hidden="true" /> {t.requestSheet}</Link>
            </div>
            <p className={styles.panelNote}>
              {t.noPrice}{" "}
              <a className={styles.textLinkInline} href={whatsappLink(t.message(sheet.name.es, sheet.code ?? ""))} target="_blank" rel="noopener noreferrer"><MessageCircleMore size={15} aria-hidden="true" /> {t.whatsapp}</a>
            </p>
          </aside>

          <div className={styles.detail}>
            {paragraphs.length > 0 && (
              <section aria-labelledby="ficha-about" data-reveal>
                <h2 id="ficha-about" className={styles.detailTitle}>{t.about}</h2>
                <div className={styles.prose}>{paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
              </section>
            )}

            {(features.length > 0 || applications.length > 0) && (
              <div className={styles.twoLists} data-reveal>
                {features.length > 0 && (
                  <section aria-labelledby="ficha-features">
                    <h2 id="ficha-features" className={styles.detailTitle}>{t.features}</h2>
                    <ul className={styles.ruleList}>{features.map((f) => <li key={f}>{f}</li>)}</ul>
                  </section>
                )}
                {applications.length > 0 && (
                  <section aria-labelledby="ficha-apps">
                    <h2 id="ficha-apps" className={styles.detailTitle}>{t.applications}</h2>
                    <ul className={styles.ruleList}>{applications.map((a) => <li key={a}>{a}</li>)}</ul>
                  </section>
                )}
              </div>
            )}

            <section aria-labelledby="ficha-specs" data-reveal>
              <h2 id="ficha-specs" className={styles.detailTitle}>{t.specs}</h2>
              <table className={styles.specTable}>
                <thead className="sr-only"><tr><th scope="col">{t.specCol[0]}</th><th scope="col">{t.specCol[1]}</th></tr></thead>
                <tbody>
                  {sheet.specs[lang].map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
                </tbody>
              </table>
              <div className={styles.source}>
                <strong>{t.sourceTitle}</strong>
                <p>{sheet.sourceNote[lang]}</p>
              </div>
              <SectorLinks slug={sheet.slug} />
            </section>
          </div>
        </div>

        {sheet.related.length > 0 && (
          <section className={styles.relatedBlock} aria-labelledby="ficha-related">
            <div className={`cota ${styles.relatedHead}`} data-reveal>
              <h2 id="ficha-related">{t.related}</h2>
              <Link href={sheet.familyHref} className={styles.textLink}>{t.allFamily(sheet.familyName[lang])} <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <div className={`celdas ${styles.grid}`}>
              {sheet.related.map((cell, index) => <ProductCell key={cell.slug} cell={cell} lang={lang} index={index + 4} sizes="(min-width: 1261px) 25vw, (min-width: 860px) 33vw, 50vw" />)}
            </div>
          </section>
        )}
      </div>

      <section className="banda-cierre on-dark" aria-labelledby="ficha-band">
        <div className={styles.shell}>
          <h2 id="ficha-band" data-reveal>{t.catalogBandTitle}</h2>
          <Link href="/contacto" className="lp-btn lp-btn--solid">{t.advice} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
