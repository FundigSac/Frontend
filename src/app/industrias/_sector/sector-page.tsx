"use client";

import { SectorImage, type PreparedImage } from "./sector-image";
import Link from "next/link";
import { ArrowRight, FileText, LayoutGrid, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { BLUR } from "@/shared/media/blur";

/** Textos de una página de sector (saneamiento, minería…), en un idioma. */
export type SectorCopy = {
  crumbs: { home: string; current: string };
  hero: { eyebrow: string; title: string; lead: string; explore: string; quote: string; alt: string };
  featured: {
    eyebrow: string; title: string; lead: readonly [string, string, string];
    features: readonly { title: string; text: string }[];
    datasheet: string; product: string; quote: string; alt: string;
  };
  apps: { eyebrow: string; title: string; lead: string; more: string; items: readonly { title: string; text: string; alt: string }[] };
  line: { eyebrow: string; title: string; all: string; items: readonly { title: string; alt: string }[] };
  docs: { eyebrow: string; title: string; lead: string; cta: string; alt: string; campaigns?: string };
  cta: { eyebrow: string; title: string; text: string; quote: string };
};

/** Imágenes, enlaces e íconos de una página de sector (no dependen del idioma). */
export type SectorMedia = {
  id: string;
  hero: string;
  blur?: Record<string, string>;
  preparedImages?: Record<string, PreparedImage>;
  reveal?: boolean;
  featured: string;
  featuredSizes?: string;
  features: readonly LucideIcon[];
  apps: readonly { href: string; image: string }[];
  line: readonly { href: string; image: string; position?: string }[];
  /** `cutout`: PNG/WebP con transparencia que flota sin marco; si no, se muestra como lámina con sombra. */
  docs: { image: string; width: number; height: number; cutout: boolean };
  cta: string;
};

/** Revela cada elemento `[data-reveal]` al entrar en pantalla (respeta movimiento reducido). */
function useReveal(enabled = true) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled) return;
    const nodes = el.querySelectorAll<HTMLElement>("[data-reveal]");
    // Lo que ya está en el primer pantallazo se muestra de inmediato (sin parpadeo); solo lo de abajo se anima al llegar.
    const fold = window.innerHeight * 0.92;
    nodes.forEach((n) => {
      if (n.getBoundingClientRect().top <= fold) n.classList.add("is-in");
    });
    el.classList.add("ag-js");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((n) => {
      if (!n.classList.contains("is-in")) io.observe(n);
    });
    return () => io.disconnect();
  }, [enabled]);
  return root;
}

export function SectorPage({ t, media }: { t: SectorCopy; media: SectorMedia }) {
  const root = useReveal(media.reveal !== false);
  const id = media.id;
  const blur = media.blur ?? BLUR;

  return (
    <main className={`lp ag sa sa--${id}`} ref={root}>
      {/* Hero */}
      <section className="ag-hero sa-hero" aria-labelledby={`${id}-title`}>
        <SectorImage prepared={media.preparedImages?.[media.hero]} className="ag-hero__photo sa-hero__photo" src={media.hero} alt={t.hero.alt} fill loading="eager" fetchPriority="high" quality={75} placeholder="blur" blurDataURL={blur[media.hero]} sizes="100vw" />
        <span className="sa-hero__glint" aria-hidden="true" />
        <div className="ag-hero__veil sa-hero__veil" aria-hidden="true" />
        <div className="lp-shell ag-hero__inner">
          <nav className="ag-crumbs" aria-label="breadcrumb">
            <Link href="/">{t.crumbs.home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.crumbs.current}</span>
          </nav>
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.hero.eyebrow}</p>
          <h1 id={`${id}-title`}>{t.hero.title}</h1>
          <p className="ag-hero__lead">{t.hero.lead}</p>
          <div className="ag-hero__actions">
            <Link href="/productos" className="lp-btn lp-btn--solid sa-btn-sheen">
              {t.hero.explore} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <Link href="/cotizar" className="lp-btn lp-btn--outline ag-btn-glass">
              {t.hero.quote} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Producto destacado */}
      <section className="ag-featured sa-featured" aria-labelledby={`${id}-featured-title`}>
        <div className="ag-featured__media" data-reveal="left">
          <SectorImage prepared={media.preparedImages?.[media.featured]} src={media.featured} alt={t.featured.alt} fill loading={media.preparedImages ? "eager" : "lazy"} quality={75} placeholder="blur" blurDataURL={blur[media.featured]} sizes={media.featuredSizes ?? "(max-width: 860px) 100vw, 50vw"} />
        </div>
        <div className="ag-featured__copy" data-reveal="right">
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.featured.eyebrow}</p>
          <h2 id={`${id}-featured-title`}>{t.featured.title}</h2>
          <p className="ag-lead">{t.featured.lead[0]}<strong>{t.featured.lead[1]}</strong>{t.featured.lead[2]}</p>
          <ul className="sa-features">
            {t.featured.features.map((f, i) => {
              const Icon = media.features[i];
              return (
                <li key={f.title}>
                  <Icon aria-hidden="true" size={22} strokeWidth={1.6} />
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="ag-actions">
            <a className="lp-btn lp-btn--outline" href="/docs/ficha-tecnica-valvula-compuerta-bridada.pdf" target="_blank" rel="noopener noreferrer">
              <FileText aria-hidden="true" size={17} strokeWidth={1.8} /> {t.featured.datasheet}
            </a>
            <Link className="lp-btn lp-btn--outline" href="/productos/valvulas/valvula-compuerta">
              {t.featured.product} <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
            <Link className="lp-btn lp-btn--solid" href="/cotizar">
              {t.featured.quote} <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Aplicaciones */}
      <section className="sa-apps" aria-labelledby={`${id}-apps-title`}>
        <div className="lp-shell sa-apps__head">
          <div data-reveal="up">
            <p className="ag-eyebrow"><span aria-hidden="true" />{t.apps.eyebrow}</p>
            <h2 id={`${id}-apps-title`}>{t.apps.title}</h2>
          </div>
          <p className="sa-apps__lead" data-reveal="up" style={{ ["--d" as string]: "120ms" }}>{t.apps.lead}</p>
        </div>
        <ul className="sa-apps__grid">
          {media.apps.map((item, i) => (
            <li key={item.image} data-reveal="up" style={{ ["--d" as string]: `${i * 120}ms` }}>
              <Link href={item.href} className="sa-app">
                <SectorImage prepared={media.preparedImages?.[item.image]} src={item.image} alt={t.apps.items[i].alt} fill quality={72} placeholder="blur" blurDataURL={blur[item.image]} sizes={media.preparedImages ? "(max-width: 900px) 100vw, 50vw" : "(max-width: 860px) 100vw, 50vw"} />
                <span className="sa-app__veil" aria-hidden="true" />
                <span className="sa-app__body">
                  <span className="sa-app__n">{String(i + 1).padStart(2, "0")}<i aria-hidden="true" /></span>
                  <strong>{t.apps.items[i].title}</strong>
                  <span className="sa-app__text">{t.apps.items[i].text}</span>
                  <span className="sa-app__more">{t.apps.more} <ArrowRight aria-hidden="true" size={16} strokeWidth={2} /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Línea del sector */}
      <section className="ag-line" aria-labelledby={`${id}-line-title`}>
        <div className="lp-shell">
          <div className="ag-line__head" data-reveal="up">
            <div>
              <p className="ag-eyebrow" id={!t.line.title ? `${id}-line-title` : undefined}><span aria-hidden="true" />{t.line.eyebrow}</p>
              {t.line.title && <h2 id={`${id}-line-title`}>{t.line.title}</h2>}
            </div>
            {t.line.all && <Link href="/productos" className="lp-link">
              <span>{t.line.all}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>}
          </div>
          <ul className="ag-line__grid">
            {media.line.map((item, i) => (
              <li key={item.image} data-reveal="up" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <Link href={item.href} className="lp-card">
                  <span className="lp-card__media">
                    <SectorImage prepared={media.preparedImages?.[item.image]} src={item.image} alt={t.line.items[i].alt} width={1448} height={1086} quality={70} placeholder="blur" blurDataURL={blur[item.image]} style={item.position ? { objectPosition: item.position } : undefined} sizes={media.preparedImages ? "(max-width: 900px) calc((100vw - 54px) / 2), (max-width: 1753px) calc((89vw - 48px) / 4), 378px" : "(max-width: 560px) 46vw, (max-width: 1100px) 45vw, 300px"} />
                  </span>
                  <span className="lp-card__label">
                    {t.line.items[i].title}
                    <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Documentación */}
      <section className="ag-docs sa-docs" aria-labelledby={`${id}-docs-title`}>
        <div className="lp-shell ag-docs__inner">
          <div className="ag-docs__copy" data-reveal="left">
            <p className="ag-eyebrow"><span aria-hidden="true" />{t.docs.eyebrow}</p>
            <h2 id={`${id}-docs-title`}>{t.docs.title}</h2>
            <p className="ag-lead">{t.docs.lead}</p>
            <Link href="/recursos" className="lp-btn lp-btn--outline">
              {t.docs.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            {t.docs.campaigns && (
              <Link href="/recursos" className="sa-docs__campaigns">
                <span><LayoutGrid aria-hidden="true" size={16} strokeWidth={1.8} /></span>
                {t.docs.campaigns}
                <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
              </Link>
            )}
          </div>
          <Link href="/recursos" className={`sa-docs__media${media.docs.cutout ? "" : " sa-docs__media--sheet"}`} data-reveal="right" aria-label={t.docs.cta}>
            <SectorImage prepared={media.preparedImages?.[media.docs.image]} src={media.docs.image} alt={t.docs.alt} width={media.docs.width} height={media.docs.height} quality={75} sizes="(max-width: 860px) 92vw, 54vw" />
          </Link>
        </div>
      </section>

      {/* Cierre */}
      <section className="ag-cta sa-cta" aria-labelledby={`${id}-cta-title`}>
        <SectorImage prepared={media.preparedImages?.[media.cta]} className="ag-cta__photo sa-cta__photo" src={media.cta} alt="" fill quality={60} placeholder="blur" blurDataURL={blur[media.cta]} sizes="100vw" />
        <div className="ag-cta__veil sa-cta__veil" aria-hidden="true" />
        <div className="lp-shell ag-cta__inner" data-reveal="up">
          <div>
            <p className="ag-eyebrow sa-cta__eyebrow"><span aria-hidden="true" />{t.cta.eyebrow}</p>
            <h2 id={`${id}-cta-title`}>{t.cta.title}</h2>
            <p>{t.cta.text}</p>
          </div>
          <div className="ag-cta__actions">
            <Link className="lp-btn lp-btn--solid sa-btn-sheen" href="/cotizar">
              {t.cta.quote} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
