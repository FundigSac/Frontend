"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "../_legal/copy";
import { useCopy } from "../_legal/use-copy";
import { SectionHead, SectorClosing, SectorHero } from "../industrias/_sector/sector-kit";
import { SITE } from "@/shared/config/site";
import { ABOUT } from "./copy";
import "@/app/landing.css";
import "../industrias/_sector/sector.css";
import "./about.css";

/** Cascada de la línea de tiempo: pasos de 90 ms con tope de 250 ms (brief §4.4 y §4.6). */
const delay = (i: number) => ({ ["--d" as string]: `${Math.min(i * 90, 250)}ms` });

export function AboutView() {
  const t = useCopy(ABOUT);
  const home = useCopy(COMMON.home);
  const { labels } = t.company;

  return (
    <>
      <main className="lp in ab">
        <SectorHero
          id="ab"
          image="/media/nosotros/hero.webp"
          alt={t.heroAlt}
          crumbs={{ home, current: t.crumb }}
          title={t.title}
          lead={t.lead}
          action={{ href: "/contacto", label: t.heroAction }}
        />

        <section className="sec" aria-labelledby="ab-sectores-title">
          <div className="lp-shell ab-sectores">
            <div className="ab-sectores__foto" data-reveal="media">
              <Image src="/media/nosotros/planta.webp" alt={t.essence.photoAlt} fill quality={72} sizes="(max-width: 1023px) 100vw, 50vw" />
            </div>
            <div className="ab-sectores__texto" data-reveal="up">
              <h2 id="ab-sectores-title">{t.sectors.title}</h2>
              <p className="ab-entrada">{t.history.text}</p>
              <ul className="sa-piezas">
                {t.sectors.items.map((item) => (
                  <li key={item.href}>
                    <Link className="sa-pieza" href={item.href}>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.text}</small>
                      </span>
                      <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec sec--suave" aria-labelledby="ab-historia-title">
          <div className="lp-shell">
            <SectionHead id="ab-historia-title" title={t.timelineTitle} />
            <ol className="ab-tiempo">
              {t.timeline.map((hito, i) => (
                <li key={hito.year} data-reveal="up" style={delay(i)}>
                  <span className="ab-tiempo__anio">{hito.year}</span>
                  <h3>{hito.title}</h3>
                  <p>{hito.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec" aria-labelledby="ab-esencia-title">
          <div className="lp-shell">
            <SectionHead id="ab-esencia-title" title={t.essence.title} />
            <div className="ab-mv" data-reveal="up">
              <div>
                <h3>{t.mission.title}</h3>
                <p>{t.mission.text}</p>
              </div>
              <div>
                <h3>{t.vision.title}</h3>
                <p>{t.vision.text}</p>
              </div>
            </div>
            <h3 className="ab-valores__titulo" data-reveal="up">{t.values.title}</h3>
            <ul className="ab-valores" data-reveal="stagger">
              {t.values.items.map((value) => <li key={value}>{value}</li>)}
            </ul>
          </div>
        </section>

        <section className="sec sec--suave" aria-labelledby="ab-datos-title">
          <div className="lp-shell">
            <SectionHead id="ab-datos-title" title={t.company.title} />
            <dl className="ab-datos" data-reveal="up">
              <div><dt>{labels.name}</dt><dd>{SITE.registeredName}</dd></div>
              <div><dt>{labels.ruc}</dt><dd className="ab-num">{SITE.ruc}</dd></div>
              <div><dt>{labels.address}</dt><dd>{SITE.address}</dd></div>
              <div><dt>{labels.phone}</dt><dd><a className="ab-num" href={SITE.phoneHref}>{SITE.phone}</a></dd></div>
              <div><dt>{labels.email}</dt><dd><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd></div>
              <div><dt>{labels.hours}</dt><dd>{t.company.hours}</dd></div>
            </dl>
          </div>
        </section>

        <SectorClosing id="ab" title={t.cta.title} text={t.cta.text} action={{ href: "/cotizar", label: t.cta.cta }} />
      </main>
      <FloatingActions />
    </>
  );
}
