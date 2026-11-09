"use client";

import { ArrowRight, ChevronDown, ChevronRight, ExternalLink, Info, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { FacebookIcon, GoogleIcon } from "@/modules/access/access-fields";
import { SITE } from "@/shared/config/site";
import { AnimatedDetails } from "@/shared/ui/animated-details";
import { FloatingActions } from "../_landing/floating-actions";
import { mailtoUrl } from "./claim-message";
import { COMMON } from "./copy";
import { DELETION, DELETION_UPDATED } from "./deletion-copy";
import { DeletionForm, DeviceCleaner } from "./deletion-interactive";
import { SheetEnd, SheetHead, useSheetRows } from "./sheet";
import { SHEET_UI } from "./sheet-copy";
import { LegalToc } from "./toc";
import { useCopy } from "./use-copy";
import "./deletion.css";

const FACEBOOK_APPS = "https://www.facebook.com/settings?tab=applications";
const GOOGLE_CONNECTIONS = "https://myaccount.google.com/connections";

function PathSteps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="dl-path">
      {steps.map((s, i) => (
        <li key={s}>
          {i > 0 && <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />}
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function DeletionView({ email, phoneHref, whatsappNumber }: { email: string; phoneHref: string; whatsappNumber: string }) {
  const t = useCopy(DELETION);
  const ui = useCopy(SHEET_UI).deletion;
  const home = useCopy(COMMON.home);
  const date = useCopy(DELETION_UPDATED);
  const rows = useSheetRows(t.crumb, date);
  const w = t.ways;
  const s = t.side;
  const help = [
    { icon: Phone, title: s.help.call[0], text: s.help.call[1], href: phoneHref, external: false },
    { icon: Mail, title: s.help.write, text: email, href: `mailto:${email}`, external: false },
    { icon: MessageCircle, title: s.help.whatsapp[0], text: s.help.whatsapp[1], href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(s.help.whatsappMsg)}`, external: true },
  ];
  const toc = [
    { id: "formas", number: "", label: w.eyebrow },
    { id: "datos", number: "", label: t.data.eyebrow },
    { id: "dispositivo", number: "", label: ui.tocDevice },
    { id: "proceso", number: "", label: t.process.eyebrow },
    { id: "solicitud", number: "", label: t.form.eyebrow },
    { id: "preguntas", number: "", label: t.faq.eyebrow },
  ];

  return (
    <main className="lp lg ls dl">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} rows={rows}>
        <a className="lp-btn lp-btn--solid lp-btn--lg ls-head__cta" href="#solicitud">
          {ui.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
        </a>
      </SheetHead>

      <div className="lp-shell ls-doc">
        <LegalToc items={toc} label={t.crumb} />
        <div className="ls-doc__body">
          <section className="ls-section ls-section--first" aria-labelledby="dl-facts-title">
            <h2 id="dl-facts-title">{t.summary.title}</h2>
            <ul className="dl-facts">
              {t.summary.facts.map((f) => (
                <li key={f.label}>
                  <strong>{f.value}</strong>
                  <span className="dl-facts__label">{f.label}</span>
                  <p>{f.text}</p>
                  <span className="dl-law">{f.law}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="ls-section" id="formas" aria-labelledby="dl-ways-title">
            <h2 id="dl-ways-title">{w.title}</h2>
            <p>{w.text}</p>
            <ol className="dl-ways">
              <li>
                <div>
                  <h3>{w.form.title}</h3>
                  <p>{w.form.text}</p>
                </div>
                <a className="lp-btn lp-btn--outline" href="#solicitud">
                  {w.form.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </a>
              </li>
              <li>
                <div>
                  <h3>{w.mail.title}</h3>
                  <p>{w.mail.text}</p>
                </div>
                <a className="lp-btn lp-btn--outline" href={mailtoUrl(email, w.mail.subject, w.mail.body)}>
                  {w.mail.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </a>
              </li>
              <li className="dl-ways__social">
                <div>
                  <h3>{w.social.title}</h3>
                  <p>{w.social.text}</p>
                </div>
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
                <span className="dl-note"><Info aria-hidden="true" size={16} strokeWidth={2} /> {w.social.note}</span>
              </li>
            </ol>
          </section>

          <section className="ls-section" id="datos" aria-labelledby="dl-data-title">
            <h2 id="dl-data-title">{t.data.title}</h2>
            <p>{t.data.text}</p>
            <div className="dl-data">
              <div>
                <h3>{t.data.deletedTitle}</h3>
                <ul className="dl-rows">
                  {t.data.deleted.map((row) => (
                    <li key={row.title}>
                      <strong>{row.title}</strong>
                      <p>{row.text}</p>
                      <span className="dl-tag">{row.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{t.data.keptTitle}</h3>
                <p>{t.data.keptText}</p>
                <ul className="dl-rows">
                  {t.data.kept.map((row) => (
                    <li key={row.title}>
                      <strong>{row.title}</strong>
                      <p>{row.text}</p>
                      <span className="dl-tag dl-tag--law">{row.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lg-provider">
              <strong className="lg-provider__title">{t.data.controller.title}</strong>
              <dl>
                <div><dt>{t.data.controller.name}</dt><dd>{SITE.registeredName}</dd></div>
                <div><dt>{t.data.controller.ruc}</dt><dd>{SITE.ruc}</dd></div>
                <div><dt>{t.data.controller.address}</dt><dd>{SITE.address}</dd></div>
                <div><dt>{t.data.controller.email}</dt><dd><a className="ls-link" href={`mailto:${email}`}>{email}</a></dd></div>
              </dl>
            </div>
          </section>

          <section className="ls-section" id="dispositivo" aria-labelledby="dl-device-title">
            <h2 id="dl-device-title">{t.device.title}</h2>
            <p>{t.device.text}</p>
            <DeviceCleaner t={t.device} />
          </section>

          <section className="ls-section" id="proceso" aria-labelledby="dl-process-title">
            <h2 id="dl-process-title">{t.process.title}</h2>
            <p>{t.process.text}</p>
            <ol className="dl-timeline">
              {t.process.steps.map((step) => (
                <li key={step.title}>
                  <span className="dl-timeline__when">{step.when}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    <span className="dl-law">{step.law}</span>
                  </div>
                </li>
              ))}
            </ol>
            <span className="dl-note"><Info aria-hidden="true" size={16} strokeWidth={2} /> {t.process.extension}</span>
            <span className="dl-note"><Info aria-hidden="true" size={16} strokeWidth={2} /> {t.process.authority}</span>
          </section>

          <section className="ls-section" id="solicitud" aria-labelledby="dl-form-title">
            <DeletionForm t={t.form} email={email} whatsappNumber={whatsappNumber} />
            <div className="dl-after" role="group" aria-label={s.aria}>
              <div>
                <h3>{s.help.title}</h3>
                <p>{s.help.text}</p>
                <ul className="ls-help">
                  {help.map(({ icon: Icon, title, text, href, external }) => (
                    <li key={title}>
                      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
                        <span><strong>{title}</strong><small>{text}</small></span>
                        <ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{s.safe.title}</h3>
                <ul className="ls-bullets">
                  {s.safe.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <h3>{s.legal.title}</h3>
                <p>{s.legal.text}</p>
                <Link className="ls-link" href="/privacidad">{s.legal.link}</Link>
              </div>
            </div>
          </section>

          <section className="ls-section" id="preguntas" aria-labelledby="dl-faq-title">
            <h2 id="dl-faq-title">{t.faq.title}</h2>
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

          <SheetEnd title={t.cta.eyebrow} text={t.cta.text} cta={t.cta.cta} href="/contacto" />
        </div>
      </div>
      <FloatingActions />
    </main>
  );
}
