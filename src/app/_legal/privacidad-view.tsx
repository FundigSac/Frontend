"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Mail, UserX } from "lucide-react";
import { SITE } from "@/shared/config/site";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON, PRIVACY, UPDATED } from "./copy";
import { SheetHead, useSheetRows } from "./sheet";
import { LegalToc } from "./toc";
import { useCopy } from "./use-copy";

export function PrivacyView() {
  const t = useCopy(PRIVACY);
  const home = useCopy(COMMON.home);
  const date = useCopy(UPDATED);
  const rows = useSheetRows(t.title, date);
  const toc = [
    { id: "compromiso", number: "", label: t.introTitle },
    ...t.steps.map((s, i) => ({ id: `seccion-${i + 1}`, number: String(i + 1), label: s.title })),
    { id: "tus-preguntas", number: "", label: t.aside.title },
  ];

  return (
    <main className="lp lg ls">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} rows={rows} />

      <div className="lp-shell ls-doc">
        <LegalToc items={toc} label={t.crumb} />
        <div className="ls-doc__body">
          <section className="ls-section ls-section--first" id="compromiso" aria-labelledby="ls-intro">
            <h2 id="ls-intro">{t.introTitle}</h2>
            <p>{t.intro}</p>
            <p>{t.callout.text}</p>
            <ul className="ls-rows ls-rows--2">
              {t.pillars.map((p) => (
                <li key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <ol className="lg-steps">
            {t.steps.map((s, i) => (
              <li className="lg-step" id={`seccion-${i + 1}`} key={s.title}>
                <span className="lg-term__n" aria-hidden="true">{i + 1}</span>
                <div>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="ls-section lg-aside" id="tus-preguntas" aria-labelledby="lg-aside-title">
            <h2 id="lg-aside-title">{t.aside.title}</h2>
            <p>{t.aside.text}</p>
            <Link className="lp-btn lp-btn--solid" href="/contacto">
              {t.aside.button} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <h3>{t.aside.also}</h3>
            <ul className="lg-contact-list">
              <li>
                <Mail aria-hidden="true" size={22} strokeWidth={1.75} />
                <div>
                  <strong>{t.aside.mail}</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </li>
              <li>
                <FileText aria-hidden="true" size={22} strokeWidth={1.75} />
                <div>
                  <strong>{t.aside.request}</strong>
                  <span>{t.aside.requestText}</span>
                </div>
              </li>
              <li>
                <UserX aria-hidden="true" size={22} strokeWidth={1.75} />
                <div>
                  <strong>{t.aside.deletion}</strong>
                  <Link href="/eliminar-cuenta">{t.aside.deletionText}</Link>
                </div>
              </li>
              <li>
                <CalendarDays aria-hidden="true" size={22} strokeWidth={1.75} />
                <div>
                  <strong>{t.aside.updated}</strong>
                  <span>{date}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <FloatingActions />
    </main>
  );
}
