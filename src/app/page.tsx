import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";
import { ComponentsCarousel } from "./_landing/components-carousel";
import { HeroCarousel } from "./_landing/hero-carousel";
import { SectorsBand } from "./_landing/sectors-band";
import "./landing.css";

const components = [
  { title: "Válvulas", href: "/productos/valvulas", image: "/media/home-v2/card-valvulas-hd.webp", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil", width: 1000, height: 617 },
  { title: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/media/home-v3/card-marcos.webp", alt: "Marco y tapa de hierro dúctil instalada en pavimento de adoquín", width: 1000, height: 617 },
  { title: "Grifos", href: "/productos?q=grifo", image: "/media/home-v3/card-grifos.webp", alt: "Grifo de bronce con palanca azul", width: 1000, height: 617 },
  { title: "Acoples", href: "/productos?q=acople", image: "/media/home-v3/card-acoples.webp", alt: "Acople de hierro dúctil con pernos de acero inoxidable", width: 1000, height: 617 },
  { title: "Tuberías", href: "/productos/tuberias", image: "/media/home-v3/card-tuberias.webp", alt: "Tuberías azules apiladas", width: 1000, height: 617 },
];

const backing = [
  { n: "01", title: "Catálogo por sectores", text: "Encuentra rápidamente las soluciones para tu industria.", href: "/industrias" },
  { n: "02", title: "Documentación técnica", text: "Fichas, planos y especificaciones actualizadas.", href: "/recursos" },
  { n: "03", title: "Atención comercial directa", text: "Asesoría especializada para tu proyecto.", href: "/contacto" },
];

export default function HomePage() {
  return (
    <main className="lp">
      <HeroCarousel />

      <section className="lp-components" aria-labelledby="lp-components-title">
        <ComponentsCarousel items={components} />
      </section>

      <SectorsBand />

      <section className="lp-backing" aria-labelledby="lp-backing-title">
        <div className="lp-backing__media">
          <Image src="/media/home-v3/respaldo-ingeniero.webp" alt="Ingeniero de FUNDIGSAC revisando planos técnicos en una planta industrial" fill sizes="(max-width: 860px) 100vw, 46vw" />
        </div>
        <div className="lp-backing__copy">
          <p className="lp-eyebrow">Nuestro respaldo</p>
          <span className="lp-hero__rule" aria-hidden="true" />
          <h2 id="lp-backing-title">Respaldo técnico y comercial para tus proyectos.</h2>
          <p className="lp-backing__lead">Más que productos, brindamos información, asesoría y acompañamiento en cada etapa de tu proyecto.</p>
          <ul className="lp-backing__list">
            {backing.map((b) => (
              <li key={b.n}>
                <Link href={b.href}>
                  <span className="lp-backing__n">{b.n}</span>
                  <strong>{b.title}</strong>
                  <span>{b.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-docs" aria-labelledby="lp-docs-title">
        <div className="lp-shell lp-docs__inner">
          <div className="lp-docs__copy">
            <p className="lp-eyebrow">Recursos técnicos</p>
            <h2 id="lp-docs-title">Documentación técnica para tus proyectos.</h2>
            <p className="lp-docs__lead">Consulta productos, especificaciones y fichas en un solo lugar.</p>
            <Link href="/recursos" className="lp-btn lp-btn--outline">
              Explorar recursos técnicos <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <Link href="/recursos" className="lp-docs__campaigns">
              <span className="lp-docs__campaigns-icon"><CalendarRange aria-hidden="true" size={16} strokeWidth={1.8} /></span>
              Campañas y sobrestock
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
            </Link>
          </div>

          <Link href="/recursos" className="lp-docs__media" aria-label="Ver fichas técnicas y planos">
            <Image src="/media/home-v3/ficha-plano.webp" alt="Ficha técnica FUNDIGSAC de válvula compuerta de hierro dúctil junto a su plano con dimensiones" width={1448} height={1086} sizes="(max-width: 860px) 100vw, 55vw" />
          </Link>
        </div>
      </section>
    </main>
  );
}
