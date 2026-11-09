"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { MAP_DIRECTIONS } from "@/shared/config/location";
import { SITE } from "@/shared/config/site";
import { MapEmbed } from "@/shared/consent/map-embed";
import { useHome } from "@/shared/layout/home-copy";
import { COPY, useLang } from "@/shared/layout/landing-prefs";
import { PAGE } from "./copy";
import { IntentLink } from "./intent-link";

const FAMILIES = [
  { href: "/productos/valvulas", image: "/media/home-v2/card-valvulas-hd.webp", focus: "78% 50%" },
  { href: "/productos/marcos-y-tapas", image: "/media/home-v3/card-marcos.webp", focus: "50% 50%" },
  { href: "/cotizar", image: "/media/home-v3/card-grifos.webp", focus: "58% 50%" },
  { href: "/productos/conexiones-y-fittings", image: "/media/home-v3/card-acoples.webp", focus: "50% 50%" },
  { href: "/productos/tuberias", image: "/media/home-v3/card-tuberias.webp", focus: "50% 50%" },
] as const;

const SECTORS = [
  { href: "/industrias/saneamiento", image: "/media/home-v3/sector-saneamiento.webp" },
  { href: "/industrias/agricultura", image: "/media/home-v3/sector-agricultura.webp" },
  { href: "/industrias/mineria", image: "/media/home-v3/sector-mineria.webp" },
] as const;

// Mismo orden que PAGE[lang].families.index.items.
const SHEET_HREFS = [
  "/productos/valvulas/valvula-compuerta",
  "/productos/valvulas/valvula-compuerta-fundigsac",
  "/productos/valvulas/valvula-compuerta-acerrojada",
  "/productos/valvulas/valvula-check-swing",
  "/productos/valvulas/valvula-reductora-de-presion",
  "/productos/valvulas/valvula-flotadora-bridada",
  "/productos/tuberias/tuberia-hierro-ductil-c40-k9-k7-thd",
  "/productos/marcos-y-tapas/marco-y-tapa-pesada-2seg",
] as const;

const BACKING_LINKS = ["/industrias", "/contacto?motivo=documentacion", "/contacto"] as const;
const DOCS_HREF = "/contacto?motivo=documentacion";

export function FamiliesSection() {
  const [lang] = useLang();
  const t = useHome().components;
  const page = PAGE[lang].families;
  return (
    <section className="sec ho-families" aria-labelledby="lp-components-title">
      <div className="lp-shell">
        <header className="cota ho-head" data-reveal="up">
          <h2 id="lp-components-title">{t.title}</h2>
          <IntentLink href="/productos" className="lp-link">
            <span>{page.all}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </IntentLink>
        </header>
        <ul className="ho-cells" data-reveal="stagger">
          {FAMILIES.map((item, i) => (
            <li key={item.href}>
              <IntentLink href={item.href} className="lp-card">
                <span className="lp-card__media">
                  <Image src={item.image} alt={t.items[i].alt} width={1000} height={617} quality={70} style={{ objectPosition: item.focus }} sizes="(max-width: 1023px) 50vw, 272px" />
                </span>
                <span className="ho-cell__name">{t.items[i].title}</span>
                <span className="ho-cell__note">{page.notes[i]}</span>
              </IntentLink>
            </li>
          ))}
        </ul>
        <div className="ho-index" data-reveal="up">
          <h3>{page.index.title}</h3>
          <ul className="ho-rows ho-index__list">
            {page.index.items.map((label, i) => (
              <li key={SHEET_HREFS[i]}>
                <IntentLink href={SHEET_HREFS[i]}>
                  <span><strong>{label}</strong></span>
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </IntentLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function SectorsSection() {
  const t = useHome().sectors;
  return (
    <section className="on-dark ho-sectors" aria-labelledby="lp-sectors-title">
      <div className="lp-shell ho-sectors__head">
        <div className="cota" data-reveal="up">
          <h2 id="lp-sectors-title">{t.title}</h2>
          <p>{t.lead}</p>
        </div>
      </div>
      <ul className="ho-strips">
        {SECTORS.map((s, i) => (
          <li key={s.href} className="ho-strip">
            <span className="ho-strip__img" aria-hidden="true">
              <Image src={s.image} alt="" width={1122} height={1402} quality={70} sizes="(max-width: 1023px) 60vw, 46vw" />
            </span>
            <span className="ho-strip__band" aria-hidden="true" />
            <IntentLink href={s.href}>
              <span className="ho-strip__body" data-reveal="up" style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <strong>{t.items[i].title}</strong>
                <span className="ho-strip__text">{t.items[i].text.join(" ")}</span>
                <span className="ho-strip__cta">
                  {t.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </span>
              </span>
            </IntentLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BackingSection() {
  const t = useHome().backing;
  return (
    <section className="sec ho-backing" aria-labelledby="lp-backing-title">
      <div className="lp-shell ho-split">
        <div className="lp-backing__media ho-split__wide" data-reveal="media">
          <Image src="/media/home-v3/respaldo-ingeniero.webp" alt={t.alt} width={1200} height={800} quality={70} sizes="(max-width: 1023px) 100vw, 56vw" />
        </div>
        <div className="ho-split__narrow" data-reveal="up">
          <div className="cota">
            <h2 id="lp-backing-title">{t.title}</h2>
            <p>{t.lead}</p>
          </div>
          <ul className="ho-rows">
            {t.items.map((item, i) => (
              <li key={BACKING_LINKS[i]}>
                <IntentLink href={BACKING_LINKS[i]}>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </IntentLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function DocsSection() {
  const [lang] = useLang();
  const t = useHome().docs;
  const rows = COPY[lang].resources;
  return (
    <section className="sec sec--suave ho-docs" aria-labelledby="lp-docs-title">
      <div className="lp-shell ho-split">
        <div className="ho-split__narrow" data-reveal="up">
          <div className="cota">
            <h2 id="lp-docs-title">{t.title}</h2>
            <p>{t.lead}</p>
          </div>
          <ul className="ho-rows ho-rows--desktop">
            {rows.map((label) => (
              <li key={label}>
                <IntentLink href={DOCS_HREF}>
                  <span><strong>{label}</strong></span>
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </IntentLink>
              </li>
            ))}
          </ul>
          <IntentLink href={DOCS_HREF} className="lp-btn lp-btn--outline ho-docs__cta">
            {t.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </IntentLink>
        </div>
        <IntentLink href={DOCS_HREF} className="ho-split__wide ho-docs__plate" data-reveal="media" aria-label={t.mediaLabel}>
          <Image src="/media/home-v3/ficha-plano-recorte.webp" alt={t.alt} width={1186} height={784} quality={75} sizes="(max-width: 1023px) 100vw, 56vw" />
        </IntentLink>
      </div>
    </section>
  );
}

export function LocationSection() {
  const t = useHome().location;
  return (
    <section className="sec ho-location" aria-labelledby="lp-location-title">
      <div className="lp-shell ho-split ho-split--map">
        <div className="ho-split__narrow" data-reveal="up">
          <div className="cota">
            <h2 id="lp-location-title">{t.title}</h2>
            <p>{t.lead}</p>
          </div>
          <dl className="ho-data">
            <div>
              <dt>{t.addressLabel}</dt>
              <dd>{t.address[0]}<br />{t.address[1]}</dd>
            </div>
            <div>
              <dt>{t.phoneLabel}</dt>
              <dd><a href={SITE.phoneHref}>{SITE.phone}</a></dd>
            </div>
            <div>
              <dt>{t.emailLabel}</dt>
              <dd><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
            </div>
            <div>
              <dt>{t.hoursLabel}</dt>
              <dd>{t.hours}</dd>
            </div>
          </dl>
          <a className="lp-btn lp-btn--outline" href={MAP_DIRECTIONS} target="_blank" rel="noopener noreferrer">
            {t.directions} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </a>
        </div>
        <div className="lp-location__map ho-split__wide" data-reveal="media">
          <MapEmbed title={t.mapTitle} />
        </div>
      </div>
    </section>
  );
}
