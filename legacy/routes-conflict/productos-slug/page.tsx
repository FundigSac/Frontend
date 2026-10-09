import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Info, MessageCircle, Ruler, ShieldCheck } from "lucide-react";
import { categories, getProduct, products } from "@/lib/catalog";
import { ProductSelection } from "@/components/product-selection";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, Breadcrumb } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { whatsappLink } from "@/lib/site-info";

export function generateStaticParams() { return products.map(p => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const code = p.specs?.find(([k]) => k === "Código")?.[1];
  const description = `${p.summary}${code ? ` Código ${code}.` : ""} Consulta medidas, precio y disponibilidad con FUNDIGSAC.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/productos/${p.slug}` },
    openGraph: { title: p.name, description, ...(p.image && !p.imageIllustrative ? { images: [{ url: p.image }] } : {}) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = categories.find(c => c.slug === product.category);
  const related = products.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const code = product.specs?.find(([k]) => k === "Código")?.[1];
  const hasSdr = product.variants?.some(v => v.sdr);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    url: `https://fundigsac.com/productos/${product.slug}`,
    ...(category ? { category: category.name } : {}),
    ...(code ? { sku: code } : {}),
    ...(product.image && !product.imageIllustrative ? { image: `https://fundigsac.com${product.image}` } : {}),
  };
  const sections = [
    ...(product.specs?.length ? [{ id: "especificaciones", label: "Especificaciones" }] : []),
    ...(product.variants?.length ? [{ id: "medidas", label: "Medidas" }] : []),
    { id: "consulta", label: "Antes de comprar" },
    ...(related.length ? [{ id: "relacionados", label: "Relacionados" }] : []),
  ];

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className="x-detail-top"><div className="container"><Breadcrumb items={[{ label: "Productos", href: "/productos" }, { label: category?.name ?? "Familia", href: `/productos?categoria=${category?.slug}` }, { label: product.name }]} /></div></div>

    <div className="container x-detail">
      <div className="x-gallery">
        {product.image
          ? <div className="x-gallery-stage"><Image src={product.image} alt={product.imageIllustrative ? `Ilustración del tipo de producto: ${product.name}` : product.name} fill priority sizes="(max-width: 900px) 100vw, 52vw" /><span className="x-gallery-tag">{product.imageIllustrative ? "Imagen ilustrativa de la familia; no representa una medida exacta." : "Fotografía de referencia. Confirma medidas con la ficha técnica."}</span></div>
          : <div className="x-gallery-stage x-gallery-stage--text"><div><span className="x-eyebrow">{category?.name}</span><strong>{product.name}</strong><small>Fotografía técnica en preparación</small></div></div>}
      </div>

      <div className="x-detail-info">
        <span className="x-eyebrow">{category?.name}</span>
        <h1>{product.name}</h1>
        <p className="x-lead">{product.summary}</p>
        <ul className="x-badges">
          {code && <li className="x-badge">Código {code}</li>}
          {product.variants?.length ? <li className="x-badge">{product.variants.length} medidas de referencia</li> : null}
          <li className="x-badge">Precio y stock al cotizar</li>
        </ul>
        <div className="x-buy">
          <ProductSelection product={product} />
          <ul className="x-assure">
            <li><ShieldCheck size={18} aria-hidden="true" /> Confirmamos medida, clase y compatibilidad antes de tu pedido.</li>
            <li><Ruler size={18} aria-hidden="true" /> ¿Dudas con la medida? <a className="text-link" href={whatsappLink(`Hola FUNDIGSAC. Necesito ayuda para elegir la medida de ${product.name}.`)} target="_blank" rel="noopener noreferrer">Te orientamos</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="container">
      <nav className="x-anchors" aria-label="Secciones del producto">{sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}</nav>

      {product.specs?.length ? <section className="x-block" id="especificaciones"><Reveal><h2>Especificaciones</h2><dl className="x-specs">{product.specs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></Reveal></section> : null}

      {product.variants?.length ? <section className="x-block" id="medidas"><Reveal>
        <h2>Medidas de referencia</h2>
        <div className="x-table-wrap" tabIndex={0} role="region" aria-label="Tabla de medidas, desplazable">
          <table className="x-table"><thead><tr><th scope="col">Medida</th>{hasSdr && <th scope="col">Serie</th>}<th scope="col">Disponibilidad</th></tr></thead>
            <tbody>{product.variants.map(v => <tr key={v.label}><td>{v.label}</td>{hasSdr && <td>{v.sdr ?? "SDR11"}</td>}<td>Consultar</td></tr>)}</tbody></table>
        </div>
        <p className="x-table-note">Las medidas provienen de nuestros documentos de referencia. Confirma la medida exacta antes de comprar.</p>
      </Reveal></section> : null}

      <section className="x-block" id="consulta"><Reveal>
        <h2>Antes de comprar</h2>
        <div className="x-grid x-grid--2">
          <div className="x-card"><h3>Qué confirmar con el equipo</h3><ul className="x-check"><li>Medida o DN exacto de tu línea.</li><li>Clase de presión (PN) o serie (SDR).</li><li>Tipo de conexión y norma de brida.</li><li>Cantidad y plazo de entrega.</li></ul></div>
          <div className="x-card"><h3>¿Necesitas la ficha técnica?</h3><p>{product.specs?.length ? "Los datos mostrados son de referencia." : "La ficha técnica de esta referencia está pendiente de validación."} Solicítala indicando el producto y la medida.</p><a className="x-more" href={whatsappLink(`Hola FUNDIGSAC. Quisiera la ficha técnica de ${product.name}.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> Pedir ficha por WhatsApp</a></div>
        </div>
        {product.needsReplacement && <div className="x-source"><Info size={16} aria-hidden="true" /><span>La fotografía es una referencia del catálogo y puede actualizarse con imágenes propias del fabricante.</span></div>}
      </Reveal></section>

      {related.length > 0 && <section className="x-block" id="relacionados">
        <h2>Productos relacionados</h2>
        <div className="x-pgrid">{related.map((p, i) => <Reveal key={p.slug} delay={i * 70}><CatalogCard product={p} compact /></Reveal>)}</div>
        <p className="x-after"><Link className="text-link" href={`/productos?categoria=${product.category}`}>Ver toda la familia <ArrowRight size={16} aria-hidden="true" /></Link></p>
      </section>}
    </div>

    <div style={{ marginTop: 56 }}><CtaBand title="¿Listo para cotizar este producto?" text="Agrégalo a tu lista con su medida o consúltalo directamente con el equipo." primary={{ href: "/cotizar", label: "Preparar cotización" }} secondary={{ href: whatsappLink(`Hola FUNDIGSAC. Quisiera cotizar ${product.name}.`), label: "Consultar por WhatsApp", external: true }} /></div>
  </main>;
}
