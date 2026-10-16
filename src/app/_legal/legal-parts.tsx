import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blurBackdrop } from "@/shared/media/blur-backdrop";
import { BLUR_LEGAL } from "@/shared/media/blur-legal";
import "./legal.css";

export const LEGAL_UPDATED = "14 de octubre de 2026";

/** Hero de las páginas legales: foto a la derecha, velo claro a la izquierda y migas de pan. */
export function LegalHero({ home = "Inicio", crumb, eyebrow, title, lead, image, alt, wide, modifier, children }: {
  home?: string;
  crumb: string;
  /** Si se indica, reemplaza las migas de pan y la barra por un eyebrow (p. ej. "Atención al cliente"). */
  eyebrow?: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  image: string;
  alt?: string;
  wide?: boolean;
  modifier?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`lg-hero${modifier ? ` ${modifier}` : ""}`} aria-labelledby="lg-title">
      <Image className="lg-hero__photo" src={image} alt={alt ?? ""} fill priority fetchPriority="high" quality={85} sizes="100vw" style={blurBackdrop(BLUR_LEGAL[image], "70% 58%")} />
      <div className="lg-hero__veil" aria-hidden="true" />
      <div className="lp-shell">
        {eyebrow ? (
          <p className="lg-eyebrow lg-hero__eyebrow lg-rise">{eyebrow}</p>
        ) : (
          <>
            <nav className="lg-crumbs lg-rise" aria-label="Breadcrumb">
              <Link href="/">{home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{crumb}</span>
            </nav>
            <span className="lg-bar lg-rise" style={{ ["--d" as string]: "60ms" }} aria-hidden="true" />
          </>
        )}
        <h1 id="lg-title" className={`lg-hero__title lg-rise${wide ? " lg-hero__title--wide" : ""}`} style={{ ["--d" as string]: "100ms" }}>{title}</h1>
        <p className="lg-hero__lead lg-rise" style={{ ["--d" as string]: "160ms" }}>{lead}</p>
      </div>
      {children}
    </section>
  );
}

/** Banda de cierre con foto oscurecida y una acción principal. */
export function LegalCta({ eyebrow, title, text, cta, href, image }: {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
}) {
  return (
    <section className="lg-cta" aria-labelledby="lg-cta-title">
      <Image className="lg-cta__photo" src={image} alt="" fill quality={75} sizes="100vw" />
      <div className="lg-cta__veil" aria-hidden="true" />
      <div className="lp-shell lg-cta__inner">
        <div data-reveal="">
          <p className="lg-eyebrow">{eyebrow}</p>
          <h2 id="lg-cta-title">{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="lp-btn lp-btn--solid lp-btn--lg" href={href}>
          {cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
