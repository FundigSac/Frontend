"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COPY, useLang } from "@/shared/layout/landing-prefs";
import { PAGE } from "./copy";
import { HeroValve } from "./hero-valve";
import { IntentLink } from "./intent-link";

// Mismo orden que COPY[lang].products (sin "Catálogo general") y COPY[lang].sectors.
const PRODUCT_HREFS = ["/productos/valvulas", "/productos/marcos-y-tapas", "/cotizar", "/productos/conexiones-y-fittings", "/productos/tuberias"] as const;
const SECTOR_HREFS = ["/industrias/saneamiento", "/industrias/agricultura", "/industrias/mineria"] as const;

export function HomeHero() {
  const [lang] = useLang();
  const base = COPY[lang];
  const t = PAGE[lang].hero;
  const products = base.products.slice(1);

  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-shell lp-hero__grid">
        <div className="lp-hero__copy">
          <h1 id="lp-hero-title">{t.title}</h1>
          <p className="lp-hero__lead">{t.lead}</p>
          <div className="lp-hero__actions" data-enter="">
            <Link href="/productos" className="lp-btn lp-btn--solid" prefetch={false}>
              {base.hero.explore} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <IntentLink href="/cotizar" className="lp-link">
              <span>{base.quote}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </IntentLink>
          </div>
        </div>
        <HeroValve />
      </div>

      {/* Cartela de la lámina: qué se vende, para quién y cómo se cotiza, sin tener que bajar. */}
      <div className="lp-shell">
        <dl className="ho-sheet" aria-label={t.sheetLabel} data-enter="">
          <div className="ho-sheet__cell">
            <dt>{t.whatLabel}</dt>
            <dd>
              <ul>
                {products.map((label, i) => (
                  <li key={PRODUCT_HREFS[i]}><IntentLink href={PRODUCT_HREFS[i]}>{label}</IntentLink></li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="ho-sheet__cell">
            <dt>{t.sectorsLabel}</dt>
            <dd>
              <ul>
                {base.sectors.map((label, i) => (
                  <li key={SECTOR_HREFS[i]}><IntentLink href={SECTOR_HREFS[i]}>{label}</IntentLink></li>
                ))}
                <li><IntentLink href="/industrias">{base.hero.solutions}</IntentLink></li>
              </ul>
            </dd>
          </div>
          <div className="ho-sheet__cell">
            <dt>{t.quoteLabel}</dt>
            <dd>
              <ol>
                {t.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
