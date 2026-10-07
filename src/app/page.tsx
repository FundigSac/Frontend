import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  Droplets,
  Factory,
  FileText,
  Leaf,
  Mountain,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const families = [
  { label: "Válvulas industriales", href: "/productos?categoria=valvulas", image: "/media/valvula-compuerta-bridada.jpg", real: true },
  { label: "Sistemas HDPE", href: "/soluciones", image: "/media/hdpe-pipes-illustration.webp" },
  { label: "Equipos de termofusión", href: "/productos?categoria=equipos", image: "/media/termofusion-illustration.webp" },
  { label: "Accesorios HDPE", href: "/productos?categoria=hdpe", image: "/media/hdpe-fittings-illustration.webp" },
  { label: "Bridas y uniones", href: "/productos?categoria=acoples", image: "/media/flange-coupling-illustration.webp" },
];

const sectors = [
  { name: "Agua y saneamiento", description: "Conducción, uniones y control de flujo.", icon: Droplets },
  { name: "Minería", description: "Componentes para redes de operación.", icon: Mountain },
  { name: "Agricultura", description: "Soluciones para sistemas de riego.", icon: Leaf },
  { name: "Industria", description: "Válvulas y accesorios para instalaciones.", icon: Factory },
];

export default function Home() {
  return (
    <main>
      <section className="hero hero-reference">
        <Image
          src="/media/hero-industrial.webp"
          alt="Composición ilustrativa de válvulas y tuberías para infraestructura hidráulica"
          fill
          priority
          sizes="(max-width: 700px) 100vw, 62vw"
          className="hero-image"
        />
        <div className="container hero-copy">
          <div className="hero-text">
            <span className="eyebrow hero-eyebrow">SOLUCIONES PARA INFRAESTRUCTURA HIDRÁULICA</span>
            <h1>Componentes para redes que tienen que funcionar.</h1>
            <p>Válvulas, sistemas HDPE y equipos para infraestructura hidráulica.</p>
            <div className="actions">
              <Link className="button" href="/productos">Explorar productos <ArrowRight size={18} /></Link>
              <Link className="button button-outline" href="/cotizar">Solicitar cotización</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-families" aria-label="Explorar familias">
        {families.map((family) => (
          <Link prefetch={false} className="family-tile" href={family.href} key={family.label}>
            <span className={`family-media ${family.real ? "family-media-real" : ""}`}>
              <Image src={family.image} alt="" fill sizes="82px" />
            </span>
            <strong>{family.label}</strong>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section className="container home-featured section" aria-labelledby="featured-heading">
        <div className="home-featured-intro">
          <span className="eyebrow">PRODUCTOS DESTACADOS</span>
          <h2 id="featured-heading">Componentes para cada tramo de la red.</h2>
          <p>Válvulas del catálogo público y accesorios documentados para tu consulta.</p>
          <Link className="text-link" href="/productos">Ver catálogo completo <ArrowRight size={18} /></Link>
        </div>
        <div className="home-featured-grid">
          <ProductCard product={products[3]} />
          <ProductCard product={products[0]} />
          <ProductCard product={products[8]} />
          <Link className="product-card featured-family-card" href="/soluciones">
            <span className="product-image"><Image src="/media/hdpe-pipes-illustration.webp" alt="Ilustración de tuberías HDPE" fill sizes="(max-width: 700px) 45vw, 15vw" /></span>
            <span className="product-card-body"><span className="card-category">Sistemas HDPE</span><span className="featured-family-title">Conducción y uniones HDPE</span><span className="card-action">Explorar solución <ArrowRight size={17} /></span></span>
          </Link>
          <ProductCard product={products[10]} />
        </div>
      </section>

      <section className="home-technical" aria-labelledby="fusion-heading">
        <div className="container home-technical-grid">
          <div className="home-technical-copy">
            <span className="eyebrow">EQUIPOS DE TERMOFUSIÓN</span>
            <h2 id="fusion-heading">Equipamiento para uniones de tuberías PE.</h2>
            <p>Consulta los modelos publicados y sus datos disponibles antes de elegir el equipo para tu instalación.</p>
            <Link className="button button-outline" href="/productos?categoria=equipos">Ver equipos <ArrowRight size={17} /></Link>
          </div>
          <div className="home-technical-visual"><Image src="/media/termofusion-illustration.webp" alt="Imagen ilustrativa de un equipo para unión de tuberías PE" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
          <div className="home-technical-points">
            <div><ShieldCheck /><strong>Referencias documentadas</strong><span>Productos tomados del catálogo y los documentos disponibles.</span></div>
            <div><Wrench /><strong>Consulta técnica</strong><span>Confirma medidas y compatibilidad antes del pedido.</span></div>
            <div><FileText /><strong>Cotización clara</strong><span>Reúne productos y cantidades en una sola consulta.</span></div>
          </div>
        </div>
      </section>

      <section className="home-sectors container section" aria-labelledby="sectors-heading">
        <div className="section-heading split">
          <div><span className="eyebrow">SECTORES DE APLICACIÓN</span><h2 id="sectors-heading">Una red, distintas exigencias.</h2><p>Selecciona componentes según las condiciones de cada proyecto.</p></div>
          <Link className="text-link" href="/industrias">Conocer sectores <ArrowRight size={18} /></Link>
        </div>
        <div className="sector-grid">
          {sectors.map(({ name, description, icon: Icon }) => (
            <Link href="/industrias" className="sector-card" key={name}>
              <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
              <strong>{name}</strong>
              <span>{description}</span>
              <ArrowRight size={17} className="sector-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-about" aria-labelledby="about-heading">
        <div className="home-about-photo"><Image src="/media/infrastructure-illustration.webp" alt="Imagen ilustrativa de una infraestructura de agua con tuberías" fill sizes="(max-width: 800px) 100vw, 45vw" /></div>
        <div className="home-about-copy">
          <span className="eyebrow">FUNDIGSAC</span>
          <h2 id="about-heading">Componentes para proyectos de infraestructura en el Perú.</h2>
          <p>Explora las familias de productos y comparte las medidas de tu proyecto para preparar una consulta comercial.</p>
          <Link className="text-link" href="/nosotros">Conoce FUNDIGSAC <ArrowRight size={18} /></Link>
        </div>
        <div className="home-about-points">
          <div><CircleCheck /><span>Catálogo con procedencia documentada.</span></div>
          <div><CircleCheck /><span>Información técnica señalada cuando requiere confirmación.</span></div>
          <div><CircleCheck /><span>Contacto directo para resolver tu consulta.</span></div>
        </div>
      </section>

      <section className="home-process section-tint" aria-labelledby="process-heading">
        <div className="container process-layout">
          <div className="process-intro"><span className="eyebrow">CÓMO COTIZAR</span><h2 id="process-heading">Tu consulta, con los datos que importan.</h2><p>Elige referencias y adjunta las medidas necesarias para que el equipo comercial pueda responder.</p><Link className="text-link" href="/cotizar">Preparar mi consulta <ArrowRight size={18} /></Link></div>
          <ol className="process-steps">
            <li><span>01</span><div><strong>Encuentra productos</strong><p>Busca por nombre, familia o medida publicada.</p></div><Search size={22} aria-hidden="true" /></li>
            <li><span>02</span><div><strong>Define cantidades y variantes</strong><p>Agrega las referencias a tu lista de cotización.</p></div><CircleCheck size={22} aria-hidden="true" /></li>
            <li><span>03</span><div><strong>Envía tu consulta</strong><p>Revisa los datos y abre el mensaje listo para WhatsApp.</p></div><ArrowRight size={22} aria-hidden="true" /></li>
          </ol>
        </div>
      </section>

      <section className="quote-band"><div className="container quote-band-inner"><FileText size={32} aria-hidden="true" /><div><span className="eyebrow">COTIZA TU PROYECTO</span><h2>Cuéntanos qué componentes necesitas.</h2><p>Reúne productos, medidas y cantidades para hacer tu consulta.</p></div><Link className="button quote-band-action" href="/cotizar">Solicitar cotización <ArrowRight size={18} /></Link></div></section>
    </main>
  );
}
