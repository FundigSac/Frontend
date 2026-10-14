"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Gauge, Network, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSanea } from "./copy";
import { BLUR } from "@/shared/media/blur";

const FEATURE_ICONS = [ShieldCheck, Network, Gauge] as const;
const APP_ITEMS = [
  { href: "/productos/valvulas", image: "/media/saneamiento/agua-potable.webp" },
  { href: "/productos/marcos-y-tapas", image: "/media/saneamiento/alcantarillado.webp" },
] as const;
const LINE_ITEMS = [
  { href: "/productos/marcos-y-tapas", image: "/media/saneamiento/marcos-tapas.webp", position: "50% 50%" },
  { href: "/productos/tuberias", image: "/media/saneamiento/tuberias.webp", position: "50% 60%" },
  { href: "/productos?q=acople", image: "/media/saneamiento/acoples.webp", position: "50% 50%" },
  { href: "/productos/valvulas", image: "/media/saneamiento/hero.webp", position: "76% 55%" },
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

export function SanitationSections() {
  const t = useSanea();
  const root = useReveal();

  return (
    <main className="lp ag sa" ref={root}>
      {/* Hero */}
      <section className="ag-hero sa-hero" aria-labelledby="sa-title">
        <Image className="ag-hero__photo sa-hero__photo" src="/media/saneamiento/hero.webp" alt={t.hero.alt} fill priority fetchPriority="high" quality={75} placeholder="blur" blurDataURL={BLUR["/media/saneamiento/hero.webp"]} sizes="100vw" />
        <span className="sa-hero__glint" aria-hidden="true" />
        <div className="ag-hero__veil sa-hero__veil" aria-hidden="true" />
        <div className="lp-shell ag-hero__inner">
          <nav className="ag-crumbs" aria-label="breadcrumb">
            <Link href="/">{t.crumbs.home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.crumbs.current}</span>
          </nav>
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.hero.eyebrow}</p>
          <h1 id="sa-title">{t.hero.title}</h1>
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
      <section className="ag-featured sa-featured" aria-labelledby="sa-featured-title">
        <div className="ag-featured__media" data-reveal="left">
          <Image src="/media/saneamiento/destacada.webp" alt={t.featured.alt} fill quality={75} placeholder="blur" blurDataURL={BLUR["/media/saneamiento/destacada.webp"]} sizes="(max-width: 860px) 100vw, 50vw" />
        </div>
        <div className="ag-featured__copy" data-reveal="right">
          <p className="ag-eyebrow"><span aria-hidden="true" />{t.featured.eyebrow}</p>
          <h2 id="sa-featured-title">{t.featured.title}</h2>
          <p className="ag-lead">{t.featured.lead[0]}<strong>{t.featured.lead[1]}</strong>{t.featured.lead[2]}</p>
          <ul className="sa-features">
            {t.featured.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li key={f.title} style={{ ["--d" as string]: `${i * 90}ms` }}>
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
      <section className="sa-apps" aria-labelledby="sa-apps-title">
        <div className="lp-shell sa-apps__head">
          <div data-reveal="up">
            <p className="ag-eyebrow"><span aria-hidden="true" />{t.apps.eyebrow}</p>
            <h2 id="sa-apps-title">{t.apps.title}</h2>
          </div>
          <p className="sa-apps__lead" data-reveal="up" style={{ ["--d" as string]: "120ms" }}>{t.apps.lead}</p>
        </div>
        <ul className="sa-apps__grid">
          {APP_ITEMS.map((item, i) => (
            <li key={item.href} data-reveal="up" style={{ ["--d" as string]: `${i * 120}ms` }}>
              <Link href={item.href} className="sa-app">
                <Image src={item.image} alt={t.apps.items[i].alt} fill quality={72} placeholder="blur" blurDataURL={BLUR[item.image]} sizes="(max-width: 860px) 100vw, 50vw" />
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

      {/* Línea para saneamiento */}
      <section className="ag-line" aria-labelledby="sa-line-title">
        <div className="lp-shell">
          <div className="ag-line__head" data-reveal="up">
            <div>
              <p className="ag-eyebrow"><span aria-hidden="true" />{t.line.eyebrow}</p>
              <h2 id="sa-line-title">{t.line.title}</h2>
            </div>
            <Link href="/productos" className="lp-link">
              <span>{t.line.all}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
          <ul className="ag-line__grid">
            {LINE_ITEMS.map((item, i) => (
              <li key={item.href} data-reveal="up" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <Link href={item.href} className="lp-card">
                  <span className="lp-card__media">
                    <Image src={item.image} alt={t.line.items[i].alt} width={1448} height={1086} quality={70} placeholder="blur" blurDataURL={BLUR[item.image]} style={{ objectPosition: item.position }} sizes="(max-width: 560px) 90vw, (max-width: 1100px) 45vw, 300px" />
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
      <section className="ag-docs sa-docs" aria-labelledby="sa-docs-title">
        <div className="lp-shell ag-docs__inner">
          <div className="ag-docs__copy" data-reveal="left">
            <p className="ag-eyebrow"><span aria-hidden="true" />{t.docs.eyebrow}</p>
            <h2 id="sa-docs-title">{t.docs.title}</h2>
            <p className="ag-lead">{t.docs.lead}</p>
            <Link href="/recursos" className="lp-btn lp-btn--outline">
              {t.docs.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
          <Link href="/recursos" className="sa-docs__media" data-reveal="right" aria-label={t.docs.cta}>
            <Image src="/media/saneamiento/catalogo-recorte.webp" alt={t.docs.alt} width={1448} height={1086} quality={78} sizes="(max-width: 860px) 92vw, 54vw" />
          </Link>
        </div>
      </section>

      {/* Cierre */}
      <section className="ag-cta sa-cta" aria-labelledby="sa-cta-title">
        <Image className="ag-cta__photo sa-cta__photo" src="/media/saneamiento/cierre.webp" alt="" fill quality={65} placeholder="blur" blurDataURL={BLUR["/media/saneamiento/cierre.webp"]} sizes="100vw" />
        <div className="ag-cta__veil sa-cta__veil" aria-hidden="true" />
        <div className="lp-shell ag-cta__inner" data-reveal="up">
          <div>
            <p className="ag-eyebrow sa-cta__eyebrow"><span aria-hidden="true" />{t.cta.eyebrow}</p>
            <h2 id="sa-cta-title">{t.cta.title}</h2>
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
