"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productLabel } from "@/lib/catalog-en";
import { useLang } from "@/shared/layout/landing-prefs";
import { ProductCells, SectorClosing, SectorHero } from "./_sector/sector-kit";
import { SECTOR_TEXT, UI } from "./copy";

/** Cada familia mencionada en un sector lleva directo a su parte del catálogo (las claves son los textos en español). */
const NEED_LINKS: Record<string, string> = {
  "Tubería y accesorios de hierro dúctil": "/productos/tuberias",
  "Válvulas de compuerta, mariposa y retención": "/productos/valvulas",
  "Marcos y tapas para buzones": "/productos/marcos-y-tapas",
  "Medidores de caudal": "/productos/medidores",
  "Tubería HDPE y accesorios de termofusión": "/productos/accesorios-hdpe",
  "Válvulas y juntas para líneas de proceso": "/productos/valvulas",
  "Acoples y uniones para reparación rápida": "/productos/conexiones-y-fittings",
  "Equipos de termofusión": "/productos/equipos-termofusion",
  "Ventosas y válvulas de aire": "/productos/valvulas/valvula-de-aire-3-funciones-premium-vdap",
  "Filtros tipo Y y válvulas de control": "/productos/valvulas/filtro-tipo-y-bridado-fyb",
  "Tubería y accesorios HDPE": "/productos/accesorios-hdpe",
  "Válvulas de retención y compuerta": "/productos/valvulas/valvula-compuerta",
  "Bridas ISO, ANSI y roscadas": "/productos/conexiones-y-fittings",
  "Juntas flexibles contra vibración": "/productos/conexiones-y-fittings",
  "Válvulas mariposa y de retención": "/productos/valvulas",
  "Tubería y codos SCH40": "/productos/conexiones-y-fittings",
};

/** Foto de cada sector: la misma escena que abre su página. */
const PHOTOS: Record<string, string> = {
  saneamiento: "/media/saneamiento/agua-potable.webp",
  mineria: "/media/mineria/procesos.webp",
  agricultura: "/media/agricultura/hero-poster-v2.webp",
  industria: "/media/mineria/pulpas.webp",
};

export type SectorItem = { slug: string; name: string; image?: string; href: string; illustrative?: boolean; nameEn?: string };
export type SectorData = { id: string; href: string; items: SectorItem[] };

export function IndustriesView({ sectors }: { sectors: SectorData[] }) {
  const [lang] = useLang();
  const t = UI[lang];

  return (
    <main className="lp in">
      <SectorHero
        id="in"
        image="/media/hero-industrial.webp"
        alt={t.heroAlt}
        crumbs={{ home: t.home, current: t.crumb }}
        title={t.title}
        lead={t.lead}
      >
        <nav className="in-puertas" aria-label={t.sectorsLabel} data-enter="">
          {sectors.map(({ id, href }) => (
            <Link key={id} className="in-puerta" href={href}>
              {SECTOR_TEXT[lang][id].name} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          ))}
        </nav>
      </SectorHero>

      {sectors.map((s, i) => {
        const text = SECTOR_TEXT[lang][s.id];
        const esNeeds = SECTOR_TEXT.es[s.id].needs;
        return (
          <section key={s.id} id={s.id} className={`sec in-bloque${i % 2 ? " in-bloque--par sec--suave" : ""}`} aria-labelledby={`${s.id}-title`}>
            <div className="lp-shell in-bloque__rejilla">
              <div className="in-bloque__texto" data-reveal="up">
                <div className="cota">
                  <h2 id={`${s.id}-title`}>{text.name}</h2>
                  <p>{text.text}</p>
                </div>
                <h3 className="in-bloque__sub">{t.families}</h3>
                <ul className="sa-piezas">
                  {text.needs.map((need, index) => (
                    <li key={need}>
                      <Link className="sa-pieza" href={NEED_LINKS[esNeeds[index]]}>
                        <span><strong>{need}</strong></span>
                        <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link className="lp-link in-bloque__mas" href={s.href}>
                  <span>{t.viewProductsFor(text.name)}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
                </Link>
              </div>
              <div className="in-bloque__media">
                <div className="in-bloque__foto" data-reveal="media">
                  <Image src={PHOTOS[s.id]} alt={text.alt} fill quality={70} sizes="(max-width: 480px) 52vw, (max-width: 1023px) 100vw, 56vw" />
                </div>
                <ProductCells
                  columns={3}
                  label={t.examples}
                  items={s.items.map((item) => {
                    const name = lang === "en" && item.nameEn ? item.nameEn : productLabel(lang, item.slug, item.name);
                    const prefix = item.illustrative ? (lang === "en" ? "Illustration of " : "Ilustración de ") : "";
                    return { href: item.href, image: item.image ?? "", name, note: "", alt: `${prefix}${name}` };
                  })}
                />
              </div>
            </div>
          </section>
        );
      })}

      <section className="in-aviso">
        <div className="lp-shell">
          <p><strong>{t.noteTitle}</strong>{t.noteText}</p>
        </div>
      </section>

      <SectorClosing id="in" title={t.ctaTitle} text={t.ctaText} action={{ href: "/contacto", label: t.ctaPrimary }} />
    </main>
  );
}
