"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "./copy";
import { SheetEnd, SheetHead } from "./sheet";
import { SITEMAP } from "./sitemap-copy";
import { useCopy } from "./use-copy";

export function SitemapView() {
  const t = useCopy(SITEMAP);
  const home = useCopy(COMMON.home);

  return (
    <main className="lp lg ls">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} />

      <div className="lp-shell ls-page">
        <ul className="lg-map">
          {t.groups.map((group) => (
            <li className="ls-section lg-map__card" key={group.title}>
              <div className="lg-map__intro">
                <h2>{group.title}</h2>
                <p>{group.text}</p>
              </div>
              <ul className="lg-map__links">
                {group.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href}>
                      <span>{link.label}</span>
                      <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <SheetEnd title={t.cta.eyebrow} text={t.cta.text} cta={t.cta.cta} href="/contacto" />
      </div>
      <FloatingActions />
    </main>
  );
}
