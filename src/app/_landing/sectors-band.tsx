"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

const sectors = [
  { n: "01", title: "Saneamiento", text: ["Agua potable y", "alcantarillado."], href: "/industrias#saneamiento", img: "/media/home-v3/sector-saneamiento.webp", alt: "Planta de tratamiento de agua con montañas al fondo" },
  { n: "02", title: "Agricultura", text: ["Soluciones para", "sistemas de riego."], href: "/industrias#agricultura", img: "/media/home-v3/sector-agricultura.webp", alt: "Cultivo con riego por aspersión" },
  { n: "03", title: "Minería", text: ["Componentes para", "operaciones exigentes."], href: "/industrias#mineria", img: "/media/home-v3/sector-mineria.webp", alt: "Planta minera con fajas transportadoras al atardecer" },
];

export function SectorsBand() {
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
      <div className="lp-shell lp-sectors__head">
        <div>
          <h2 id="lp-sectors-title">Soluciones para cada sector.</h2>
          <p>Componentes para los desafíos de cada proyecto.</p>
        </div>
        <div className="lp-arrows lp-arrows--light" role="group" aria-label="Recorrer sectores">
          <button type="button" className="lp-arrow" onClick={() => go(-1)} aria-label="Sector anterior">
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          </button>
          <button type="button" className="lp-arrow" onClick={() => go(1)} aria-label="Sector siguiente">
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <ul className="lp-sectors__list" ref={list}>
        {sectors.map((s, i) => (
          <li key={s.n} className={`lp-sector lp-sector--${i + 1}${i === active ? " is-active" : ""}`}>
            <span className="lp-sector__img" aria-hidden="true">
              <Image src={s.img} alt="" fill sizes="(max-width: 860px) 80vw, 45vw" />
            </span>
            <Link href={s.href} onFocus={() => setActive(i)} onMouseEnter={() => setActive(i)}>
              <span className="lp-sector__num">{s.n} /</span>
              <strong className="lp-sector__title">{s.title}</strong>
              <span className="lp-sector__text">{s.text[0]}<br />{s.text[1]}</span>
              <ArrowRight className="lp-sector__arrow" aria-hidden="true" size={26} strokeWidth={1.6} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
