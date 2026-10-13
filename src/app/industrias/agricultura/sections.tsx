"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplet, FileText, Settings, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAgri } from "./copy";
import { HeroMotion, type HeroVideo } from "./hero-motion";

/** Cuando exista un video real del riego (WebM/MP4), indícalo aquí y reemplaza al shader: { webm: "/media/agricultura/hero-loop.webm", mp4: "/media/agricultura/hero-loop.mp4" } */
const HERO_VIDEO: HeroVideo | undefined = {
  webm: "/media/agricultura/hero-loop.webm",
  mp4: "/media/agricultura/hero-loop.mp4",
  small: { webm: "/media/agricultura/hero-loop-sm.webm", mp4: "/media/agricultura/hero-loop-sm.mp4" },
};
import { BLUR } from "@/shared/media/blur";

const FEATURE_ICONS = [ShieldCheck, Droplet, Settings] as const;
const LINE_ITEMS = [
  { href: "/productos?q=ventosa", image: "/media/agricultura/ventosa.webp" },
  { href: "/productos?q=filtro", image: "/media/agricultura/filtro-y.webp" },
  { href: "/productos?categoria=hdpe", image: "/media/agricultura/tuberia-hdpe.webp" },
  { href: "/productos/valvulas", image: "/media/agricultura/valvula-retencion.webp" },
] as const;

/** Revela cada elemento `[data-reveal]` al entrar en pantalla (respeta movimiento reducido). */
function useReveal() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nodes = el.querySelectorAll<HTMLElement>("[data-reveal]");
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
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return root;
}

export function AgricultureSections() {
  const t = useAgri();
  const root = useReveal();

  return (
    <main className="lp ag" ref={root}>
      {/* Hero */}
      <section className="ag-hero" aria-labelledby="ag-title">
        <Image className="ag-hero__photo" src="/media/agricultura/hero.webp" alt={t.hero.alt} fill priority fetchPriority="high" quality={70} placeholder="blur" blurDataURL={BLUR["/media/agricultura/hero.webp"]} sizes="100vw" />
        <HeroMotion video={HERO_VIDEO} />
        <div className="ag-hero__veil" aria-hidden="true" />
        <div className="lp-shell ag-hero__inner">
          <nav className="ag-crumbs" aria-label="breadcrumb">
            <Link href="/">{t.crumbs.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/industrias">{t.crumbs.sectors}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.crumbs.current}</span>
          </nav>
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.hero.eyebrow}</p>
          <h1 id="ag-title">{t.hero.title}</h1>
          <p className="ag-hero__lead">{t.hero.lead}</p>
          <div className="ag-hero__actions">
            <Link href="/productos?categoria=valvulas" className="lp-btn lp-btn--solid">
              {t.hero.explore} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <Link href="/cotizar" className="lp-btn lp-btn--outline ag-btn-glass">
              {t.hero.quote} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Producto destacado */}
      <section className="ag-featured" aria-labelledby="ag-featured-title">
        <div className="ag-featured__media" data-reveal="left">
          <Image src="/media/agricultura/valvula-compuerta.webp" alt={t.featured.alt} fill loading="eager" fetchPriority="low" quality={72} placeholder="blur" blurDataURL={BLUR["/media/agricultura/valvula-compuerta.webp"]} sizes="(max-width: 860px) 100vw, 50vw" />
        </div>
        <div className="ag-featured__copy" data-reveal="right">
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.featured.eyebrow}</p>
          <h2 id="ag-featured-title">{t.featured.title}</h2>
          <p className="ag-lead">{t.featured.lead}</p>
          <ul className="ag-features">
            {t.featured.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li key={f}>
                  <Icon aria-hidden="true" size={30} strokeWidth={1.4} />
                  <span>{f}</span>
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

      {/* Línea para agricultura */}
      <section className="ag-line" aria-labelledby="ag-line-title">
        <div className="lp-shell">
          <div className="ag-line__head" data-reveal="up">
            <div>
              <p className="ag-eyebrow"><span aria-hidden="true" />{t.line.eyebrow}</p>
              <h2 id="ag-line-title">{t.line.title}</h2>
            </div>
            <Link href="/productos/valvulas" className="lp-link">
              <span>{t.line.all}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
          <ul className="ag-line__grid">
            {LINE_ITEMS.map((item, i) => (
              <li key={item.href} data-reveal="up" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <Link href={item.href} className="lp-card">
                  <span className="lp-card__media">
                    <Image src={item.image} alt={t.line.items[i].alt} width={1448} height={1086} loading="eager" fetchPriority="low" quality={70} placeholder="blur" blurDataURL={BLUR[item.image]} sizes="(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 280px" />
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
      <section className="ag-docs" aria-labelledby="ag-docs-title">
        <div className="lp-shell ag-docs__inner">
          <div className="ag-docs__copy" data-reveal="left">
            <p className="ag-eyebrow"><span aria-hidden="true" />{t.docs.eyebrow}</p>
            <h2 id="ag-docs-title">{t.docs.title}</h2>
            <p className="ag-lead">{t.docs.lead}</p>
            <Link href="/recursos" className="lp-btn lp-btn--solid">
              {t.docs.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
          <Link href="/recursos" className="ag-docs__media" data-reveal="right" aria-label={t.docs.cta}>
            <span className="ag-docs__plan">
              <Image src="/media/agricultura/plano.webp" alt={t.docs.drawingAlt} width={1448} height={1086} quality={70} placeholder="blur" blurDataURL={BLUR["/media/agricultura/plano.webp"]} sizes="(max-width: 860px) 70vw, 28vw" />
            </span>
            <span className="ag-docs__book">
              <Image src="/media/agricultura/catalogo.webp" alt={t.docs.catalogAlt} width={1448} height={1086} quality={70} placeholder="blur" blurDataURL={BLUR["/media/agricultura/catalogo.webp"]} sizes="(max-width: 860px) 70vw, 30vw" />
            </span>
          </Link>
        </div>
      </section>

      {/* Cierre */}
      <section className="ag-cta" aria-labelledby="ag-cta-title">
        <Image className="ag-cta__photo" src="/media/agricultura/hero.webp" alt="" fill quality={60} placeholder="blur" blurDataURL={BLUR["/media/agricultura/hero.webp"]} sizes="100vw" />
        <div className="ag-cta__veil" aria-hidden="true" />
        <div className="lp-shell ag-cta__inner" data-reveal="up">
          <div>
            <h2 id="ag-cta-title">{t.cta.title}</h2>
            <p>{t.cta.text}</p>
          </div>
          <div className="ag-cta__actions">
            <Link className="lp-btn lp-btn--solid" href="/cotizar">
              {t.cta.quote} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
