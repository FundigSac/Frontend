"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "../_legal/copy";
import { LegalCta, LegalHero } from "../_legal/legal-parts";
import { LegalMotion } from "../_legal/motion";
import { useCopy } from "../_legal/use-copy";
import { ABOUT } from "./copy";
import { BarsUpIcon, GearIcon, GemIcon, LeafIcon, TargetArrowIcon, TeamIcon } from "./icons";
import "./about.css";

const HIGHLIGHT_ICONS = [GemIcon, TeamIcon, GearIcon, LeafIcon] as const;

export function AboutView() {
  const t = useCopy(ABOUT);
  const home = useCopy(COMMON.home);

  return (
    <>
    <main className="lp lg ab">
      <LegalHero home={home} crumb={t.crumb} title={t.title} lead={t.lead} image="/media/nosotros/hero.webp" wide modifier="ab-hero" />

      <section className="ab-highlights" aria-label={t.highlightsLabel}>
        <ul className="lp-shell ab-highlights__list">
          {t.highlights.map((h, i) => {
            const Icon = HIGHLIGHT_ICONS[i];
            return (
              <li key={h.title} data-reveal="">
                <Icon />
                <h2>{h.title}</h2>
                <p>{h.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ab-history" aria-labelledby="ab-history-title">
        <div className="lp-shell ab-history__grid">
          <div data-reveal="">
            <p className="lg-eyebrow">{t.history.eyebrow}</p>
            <h2 id="ab-history-title" className="lg-section-title">{t.history.title}</h2>
            <p className="lg-text ab-history__text">{t.history.text}</p>
            <Link className="lp-btn lp-btn--solid lp-btn--lg ab-history__cta" href="/contacto">
              {t.history.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
          <ol className="ab-timeline">
            {t.timeline.map((e) => (
              <li key={e.year} data-reveal="">
                <span className="ab-timeline__year">{e.year}</span>
                <div>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ab-essence" aria-labelledby="ab-essence-title">
        <div className="ab-essence__photo" data-reveal="">
          <Image src="/media/nosotros/planta.webp" alt={t.essence.photoAlt} fill quality={85} sizes="(min-width: 901px) 46vw, 100vw" />
        </div>
        <div className="ab-essence__body">
          <p className="lg-eyebrow">{t.essence.eyebrow}</p>
          <h2 id="ab-essence-title" className="lg-section-title">{t.essence.title}</h2>
          <div className="ab-mv">
            <div data-reveal="">
              <TargetArrowIcon />
              <h3>{t.mission.title}</h3>
              <p>{t.mission.text}</p>
            </div>
            <div data-reveal="">
              <BarsUpIcon />
              <h3>{t.vision.title}</h3>
              <p>{t.vision.text}</p>
            </div>
          </div>
          <div className="ab-values" data-reveal="">
            <TeamIcon />
            <div>
              <h3>{t.values.title}</h3>
              <ul>
                {t.values.items.map((v) => <li key={v}>{v}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <LegalCta {...t.cta} href="/cotizar" image="/media/nosotros/cierre.webp" />
      <LegalMotion />
    </main>
    <FloatingActions />
    </>
  );
}
