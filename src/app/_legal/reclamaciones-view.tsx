"use client";

import { ChevronRight, FileText, Info, Mail, MessageCircle, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { ClaimForm } from "./claim-form";
import { CLAIMS, COMMON } from "./copy";
import { LegalCta, LegalHero } from "./legal-parts";
import { useCopy } from "./use-copy";

const HOW_ICONS = [FileText, Mail, Search, ShieldCheck] as const;

export function ClaimsView({ hero, closing, enabled, email, phone, phoneHref, whatsappNumber }: {
  hero: string;
  closing: string;
  enabled: boolean;
  email: string;
  phone: string;
  phoneHref: string;
  whatsappNumber: string;
}) {
  const t = useCopy(CLAIMS);
  const home = useCopy(COMMON.home);
  const s = t.side;
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(s.help.whatsappMsg)}`;
  const help = [
    { icon: Phone, title: s.help.call[0], text: s.help.call[1], href: phoneHref, external: false },
    { icon: Mail, title: s.help.write, text: email, href: `mailto:${email}`, external: false },
    { icon: MessageCircle, title: s.help.whatsapp[0], text: s.help.whatsapp[1], href: whatsapp, external: true },
  ];

  return (
    <main className="lp lg">
      <LegalHero modifier="lg-hero--claims" home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt={t.heroAlt}>
        <ul className="lg-hero__panel">
          <li><ShieldCheck aria-hidden="true" size={30} strokeWidth={1.5} /> {t.panel[0]}</li>
          <li><Users aria-hidden="true" size={30} strokeWidth={1.5} /> {t.panel[1]}</li>
          <li><FileText aria-hidden="true" size={30} strokeWidth={1.5} /> {t.panel[2]}</li>
        </ul>
      </LegalHero>

      <div className="lp-shell" style={{ paddingBottom: "clamp(40px, 6vw, 84px)" }}>
        <div className="lg-claims">
          <ClaimForm enabled={enabled} email={email} phone={phone} whatsappNumber={whatsappNumber} />

          <aside className="lg-side" aria-label={s.aria}>
            <div className="lg-side__card lg-side__card--blue">
              <FileText aria-hidden="true" size={56} strokeWidth={1.3} />
              <div>
                <h3>{s.blue.title}</h3>
                <p>{s.blue.text}</p>
              </div>
            </div>

            <div className="lg-side__card">
              <h3>{s.how.title}</h3>
              <ol className="lg-how">
                {s.how.items.map((item, i) => {
                  const Icon = HOW_ICONS[i];
                  return (
                    <li key={item.title}>
                      <span className="lg-how__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></span>
                      <div><strong>{item.title}</strong><span>{item.text}</span></div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="lg-side__card lg-side__card--amber">
              <h3><Info aria-hidden="true" size={20} strokeWidth={1.8} /> {s.important.title}</h3>
              <ul>
                {s.important.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="lg-side__card">
              <h3>{s.help.title}</h3>
              <p>{s.help.text}</p>
              <ul className="lg-help">
                {help.map(({ icon: Icon, title, text, href, external }) => (
                  <li key={title}>
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      <Icon aria-hidden="true" size={24} strokeWidth={1.6} />
                      <div><strong>{title}</strong><span>{text}</span></div>
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg-side__card lg-side__card--pledge">
              <ShieldCheck aria-hidden="true" size={40} strokeWidth={1.5} />
              <div>
                <h3>{s.pledge.title}</h3>
                <p>{s.pledge.text}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LegalCta {...t.cta} href="/contacto" image={closing} />
    </main>
  );
}
