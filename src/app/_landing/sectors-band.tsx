"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useHome } from "@/shared/layout/home-copy";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BLUR } from "@/shared/media/blur";
import { Words } from "./words";

const sectors = [
  { n: "01", href: "/industrias/saneamiento", img: "/media/home-v3/sector-saneamiento.webp" },
  { n: "02", href: "/industrias/agricultura", img: "/media/home-v3/sector-agricultura.webp" },
  { n: "03", href: "/industrias/mineria", img: "/media/home-v3/sector-mineria.webp" },
];

/**
 * Tres franjas diagonales. En escritorio la franja que se apunta (o se enfoca, o se elige con las flechas) se ensancha:
 * las líneas blancas se corren y las otras dos se pliegan; al salir, las tres vuelven a su reparto (`data-open`, la
 * geometría vive en `home-motion.css`). En móvil son un carrusel de tarjetas con puntos.
 */
export function SectorsBand() {
  const t = useHome().sectors;
  const [open, setOpen] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  // Móvil: la tarjeta que ocupa la mayor parte del carrusel es la actual (marca su punto).
  useEffect(() => {
    const el = list.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (el.scrollWidth <= el.clientWidth + 1) return;
        for (const entry of entries) if (entry.isIntersecting) setCurrent(Number((entry.target as HTMLElement).dataset.index));
      },
      { root: el, threshold: 0.6 },
    );
    Array.from(el.children).forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, []);

  // En móvil desplaza el carrusel (sin mover la página) hasta centrar la tarjeta.
  const show = (i: number) => {
    const el = list.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.clientWidth) / 2, behavior: "smooth" });
  };

  const go = (dir: 1 | -1) => {
    const el = list.current;
    if (el && el.scrollWidth > el.clientWidth + 1) {
      show((current + dir + sectors.length) % sectors.length);
      return;
    }
    setOpen((o) => ((o ?? (dir === 1 ? -1 : sectors.length)) + dir + sectors.length) % sectors.length);
  };

  return (
    <section className="lp-sectors" aria-labelledby="lp-sectors-title" data-open={open ?? undefined}>
      <span className="lp-sectors__seam lp-sectors__seam--1" aria-hidden="true" />
      <span className="lp-sectors__seam lp-sectors__seam--2" aria-hidden="true" />
      <div className="lp-shell lp-sectors__head">
        <div data-reveal="stagger">
          <h2 id="lp-sectors-title" className="lp-words"><Words text={t.title} /></h2>
          <p>{t.lead}</p>
        </div>
        <div className="lp-arrows lp-arrows--light" role="group" aria-label={t.group} data-reveal="fade">
          <button type="button" className="lp-arrow" onClick={() => go(-1)} aria-label={t.prev}>
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          </button>
          <button type="button" className="lp-arrow" onClick={() => go(1)} aria-label={t.next}>
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <ul
        className="lp-sectors__list"
        ref={list}
        data-reveal="sectors"
        onMouseLeave={() => setOpen(null)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(null)}
      >
        {sectors.map((s, i) => (
          <li
            key={s.n}
            data-index={i}
            className={`lp-sector lp-sector--${i + 1}${open === i ? " is-open" : ""}${open !== null && open !== i ? " is-folded" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="lp-sector__img" aria-hidden="true">
              <Image src={s.img} alt="" width={1122} height={1402} quality={70} loading="eager" fetchPriority="low" placeholder="blur" blurDataURL={BLUR[s.img]} sizes="(max-width: 860px) 60vw, 45vw" />
            </span>
            <Link href={s.href} onFocus={() => setOpen(i)} onMouseEnter={() => setOpen(i)}>
              <span className="lp-sector__body">
                <span className="lp-sector__num">{s.n} /</span>
                <strong className="lp-sector__title"><Words text={t.items[i].title} by="char" /></strong>
                <span className="lp-sector__text">{t.items[i].text[0]}<br />{t.items[i].text[1]}</span>
                <span className="lp-sector__cta" aria-hidden="true">
                  <ArrowRight className="lp-sector__arrow" size={26} strokeWidth={1.6} />
                  <span>{t.cta}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="lp-sectors__dots" role="group" aria-label={t.dots}>
        {sectors.map((s, i) => (
          <button key={s.n} type="button" aria-label={t.goTo(t.items[i].title)} aria-current={current === i ? "true" : undefined} onClick={() => show(i)}>
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
