import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, Factory, Info, Mountain, Sprout } from "lucide-react";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { productsBySlug } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Industrias",
  description: "Componentes FUNDIGSAC para saneamiento, minería, agricultura e industria: válvulas, hierro dúctil, tubería HDPE, acoples y medición.",
  alternates: { canonical: "/industrias" },
};

const sectors = [
  { id: "saneamiento", icon: Droplets, name: "Saneamiento", text: "Redes de agua potable y alcantarillado que requieren conducción, control y medición confiables.", needs: ["Tubería y accesorios de hierro dúctil", "Válvulas de compuerta, mariposa y retención", "Marcos y tapas para buzones", "Medidores de caudal"], href: "/productos?categoria=hierro-ductil", slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "valvula-compuerta-bridada-vbbh", "marco-y-tapa-pesada-2seg"] },
  { id: "mineria", icon: Mountain, name: "Minería", text: "Conducción de agua y procesos en operaciones donde las líneas deben resistir uso exigente.", needs: ["Tubería HDPE y accesorios de termofusión", "Válvulas y juntas para líneas de proceso", "Acoples y uniones para reparación rápida", "Equipos de termofusión"], href: "/productos?categoria=hdpe", slugs: ["codo-hdpe-termofusion-90-sdr11", "acople-gran-rango-agr", "maquina-termofusion-serie-hdc"] },
  { id: "agricultura", icon: Sprout, name: "Agricultura", text: "Sistemas de riego y distribución de agua en campo, con control de aire, presión y filtrado.", needs: ["Ventosas y válvulas de aire", "Filtros tipo Y y válvulas de control", "Tubería y accesorios HDPE", "Válvulas de retención y compuerta"], href: "/productos?categoria=valvulas", slugs: ["valvula-de-aire-roscada-vdar", "filtro-tipo-y-bridado-fyb", "tee-hdpe-termofusion-sdr11"] },
  { id: "industria", icon: Factory, name: "Industria", text: "Líneas de proceso y servicios de planta que necesitan bridas, juntas y válvulas con la clase correcta.", needs: ["Bridas ISO, ANSI y roscadas", "Juntas flexibles contra vibración", "Válvulas mariposa y de retención", "Tubería y codos SCH40"], href: "/productos?categoria=acoples", slugs: ["brida-iso-2351-pn16-biso", "junta-flexible-din-jfdin", "valvula-mariposa-wafer-timon-vmtwt"] },
];

export default function Industries() {
  return <main>
    <PageHero
      crumbs={[{ label: "Industrias" }]}
      eyebrow="Sectores atendidos"
      title="Componentes para cada tipo de red"
      lead="Saneamiento, minería, agricultura e industria: familias de producto que suelen usarse en cada sector. La selección final depende de las condiciones de tu proyecto."
      actions={<Link className="button" href="/cotizar">Consultar mis componentes <ArrowRight size={18} /></Link>}
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
              <ul className="x-check">{s.needs.map(n => <li key={n}>{n}</li>)}</ul>
              <p className="x-after"><Link className="text-link" href={s.href}>Ver productos para {s.name.toLowerCase()} <ArrowRight size={16} /></Link></p>
            </Reveal>
            <div className={`x-pgrid x-pgrid--${Math.min(items.length, 3)}`}>
              {items.map((p, k) => <Reveal key={p.slug} delay={k * 90}><CatalogCard product={p} compact /></Reveal>)}
            </div>
          </div>
        </div>
      </section>;
    })}
    <section className="x-section--tight"><div className="container"><div className="x-note"><Info size={20} aria-hidden="true" /><p><strong>Orientación general.</strong> Las familias mostradas ayudan a ubicar productos del catálogo. Para tu obra confirma medidas, clase de presión y compatibilidad con nuestro equipo antes de comprar.</p></div></div></section>
    <CtaBand title="¿Tu sector tiene requisitos especiales?" text="Cuéntanos las condiciones de tu red y te orientamos hacia la referencia adecuada." primary={{ href: "/contacto", label: "Hablar con el equipo" }} secondary={{ href: "/productos", label: "Explorar catálogo" }} />
  </main>;
}
