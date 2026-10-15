"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "../_legal/copy";
import { LegalCta, LegalHero } from "../_legal/legal-parts";
import { LegalMotion } from "../_legal/motion";
import { useCopy } from "../_legal/use-copy";
import { MAP_EMBED, MAP_VIEW } from "@/shared/config/location";
import { useHome } from "@/shared/layout/home-copy";
import { ContactForm, type ContactPrefill } from "./contact-form";
import { CONTACT } from "./copy";
import "./contact.css";

export type ContactSite = { email: string; phone: string; phoneHref: string; whatsappNumber: string };

function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.2 8.2 0 1 1 6.94 3.83Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

export function ContactView({ site, prefill, hero, closing }: { site: ContactSite; prefill: ContactPrefill; hero: string; closing: string }) {
  const t = useCopy(CONTACT);
  const home = useCopy(COMMON.home);
  const loc = useHome().location;
  const c = t.channels;
  const whatsapp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(c.whatsapp.message)}`;

  const cards = [
    { key: "call", tone: "blue", icon: <Phone aria-hidden="true" size={26} strokeWidth={1.8} />, title: c.call.title, main: site.phone, text: c.call.text, href: site.phoneHref, external: false },
    { key: "mail", tone: "blue", icon: <Mail aria-hidden="true" size={26} strokeWidth={1.8} />, title: c.mail.title, main: site.email, text: c.mail.text, href: `mailto:${site.email}`, external: false },
    { key: "whatsapp", tone: "green", icon: <WhatsAppGlyph />, title: c.whatsapp.title, main: site.phone, text: c.whatsapp.text, href: whatsapp, external: true },
    { key: "quote", tone: "navy", icon: <FileText aria-hidden="true" size={26} strokeWidth={1.8} />, title: c.quote.title, main: c.quote.main, text: c.quote.text, href: "/cotizar", external: false },
  ] as const;

  return (
    <main className="lp lg ct">
      <LegalHero modifier="lg-hero--contact" home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt={t.heroAlt} />

      <section className="lp-shell ct-channels" aria-label={c.aria}>
        <ul className="ct-cards">
          {cards.map((card, i) => {
            const body = (
              <>
                <span className={`ct-card__icon ct-card__icon--${card.tone}`}>{card.icon}</span>
                <span className="ct-card__text">
                  <strong>{card.title}</strong>
                  <b className={card.key === "mail" ? "ct-email" : undefined}>{card.main}</b>
                  <small>{card.text}</small>
                </span>
              </>
            );
            return (
              <li key={card.key} data-reveal="" style={{ ["--d" as string]: `${i * 80}ms` }}>
                {card.external ? (
                  <a className="ct-card" href={card.href} target="_blank" rel="noopener noreferrer">{body}</a>
                ) : card.href.startsWith("/") ? (
                  <Link className="ct-card" href={card.href}>{body}</Link>
                ) : (
                  <a className="ct-card" href={card.href}>{body}</a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="lp-shell ct-main">
        <div className="ct-form-wrap" data-reveal="">
          <ContactForm email={site.email} whatsappNumber={site.whatsappNumber} prefill={prefill} />
        </div>

        <section className="ct-offices" aria-labelledby="ct-offices-title" data-reveal="" style={{ ["--d" as string]: "100ms" }}>
          <p className="lg-eyebrow">{t.offices.eyebrow}</p>
          <h2 id="ct-offices-title" className="ct-title">{t.offices.title}</h2>
          <p className="ct-intro">{t.offices.lead}</p>

          <div className="ct-map">
            <iframe src={MAP_EMBED} title={loc.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <div className="ct-map__pin">
              <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" />
              <span>{loc.pin[0]}<br />{loc.pin[1]}</span>
            </div>
          </div>

          <div className="ct-details">
          <p className="ct-address">
            <MapPin aria-hidden="true" size={26} strokeWidth={1.6} />
            <span>{loc.address[0].replace(/ (E)$/, "\u00a0$1")}<br />{loc.address[1]}</span>
          </p>

          <div className="ct-info">
            <div>
              <Clock aria-hidden="true" size={26} strokeWidth={1.6} />
              <div>
                <h3>{t.offices.hoursTitle}</h3>
                <p>{t.offices.hours[0]}<br />{t.offices.hours[1]}</p>
              </div>
            </div>
            <div>
              <Navigation aria-hidden="true" size={26} strokeWidth={1.6} />
              <div>
                <h3>{t.offices.arriveTitle}</h3>
                <p>{t.offices.arrive}</p>
                <a className="ct-link" href={MAP_VIEW} target="_blank" rel="noopener noreferrer">
                  {t.offices.viewMap} <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>

      <LegalCta eyebrow={t.cta.eyebrow} title={t.cta.title} text={t.cta.text} cta={t.cta.cta} href="/cotizar" image={closing} />
      <LegalMotion />
      <FloatingActions />
    </main>
  );
}
