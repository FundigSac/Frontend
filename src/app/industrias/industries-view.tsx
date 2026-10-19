"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Factory, Info, Mountain, Sprout, type LucideIcon } from "lucide-react";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import type { Product } from "@/lib/catalog";
import { useLang } from "@/shared/layout/landing-prefs";
import { SECTOR_TEXT, UI } from "./copy";

/** Ficha de la válvula de compuerta bridada H-ITALY (configurador + visor 3D). */
const GATE_VALVE_HREF = "/productos/valvulas/valvula-compuerta";

/** Cada familia mencionada en un sector lleva directo a su parte del catálogo (las claves son los textos en español). */
const NEED_LINKS: Record<string, string> = {
  "Ventosas y válvulas de aire": "/productos/valvulas",
  "Filtros tipo Y y válvulas de control": "/productos/valvulas",
  "Tubería y accesorios HDPE": "/productos?familia=accesorios-hdpe",
  "Válvulas de retención y compuerta": GATE_VALVE_HREF,
  "Válvulas de compuerta, mariposa y retención": "/productos/valvulas",
  "Tubería y accesorios de hierro dúctil": "/productos/tuberias",
  "Marcos y tapas para buzones": "/productos/marcos-y-tapas",
  "Válvulas y juntas para líneas de proceso": "/productos/valvulas",
  "Válvulas mariposa y de retención": "/productos/valvulas",
};

const ICONS: Record<string, LucideIcon> = { saneamiento: Droplets, mineria: Mountain, agricultura: Sprout, industria: Factory };

export type SectorData = { id: string; href: string; items: Product[] };

export function IndustriesView({ sectors }: { sectors: SectorData[] }) {
  const [lang] = useLang();
  const t = UI[lang];
  return <main lang={lang} className="x-page">
    <PageHero
      crumbs={[{ label: t.crumb }]}
      eyebrow={t.eyebrow}
      title={t.title}
      lead={t.lead}
      actions={<Link className="lp-btn lp-btn--solid" href="/cotizar">{t.heroAction} <ArrowRight size={18} aria-hidden="true" /></Link>}
    />
    <nav className="container x-section--tight" aria-label={t.sectorsLabel}><ul className="x-chips">{sectors.map(({ id }) => {
      const Icon = ICONS[id];
      return <li key={id}><a className="x-chip" href={`#${id}`}><Icon size={17} aria-hidden="true" />{SECTOR_TEXT[lang][id].name}</a></li>;
    })}</ul></nav>
    {sectors.map((s, i) => {
      const Icon = ICONS[s.id];
      const text = SECTOR_TEXT[lang][s.id];
      const esNeeds = SECTOR_TEXT.es[s.id].needs;
      return <section key={s.id} id={s.id} className={`x-section ${i % 2 === 0 ? "" : "x-section--tint"}`} style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div className="x-split x-split--wide-left" style={{ alignItems: "start" }}>
            <Reveal>
              <span className="x-icon" style={{ marginBottom: 16 }}><Icon size={24} aria-hidden="true" /></span>
              <SectionHead title={text.name} lead={text.text} />
              <h3 className="x-minor">{t.families}</h3>
              <ul className="x-check">{text.needs.map((n, index) => {
                const href = NEED_LINKS[esNeeds[index]];
                return <li key={n}>{href ? <Link className="x-need" href={href}>{n}<ArrowRight size={14} aria-hidden="true" /></Link> : n}</li>;
              })}</ul>
              <p className="x-after">{s.id === "agricultura" && <><Link className="text-link" href="/industrias/agricultura">{t.agriPage} <ArrowRight size={16} aria-hidden="true" /></Link>{" · "}</>}<Link className="text-link" href={s.href}>{t.viewProductsFor(text.name)} <ArrowRight size={16} aria-hidden="true" /></Link></p>
            </Reveal>
            <div className="x-split__main">
              {s.id === "agricultura" && <Reveal>
                <Link href={GATE_VALVE_HREF} className="x-featured" aria-label={t.featuredAria}>
                  <span className="x-featured__badge">{t.featuredBadge}</span>
                  <span className="x-featured__media"><Image src="/media/home-v2/compuerta-con-timon-v4.webp" alt={t.featuredAlt} width={578} height={1030} sizes="(max-width: 860px) 60vw, 240px" /></span>
                  <span className="x-featured__body">
                    <strong>{t.featuredName}</strong>
                    <span>{t.featuredText}</span>
                    <span className="x-featured__cta">{t.featuredCta} <ArrowRight size={16} aria-hidden="true" /></span>
                  </span>
                </Link>
              </Reveal>}
              <div className={`x-pgrid x-pgrid--${Math.min(s.items.length, 3)}`}>
              {s.items.map((p, k) => <Reveal key={p.slug} delay={k * 90}><CatalogCard product={p} compact /></Reveal>)}
              </div>
            </div>
          </div>
        </div>
      </section>;
    })}
    <section className="x-section--tight"><div className="container"><div className="x-note"><Info size={20} aria-hidden="true" /><p><strong>{t.noteTitle}</strong>{t.noteText}</p></div></div></section>
    <CtaBand title={t.ctaTitle} text={t.ctaText} primary={{ href: "/contacto", label: t.ctaPrimary }} secondary={{ href: "/productos", label: t.ctaSecondary }} />
  </main>;
}
