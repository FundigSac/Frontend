"use client";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  Info,
  Lock,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  PackageCheck,
  Phone,
  Receipt,
  Scale,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FacebookIcon, GoogleIcon } from "@/modules/access/access-fields";
import { SITE } from "@/shared/config/site";
import { AnimatedDetails } from "@/shared/ui/animated-details";
import { FloatingActions } from "../_landing/floating-actions";
import { mailtoUrl } from "./claim-message";
import { COMMON } from "./copy";
import { DELETION, DELETION_UPDATED } from "./deletion-copy";
import { DeletionForm, DeviceCleaner, ProcessTimeline, StatusCard } from "./deletion-interactive";
import { LegalCta, LegalHero } from "./legal-parts";
import { LegalMotion } from "./motion";
import { useCopy } from "./use-copy";
import "./deletion.css";

const DELETED_ICONS = [UserRound, ClipboardList, MessagesSquare, Bot, Megaphone] as const;
const KEPT_ICONS = [BookOpen, Receipt, PackageCheck, FileCheck2] as const;
const FACT_ICONS = [BadgeCheck, ShieldCheck, Lock, FileCheck2] as const;

const FACEBOOK_APPS = "https://www.facebook.com/settings?tab=applications";
const GOOGLE_CONNECTIONS = "https://myaccount.google.com/connections";

function PathSteps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="dl-path">
      {steps.map((s, i) => (
        <li key={s}>
          {i > 0 && <ChevronRight aria-hidden="true" size={14} strokeWidth={2.2} />}
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function DeletionView({ hero, closing, email, phoneHref, whatsappNumber }: {
  hero: string;
  closing: string;
  email: string;
  phoneHref: string;
  whatsappNumber: string;
}) {
  const t = useCopy(DELETION);
  const home = useCopy(COMMON.home);
  const date = useCopy(DELETION_UPDATED);
  const w = t.ways;
  const s = t.side;
  const help = [
    { icon: Phone, title: s.help.call[0], text: s.help.call[1], href: phoneHref, external: false },
    { icon: Mail, title: s.help.write, text: email, href: `mailto:${email}`, external: false },
    { icon: MessageCircle, title: s.help.whatsapp[0], text: s.help.whatsapp[1], href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(s.help.whatsappMsg)}`, external: true },
  ];

  return (
    <main className="lp lg dl">
      <LegalHero modifier="dl-hero" home={home} crumb={t.crumb} title={t.title} lead={t.lead} image={hero} alt={t.heroAlt}>
        <div className="dl-hero__card lg-rise" style={{ ["--d" as string]: "260ms" }}>
          <StatusCard t={t.status} />
        </div>
      </LegalHero>

      {/* Resumen con las garantías legales */}
      <section className="lp-shell dl-facts" aria-labelledby="dl-facts-title">
        <h2 id="dl-facts-title" className="dl-sr">{t.summary.title}</h2>
        <ul>
          {t.summary.facts.map((f, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <li key={f.label} className="dl-fact lg-rise" style={{ ["--d" as string]: `${320 + i * 80}ms` }}>
                <Icon className="dl-fact__icon" aria-hidden="true" size={22} strokeWidth={1.7} />
                <strong className="dl-fact__value">{f.value}</strong>
                <span className="dl-fact__label">{f.label}</span>
                <p>{f.text}</p>
                <span className="dl-law">{f.law}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Formas de solicitarla */}
      <section className="lp-shell lg-body dl-ways" aria-labelledby="dl-ways-title">
        <div className="dl-head">
          <div>
            <p className="lg-eyebrow">{w.eyebrow}</p>
            <h2 id="dl-ways-title" className="lg-section-title">{w.title}</h2>
          </div>
          <p className="lg-text">{w.text}</p>
        </div>
        <div className="dl-ways__grid">
          <article className="dl-way dl-way--main" data-reveal="">
            <span className="dl-way__badge">{w.recommended}</span>
            <span className="dl-way__n" aria-hidden="true">01</span>
            <ClipboardList className="dl-way__icon" aria-hidden="true" size={30} strokeWidth={1.5} />
            <h3>{w.form.title}</h3>
            <p>{w.form.text}</p>
            <a className="lp-btn lp-btn--solid" href="#solicitud">
              {w.form.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </a>
          </article>
          <article className="dl-way dl-way--mail" data-reveal="" style={{ ["--d" as string]: "90ms" }}>
            <span className="dl-way__n" aria-hidden="true">02</span>
            <Mail className="dl-way__icon" aria-hidden="true" size={30} strokeWidth={1.5} />
            <h3>{w.mail.title}</h3>
            <p>{w.mail.text}</p>
            <a className="lp-btn lp-btn--outline" href={mailtoUrl(email, w.mail.subject, w.mail.body)}>
              {w.mail.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </a>
            <span className="dl-way__mail">{email}</span>
          </article>
          <article className="dl-way dl-way--social" data-reveal="" style={{ ["--d" as string]: "180ms" }}>
            <span className="dl-way__n" aria-hidden="true">03</span>
            <h3>{w.social.title}</h3>
            <p>{w.social.text}</p>
            {[
              { brand: <FacebookIcon />, path: w.social.facebook, href: FACEBOOK_APPS },
              { brand: <GoogleIcon />, path: w.social.google, href: GOOGLE_CONNECTIONS },
            ].map(({ brand, path, href }) => (
              <div className="dl-social" key={path.name}>
                <div className="dl-social__head">
                  <span className="dl-social__brand">{brand}</span>
                  <strong>{path.name}</strong>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {path.cta} <ExternalLink aria-hidden="true" size={14} strokeWidth={2} />
                  </a>
                </div>
                <PathSteps steps={path.steps} />
              </div>
            ))}
            <p className="dl-way__note"><Info aria-hidden="true" size={16} strokeWidth={2} /> {w.social.note}</p>
          </article>
        </div>
      </section>

      {/* Qué datos se eliminan y cuáles se conservan */}
      <section className="dl-data" aria-labelledby="dl-data-title">
        <div className="lp-shell">
          <div className="dl-head">
            <div>
              <p className="lg-eyebrow">{t.data.eyebrow}</p>
              <h2 id="dl-data-title" className="lg-section-title">{t.data.title}</h2>
            </div>
            <p className="lg-text">{t.data.text}</p>
          </div>
          <div className="dl-data__grid">
            <div className="dl-panel" data-reveal="">
              <h3 className="dl-panel__title"><Trash2 aria-hidden="true" size={20} strokeWidth={1.8} /> {t.data.deletedTitle}</h3>
              <ul className="dl-rows">
                {t.data.deleted.map((row, i) => {
                  const Icon = DELETED_ICONS[i];
                  return (
                    <li key={row.title}>
                      <span className="dl-rows__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
                      <div>
                        <strong>{row.title}</strong>
                        <p>{row.text}</p>
                        <span className="dl-tag">{row.tag}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="dl-panel dl-panel--kept" data-reveal="" style={{ ["--d" as string]: "100ms" }}>
              <h3 className="dl-panel__title"><Scale aria-hidden="true" size={20} strokeWidth={1.8} /> {t.data.keptTitle}</h3>
              <p className="dl-panel__text">{t.data.keptText}</p>
              <ul className="dl-rows">
                {t.data.kept.map((row, i) => {
                  const Icon = KEPT_ICONS[i];
                  return (
                    <li key={row.title}>
                      <span className="dl-rows__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
                      <div>
                        <strong>{row.title}</strong>
                        <p>{row.text}</p>
                        <span className="dl-tag dl-tag--law">{row.tag}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="lg-provider dl-controller" data-reveal="">
            <p className="lg-provider__title">{t.data.controller.title}</p>
            <dl>
              <div><dt>{t.data.controller.name}</dt><dd>{SITE.registeredName}</dd></div>
              <div><dt>{t.data.controller.ruc}</dt><dd>{SITE.ruc}</dd></div>
              <div><dt>{t.data.controller.address}</dt><dd>{SITE.address}</dd></div>
              <div><dt>{t.data.controller.email}</dt><dd><a className="lg-link-inline" href={`mailto:${email}`}>{email}</a></dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* Borrado inmediato en este dispositivo */}
      <section className="dl-device" aria-labelledby="dl-device-title">
        <div className="lp-shell dl-device__inner">
          <div className="dl-device__copy" data-reveal="">
            <p className="lg-eyebrow">{t.device.eyebrow}</p>
            <h2 id="dl-device-title" className="lg-section-title">{t.device.title}</h2>
            <p className="lg-text">{t.device.text}</p>
          </div>
          <DeviceCleaner t={t.device} />
        </div>
      </section>

      {/* Proceso con plazos legales */}
      <section className="lp-shell lg-body dl-process" aria-labelledby="dl-process-title">
        <div className="dl-head">
          <div>
            <p className="lg-eyebrow">{t.process.eyebrow}</p>
            <h2 id="dl-process-title" className="lg-section-title">{t.process.title}</h2>
          </div>
          <p className="lg-text">{t.process.text}</p>
        </div>
        <ProcessTimeline t={t.process} />
        <ul className="dl-process__notes" data-reveal="">
          <li><Info aria-hidden="true" size={18} strokeWidth={1.9} /> {t.process.extension}</li>
          <li><Scale aria-hidden="true" size={18} strokeWidth={1.9} /> {t.process.authority}</li>
        </ul>
      </section>

      {/* Formulario + ayuda */}
      <section className="dl-request" id="solicitud" aria-labelledby="dl-form-title">
        <div className="lp-shell lg-claims dl-request__grid">
          <div data-reveal="">
            <DeletionForm t={t.form} email={email} whatsappNumber={whatsappNumber} />
          </div>
          <aside className="lg-side" aria-label={s.aria}>
            <div className="lg-side__card lg-side__card--blue" data-reveal="">
              <ShieldCheck aria-hidden="true" size={50} strokeWidth={1.3} />
              <div>
                <h3>{s.safe.title}</h3>
                <ul className="dl-safe">
                  {s.safe.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="lg-side__card" data-reveal="" style={{ ["--d" as string]: "80ms" }}>
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
            <div className="lg-side__card lg-side__card--pledge" data-reveal="" style={{ ["--d" as string]: "160ms" }}>
              <Scale aria-hidden="true" size={38} strokeWidth={1.5} />
              <div>
                <h3>{s.legal.title}</h3>
                <p>{s.legal.text}</p>
                <Link className="lg-link-inline dl-more" href="/privacidad">
                  {s.legal.link} <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="lg-faq-wrap lg-body" aria-labelledby="dl-faq-title">
        <div className="lp-shell">
          <div className="lg-faq-head">
            <div>
              <p className="lg-eyebrow">{t.faq.eyebrow}</p>
              <h2 id="dl-faq-title" className="lg-section-title" style={{ marginTop: 14 }}>{t.faq.title}</h2>
            </div>
            <p className="lg-text">{t.faq.lead}</p>
          </div>
          <div className="lg-faq" data-reveal="">
            {t.faq.items.map((item) => (
              <AnimatedDetails key={item.q}>
                <summary>
                  {item.q}
                  <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
                </summary>
                <div>{item.a}</div>
              </AnimatedDetails>
            ))}
          </div>
          <p className="lg-updated">{t.updated}: {date}</p>
        </div>
      </section>

      <LegalCta {...t.cta} href="/contacto" image={closing} />
      <LegalMotion />
      <FloatingActions />
    </main>
  );
}
