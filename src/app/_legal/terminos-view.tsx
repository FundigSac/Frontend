"use client";

import Link from "next/link";
import { COMMON, TERMS, UPDATED } from "./copy";
import { LegalCta, LegalHero } from "./legal-parts";
import { LegalToc } from "./toc";
import { useCopy } from "./use-copy";

export function TermsView({ hero, closing }: { hero: string; closing: string }) {
  const t = useCopy(TERMS);
  const home = useCopy(COMMON.home);
  const updated = useCopy(COMMON.updatedLabel);
  const date = useCopy(UPDATED);
  const toc = t.sections.map((s, i) => ({ id: s.id, number: String(i + 1).padStart(2, "0"), label: s.label }));

  return (
    <main className="lp lg">
      <LegalHero home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt="" wide />

      <div className="lp-shell lg-body">
        <div className="lg-doc">
          <LegalToc items={toc} label={t.tocLabel} />
          <div>
            <ol className="lg-terms">
              {t.sections.map((s, i) => (
                <li className="lg-term" id={s.id} key={s.id}>
                  <span className="lg-term__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div className="lg-term__body">
                    <h2>{s.label}</h2>
                    {s.text ? (
                      <p>{s.text}</p>
                    ) : (
                      <p>
                        {t.privacy.pre}<Link className="lg-link-inline" href="/privacidad">{t.privacy.link}</Link>{t.privacy.post}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="lg-updated">{updated} {date}</p>
          </div>
        </div>
      </div>

      <LegalCta {...t.cta} href="/contacto" image={closing} />
    </main>
  );
}
