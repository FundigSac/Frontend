"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useHome } from "@/shared/layout/home-copy";
import { useRef, useState } from "react";
import { BLUR } from "@/shared/media/blur";

const sectors = [
  { n: "01", href: "/industrias/saneamiento", img: "/media/home-v3/sector-saneamiento.webp" },
  { n: "02", href: "/industrias/agricultura", img: "/media/home-v3/sector-agricultura.webp" },
  { n: "03", href: "/industrias/mineria", img: "/media/home-v3/sector-mineria.webp" },
];

export function SectorsBand() {
  const t = useHome().sectors;
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  const go = (dir: 1 | -1) => {
    const next = (active + dir + sectors.length) % sectors.length;
    setActive(next);
    // En móvil los sectores son un carrusel horizontal: desplaza sin mover la página.
    const el = list.current;
    const item = el?.children[next] as HTMLElement | undefined;
    if (el && item && el.scrollWidth > el.clientWidth) el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  return (
    <section className="lp-sectors" aria-labelledby="lp-sectors-title">
      <svg className="lp-sectors__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="39.3" y1="0" x2="31" y2="100" />
        <line x1="72.3" y1="0" x2="61.6" y2="100" />
      </svg>
      <div className="lp-shell lp-sectors__head" data-reveal>
        <div>
          <h2 id="lp-sectors-title">{t.title}</h2>
          <p>{t.lead}</p>
        </div>
        <div className="lp-arrows lp-arrows--light" role="group" aria-label={t.group}>
          <button type="button" className="lp-arrow" onClick={() => go(-1)} aria-label={t.prev}>
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          </button>
          <button type="button" className="lp-arrow" onClick={() => go(1)} aria-label={t.next}>
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <ul className="lp-sectors__list" ref={list} data-reveal="sectors">
        {sectors.map((s, i) => (
          <li key={s.n} className={`lp-sector lp-sector--${i + 1}${i === active ? " is-active" : ""}`} style={{ ["--i" as string]: i }}>
            <span className="lp-sector__img" aria-hidden="true">
              <Image src={s.img} alt="" fill quality={70} placeholder="blur" blurDataURL={BLUR[s.img]} sizes="(max-width: 860px) 80vw, 45vw" />
            </span>
            <Link href={s.href} onFocus={() => setActive(i)} onMouseEnter={() => setActive(i)}>
              <span className="lp-sector__num">{s.n} /</span>
              <strong className="lp-sector__title">{t.items[i].title}</strong>
              <span className="lp-sector__text">{t.items[i].text[0]}<br />{t.items[i].text[1]}</span>
              <ArrowRight className="lp-sector__arrow" aria-hidden="true" size={26} strokeWidth={1.6} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
