"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/shared/config/site";
import { SHEET_UI } from "./sheet-copy";
import { useCopy } from "./use-copy";
import "./sheet.css";

export type SheetRow = { label: string; value: string; mobile?: boolean };

/** Filas del cajetín: documento, titular y, si existe, fecha de actualización. Solo la fecha se muestra en móvil. */
export function useSheetRows(doc: string, updated?: string): SheetRow[] {
  const ui = useCopy(SHEET_UI);
  return [
    { label: ui.doc, value: doc },
    { label: ui.company, value: SITE.registeredName },
    { label: ui.ruc, value: SITE.ruc },
    ...(updated ? [{ label: ui.updated, value: updated, mobile: true }] : []),
  ];
}

/** Cabecera de lámina: migas, H1 (elemento LCP, fijo), una frase con el propósito y el cajetín con los datos del documento. */
export function SheetHead({ home, crumb, title, lead, rows, mark, children }: {
  home: string;
  crumb: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  rows?: readonly SheetRow[];
  mark?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="on-dark ls-head" aria-labelledby="lg-title">
      <div className="lp-shell ls-head__grid">
        <div className="ls-head__text">
          <nav className="ls-crumbs" aria-label="Breadcrumb">
            <Link href="/">{home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <h1 id="lg-title">{title}</h1>
          <p className="ls-head__lead">{lead}</p>
          {children}
        </div>
        {rows ? (
          <dl className="ls-block">
            {rows.map((row) => (
              <div key={row.label} className={row.mobile ? "is-mobile" : undefined}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {mark ? <div className="ls-head__mark" aria-hidden="true">{mark}</div> : null}
      </div>
    </section>
  );
}

/** Cierre discreto dentro del documento: una pregunta, una frase y un enlace al canal de contacto. */
export function SheetEnd({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return (
    <section className="ls-section ls-end" aria-labelledby="ls-end-title">
      <h2 id="ls-end-title">{title}</h2>
      <p>{text}</p>
      <Link className="lp-btn lp-btn--outline" href={href}>
        {cta} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
      </Link>
    </section>
  );
}
