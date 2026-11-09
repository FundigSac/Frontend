"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHead, SectorClosing, SectorDocs, SectorFeatured, SectorHero } from "../_sector/sector-kit";
import { useAgri } from "./copy";
import { HeroVideo } from "./hero-video";

const STATIONS = [
  { href: "/productos/valvulas/filtro-tipo-y-bridado-fyb", image: "/media/catalog/filtro-y.webp" },
  { href: "/productos/valvulas/valvula-compuerta-acerrojada", image: "/media/catalog/compuerta-acerrojada.webp" },
  { href: "/productos/valvulas/valvula-reductora-de-presion", image: "/media/catalog/reductora-presion.webp" },
  { href: "/productos/valvulas/valvula-de-aire-3-funciones-premium-vdap", image: "/media/catalog/ventosa-3-funciones.webp" },
  { href: "/productos/valvulas/valvula-check-swing", image: "/media/catalog/check-swing.webp" },
] as const;

export function AgricultureSections() {
  const t = useAgri();
  return (
    <main className="lp in">
      <SectorHero
        id="ag"
        image="/media/agricultura/hero-poster-v2.webp"
        alt={t.hero.alt}
        crumbs={t.crumbs}
        title={t.hero.title}
        lead={t.hero.lead}
        action={{ href: "#ag-productos", label: t.hero.explore }}
        media={<HeroVideo />}
      />

      <section className="sec" id="ag-productos" aria-labelledby="ag-linea-title">
        <div className="lp-shell">
          <SectionHead id="ag-linea-title" title={t.linea.title} lead={t.linea.lead} />
          <ul className="ag-linea" data-reveal="stagger">
            {t.linea.stations.map((station, i) => (
              <li className="ag-est" key={station.name}>
                <Link href={STATIONS[i].href}>
                  <span className="ag-est__foto">
                    <Image src={STATIONS[i].image} alt="" width={384} height={384} loading="lazy" sizes="(max-width: 1023px) 80px, 168px" />
                  </span>
                  <span className="ag-est__fn">{station.fn}</span>
                  <strong>{station.name}</strong>
                  <small>{station.text}</small>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ag-tubo" data-reveal="up">
            <strong>{t.linea.pipe}</strong>
            <Link className="lp-link" href="/productos/accesorios-hdpe">
              <span>{t.linea.pipeLink}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
          <p className="ag-nota">{t.linea.note}</p>
        </div>
      </section>

      <SectorFeatured id="ag" t={t.featured} image="/media/agricultura/valvula-compuerta.webp" />

      <SectorDocs id="ag" />
      <SectorClosing id="ag" title={t.cta.title} text={t.cta.text} action={{ href: "/cotizar", label: t.cta.quote }} />
    </main>
  );
}
