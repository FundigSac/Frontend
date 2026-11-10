"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, CircleDashed, FileText, MessageCircleMore, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/site-info";
import { addToCart, openCart } from "@/modules/cart/cart-store";
import type { CatalogSheet } from "@/modules/catalog/public-catalog";
import { sectorsOfSheet, type SheetSector } from "@/modules/catalog/sheet-sectors";
import { requestDocumentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import extra from "./catalog-sheet.module.css";
import styles from "./valve-sheet.module.css";

const UI = {
  es: {
    crumbs: "Migas de pan",
    home: "Inicio",
    products: "Productos",
    code: "Código",
    sizes: "Medidas",
    size: "Medida",
    sizeHint: "Elige la medida",
    add: "Agregar a cotización",
    added: "Agregado a tu cotización",
    whatsapp: "Cotizar por WhatsApp",
    requestSheet: "Solicitar ficha técnica",
    advice: "Hablar con un asesor",
    noPrice: "Precio y disponibilidad se confirman al cotizar.",
    referencePhoto: "Imagen referencial",
    pendingNote: "Esta ficha está por confirmar. Agrégala a tu cotización y el equipo técnico te envía las medidas y la norma que aplican.",
    about: "Descripción",
    features: "Características",
    applications: "Aplicaciones",
    specs: "Especificaciones técnicas",
    specCol: ["Dato", "Valor"],
    sourceTitle: "Origen de los datos",
    usedIn: "Se usa en",
    related: "Productos relacionados",
    all: (family: string) => `Ver ${family.toLowerCase()}`,
    viewSheet: "Ver ficha",
    message: (name: string, code: string) => `Hola, quiero cotizar: ${name}${code ? ` (código ${code})` : ""}. Medida y cantidad: `,
  },
  en: {
    crumbs: "Breadcrumb",
    home: "Home",
    products: "Products",
    code: "Code",
    sizes: "Sizes",
    size: "Size",
    sizeHint: "Choose the size",
    add: "Add to quote",
    added: "Added to your quote",
    whatsapp: "Quote on WhatsApp",
    requestSheet: "Request data sheet",
    advice: "Talk to an advisor",
    noPrice: "Price and availability are confirmed with your quote.",
    referencePhoto: "Reference image",
    pendingNote: "This data sheet is still to be confirmed. Add it to your quote and the technical team will send you the sizes and standard that apply.",
    about: "Description",
    features: "Features",
    applications: "Applications",
    specs: "Technical specifications",
    specCol: ["Item", "Value"],
    sourceTitle: "Data source",
    usedIn: "Used in",
    related: "Related products",
    all: (family: string) => `View ${family.toLowerCase()}`,
    viewSheet: "View details",
    // El mensaje lo lee el equipo comercial: va en español con el nombre en español.
    message: (name: string, code: string) => `Hola, quiero cotizar: ${name}${code ? ` (código ${code})` : ""}. Medida y cantidad: `,
  },
} as const;

const SECTOR_LABEL: Record<SheetSector, { href: string; es: string; en: string }> = {
  saneamiento: { href: "/industrias/saneamiento", es: "Agua y saneamiento", en: "Water and sanitation" },
  agricultura: { href: "/industrias/agricultura", es: "Riego agrícola", en: "Agricultural irrigation" },
  mineria: { href: "/industrias/mineria", es: "Minería", en: "Mining" },
};

/**
 * Ficha genérica del catálogo (lista de precios y productos por confirmar), con la composición y los estilos de la ficha
 * de válvula del 4 de noviembre. Todos los datos salen de public-catalog.ts: si un bloque no tiene datos, no se muestra.
 */
export function CatalogSheetView({ sheet }: { sheet: CatalogSheet }) {
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
  const specs = sheet.specs[lang];
  const sectors = sectorsOfSheet(sheet.slug);

  return (
    <main lang={lang} className={styles.page}>
      <div className={styles.width}>
        <nav aria-label={t.crumbs} className={styles.crumbs}>
          <Link href="/">{t.home}</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos">{t.products}</Link>
          <span aria-hidden="true">›</span>
          <Link href={sheet.familyHref}>{sheet.familyName[lang]}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{name}</span>
        </nav>

        <section className={styles.hero} aria-labelledby="ficha-title">
          <figure className={styles.photo}>
            <Image src={sheet.image} alt={sheet.alt[lang]} width={480} height={480} priority sizes="(min-width: 960px) 440px, 80vw" />
            {pending && <figcaption className={extra.photoNote}>{t.referencePhoto}</figcaption>}
          </figure>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>{sheet.technicalName ? sheet.technicalName[lang] : sheet.familyName[lang]}</div>
            <h1 id="ficha-title">{name}</h1>
            <p className={styles.lead}>{sheet.note[lang]}</p>
            {(sheet.code || sheet.range) && (
              <dl className={styles.facts}>
                {sheet.code && <div><dt>{t.code}</dt><dd>{sheet.code}</dd></div>}
                {sheet.range && <div><dt>{t.sizes}</dt><dd>{sheet.range}</dd></div>}
              </dl>
            )}
            {pending && (
              <div className={extra.pending}>
                <CircleDashed size={18} aria-hidden="true" />
                <span>{t.pendingNote}</span>
              </div>
            )}
            {variants.length > 0 && (
              <label className={extra.field}>
                <span>{t.size}</span>
                <span className={extra.selectBox}>
                  <select value={variant} onChange={(event) => setVariant(Number(event.target.value))} aria-label={t.sizeHint}>
                    {variants.map((label, i) => <option key={label} value={i}>{label}</option>)}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>
            )}
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={add} aria-live="polite">
                {added ? <Check size={18} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
                {added ? t.added : t.add}
              </button>
              <a className={styles.secondary} href={whatsappLink(t.message(sheet.name.es, sheet.code ?? ""))} target="_blank" rel="noopener noreferrer">
                <MessageCircleMore size={18} aria-hidden="true" />
                {t.whatsapp}
              </a>
            </div>
            <p className={styles.note}>
              {t.noPrice} <Link href={requestDocumentHref(`Ficha técnica · ${sheet.name.es}`)}><FileText size={14} aria-hidden="true" /> {t.requestSheet}</Link> · <Link href="/contacto">{t.advice}</Link>
            </p>
          </div>
        </section>

        {paragraphs.length > 0 && (
          <section className={styles.block} aria-labelledby="ficha-about" data-reveal>
            <h2 id="ficha-about">{t.about}</h2>
            <div className={styles.prose}>
              {paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
        )}

        {(features.length > 0 || applications.length > 0) && (
          <div className={styles.columns} data-reveal>
            {features.length > 0 && (
              <section className={styles.block} aria-labelledby="ficha-features">
                <h2 id="ficha-features">{t.features}</h2>
                <ul className={styles.list}>
                  {features.map((f) => <li key={f}><Check size={16} aria-hidden="true" />{f}</li>)}
                </ul>
              </section>
            )}
            {applications.length > 0 && (
              <section className={styles.block} aria-labelledby="ficha-apps">
                <h2 id="ficha-apps">{t.applications}</h2>
                <ul className={styles.list}>
                  {applications.map((a) => <li key={a}><Check size={16} aria-hidden="true" />{a}</li>)}
                </ul>
              </section>
            )}
          </div>
        )}

        <section className={styles.block} aria-labelledby="ficha-specs" data-reveal>
          <h2 id="ficha-specs">{t.specs}</h2>
          {specs.length > 0 && (
            <table className={styles.specs}>
              <thead className="sr-only">
                <tr><th scope="col">{t.specCol[0]}</th><th scope="col">{t.specCol[1]}</th></tr>
              </thead>
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          <aside className={styles.source} aria-label={t.sourceTitle}>
            <strong>{t.sourceTitle}</strong>
            <p>{sheet.sourceNote[lang]}</p>
          </aside>
          {sectors.length > 0 && (
            <p className={extra.sectors}>
              <span>{t.usedIn}</span>
              {sectors.map((sector) => <Link key={sector} href={SECTOR_LABEL[sector].href}>{SECTOR_LABEL[sector][lang]}</Link>)}
            </p>
          )}
        </section>

        {sheet.related.length > 0 && (
          <section className={styles.block} aria-labelledby="ficha-related" data-reveal>
            <div className={styles.relatedHead}>
              <h2 id="ficha-related">{t.related}</h2>
              <Link href={sheet.familyHref} className={styles.textLink}>{t.all(sheet.familyName[lang])} <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <ul className={styles.related}>
              {sheet.related.map((r) => (
                <li key={r.slug}>
                  <Link href={r.href} className={styles.relatedCard}>
                    <Image src={r.image} alt="" width={120} height={120} sizes="120px" />
                    <span>
                      <strong>{r.name[lang]}</strong>
                      {(r.code || r.range) && <small>{[r.code, r.range].filter(Boolean).join(" · ")}</small>}
                      <em>{t.viewSheet} <ArrowRight size={14} aria-hidden="true" /></em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
