"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/shared/layout/landing-prefs";
import { SectorImage, type PreparedImage } from "./sector-image";

/** Piezas comunes de las pantallas de sector, `/industrias` y `/nosotros`. Cada pantalla añade su sección propia entre ellas. */

export type CrumbText = { home: string; section?: string; current: string };

export function Crumbs({ t }: { t: CrumbText }) {
  return (
    <nav className="in-crumbs" aria-label="breadcrumb">
      <Link href="/">{t.home}</Link>
      <span aria-hidden="true">/</span>
      {t.section && (
        <>
          <Link href="/industrias">{t.section}</Link>
          <span aria-hidden="true">/</span>
        </>
      )}
      <span aria-current="page">{t.current}</span>
    </nav>
  );
}

/** Héroe: foto real, velo plano al 68 %, H1, una frase y una sola acción. La foto y el H1 se pintan fijos desde el primer fotograma. */
export function SectorHero({
  id, image, prepared, alt, crumbs, title, lead, action, children, media,
}: {
  id: string;
  image: string;
  prepared?: PreparedImage;
  alt: string;
  crumbs: CrumbText;
  title: string;
  lead: string;
  action?: { href: string; label: string };
  children?: ReactNode;
  media?: ReactNode;
}) {
  return (
    <section className="in-hero on-dark" aria-labelledby={`${id}-title`}>
      <SectorImage prepared={prepared} className="in-hero__photo" src={image} alt={alt} fill loading="eager" fetchPriority="high" quality={60} sizes="100vw" />
      {media}
      <div className="in-hero__veil" aria-hidden="true" />
      <div className="lp-shell in-hero__inner">
        <Crumbs t={crumbs} />
        <h1 id={`${id}-title`}>{title}</h1>
        <p className="in-hero__lead">{lead}</p>
        {action && (
          <div className="in-hero__actions" data-enter="">
            <Link href={action.href} className="lp-btn lp-btn--solid lp-btn--lg">
              {action.label} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Encabezado de sección bajo la cota: regla de 1 px con tramo de color. */
export function SectionHead({ id, title, lead, aside }: { id: string; title: string; lead?: string; aside?: ReactNode }) {
  return (
    <div className="cota in-head" data-reveal="up">
      <div>
        <h2 id={id}>{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
      {aside}
    </div>
  );
}

export type FeaturedText = {
  title: string;
  lead: string;
  facts: readonly (readonly [string, string])[];
  product: string;
  datasheet: string;
  alt: string;
};

const FEATURED_HREF = "/productos/valvulas/valvula-compuerta-fundigsac";
const FEATURED_PDF = "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf";

/** Destacado: foto y texto en dos mitades, con los datos que publica la ficha técnica. */
export function SectorFeatured({ id, t, image, prepared, sizes = "(max-width: 1023px) 100vw, 50vw" }: { id: string; t: FeaturedText; image: string; prepared?: PreparedImage; sizes?: string }) {
  return (
    <section className="sec" aria-labelledby={`${id}-featured-title`}>
      <div className="lp-shell in-feat">
        <div className="in-feat__media" data-reveal="media">
          <SectorImage prepared={prepared} src={image} alt={t.alt} fill quality={72} sizes={sizes} />
        </div>
        <div className="in-feat__copy" data-reveal="up">
          <h2 id={`${id}-featured-title`}>{t.title}</h2>
          <p className="in-feat__lead">{t.lead}</p>
          <dl className="in-facts">
            {t.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="in-feat__actions">
            <Link className="lp-btn lp-btn--outline" href={FEATURED_HREF}>
              {t.product} <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
            <a className="lp-link" href={FEATURED_PDF} target="_blank" rel="noopener noreferrer">
              <FileText aria-hidden="true" size={17} strokeWidth={1.8} /> <span>{t.datasheet}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export type Cell = { href: string; image: string; name: string; note: string; alt?: string };

/** Línea de producto: celdas separadas por líneas de 1 px, con la foto de catálogo sobre superficie neutra. */
export function ProductCells({ items, label, columns = 4 }: { items: readonly Cell[]; label?: string; columns?: 3 | 4 }) {
  return (
    <ul className={`celdas in-celdas in-celdas--${columns}`} data-reveal="stagger" aria-label={label}>
      {items.map((item) => (
        <li key={item.name}>
          <Link href={item.href} className="celda">
            <span className="celda__media">
              {item.image && <Image src={item.image} alt={item.alt ?? ""} width={640} height={640} loading="lazy" sizes={columns === 3 ? "(max-width: 859px) 96px, 18vw" : "(max-width: 859px) 46vw, (max-width: 1260px) 31vw, 23vw"} />}
            </span>
            <span className="in-celda__texto">
              <span className="celda__nombre">{item.name}</span>
              {item.note && <span className="celda__nota">{item.note}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const DOCS = {
  es: {
    title: "Fichas técnicas y documentos",
    lead: "Descarga las fichas en PDF. Si necesitas planos o catálogos, pídelos al equipo.",
    pdf: "PDF",
    download: "Descargar",
    onRequest: "A solicitud",
    request: "Pedir documentación",
    items: [
      { name: "Ficha técnica de la válvula de compuerta FUNDIGSAC", href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf" },
      { name: "Flyer de la válvula FUNDIGSAC con volante", href: "/docs/flyer-valvula-compuerta-fundigsac-volante.pdf" },
      { name: "Flyer de la válvula FUNDIGSAC con dado", href: "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf" },
    ],
    other: "Planos y catálogos",
  },
  en: {
    title: "Data sheets and documents",
    lead: "Download the data sheets as PDF. If you need drawings or catalogs, ask the team.",
    pdf: "PDF",
    download: "Download",
    onRequest: "On request",
    request: "Request documentation",
    items: [
      { name: "FUNDIGSAC gate valve data sheet", href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf" },
      { name: "FUNDIGSAC valve flyer, handwheel version", href: "/docs/flyer-valvula-compuerta-fundigsac-volante.pdf" },
      { name: "FUNDIGSAC valve flyer, square nut version", href: "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf" },
    ],
    other: "Drawings and catalogs",
  },
} as const;

/** Documentación: filas sin tarjeta con nombre, formato y acción. Solo documentos que existen. */
export function SectorDocs({ id }: { id: string }) {
  const [lang] = useLang();
  const t = DOCS[lang];
  return (
    <section className="sec sec--suave" aria-labelledby={`${id}-docs-title`}>
      <div className="lp-shell">
        <SectionHead id={`${id}-docs-title`} title={t.title} lead={t.lead} />
        <ul className="filas in-docs" data-reveal="stagger">
          {t.items.map((doc) => (
            <li className="fila" key={doc.href}>
              <span className="in-docs__nombre">{doc.name}</span>
              <span className="in-docs__meta">{t.pdf}</span>
              <a className="lp-link" href={doc.href} target="_blank" rel="noopener noreferrer">
                <Download aria-hidden="true" size={16} strokeWidth={1.8} /> <span>{t.download}</span>
              </a>
            </li>
          ))}
          <li className="fila">
            <span className="in-docs__nombre">{t.other}</span>
            <span className="in-docs__meta">{t.onRequest}</span>
            <Link className="lp-link" href="/contacto?motivo=documentacion">
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2} /> <span>{t.request}</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/** Banda de cierre: fondo petróleo plano, H2 y un solo botón. */
export function SectorClosing({ id, title, text, action }: { id: string; title: string; text: string; action: { href: string; label: string } }) {
  return (
    <section className="banda-cierre on-dark" aria-labelledby={`${id}-cta-title`}>
      <div className="lp-shell in-cierre" data-reveal="up">
        <div>
          <h2 id={`${id}-cta-title`}>{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="lp-btn lp-btn--solid lp-btn--lg" href={action.href}>
          {action.label} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
