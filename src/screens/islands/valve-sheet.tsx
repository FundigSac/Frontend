"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { whatsappLink } from "@/lib/site-info";
import { findValveSheet, type ValveSheet } from "@/modules/catalog/valve-sheets";
import { useLang } from "@/shared/layout/landing-prefs";
import { DATASHEETS } from "./w06-ficha-data";
import { SheetOrder, VariantTable, useVariantParam } from "./sheet-order";
import styles from "./valve-sheet.module.css";

const UI = {
  es: {
    crumbs: "Migas de pan",
    home: "Inicio",
    products: "Productos",
    valves: "Válvulas",
    code: "Código",
    sizes: "Medidas",
    added: "Agregada a tu cotización",
    advice: "Hablar con un asesor",
    noPrice: "Precio y disponibilidad se confirman al cotizar.",
    about: "Descripción",
    features: "Características",
    applications: "Aplicaciones",
    specs: "Especificaciones técnicas",
    specCol: ["Dato", "Valor"],
    sourceTitle: "Origen de los datos",
    source: "Datos tomados de la lista de precios de FUNDIGSAC (marzo de 2026) y de la ficha publicada en fundigsac.com. Algunas características cambian según el modelo y la medida: el equipo técnico confirma la ficha del modelo antes de cotizar.",
    related: "Otras válvulas",
    allValves: "Ver todas las válvulas",
    viewSheet: "Ver ficha",
    message: (name: string, code: string) => `Hola, quiero cotizar: ${name} (código ${code}). Medida y cantidad: `,
  },
  en: {
    crumbs: "Breadcrumb",
    home: "Home",
    products: "Products",
    valves: "Valves",
    code: "Code",
    sizes: "Sizes",
    added: "Added to your quote",
    advice: "Talk to an advisor",
    noPrice: "Price and availability are confirmed with your quote.",
    about: "Description",
    features: "Features",
    applications: "Applications",
    specs: "Technical specifications",
    specCol: ["Item", "Value"],
    sourceTitle: "Data source",
    source: "Data taken from the FUNDIGSAC price list (March 2026) and from the sheet published on fundigsac.com. Some features change with the model and size: the technical team confirms the sheet of the model before quoting.",
    related: "Other valves",
    allValves: "View all valves",
    viewSheet: "View details",
    // El mensaje lo lee el equipo comercial: va en español con el nombre en español.
    message: (name: string, code: string) => `Hola, quiero cotizar: ${name} (código ${code}). Medida y cantidad: `,
  },
} as const;

/** Ficha de válvula del catálogo (datos en src/modules/catalog/valve-sheets.ts). El HTML del servidor sale en español. */
type OrderOptions = { variants: { es: readonly string[]; en: readonly string[] }; pressure?: string };

const NO_OPTIONS: OrderOptions = { variants: { es: [], en: [] } };

export function ValveSheetView({ slug, options = NO_OPTIONS }: { slug: string; options?: OrderOptions }) {
  const [lang] = useLang();
  const sheet = findValveSheet(slug) as ValveSheet;
  const t = UI[lang];
  const text = sheet[lang];
  const path = `/productos/valvulas/${sheet.slug}`;
  const related = sheet.related.map((s) => findValveSheet(s)).filter((s): s is ValveSheet => Boolean(s));
  // Las compuertas de la casa tienen su propia ficha: se enlazan con su nombre y su foto de catálogo.
  const relatedGates = sheet.related.filter((s) => !findValveSheet(s));

  // Medidas de la lista de precios (llegan del servidor para no cargar la lista en el navegador).
  const variants = { es: options.variants.es, shown: options.variants[lang] };
  const [variant, setVariant] = useVariantParam(options.variants.es);

  return (
    <main className={styles.page}>
      <div className={styles.width}>
        <nav aria-label={t.crumbs} className={styles.crumbs}>
          <Link href="/">{t.home}</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos">{t.products}</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos/valvulas">{t.valves}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{text.name}</span>
        </nav>

        <section className={styles.hero} aria-labelledby="ficha-title">
          <figure className={styles.photo}>
            <Image src={sheet.image} alt={text.imageAlt} width={480} height={480} priority sizes="(min-width: 960px) 440px, 80vw" />
          </figure>
          <div className={styles.heroCopy}>
            {/* div y no p: en móvil todo `main p` va justificado y un antetítulo de dos líneas se abría en huecos. */}
            <div className={styles.eyebrow}>{text.technicalName}</div>
            <h1 id="ficha-title">{text.name}</h1>
            <p className={styles.lead}>{text.lead}</p>
            <dl className={styles.facts}>
              <div><dt>{t.code}</dt><dd>{sheet.code}</dd></div>
              <div><dt>{t.sizes}</dt><dd>{sheet.range}</dd></div>
            </dl>
            <SheetOrder
              lang={lang}
              product={{ slug: sheet.slug, nameEs: sheet.es.name, name: text.name, image: sheet.image, href: path }}
              variants={variants}
              pressure={options.pressure}
              selected={variant}
              onSelect={setVariant}
              whatsappHref={whatsappLink(t.message(sheet.es.name, sheet.code))}
              addedLabel={t.added}
            />
            <p className={styles.note}>
              {t.noPrice} <Link href="/contacto">{t.advice}</Link>
            </p>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="ficha-about" data-reveal>
          <h2 id="ficha-about">{t.about}</h2>
          <div className={styles.prose}>
            {text.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </section>

        <div className={styles.columns} data-reveal>
          <section className={styles.block} aria-labelledby="ficha-features">
            <h2 id="ficha-features">{t.features}</h2>
            <ul className={styles.list}>
              {text.features.map((f) => <li key={f}><Check size={16} aria-hidden="true" />{f}</li>)}
            </ul>
          </section>
          <section className={styles.block} aria-labelledby="ficha-apps">
            <h2 id="ficha-apps">{t.applications}</h2>
            <ul className={styles.list}>
              {text.applications.map((a) => <li key={a}><Check size={16} aria-hidden="true" />{a}</li>)}
            </ul>
          </section>
        </div>

        <section className={styles.block} aria-labelledby="ficha-specs" data-reveal>
          <h2 id="ficha-specs">{t.specs}</h2>
          <table className={styles.specs}>
            <thead className="sr-only">
              <tr><th scope="col">{t.specCol[0]}</th><th scope="col">{t.specCol[1]}</th></tr>
            </thead>
            <tbody>
              {text.specs.map(([k, v]) => (
                <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
          <aside className={styles.source} aria-label={t.sourceTitle}>
            <strong>{t.sourceTitle}</strong>
            <p>{t.source}</p>
          </aside>
        </section>

        <VariantTable lang={lang} name={text.name} variants={variants} selected={variant} onSelect={setVariant} />

        <section className={styles.block} aria-labelledby="ficha-related" data-reveal>
          <div className={styles.relatedHead}>
            <h2 id="ficha-related">{t.related}</h2>
            <Link href="/productos/valvulas" className={styles.textLink}>{t.allValves} <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <ul className={styles.related}>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/productos/valvulas/${r.slug}`} className={styles.relatedCard}>
                  <Image src={r.image} alt="" width={120} height={120} sizes="120px" />
                  <span>
                    <strong>{r[lang].name}</strong>
                    <small>{r.code} · {r.range}</small>
                    <em>{t.viewSheet} <ArrowRight size={14} aria-hidden="true" /></em>
                  </span>
                </Link>
              </li>
            ))}
            {relatedGates.map((s) => (
              <li key={s}>
                <Link href={`/productos/valvulas/${s}`} className={styles.relatedCard}>
                  <Image src={GATE_THUMBS[s]?.image ?? "/media/catalog/compuerta-bridada.webp"} alt="" width={120} height={120} sizes="120px" />
                  <span>
                    <strong>{GATE_THUMBS[s]?.name[lang] ?? s}</strong>
                    <small>{GATE_THUMBS[s]?.range}</small>
                    <em>{t.viewSheet} <ArrowRight size={14} aria-hidden="true" /></em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

/** Compuertas con ficha propia (W06) que se recomiendan desde estas fichas. */
const GATE_THUMBS: Record<string, { name: { es: string; en: string }; image: string; range: string }> = {
  "valvula-compuerta-fundigsac": { name: { es: "Válvula de compuerta FUNDIGSAC", en: "FUNDIGSAC gate valve" }, image: "/media/valvula-fundigsac/f-02.webp", range: DATASHEETS.fundigsac.sizeRange },
  "valvula-compuerta": { name: { es: "Válvula de compuerta bridada", en: "Flanged gate valve" }, image: "/media/valvula-hd/v-01.webp", range: DATASHEETS.base.sizeRange },
};

