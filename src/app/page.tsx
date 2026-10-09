import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  HardHat,
  Landmark,
  Droplet,
  Leaf,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";
import "./home.css";

const productCards = [
  { title: "Válvulas", href: "/productos/valvulas", image: "/media/home-ref-valve-detail.webp", alt: "Válvula de compuerta de hierro dúctil en una red de agua" },
  { title: "Tuberías", href: "/productos/tuberias", image: "/media/home-ref-pipes.webp", alt: "Tuberías negras de HDPE" },
  { title: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/media/home-ref-frame.webp", alt: "Marco y tapa de hierro dúctil" },
];

const solutionAreas = [
  { label: "Agua potable", Icon: Droplet },
  { label: "Alcantarillado", Icon: Waves },
  { label: "Infraestructura urbana", Icon: Building2 },
  { label: "Proyectos especiales", Icon: Leaf },
];

function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`home-arrow-link ${className}`}>
      {children}
      <ArrowRight aria-hidden="true" size={16} strokeWidth={1.7} />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <Image className="home-hero__photo" src="/media/home-ref-hero.webp" alt="" fill priority sizes="100vw" />
        <div className="home-hero__wash" aria-hidden="true" />
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-eyebrow">Infraestructura<br />que conecta ciudades</p>
            <h1 id="home-title">Soluciones en<br />hierro dúctil<br /><span>para un futuro<br />más seguro</span></h1>
            <p className="home-hero__description">Válvulas, tuberías, marcos y tapas para redes de agua, alcantarillado e infraestructura urbana.</p>
            <div className="home-hero__actions">
              <ArrowLink href="/productos" className="home-button home-button--dark">Ver productos</ArrowLink>
              <ArrowLink href="/cotizar" className="home-button home-button--plain">Solicitar cotización</ArrowLink>
            </div>
          </div>
          <p className="home-hero__quality"><span>Calidad</span><span>Resistencia</span><span>Confianza</span></p>
          <div className="home-hero__controls" aria-label="Diapositiva destacada, 1 de 3">
            <span className="is-current">01</span><i /><span>02</span><i /><span>03</span><b />
          </div>
          <Link href="/nosotros" className="home-hero__about"><span className="home-play"><span /></span><span>Conoce nuestra<br />empresa</span></Link>
        </div>
      </section>

      <section className="home-products" aria-labelledby="home-products-title">
        <div className="home-section-shell">
          <div className="home-products__heading">
            <div>
              <p className="home-eyebrow">Nuestros productos</p>
              <h2 id="home-products-title">Componentes que<br />hacen infraestructura real</h2>
            </div>
            <div className="home-products__intro">
              <p>Productos de hierro dúctil y HDPE diseñados para un rendimiento superior y una larga vida útil.</p>
              <ArrowLink href="/productos">Ver catálogo completo</ArrowLink>
            </div>
          </div>
          <div className="home-product-cards">
            {productCards.map((card) => (
              <Link href={card.href} className="home-product-card" key={card.title}>
                <Image src={card.image} alt={card.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                <span className="home-product-card__shade" aria-hidden="true" />
                <span className="home-product-card__title">{card.title}</span>
                <span className="home-product-card__arrow"><ArrowRight aria-hidden="true" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-solutions" aria-labelledby="home-solutions-title">
        <Image className="home-solutions__photo" src="/media/home-ref-infrastructure.webp" alt="Infraestructura hidráulica con tuberías y válvulas" fill sizes="100vw" />
        <div className="home-solutions__shade" aria-hidden="true" />
        <div className="home-solutions__inner">
          <p className="home-eyebrow">Soluciones</p>
          <h2 id="home-solutions-title">Infraestructura<br />que mejora la vida<br />en las ciudades</h2>
          <p className="home-solutions__description">Acompañamos proyectos de agua potable, alcantarillado y obras urbanas con productos confiables y soluciones técnicas especializadas.</p>
          <ArrowLink href="/soluciones" className="home-text-link">Ver soluciones</ArrowLink>
          <ul className="home-solutions__areas">
            {solutionAreas.map(({ label, Icon }) => (
              <li key={label}><Icon aria-hidden="true" /><span>{label}</span></li>
            ))}
          </ul>
          <div className="home-solutions__slider" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span><button>‹</button><button>›</button></div>
        </div>
      </section>

      <section className="home-quality" aria-labelledby="home-quality-title">
        <div className="home-quality__photo-wrap">
          <Image src="/media/home-ref-fittings.webp" alt="Accesorios de HDPE para redes de agua" fill sizes="(max-width: 760px) 100vw, 60vw" />
          <p>Conexiones<br />que impulsan<br />grandes proyectos</p>
        </div>
        <div className="home-quality__copy">
          <p className="home-eyebrow">Calidad en cada detalle</p>
          <h2 id="home-quality-title">Productos<br />que rinden en el tiempo</h2>
          <p>Fabricados con altos estándares de calidad para un mejor desempeño en redes de agua, alcantarillado e infraestructura urbana.</p>
          <ArrowLink href="/nosotros">Conocer FUNDIGSAC</ArrowLink>
        </div>
      </section>

      <section className="home-resources" aria-labelledby="home-resources-title">
        <div className="home-resources__intro">
          <p className="home-eyebrow">Recursos técnicos</p>
          <h2 id="home-resources-title">Información para<br />tus proyectos</h2>
          <p>Catálogos, fichas técnicas, manuales y documentación especializada en un solo lugar.</p>
          <ArrowLink href="/recursos" className="home-button home-button--dark">Ver recursos</ArrowLink>
        </div>
        <Link href="/recursos" className="home-catalog-card">
          <div className="home-catalog-cover">
            <Image src="/media/productos-page/catalogo-general-cover-cutout.png" alt="Portada del catálogo general FUNDIGSAC con el logo oficial" fill sizes="(max-width: 760px) 92px, (max-width: 1100px) 76px, 150px" />
          </div>
          <span><strong>Catálogo General<br />FUNDIGSAC</strong><small>PDF · 12 MB</small></span>
          <span className="home-download"><Download aria-hidden="true" size={17} strokeWidth={1.8} /></span>
        </Link>
        <div className="home-blueprint">
          <Image src="/media/home-resource-blueprints.jpg" alt="Planos técnicos de tuberías y componentes hidráulicos" fill sizes="(max-width: 760px) 100vw, 32vw" />
        </div>
      </section>

      <section className="home-project" aria-labelledby="home-project-title">
        <Image className="home-project__photo" src="/media/home-ref-project.webp" alt="Atardecer en una planta de tratamiento de agua" fill sizes="100vw" />
        <div className="home-project__shade" aria-hidden="true" />
        <div className="home-project__inner">
          <p className="home-eyebrow">Trabajemos juntos</p>
          <h2 id="home-project-title">¿Tienes un proyecto<br />en mente?</h2>
          <p>Nuestro equipo técnico está listo para asesorarte.</p>
          <div className="home-project__actions">
            <ArrowLink href="/cotizar" className="home-button home-button--light">Solicitar cotización</ArrowLink>
            <ArrowLink href="/contacto" className="home-button home-button--outline">Contactar</ArrowLink>
          </div>
        </div>
      </section>

      <section className="home-clients" aria-labelledby="home-clients-title">
        <div className="home-section-shell">
          <p className="home-eyebrow">Confianza que construye</p>
          <h2 id="home-clients-title">Presente en proyectos que impulsan el desarrollo</h2>
          <div className="home-client-logos" aria-label="Sectores que impulsan proyectos de infraestructura">
            <span className="home-client-logo home-client-logo--sedapal" aria-label="Sedapal">
              {/* Logotipo oficial publicado por FONAFE: https://www.fonafe.gob.pe/pw_content/empresas/20/Img/Sedapal.png */}
              <Image src="/media/home-client-sedapal.png" alt="" width={2244} height={880} />
            </span>
            <span className="home-client-logo home-client-logo--epas" aria-label="EPAS">
              <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2.8 37 20 20 37.2 3 20 20 2.8Z" /><path d="M20 10.2c-3.8 4.5-6.3 7.5-6.3 10.2a6.3 6.3 0 1 0 12.6 0c0-2.7-2.5-5.7-6.3-10.2Z" /><path d="M17.1 21.2c.6 1.4 1.6 2.2 3.2 2.5" /></svg>
              <strong>epas</strong>
            </span>
            <span className="home-client-logo home-client-logo--municipalities">
              <Landmark aria-hidden="true" />
              <span>Municipalidades</span>
            </span>
            <span className="home-client-logo home-client-logo--consortiums">
              <Building2 aria-hidden="true" />
              <span>Consorcios</span>
            </span>
            <span className="home-client-logo home-client-logo--builders">
              <HardHat aria-hidden="true" />
              <span>Constructoras</span>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
