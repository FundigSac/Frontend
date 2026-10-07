import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cable, Cylinder, Gauge, Layers, Pipette, Settings2 } from "lucide-react";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { productsBySlug } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Soluciones",
  description: "Encuentra componentes FUNDIGSAC por necesidad técnica: conducción, control de flujo y presión, uniones, sistemas HDPE y medición.",
  alternates: { canonical: "/soluciones" },
};

const solutions = [
  { icon: Pipette, id: "conduccion", title: "Conducción y distribución", text: "Tubería de hierro dúctil, accesorios bridados y tapas para redes de agua.", href: "/productos?categoria=hierro-ductil", cta: "Ver hierro dúctil", slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "tee-bridada-tbb", "yee-bridado-ybb"] },
  { icon: Settings2, id: "flujo", title: "Control de flujo", text: "Válvulas de compuerta, mariposa, retención y guillotina para abrir, cerrar y proteger la línea.", href: "/productos?categoria=valvulas", cta: "Ver válvulas", slugs: ["valvula-compuerta-bridada-vbbh", "valvula-mariposa-wafer-bridada-vmbb", "valvula-check-swing"] },
  { icon: Gauge, id: "presion", title: "Control de presión y protección", text: "Reductoras, alivio, flotadoras, ventosas y filtros para estabilizar y proteger la red.", href: "/productos?categoria=valvulas", cta: "Ver control de presión", slugs: ["valvula-reductora-de-presion", "valvula-de-aire-3-funciones-premium-vdap", "filtro-tipo-y-bridado-fyb"] },
  { icon: Layers, id: "uniones", title: "Uniones, bridas y reparación", text: "Acoples de gran rango, adaptadores, juntas flexibles, uniones de desmontaje y bridas.", href: "/productos?categoria=acoples", cta: "Ver uniones y bridas", slugs: ["acople-gran-rango-agr", "junta-flexible-din-jfdin", "union-autoportante-desmontaje-uauto"] },
  { icon: Cable, id: "hdpe", title: "Sistemas HDPE", text: "Accesorios de termofusión y máquinas de soldar PE y de electrofusión para unir tubería de polietileno.", href: "/productos?categoria=hdpe", cta: "Ver accesorios HDPE", slugs: ["codo-hdpe-termofusion-90-sdr11", "tee-hdpe-termofusion-sdr11", "maquina-termofusion-hdl-4-mordazas"] },
  { icon: Cylinder, id: "medicion", title: "Medición", text: "Medidores electromagnéticos y de tipo Woltman para controlar el caudal.", href: "/productos?categoria=medidores", cta: "Ver medidores", slugs: ["medidor-electromagnetico-melec", "medidor-tipo-woltman-mwol"] },
];

export default function Solutions() {
  return <main>
    <PageHero
      crumbs={[{ label: "Soluciones" }]}
      eyebrow="Por necesidad técnica"
      title="¿Qué necesita tu red?"
      lead="Elige por función y llega directo a las familias y referencias que cumplen ese trabajo."
      actions={<><Link className="button" href="/productos">Ver todo el catálogo <ArrowRight size={18} /></Link><Link className="button button-outline" href="/cotizar">Preparar cotización</Link></>}
    />
    <nav className="container x-section--tight" aria-label="Soluciones">
      <ul className="x-chips">{solutions.map(s => <li key={s.id}><a className="x-chip" href={`#${s.id}`}>{s.title}</a></li>)}</ul>
    </nav>
    {solutions.map((s, i) => {
      const items = productsBySlug(...s.slugs);
      const Icon = s.icon;
      return <section key={s.id} id={s.id} className={`x-section ${i % 2 === 0 ? "" : "x-section--tint"}`} style={{ scrollMarginTop: 90 }}>
        <div className="container x-split x-split--wide-left" style={{ alignItems: "start" }}>
          <Reveal>
            <span className="x-icon" style={{ marginBottom: 16 }}><Icon size={24} aria-hidden="true" /></span>
            <SectionHead title={s.title} lead={s.text} />
            <Link className="button button-outline" href={s.href}>{s.cta} <ArrowRight size={17} /></Link>
          </Reveal>
          <div className={`x-pgrid x-pgrid--${Math.min(items.length, 3)}`}>
            {items.map((p, k) => <Reveal key={p.slug} delay={k * 90}><CatalogCard product={p} compact /></Reveal>)}
          </div>
        </div>
      </section>;
    })}
    <section className="x-section x-section--dark">
      <div className="container x-split">
        <Reveal><SectionHead eyebrow="Antes de elegir" title="Datos que definen la referencia correcta" lead="Con esta información evitamos errores de compatibilidad y aceleramos tu cotización." /></Reveal>
        <Reveal delay={100}><ul className="x-check x-check--light">
          <li>Diámetro nominal (DN) o diámetro exterior del tubo en mm.</li>
          <li>Clase de presión (PN) o serie del tubo (SDR), según el material.</li>
          <li>Tipo de conexión: brida, termofusión, acople, rosca o embone.</li>
          <li>Fluido y condiciones de trabajo: presión, temperatura y caudal.</li>
          <li>Cantidad y fecha en que necesitas el material.</li>
        </ul></Reveal>
      </div>
    </section>
    <CtaBand title="Cuéntanos tu proyecto" text="Te ayudamos a elegir la referencia adecuada y confirmamos precio y disponibilidad." primary={{ href: "/cotizar", label: "Solicitar cotización" }} secondary={{ href: "/recursos", label: "Ver guía y glosario" }} />
  </main>;
}
