import "@/styles/pages.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { CountUp } from "./count-up";

const PIPES = [
  "M-20 300 H180 a40 40 0 0 0 40 -40 V120 a40 40 0 0 1 40 -40 H620",
  "M-20 350 H300 a40 40 0 0 0 40 -40 V200 a40 40 0 0 1 40 -40 H620",
  "M340 420 V300 a40 40 0 0 1 40 -40 H620",
];

type Crumb = { label: string; href?: string };
type Stat = { value: number; suffix?: string; label: string };

export function Breadcrumb({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  return <nav className={`x-crumbs${light ? " x-crumbs--light" : ""}`} aria-label="Ruta de navegación">
    <Link href="/">Inicio</Link>
    {items.map((item, index) => <span key={item.label} className="x-crumb-item"><span aria-hidden="true">/</span>{item.href && index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</span>)}
  </nav>;
}

/** Encabezado de página interna: fondo azul marino con tuberías animadas, título, texto, acciones y cifras. */
export function PageHero({ crumbs, eyebrow, title, lead, actions, stats, compact = false, children }: {
  crumbs: Crumb[]; eyebrow: string; title: string; lead: string; actions?: ReactNode; stats?: Stat[]; compact?: boolean; children?: ReactNode;
}) {
  return <section className={`x-hero${compact ? " x-hero--compact" : ""}`}>
    <svg className="x-hero-art" viewBox="0 0 600 400" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round">
        {PIPES.map((d, i) => <path key={"p" + i} className={"x-pipe x-pipe--" + "abc"[i]} d={d} />)}
        {PIPES.map((d, i) => <path key={"f" + i} className={"x-flowline x-flowline--" + "abc"[i]} d={d} />)}
      </g>
      <g className="x-pipe-nodes"><circle cx="220" cy="120" r="7" /><circle cx="260" cy="80" r="5" /><circle cx="380" cy="260" r="6" /></g>
    </svg>
    <div className="container x-hero-inner">
      <Breadcrumb items={crumbs} light />
      <div className="x-hero-copy">
        <span className="x-hero-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="x-hero-lead">{lead}</p>
        {actions && <div className="x-hero-actions">{actions}</div>}
        {children}
      </div>
      {stats && <dl className="x-hero-stats">{stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd><CountUp value={stat.value} suffix={stat.suffix} /></dd></div>)}</dl>}
    </div>
  </section>;
}

export function SectionHead({ eyebrow, title, lead, align = "left" }: { eyebrow?: string; title: string; lead?: string; align?: "left" | "center" }) {
  return <header className={`x-head${align === "center" ? " x-head--center" : ""}`}>{eyebrow && <span className="x-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{lead && <p>{lead}</p>}</header>;
}

export function CtaBand({ title, text, primary, secondary }: { title: string; text: string; primary: { href: string; label: string }; secondary?: { href: string; label: string; external?: boolean } }) {
  return <section className="x-cta"><div className="container x-cta-inner"><div><h2>{title}</h2><p>{text}</p></div><div className="x-cta-actions"><Link className="button button-light" href={primary.href}>{primary.label}</Link>{secondary && (secondary.external ? <a className="x-cta-link" href={secondary.href} target="_blank" rel="noopener noreferrer">{secondary.label}</a> : <Link className="x-cta-link" href={secondary.href}>{secondary.label}</Link>)}</div></div></section>;
}
