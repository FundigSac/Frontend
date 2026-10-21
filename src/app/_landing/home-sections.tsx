"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarRange, Clock, Mail, MapPin, Phone } from "lucide-react";
import { MAP_DIRECTIONS } from "@/shared/config/location";
import { MapEmbed } from "@/shared/consent/map-embed";
import { SITE } from "@/shared/config/site";
import { useHome } from "@/shared/layout/home-copy";
import { BLUR } from "@/shared/media/blur";

const BACKING_LINKS = ["/industrias", "/contacto?motivo=documentacion", "/contacto"] as const;

export function BackingSection() {
  const t = useHome().backing;
  return (
    <section className="lp-backing" aria-labelledby="lp-backing-title">
      <div className="lp-backing__media" data-reveal="media">
        <Image src="/media/home-v3/respaldo-ingeniero.webp" alt={t.alt} width={1200} height={800} quality={70} placeholder="blur" blurDataURL={BLUR["/media/home-v3/respaldo-ingeniero.webp"]} sizes="(max-width: 860px) 100vw, 46vw" />
      </div>
      <div className="lp-backing__copy" data-reveal="stagger">
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

// Las fichas se inclinan apenas hacia el puntero (solo ratón): dos variables CSS, sin re-render.
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--tx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
  e.currentTarget.style.setProperty("--ty", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
}

function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--tx", "0");
  e.currentTarget.style.setProperty("--ty", "0");
}

export function DocsSection() {
  const t = useHome().docs;
  return (
    <section className="lp-docs" aria-labelledby="lp-docs-title">
      <div className="lp-shell lp-docs__inner">
        <div className="lp-docs__copy" data-reveal="stagger">
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 id="lp-docs-title">{t.title}</h2>
          <p className="lp-docs__lead">{t.lead}</p>
          <Link href="/contacto?motivo=documentacion" className="lp-btn lp-btn--outline">
            {t.cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </Link>
          <Link href="/contacto?motivo=documentacion" className="lp-docs__campaigns">
            <span className="lp-docs__campaigns-icon"><CalendarRange aria-hidden="true" size={16} strokeWidth={1.8} /></span>
            {t.campaigns}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
        </div>

        <Link href="/contacto?motivo=documentacion" className="lp-docs__media" data-reveal="right" aria-label={t.mediaLabel} onPointerMove={tilt} onPointerLeave={untilt}>
          <Image src="/media/home-v3/ficha-plano-recorte.webp" alt={t.alt} width={1186} height={784} quality={75} sizes="(max-width: 860px) 100vw, 55vw" />
        </Link>
      </div>
    </section>
  );
}

export function LocationSection() {
  const t = useHome().location;
  return (
    <section className="lp-location" aria-labelledby="lp-location-title">
      <div className="lp-shell lp-location__inner">
        <div className="lp-location__copy" data-reveal="stagger">
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 id="lp-location-title">{t.title}</h2>
          <p className="lp-location__lead">{t.lead}</p>
          <ul className="lp-location__list">
            <li>
              <span className="lp-location__icon"><MapPin aria-hidden="true" size={18} strokeWidth={1.8} /></span>
              <span>
                <strong>{t.addressLabel}</strong>
                {t.address[0]}<br />{t.address[1]}
              </span>
            </li>
            <li>
              <span className="lp-location__icon"><Phone aria-hidden="true" size={18} strokeWidth={1.8} /></span>
              <span>
                <strong>{t.phoneLabel}</strong>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </span>
            </li>
            <li>
              <span className="lp-location__icon"><Mail aria-hidden="true" size={18} strokeWidth={1.8} /></span>
              <span>
                <strong>{t.emailLabel}</strong>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </span>
            </li>
            <li>
              <span className="lp-location__icon"><Clock aria-hidden="true" size={18} strokeWidth={1.8} /></span>
              <span>
                <strong>{t.hoursLabel}</strong>
                {t.hours}
              </span>
            </li>
          </ul>
          <a className="lp-btn lp-btn--outline" href={MAP_DIRECTIONS} target="_blank" rel="noopener noreferrer">
            {t.directions} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </a>
        </div>

        <div className="lp-location__map" data-reveal="media">
          <MapEmbed title={t.mapTitle} />
          <div className="lp-location__pin">
            {/* SVG de pocos KB: diferirlo no ahorra nada y Chrome lo marcaba como imagen diferida sin tamaño. */}
            <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" loading="eager" />
            <span>{t.pin[0]}<br />{t.pin[1]}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
