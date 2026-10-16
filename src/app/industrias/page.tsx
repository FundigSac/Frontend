import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Factory, Info, Mountain, Sprout } from "lucide-react";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { productsBySlug } from "@/lib/site-info";
import "./industrias.css";

/** Ficha de la válvula de compuerta bridada H-ITALY (configurador + visor 3D). */
const GATE_VALVE_HREF = "/productos/valvulas/valvula-compuerta";

/** Cada familia mencionada en un sector lleva directo a su parte del catálogo. */
const NEED_LINKS: Record<string, string> = {
  "Ventosas y válvulas de aire": "/productos/valvulas",
  "Filtros tipo Y y válvulas de control": "/productos/valvulas",
  "Tubería y accesorios HDPE": "/productos?familia=accesorios-hdpe",
  "Válvulas de retención y compuerta": GATE_VALVE_HREF,
  "Válvulas de compuerta, mariposa y retención": "/productos/valvulas",
  "Tubería y accesorios de hierro dúctil": "/productos/tuberias",
  "Marcos y tapas para buzones": "/productos/marcos-y-tapas",
  "Válvulas y juntas para líneas de proceso": "/productos/valvulas",
  "Válvulas mariposa y de retención": "/productos/valvulas",
};

export const metadata: Metadata = {
  title: "Industrias",
  description: "Componentes FUNDIGSAC para saneamiento, minería, agricultura e industria: válvulas, hierro dúctil, tubería HDPE, acoples y medición.",
  alternates: { canonical: "/industrias" },
};

const sectors = [
  { id: "saneamiento", icon: Droplets, name: "Saneamiento", text: "Redes de agua potable y alcantarillado que requieren conducción, control y medición confiables.", needs: ["Tubería y accesorios de hierro dúctil", "Válvulas de compuerta, mariposa y retención", "Marcos y tapas para buzones", "Medidores de caudal"], href: "/industrias/saneamiento", slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "valvula-compuerta-bridada-vbbh", "marco-y-tapa-pesada-2seg"] },
  { id: "mineria", icon: Mountain, name: "Minería", text: "Conducción de agua y procesos en operaciones donde las líneas deben resistir uso exigente.", needs: ["Tubería HDPE y accesorios de termofusión", "Válvulas y juntas para líneas de proceso", "Acoples y uniones para reparación rápida", "Equipos de termofusión"], href: "/industrias/mineria", slugs: ["codo-hdpe-termofusion-90-sdr11", "acople-gran-rango-agr", "maquina-termofusion-serie-hdc"] },
  { id: "agricultura", icon: Sprout, name: "Agricultura", text: "Sistemas de riego y distribución de agua en campo, con control de aire, presión y filtrado.", needs: ["Ventosas y válvulas de aire", "Filtros tipo Y y válvulas de control", "Tubería y accesorios HDPE", "Válvulas de retención y compuerta"], href: "/productos/valvulas", slugs: ["valvula-de-aire-roscada-vdar", "filtro-tipo-y-bridado-fyb", "tee-hdpe-termofusion-sdr11"] },
  { id: "industria", icon: Factory, name: "Industria", text: "Líneas de proceso y servicios de planta que necesitan bridas, juntas y válvulas con la clase correcta.", needs: ["Bridas ISO, ANSI y roscadas", "Juntas flexibles contra vibración", "Válvulas mariposa y de retención", "Tubería y codos SCH40"], href: "/productos?familia=conexiones-y-fittings", slugs: ["brida-iso-2351-pn16-biso", "junta-flexible-din-jfdin", "valvula-mariposa-wafer-timon-vmtwt"] },
];

export default function Industries() {
  return <main className="x-page">
    <PageHero
      crumbs={[{ label: "Industrias" }]}
      eyebrow="Sectores atendidos"
      title="Componentes para cada tipo de red"
      lead="Saneamiento, minería, agricultura e industria: familias de producto que suelen usarse en cada sector. La selección final depende de las condiciones de tu proyecto."
      actions={<Link className="lp-btn lp-btn--solid" href="/cotizar">Consultar mis componentes <ArrowRight size={18} aria-hidden="true" /></Link>}
    />
    <nav className="container x-section--tight" aria-label="Sectores"><ul className="x-chips">{sectors.map(({ id, icon: Icon, name }) => <li key={id}><a className="x-chip" href={`#${id}`}><Icon size={17} aria-hidden="true" />{name}</a></li>)}</ul></nav>
    {sectors.map((s, i) => {
      const Icon = s.icon;
      const items = productsBySlug(...s.slugs);
      return <section key={s.id} id={s.id} className={`x-section ${i % 2 === 0 ? "" : "x-section--tint"}`} style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div className="x-split x-split--wide-left" style={{ alignItems: "start" }}>
            <Reveal>
              <span className="x-icon" style={{ marginBottom: 16 }}><Icon size={24} aria-hidden="true" /></span>
              <SectionHead title={s.name} lead={s.text} />
              <h3 className="x-minor">Familias que suelen consultarse</h3>
              <ul className="x-check">{s.needs.map(n => <li key={n}>{NEED_LINKS[n] ? <Link className="x-need" href={NEED_LINKS[n]}>{n}<ArrowRight size={14} aria-hidden="true" /></Link> : n}</li>)}</ul>
              <p className="x-after">{s.id === "agricultura" && <><Link className="text-link" href="/industrias/agricultura">Ver la página de agricultura <ArrowRight size={16} aria-hidden="true" /></Link>{" · "}</>}<Link className="text-link" href={s.href}>Ver productos para {s.name.toLowerCase()} <ArrowRight size={16} aria-hidden="true" /></Link></p>
            </Reveal>
            <div className="x-split__main">
              {s.id === "agricultura" && <Reveal>
                <Link href={GATE_VALVE_HREF} className="x-featured" aria-label="Ver la ficha de la válvula de compuerta bridada H-ITALY">
                  <span className="x-featured__badge">Destacado · H-ITALY</span>
                  <span className="x-featured__media"><Image src="/media/home-v2/compuerta-con-timon-v4.webp" alt="Válvula de compuerta bridada H-ITALY con timón" width={578} height={1030} sizes="(max-width: 860px) 60vw, 240px" /></span>
                  <span className="x-featured__body">
                    <strong>Válvula de compuerta bridada</strong>
                    <span>Cierre elástico, extremos bridados, DN40 a DN600, PN10/PN16 según EN 1074-2. Para control de línea en riego y distribución de agua.</span>
                    <span className="x-featured__cta">Ver ficha, configurador y visor 3D <ArrowRight size={16} aria-hidden="true" /></span>
                  </span>
                </Link>
              </Reveal>}
              <div className={`x-pgrid x-pgrid--${Math.min(items.length, 3)}`}>
              {items.map((p, k) => <Reveal key={p.slug} delay={k * 90}><CatalogCard product={p} compact /></Reveal>)}
              </div>
            </div>
          </div>
        </div>
      </section>;
    })}
    <section className="x-section--tight"><div className="container"><div className="x-note"><Info size={20} aria-hidden="true" /><p><strong>Orientación general.</strong> Las familias mostradas ayudan a ubicar productos del catálogo. Para tu obra confirma medidas, clase de presión y compatibilidad con nuestro equipo antes de comprar.</p></div></div></section>
    <CtaBand title="¿Tu sector tiene requisitos especiales?" text="Cuéntanos las condiciones de tu red y te orientamos hacia la referencia adecuada." primary={{ href: "/contacto", label: "Hablar con el equipo" }} secondary={{ href: "/productos", label: "Explorar catálogo" }} />
  </main>;
}
