"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";
import { useHome } from "@/shared/layout/home-copy";

const BACKING_LINKS = ["/industrias", "/recursos", "/contacto"] as const;

export function BackingSection() {
  const t = useHome().backing;
  return (
    <section className="lp-backing" aria-labelledby="lp-backing-title">
      <div className="lp-backing__media">
        <Image src="/media/home-v3/respaldo-ingeniero.webp" alt={t.alt} fill sizes="(max-width: 860px) 100vw, 46vw" />
      </div>
      <div className="lp-backing__copy">
        <p className="lp-eyebrow">{t.eyebrow}</p>
        <span className="lp-hero__rule" aria-hidden="true" />
        <h2 id="lp-backing-title">{t.title}</h2>
        <p className="lp-backing__lead">{t.lead}</p>
        <ul className="lp-backing__list">
          {t.items.map((b, i) => (
            <li key={BACKING_LINKS[i]}>
              <Link href={BACKING_LINKS[i]}>
                <span className="lp-backing__n">{String(i + 1).padStart(2, "0")}</span>
                <strong>{b.title}</strong>
                <span>{b.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DocsSection() {
  const t = useHome().docs;
  return (
    <section className="lp-docs" aria-labelledby="lp-docs-title">
      <div className="lp-shell lp-docs__inner">
        <div className="lp-docs__copy">
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 id="lp-docs-title">{t.title}</h2>
          <p className="lp-docs__lead">{t.lead}</p>
          <Link href="/recursos" className="lp-btn lp-btn--outline">
            {t.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </Link>
          <Link href="/recursos" className="lp-docs__campaigns">
            <span className="lp-docs__campaigns-icon"><CalendarRange aria-hidden="true" size={16} strokeWidth={1.8} /></span>
            {t.campaigns}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
        </div>

        <Link href="/recursos" className="lp-docs__media" aria-label={t.mediaLabel}>
          <Image src="/media/home-v3/ficha-plano.webp" alt={t.alt} width={1448} height={1086} sizes="(max-width: 860px) 100vw, 55vw" />
        </Link>
      </div>
    </section>
  );
}
