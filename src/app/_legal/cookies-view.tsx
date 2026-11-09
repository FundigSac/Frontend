"use client";

import { ChevronDown } from "lucide-react";
import { AnimatedDetails } from "@/shared/ui/animated-details";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON, COOKIES } from "./copy";
import { CookiePrefs } from "./cookie-prefs";
import { SheetHead, useSheetRows } from "./sheet";
import { LegalToc } from "./toc";
import { useCopy } from "./use-copy";

export function CookiesView() {
  const t = useCopy(COOKIES);
  const home = useCopy(COMMON.home);
  const rows = useSheetRows(t.title);
  const toc = [
    { id: "preferencias", number: "", label: t.prefs.title },
    { id: "que-son", number: "", label: t.info[0].title },
    { id: "que-guardamos", number: "", label: t.inventory.title },
    { id: "derechos", number: "", label: t.legal.title },
    { id: "preguntas", number: "", label: t.faq.title },
  ];

  return (
    <main className="lp lg ls">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} rows={rows} />

      <div className="lp-shell ls-doc">
        <LegalToc items={toc} label={t.crumb} />
        <div className="ls-doc__body">
          <CookiePrefs />

          <section className="ls-section" id="que-son" aria-label={t.info[0].title}>
            <ul className="ls-rows">
              {t.info.map((item) => (
                <li key={item.title}>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="ls-section lg-store" id="que-guardamos" aria-labelledby="lg-store-title">
            <h2 id="lg-store-title">{t.inventory.title}</h2>
            <p>{t.inventory.lead}</p>
            <div className="lg-store__wrap">
              <table className="lg-store__table">
                <caption className="ls-sr">{t.inventory.title}</caption>
                <thead>
                  <tr>{t.inventory.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {t.inventory.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i} data-label={t.inventory.head[i]}>{i === 0 && cell.startsWith("fundigsac-") ? <code>{cell}</code> : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="lg-store__note">{t.inventory.note}</p>
          </section>

          <section className="ls-section" id="derechos" aria-labelledby="lg-legal-title">
            <h2 id="lg-legal-title">{t.legal.title}</h2>
            <p>{t.legal.lead}</p>
            <ul className="ls-rows">
              {t.legal.items.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="ls-section" id="preguntas" aria-labelledby="lg-faq-title">
            <h2 id="lg-faq-title">{t.faq.title}</h2>
            <p>{t.faq.lead}</p>
            <div className="lg-faq">
              {t.faq.items.map((item) => (
                <AnimatedDetails key={item.q}>
                  <summary>
                    {item.q}
                    <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
                  </summary>
                  <p>{item.a}</p>
                </AnimatedDetails>
              ))}
            </div>
          </section>
        </div>
      </div>
      <FloatingActions />
    </main>
  );
}
