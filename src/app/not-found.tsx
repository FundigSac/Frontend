import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, LayoutGrid } from "lucide-react";
import "./_legal/legal.css";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

const BOLTS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
  return { x: 100 + Math.cos(a) * 80, y: 100 + Math.sin(a) * 80 };
});

/** El "0" del 404: una brida de hierro dúctil con pernos y un chorro de agua. */
function FlangeZero() {
  return (
    <svg className="lg-nf__zero" viewBox="0 0 200 200" role="img" aria-label="0">
      <defs>
        <linearGradient id="nf-flange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6df0" />
          <stop offset="0.55" stopColor="#1646b8" />
          <stop offset="1" stopColor="#0b2a78" />
        </linearGradient>
        <radialGradient id="nf-bore" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#10243f" />
          <stop offset="1" stopColor="#030a14" />
        </radialGradient>
        <linearGradient id="nf-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#bfe3ff" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="nf-bolt" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f4f7fb" />
          <stop offset="1" stopColor="#7f8da3" />
        </radialGradient>
        <clipPath id="nf-bore-clip"><circle cx="100" cy="100" r="54" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#nf-flange)" />
      <circle cx="100" cy="100" r="98" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" />
      <circle cx="100" cy="100" r="66" fill="#0e358f" />
      <circle cx="100" cy="100" r="60" fill="url(#nf-flange)" />
      <circle cx="100" cy="100" r="54" fill="url(#nf-bore)" />
      {BOLTS.map((b) => (
        <g key={`${b.x}-${b.y}`}>
          <circle cx={b.x} cy={b.y} r="9.5" fill="#0a2467" />
          <circle cx={b.x} cy={b.y} r="7.5" fill="url(#nf-bolt)" />
          <circle cx={b.x - 2} cy={b.y - 2} r="2.2" fill="#fff" fillOpacity="0.8" />
        </g>
      ))}
      <g clipPath="url(#nf-bore-clip)">
        <ellipse cx="100" cy="96" rx="40" ry="14" fill="#0a1a30" opacity="0.7" />
        <path d="M84 92 C96 90 108 90 118 94 C124 120 122 150 128 176 L72 176 C80 150 78 118 84 92 Z" fill="url(#nf-water)" />
        <path d="M92 96 C95 120 92 146 90 170" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M108 98 C110 124 109 148 112 172" stroke="#e6f3ff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M62 150 C72 138 82 156 94 144 C106 134 116 154 128 142 C136 136 142 146 150 140 L150 180 L62 180 Z" fill="#fff" opacity="0.88" />
        <circle cx="70" cy="132" r="3.2" fill="#fff" />
        <circle cx="132" cy="128" r="2.6" fill="#fff" />
        <circle cx="80" cy="116" r="2" fill="#fff" opacity="0.9" />
        <circle cx="124" cy="112" r="2.2" fill="#fff" opacity="0.9" />
        <circle cx="100" cy="132" r="3.4" fill="#fff" />
      </g>
    </svg>
  );
}

const CARDS = [
  { href: "/productos", title: "Conoce nuestros productos", text: "Soluciones en válvulas, acoples, tuberías y más.", image: "/media/saneamiento/destacada.webp", alt: "Válvula compuerta de hierro dúctil" },
  { href: "/industrias", title: "Explora por sectores", text: "Saneamiento, agricultura, minería e industria.", image: "/media/home-v3/card-tuberias.webp", alt: "Tuberías para proyectos de infraestructura" },
  { href: "/recursos", title: "Recursos técnicos", text: "Fichas, catálogos y documentación.", image: "/media/home-v3/ficha-plano.webp", alt: "Ficha técnica de válvula compuerta" },
] as const;

export default function NotFound() {
  return (
    <main className="lp lg lg-nf">
      <Image className="lg-nf__photo" src="/media/saneamiento/hero.webp" alt="" fill priority fetchPriority="high" quality={75} sizes="100vw" />
      <div className="lg-nf__veil" aria-hidden="true" />

      <div className="lp-shell lg-nf__main">
        <p className="lg-eyebrow lg-rise">Página no encontrada</p>
        <p className="lg-nf__code lg-rise" style={{ ["--d" as string]: "80ms" }} aria-hidden="true">
          <span>4</span>
          <FlangeZero />
          <span>4</span>
        </p>
        <h1 className="lg-nf__title lg-rise" style={{ ["--d" as string]: "140ms" }}>
          <span className="sr-only">Error 404. </span>Ups, esta página no se encuentra.
        </h1>
        <p className="lg-nf__lead lg-rise" style={{ ["--d" as string]: "200ms" }}>
          Parece que la dirección que buscaste no existe o ha sido movida. Pero no te preocupes, te ayudamos a continuar.
        </p>
        <div className="lg-nf__actions lg-rise" style={{ ["--d" as string]: "260ms" }}>
          <Link className="lp-btn lp-btn--solid" href="/">
            <Home aria-hidden="true" size={18} strokeWidth={1.8} /> Volver al inicio <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
          </Link>
          <Link className="lp-btn lp-btn--outline" href="/productos">
            <LayoutGrid aria-hidden="true" size={18} strokeWidth={1.8} /> Explorar productos
          </Link>
        </div>
      </div>

      <div className="lp-shell">
        <ul className="lg-nf__cards">
          {CARDS.map((c) => (
            <li key={c.href}>
              <Link className="lg-nf__card" href={c.href}>
                <span className="lg-nf__thumb">
                  <Image src={c.image} alt={c.alt} fill quality={60} sizes="120px" />
                </span>
                <span>
                  <strong>{c.title}</strong>
                  <span>{c.text}</span>
                </span>
                <span className="lg-nf__go" aria-hidden="true"><ArrowRight size={18} strokeWidth={2} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
