"use client";

import Link from "next/link";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON, TERMS, UPDATED } from "./copy";
import { SheetEnd, SheetHead, useSheetRows } from "./sheet";
import { LegalToc } from "./toc";
import { useCopy } from "./use-copy";

export function TermsView() {
  const t = useCopy(TERMS);
  const home = useCopy(COMMON.home);
  const date = useCopy(UPDATED);
  const rows = useSheetRows(t.title, date);
  const toc = t.sections.map((s, i) => ({ id: s.id, number: String(i + 1), label: s.label }));

  return (
    <main className="lp lg ls">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} rows={rows} />

      <div className="lp-shell ls-doc">
        <LegalToc items={toc} label={t.tocLabel} />
        <div className="ls-doc__body">
          <ol className="lg-terms">
            {t.sections.map((s, i) => (
              <li className="lg-term" id={s.id} key={s.id}>
                <span className="lg-term__n" aria-hidden="true">{i + 1}</span>
                <div>
                  <h2>{s.label}</h2>
                  {s.text ? (
                    <p>{s.text}</p>
                  ) : (
                    <p>
                      {t.privacy.pre}<Link className="ls-link" href="/privacidad">{t.privacy.link}</Link>{t.privacy.post}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <SheetEnd title={t.cta.eyebrow} text={t.cta.text} cta={t.cta.cta} href="/contacto" />
        </div>
      </div>
      <FloatingActions />
    </main>
  );
}
