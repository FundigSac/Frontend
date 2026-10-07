import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Building2, Clock, Cog, Droplets, Factory, MapPin, Mountain, Sprout, Wrench } from "lucide-react";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { categoryList, site } from "@/lib/site-info";
import { products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "FUNDIGSAC importa y comercializa válvulas, tuberías, conexiones, accesorios HDPE y equipos de termofusión para minería, agricultura, saneamiento e industria en el Perú.",
  alternates: { canonical: "/nosotros" },
};

const services = [
  { icon: Boxes, title: "Importación directa", text: "Válvulas, acoples, bridas, tuberías y conexiones para redes hidráulicas, con catálogo organizado por familia, medida y código." },
  { icon: Cog, title: "Fabricación de piezas a medida", text: "Cuando la referencia de catálogo no alcanza, evaluamos con tu equipo la pieza que necesita tu proyecto." },
  { icon: Wrench, title: "Orientación técnica", text: "Te ayudamos a confirmar medida, clase de presión y compatibilidad antes de cotizar." },
];
const sectors = [
  { icon: Droplets, name: "Saneamiento" },
  { icon: Mountain, name: "Minería" },
  { icon: Sprout, name: "Agricultura" },
  { icon: Factory, name: "Industria" },
];
const lineImages: Record<string, string> = {
  valvulas: "/media/catalog/compuerta-bridada.webp",
  acoples: "/media/catalog/acople-gran-rango.webp",
  "hierro-ductil": "/media/catalog/tuberia-hierro-ductil.webp",
  hdpe: "/media/catalog/hdpe-codo-90.webp",
  equipos: "/media/catalog/maq-hdy.webp",
  medidores: "/media/catalog/medidor-woltman.webp",
};
const brands = ["Xinda", "Rashimi", "Fumosac", "Era", "Construetec", "Conmsysa", "Plasson", "CIM"];
const steps = [
  { title: "Cuéntanos qué necesitas", text: "Producto, medida, clase de presión y cantidad. Si tienes el plano o la lista de materiales, mejor." },
  { title: "Validamos la referencia", text: "Revisamos medida, norma de brida o serie y compatibilidad con el resto de tu red." },
  { title: "Recibes tu cotización", text: "Precio y disponibilidad vigentes para las referencias confirmadas." },
  { title: "Coordinamos la entrega", text: "Acordamos contigo cómo y cuándo recibir tu pedido." },
];

export default function About() {
  return <main>
    <PageHero
      crumbs={[{ label: "Nosotros" }]}
      eyebrow="Importadora industrial · Lima, Perú"
      title="Componentes para que tu red de agua funcione."
      lead="FUNDIGSAC importa y comercializa válvulas, tuberías, conexiones, accesorios HDPE y equipos de termofusión para minería, agricultura, saneamiento e industria."
      actions={<><Link className="button" href="/productos">Ver catálogo <ArrowRight size={18} /></Link><Link className="button button-outline" href="/contacto">Hablar con el equipo</Link></>}
      stats={[{ value: products.length, suffix: "+", label: "referencias en catálogo" }, { value: categoryList.length, label: "familias de producto" }, { value: 4, label: "sectores atendidos" }]}
    />

    <section className="x-section">
      <div className="container">
        <Reveal><SectionHead eyebrow="Qué hacemos" title="Una sola fuente para toda la red" lead="Desde la tubería hasta la válvula que la controla y el equipo que la une." /></Reveal>
        <div className="x-grid x-grid--3">
          {services.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 90}><article className="x-card x-card--hover"><span className="x-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article></Reveal>)}
        </div>
      </div>
    </section>

    <section className="x-section x-section--tint">
      <div className="container">
        <Reveal><SectionHead eyebrow="Líneas de producto" title="Explora el catálogo por familia" lead="Fotografías y medidas tomadas de nuestros documentos de referencia. Precio y disponibilidad se confirman al cotizar." /></Reveal>
        <div className="x-grid x-grid--3">
          {categoryList.map((c, i) => <Reveal key={c.slug} delay={(i % 3) * 90}>
            <Link href={`/productos?categoria=${c.slug}`} className="x-card x-line">
              <span className="x-line-media"><Image src={lineImages[c.slug]} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw" /></span>
              <span className="x-line-body"><h3>{c.name}</h3><span className="x-line-count">{c.count} {c.count === 1 ? "referencia" : "referencias"}</span><span className="x-more">Ver familia <ArrowRight size={16} aria-hidden="true" /></span></span>
            </Link>
          </Reveal>)}
        </div>
      </div>
    </section>

    <section className="x-section">
      <div className="container x-split x-split--wide-left">
        <Reveal>
          <SectionHead eyebrow="Sectores" title="Redes de agua en distintos rubros" lead="Trabajamos con proyectos de saneamiento, minería, agricultura e industria. La selección final depende de las condiciones de cada obra." />
          <ul className="x-chips">{sectors.map(({ icon: Icon, name }) => <li key={name}><Link className="x-chip" href="/industrias"><Icon size={17} aria-hidden="true" />{name}</Link></li>)}</ul>
          <p style={{ marginTop: 22 }}><Link className="text-link" href="/industrias">Ver qué componentes se usan en cada sector <ArrowRight size={16} /></Link></p>
        </Reveal>
        <Reveal delay={120}>
          <div className="x-card"><span className="x-eyebrow">Marcas y fabricantes</span><h3>Con quienes trabajamos</h3><ul className="x-chips" style={{ marginTop: 6 }}>{brands.map(b => <li key={b} className="x-chip x-brand-chip">{b}</li>)}</ul></div>
        </Reveal>
      </div>
    </section>

    <section className="x-section x-section--dark">
      <div className="container">
        <Reveal><SectionHead eyebrow="Cómo trabajamos" title="De la consulta a la entrega, en cuatro pasos" /></Reveal>
        <ol className="x-steps x-steps--row">{steps.map((s, i) => <Reveal as="li" key={s.title} delay={i * 80}><h3>{s.title}</h3><p>{s.text}</p></Reveal>)}</ol>
      </div>
    </section>

    <section className="x-section">
      <div className="container x-grid x-grid--3">
        <Reveal><div className="x-contact-card"><span className="x-icon"><Building2 size={22} aria-hidden="true" /></span><div><h3>Razón social</h3><p>{site.legalName}</p></div></div></Reveal>
        <Reveal delay={90}><a className="x-contact-card" href={site.mapsUrl} target="_blank" rel="noopener noreferrer"><span className="x-icon"><MapPin size={22} aria-hidden="true" /></span><div><h3>Dirección</h3><p>{site.address}</p></div></a></Reveal>
        <Reveal delay={180}><div className="x-contact-card"><span className="x-icon"><Clock size={22} aria-hidden="true" /></span><div><h3>Horario de atención</h3><p>{site.hours}</p></div></div></Reveal>
      </div>
    </section>

    <CtaBand title="¿Tienes una lista de materiales?" text="Envíanos medidas y cantidades. Te confirmamos las referencias y la disponibilidad." primary={{ href: "/cotizar", label: "Preparar cotización" }} secondary={{ href: "/contacto", label: "Ver formas de contacto" }} />
  </main>;
}
