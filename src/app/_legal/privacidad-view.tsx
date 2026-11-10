"use client";

import { FloatingActions } from "../_landing/floating-actions";
import { LegalMotion } from "./motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Lock, Mail, ScrollText, ShieldCheck, UserX, Users } from "lucide-react";
import { SITE } from "@/shared/config/site";
import { COMMON, PRIVACY, UPDATED } from "./copy";
import { LegalCta, LegalHero } from "./legal-parts";
import { useCopy } from "./use-copy";

const PILLAR_ICONS = [ShieldCheck, Users, Lock, ScrollText] as const;

export function PrivacyView({ hero, aside, closing }: { hero: string; aside: string; closing: string }) {
  const t = useCopy(PRIVACY);
  const home = useCopy(COMMON.home);
  const date = useCopy(UPDATED);

  return (
    <main className="lp lg">
      <LegalHero home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt="" wide />

      <div className="lp-shell lg-body">
        <div className="lg-intro">
          <div>
            <span className="lg-bar" aria-hidden="true" />
            <h2 className="lg-section-title">{t.introTitle}</h2>
            <p className="lg-text">{t.intro}</p>
          </div>
          <aside className="lg-callout" aria-label={t.callout.label} data-reveal="">
            <span className="lg-callout__icon" aria-hidden="true"><ShieldCheck size={30} strokeWidth={1.6} /></span>
            <div>
              <small>{t.callout.small}</small>
              <h3>{t.callout.title}</h3>
              <p>{t.callout.text}</p>
            </div>
          </aside>
        </div>

        <ul className="lg-pillars">
          {t.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i];
            return (
              <li className="lg-pillar" key={p.title} data-reveal="" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <Icon aria-hidden="true" size={34} strokeWidth={1.5} />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            );
          })}
        </ul>

        <div className="lg-privacy">
          <ol className="lg-steps">
            {t.steps.map((s, i) => (
              <li className="lg-step" key={s.title} data-reveal="">
                <span className="lg-step__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="lg-aside" aria-labelledby="lg-aside-title" data-reveal="">
            <div className="lg-aside__media">
              <Image src={aside} alt={t.aside.alt} fill quality={75} sizes="(max-width: 900px) 92vw, 400px" />
            </div>
            <span className="lg-bar" style={{ marginTop: 22 }} aria-hidden="true" />
            <h3 id="lg-aside-title" style={{ marginTop: 14 }}>{t.aside.title}</h3>
            <p>{t.aside.text}</p>
            <Link className="lp-btn lp-btn--solid" href="/contacto">
              {t.aside.button} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <hr />
            <h4>{t.aside.also}</h4>
            <ul className="lg-contact-list">
              <li>
                <Mail aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>{t.aside.mail}</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </li>
              <li>
                <FileText aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>{t.aside.request}</strong>
                  <span>{t.aside.requestText}</span>
                </div>
              </li>
              <li>
                <UserX aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>{t.aside.deletion}</strong>
                  <Link href="/eliminar-cuenta">{t.aside.deletionText}</Link>
                </div>
              </li>
              <li>
                <CalendarDays aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>{t.aside.updated}</strong>
                  <span>{date}</span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <LegalCta {...t.cta} href="/cotizar" image={closing} />
      <LegalMotion />
      <FloatingActions />
    </main>
  );
}
