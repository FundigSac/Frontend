"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCells, SectionHead, SectorClosing, SectorDocs, SectorFeatured, SectorHero } from "../_sector/sector-kit";
import { useSanea } from "./copy";

const RED_IMAGES = ["/media/saneamiento/agua-potable.webp", "/media/saneamiento/alcantarillado.webp", "/media/contacto/planta-valvula.webp"] as const;

const LINE = [
  { href: "/productos/tuberias", image: "/media/catalog/tuberia-hierro-ductil.webp", photo: true },
  { href: "/productos/valvulas", image: "/media/catalog/compuerta-bridada.webp" },
  { href: "/productos/marcos-y-tapas", image: "/media/catalog/marco-tapa-pesada.webp" },
  { href: "/productos/conexiones-y-fittings", image: "/media/catalog/acople-gran-rango.webp" },
] as const;

export function SanitationSections() {
  const t = useSanea();
  return (
    <main className="lp in">
      <SectorHero
        id="sa"
        image="/media/saneamiento/hero.webp"
        alt={t.hero.alt}
        crumbs={t.crumbs}
        title={t.hero.title}
        lead={t.hero.lead}
        action={{ href: "#sa-productos", label: t.hero.explore }}
      />

      <section className="sec" aria-labelledby="sa-redes-title">
        <div className="lp-shell">
          <SectionHead id="sa-redes-title" title={t.redes.title} lead={t.redes.lead} />
          <div className="sa-redes" data-reveal="stagger">
            {t.redes.items.map((red, i) => (
              <article className="sa-red" key={red.title}>
                <div className="sa-red__foto">
                  <Image src={RED_IMAGES[i]} alt={red.alt} fill quality={70} sizes="(max-width: 480px) 52vw, (max-width: 1023px) 100vw, 31vw" />
                </div>
                <h3>{red.title}</h3>
                <p>{red.text}</p>
                <ul className="sa-piezas">
                  {red.pieces.map((piece) => (
                    <li key={piece.name}>
                      <Link className="sa-pieza" href={piece.href}>
                        <span>
                          <strong>{piece.name}</strong>
                          <small>{piece.use}</small>
                        </span>
                        <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectorFeatured id="sa" t={t.featured} image="/media/saneamiento/destacada.webp" />

      <section className="sec sec--suave" id="sa-productos" aria-labelledby="sa-line-title">
        <div className="lp-shell">
          <SectionHead
            id="sa-line-title"
            title={t.line.title}
            aside={<Link href="/productos" className="lp-link"><span>{t.line.all}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} /></Link>}
          />
          <ProductCells items={LINE.map((item, i) => ({ ...item, ...t.line.items[i] }))} label={t.line.title} />
        </div>
      </section>

      <SectorDocs id="sa" />
      <SectorClosing id="sa" title={t.cta.title} text={t.cta.text} action={{ href: "/cotizar", label: t.cta.quote }} />
    </main>
  );
}
