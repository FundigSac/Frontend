"use client";

import { FloatingActions } from "../_landing/floating-actions";
import { LegalMotion } from "./motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AnimatedDetails } from "@/shared/ui/animated-details";
import { COMMON, COOKIES } from "./copy";
import { CookiePrefs } from "./cookie-prefs";
import { LegalHero } from "./legal-parts";
import { useCopy } from "./use-copy";

const INFO_POSITIONS = ["50% 58%", "50% 50%", "50% 62%"] as const;

export function CookiesView({ hero, info }: { hero: string; info: readonly [string, string, string] }) {
  const t = useCopy(COOKIES);
  const home = useCopy(COMMON.home);

  return (
    <main className="lp lg">
      <LegalHero home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt="" wide />

      <div className="lp-shell lg-body" style={{ paddingBottom: 0 }}>
        <CookiePrefs />

        <ul className="lg-info-grid">
          {t.info.map((item, i) => (
            <li className="lg-info" key={item.title} data-reveal="" style={{ ["--d" as string]: `${i * 110}ms` }}>
              <div className="lg-info__media">
                <Image src={info[i]} alt={item.alt} fill quality={85} sizes="(max-width: 720px) 92vw, 33vw" style={{ objectPosition: INFO_POSITIONS[i] }} />
              </div>
              <span className="lg-bar" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <section className="lg-faq-wrap lg-body" style={{ marginTop: "clamp(28px, 4vw, 52px)" }} aria-labelledby="lg-faq-title">
        <div className="lp-shell">
          <div className="lg-faq-head">
            <div>
              <p className="lg-eyebrow">{t.faq.eyebrow}</p>
              <h2 id="lg-faq-title" className="lg-section-title" style={{ marginTop: 14 }}>{t.faq.title}</h2>
            </div>
            <p className="lg-text">{t.faq.lead}</p>
          </div>
          <div className="lg-faq" data-reveal="">
            {t.faq.items.map((item) => (
              <AnimatedDetails key={item.q}>
                <summary>
                  {item.q}
                  <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
                </summary>
                <div>{item.a}</div>
              </AnimatedDetails>
            ))}
          </div>
        </div>
      </section>
      <LegalMotion />
      <FloatingActions />
    </main>
  );
}
