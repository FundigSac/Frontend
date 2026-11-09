"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectorImage } from "../_sector/sector-image";
import { SectionHead, SectorClosing, SectorDocs, SectorFeatured, SectorHero } from "../_sector/sector-kit";
import { useMining } from "./copy";
import { MINING_IMAGES } from "./media-responsive";

const USES = ["/media/mineria/agua-proceso.webp", "/media/mineria/recirculacion.webp"] as const;

const ROWS = [
  { href: "/productos/accesorios-hdpe/tee-hdpe-termofusion-sdr11", image: "/media/catalog/hdpe-tee.webp" },
  { href: "/productos/equipos-termofusion/maquina-termofusion-serie-hdc", image: "/media/catalog/maq-hdc.webp" },
  { href: "/productos/conexiones-y-fittings/acople-gran-rango-agr", image: "/media/catalog/acople-gran-rango.webp" },
  { href: "/productos/valvulas/valvula-compuerta-acerrojada", image: "/media/catalog/compuerta-acerrojada.webp" },
] as const;

export function MiningSections() {
  const t = useMining();
  return (
    <main className="lp in">
      <SectorHero
        id="mi"
        image="/media/mineria/hero-planta.webp"
        prepared={MINING_IMAGES["/media/mineria/hero-planta.webp"]}
        alt={t.hero.alt}
        crumbs={t.crumbs}
        title={t.hero.title}
        lead={t.hero.lead}
        action={{ href: "#mi-productos", label: t.hero.explore }}
      />

      <section className="sec" aria-labelledby="mi-usos-title">
        <div className="lp-shell">
          <SectionHead id="mi-usos-title" title={t.usos.title} lead={t.usos.lead} />
          <div className="mi-usos" data-reveal="stagger">
            {t.usos.items.map((uso, i) => (
              <article className="mi-uso" key={uso.title}>
                <div className="mi-uso__foto">
                  <SectorImage prepared={MINING_IMAGES[USES[i]]} src={USES[i]} alt={uso.alt} fill quality={72} sizes="(max-width: 1023px) 100vw, 46vw" />
                </div>
                <div>
                  <h3>{uso.title}</h3>
                  <p>{uso.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mi-banda on-dark" id="mi-productos" aria-labelledby="mi-tabla-title">
        <div className="lp-shell">
          <SectionHead id="mi-tabla-title" title={t.tabla.title} lead={t.tabla.lead} />
          <table className="mi-tabla" data-reveal="up">
            <thead>
              <tr>
                <th scope="col">{t.tabla.columns[0]}</th>
                <th scope="col">{t.tabla.columns[1]}</th>
                <th scope="col">{t.tabla.columns[2]}</th>
              </tr>
            </thead>
            <tbody>
              {t.tabla.rows.map((row, i) => (
                <tr key={row.need}>
                  <th scope="row">
                    <span className="mi-tabla__pieza">
                      <span className="mi-tabla__foto">
                        <Image src={ROWS[i].image} alt="" width={256} height={256} loading="lazy" sizes="72px" />
                      </span>
                      {row.need}
                    </span>
                  </th>
                  <td>{row.pieces}</td>
                  <td>
                    <Link className="lp-link" href={ROWS[i].href}>
                      <span>{row.link}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SectorFeatured
        id="mi"
        t={t.featured}
        image="/media/mineria/valvula-planta.webp"
        prepared={MINING_IMAGES["/media/mineria/valvula-planta.webp"]}
      />

      <SectorDocs id="mi" />
      <SectorClosing id="mi" title={t.cta.title} text={t.cta.text} action={{ href: "/cotizar", label: t.cta.quote }} />
    </main>
  );
}
