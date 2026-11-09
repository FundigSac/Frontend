"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { NOT_FOUND } from "./copy";
import { useCopy } from "./use-copy";
import "./sheet.css";

const BOLTS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
  return { x: Math.round((100 + Math.cos(a) * 74) * 100) / 100, y: Math.round((100 + Math.sin(a) * 74) * 100) / 100 };
});

/** El "0" del 404 dibujado como la vista frontal de una brida: geometría, sin relleno ni degradados. */
function FlangeZero() {
  return (
    <svg className="ls-nf__zero" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="52" />
      {BOLTS.map((b) => <circle key={`${b.x}-${b.y}`} cx={b.x} cy={b.y} r="9" />)}
      <path d="M100 0v200M0 100h200" strokeWidth="1" strokeDasharray="10 4 2 4" opacity="0.7" />
    </svg>
  );
}

const CARD_HREFS = ["/productos", "/industrias", "/contacto?motivo=documentacion"] as const;

export function NotFoundView() {
  const t = useCopy(NOT_FOUND);

  return (
    <main className="lp lg ls">
      <section className="on-dark ls-head" aria-labelledby="lg-title">
        <div className="lp-shell ls-head__grid ls-nf__grid">
          <div className="ls-head__text">
            <h1 id="lg-title"><span className="ls-sr">{t.srError}</span>{t.title}</h1>
            <p className="ls-head__lead">{t.lead}</p>
            <div className="ls-nf__actions" data-enter="">
              <Link className="lp-btn lp-btn--solid lp-btn--lg" href="/">
                {t.home} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
              </Link>
              <Link className="lp-btn lp-btn--outline lp-btn--lg" href="/productos">
                {t.products}
              </Link>
            </div>
          </div>
          <div className="ls-nf__figure" aria-hidden="true">
            <span>4</span>
            <FlangeZero />
            <span>4</span>
          </div>
        </div>
      </section>

      <div className="lp-shell ls-page">
        <section className="ls-section" aria-label={t.eyebrow}>
          <ul className="ls-nf__links" data-enter="">
            {t.cards.map((c, i) => (
              <li key={CARD_HREFS[i]}>
                <Link href={CARD_HREFS[i]}>
                  <strong>{c.title}</strong>
                  <span>{c.text}</span>
                  <ArrowRight aria-hidden="true" size={20} strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <FloatingActions />
    </main>
  );
}
