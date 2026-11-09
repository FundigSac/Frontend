"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { FloatingActions } from "../_landing/floating-actions";
import { COMMON } from "../_legal/copy";
import { useCopy } from "../_legal/use-copy";
import { Crumbs, SectorClosing } from "../industrias/_sector/sector-kit";
import { MAP_VIEW } from "@/shared/config/location";
import { MapEmbed } from "@/shared/consent/map-embed";
import { useHome } from "@/shared/layout/home-copy";
import { ContactForm } from "./contact-form";
import { CONTACT } from "./copy";
import "@/app/landing.css";
import "../industrias/_sector/sector.css";
import "./contact.css";

export type ContactSite = { email: string; phone: string; phoneHref: string; whatsappNumber: string };

type Channel = { key: string; icon: LucideIcon; title: string; main: string; text: string; href: string; external?: boolean };

function ChannelLink({ channel }: { channel: Channel }) {
  const Icon = channel.icon;
  const body = (
    <>
      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      <span className="ct-canal__texto">
        <strong>{channel.title}</strong>
        <span className="ct-canal__valor">{channel.main}</span>
        <small>{channel.text}</small>
      </span>
      {channel.external ? <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2} /> : <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />}
    </>
  );
  if (channel.href.startsWith("/")) return <Link className="ct-canal" href={channel.href}>{body}</Link>;
  return <a className="ct-canal" href={channel.href} target={channel.external ? "_blank" : undefined} rel={channel.external ? "noopener noreferrer" : undefined}>{body}</a>;
}

export function ContactView({ site }: { site: ContactSite }) {
  const t = useCopy(CONTACT);
  const home = useCopy(COMMON.home);
  const loc = useHome().location;
  const c = t.channels;
  const whatsapp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(c.whatsapp.message)}`;

  const channels: Channel[] = [
    { key: "whatsapp", icon: MessageCircle, title: c.whatsapp.title, main: site.phone, text: c.whatsapp.text, href: whatsapp, external: true },
    { key: "call", icon: Phone, title: c.call.title, main: site.phone, text: c.call.text, href: site.phoneHref },
    { key: "mail", icon: Mail, title: c.mail.title, main: site.email, text: c.mail.text, href: `mailto:${site.email}` },
    { key: "quote", icon: FileText, title: c.quote.title, main: c.quote.main, text: c.quote.text, href: "/cotizar" },
  ];

  return (
    <>
      <main className="lp in ct">
        <section className="ct-intro on-dark" aria-labelledby="ct-title">
          <div className="lp-shell">
            <Crumbs t={{ home, current: t.crumb }} />
            <h1 id="ct-title">{t.title}</h1>
            <p>{t.lead}</p>
          </div>
        </section>

        <div className="lp-shell ct-main">
          <div className="ct-form-wrap">
            <ContactForm email={site.email} whatsappNumber={site.whatsappNumber} />
          </div>

          <section className="ct-canales" aria-label={c.aria}>
            <h2>{c.title}</h2>
            <ul>
              {channels.map((channel) => <li key={channel.key}><ChannelLink channel={channel} /></li>)}
            </ul>
          </section>
        </div>

        <section className="sec sec--suave" aria-labelledby="ct-offices-title">
          <div className="lp-shell">
            <div className="cota in-head" data-reveal="up">
              <div>
                <h2 id="ct-offices-title">{t.offices.title}</h2>
                <p>{t.offices.lead}</p>
              </div>
            </div>
            <div className="ct-sede">
              <dl className="ct-datos" data-reveal="up">
                <div>
                  <dt>{t.offices.addressTitle}</dt>
                  <dd>{loc.address[0].replace(/ (E)$/, " $1")}<br />{loc.address[1]}</dd>
                </div>
                <div>
                  <dt>{t.offices.hoursTitle}</dt>
                  <dd>{t.offices.hours[0]}<br />{t.offices.hours[1]}</dd>
                </div>
                <div>
                  <dt>{t.offices.arriveTitle}</dt>
                  <dd>
                    {t.offices.arrive}<br />
                    <a className="lp-link" href={MAP_VIEW} target="_blank" rel="noopener noreferrer">
                      <span>{t.offices.viewMap}</span> <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="ct-map" data-reveal="up">
                <MapEmbed title={loc.mapTitle} />
              </div>
            </div>
          </div>
        </section>

        <SectorClosing id="ct" title={t.cta.title} text={t.cta.text} action={{ href: "/cotizar", label: t.cta.cta }} />
      </main>
      <FloatingActions />
    </>
  );
}
