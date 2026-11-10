"use client";

import Link from "next/link";
import { ArrowUpRight, Boxes, Building2, Factory, Scale, UserRound } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "./copy";
import { LegalCta, LegalHero } from "./legal-parts";
import { LegalMotion } from "./motion";
import { SITEMAP } from "./sitemap-copy";
import { useCopy } from "./use-copy";

const ICONS = [Boxes, Factory, Building2, Scale, UserRound] as const;

export function SitemapView({ hero, closing }: { hero: string; closing: string }) {
  const t = useCopy(SITEMAP);
  const home = useCopy(COMMON.home);

  return (
    <main className="lp lg">
      <LegalHero home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt="" wide />

      <div className="lp-shell lg-body">
        <ul className="lg-map">
          {t.groups.map((group, i) => {
            const Icon = ICONS[i];
            return (
              <li className="lg-map__card" key={group.title} data-reveal="" style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
                <span className="lg-map__icon" aria-hidden="true"><Icon size={26} strokeWidth={1.5} /></span>
                <h2>{group.title}</h2>
                <p>{group.text}</p>
                <ul className="lg-map__links">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <span>{link.label}</span>
                        <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>

      <LegalCta {...t.cta} href="/contacto" image={closing} />
      <LegalMotion />
      <FloatingActions />
    </main>
  );
}
