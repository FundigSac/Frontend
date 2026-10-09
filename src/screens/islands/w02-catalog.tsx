"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileCheck2, Headphones, Mail, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { documentHref } from "@/modules/resources/documents";
import styles from "./w02-catalog.module.css";

type FamilyId = "valvulas" | "tuberias" | "marcos-y-tapas" | "accesorios-hdpe" | "conexiones-y-fittings";
type FamilyFilter = "todas" | FamilyId;

const FAMILIES: readonly { id: FamilyId; label: string; href: string; image: string; alt: string; description: string; search: string }[] = [
  { id: "valvulas", label: "Válvulas", href: "/productos/valvulas", image: "/media/productos-page/productos2.jpg", alt: "Válvula azul de compuerta para una red de agua", description: "Válvulas de compuerta, mariposa, retención, aire y más.", search: "hierro ductil compuerta mariposa control" },
  { id: "tuberias", label: "Tuberías", href: "/productos/tuberias", image: "/media/productos-page/productos3.jpg", alt: "Tuberías de polietileno de alta densidad con franja azul", description: "Tuberías de HDPE para conducción de agua y alcantarillado.", search: "hdpe pead hierro ductil conduccion" },
  { id: "marcos-y-tapas", label: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/media/productos-page/productos4.jpg", alt: "Tapa de hierro dúctil instalada en pavimento", description: "Marcos y tapas de hierro dúctil para infraestructura urbana.", search: "tapa tapa circular hierro ductil buzones" },
  { id: "accesorios-hdpe", label: "Accesorios HDPE", href: "/productos?familia=accesorios-hdpe", image: "/media/productos-page/productos5.jpg", alt: "Accesorios HDPE bridados de color azul", description: "Acoples, adaptadores, uniones y reducciones.", search: "hdpe pead termofusion codos tees reducciones" },
  { id: "conexiones-y-fittings", label: "Conexiones y fittings", href: "/productos?familia=conexiones-y-fittings", image: "/media/productos-page/productos6.jpg", alt: "Codos, tees y conexiones de polietileno de alta densidad", description: "Codos, tees, reducciones, tapones y más.", search: "acoples uniones adaptadores bridas conexiones fittings" },
];

type FeaturedProduct = {
  id: string;
  family: FamilyId;
  name: string;
  descriptor: string;
  image: string;
  alt: string;
  href: string;
  terms: string;
};

const FEATURED_PRODUCTS: readonly FeaturedProduct[] = [
  { id: "compuerta", family: "valvulas", name: "Válvula de compuerta de hierro dúctil", descriptor: "DN 50 – DN 600  |  PN 10/16", image: "/media/productos-page/featured-compuerta.jpg", alt: "Válvula de compuerta azul", href: "/productos/valvulas/valvula-compuerta", terms: "válvula compuerta cierre agua hierro dúctil" },
  { id: "mariposa", family: "valvulas", name: "Válvula mariposa", descriptor: "DN 50 – DN 1200  |  PN 10/16", image: "/media/productos-page/featured-mariposa.jpg", alt: "Válvula mariposa azul con accionamiento manual", href: "/productos/valvulas/valvula-mariposa", terms: "válvula mariposa palanca control" },
  { id: "hdpe-pipe", family: "tuberias", name: "Tubería HDPE PE100", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tuberia.jpg", alt: "Tuberías HDPE negras con franja azul", href: "/productos/tuberias", terms: "tubería hdpe pe100 pead conducción" },
  { id: "tapa-d400", family: "marcos-y-tapas", name: "Tapa circular", descriptor: "Clase B125 – D400", image: "/media/productos-page/featured-tapa.jpg", alt: "Tapa circular de hierro dúctil", href: "/productos/marcos-y-tapas/marco-tapa-d400", terms: "tapa circular marco calzada hierro dúctil" },
  { id: "union-flexible", family: "conexiones-y-fittings", name: "Unión flexible HDPE", descriptor: "DN 50 – DN 600", image: "/media/productos-page/featured-union.jpg", alt: "Acople bridado azul para tubería", href: "/productos?familia=conexiones-y-fittings", terms: "unión flexible acople hdpe fitting" },
  { id: "elbow-90", family: "accesorios-hdpe", name: "Codo 90° HDPE", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-codo.jpg", alt: "Codo negro de 90 grados para tubería HDPE", href: "/productos?familia=accesorios-hdpe", terms: "codo 90 hdpe termofusión" },
  { id: "tee-hdpe", family: "accesorios-hdpe", name: "Tee HDPE", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tee.jpg", alt: "Tee negra para tubería HDPE", href: "/productos?familia=accesorios-hdpe", terms: "tee t hdpe derivación" },
  { id: "reduction-hdpe", family: "accesorios-hdpe", name: "Reducción HDPE", descriptor: "DN 32 – DN 630", image: "/media/productos-page/featured-reduccion.jpg", alt: "Reducción negra para tubería HDPE", href: "/productos?familia=accesorios-hdpe", terms: "reducción hdpe adaptador" },
  { id: "adapter-hdpe", family: "conexiones-y-fittings", name: "Adaptador brida HDPE", descriptor: "DN 50 – DN 630", image: "/media/productos-page/featured-adaptador.jpg", alt: "Adaptador azul bridado para tubería", href: "/productos?familia=conexiones-y-fittings", terms: "adaptador brida hdpe conexión" },
  { id: "air-valve", family: "valvulas", name: "Válvula de aire", descriptor: "DN 50 – DN 200  |  PN 16", image: "/media/productos-page/featured-valvula-aire.jpg", alt: "Válvula de aire para redes hidráulicas", href: "/productos/valvulas", terms: "válvula aire ventosa purga" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE").trim();
}

function readFamily(value: string | null): FamilyFilter {
  return value && FAMILIES.some((family) => family.id === value) ? value as FamilyId : "todas";
}

function updateAddress(query: string, family: FamilyFilter) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (family !== "todas") params.set("familia", family);
  const search = params.toString();
  const next = window.location.pathname + (search ? "?" + search : "") + window.location.hash;
  window.history.replaceState(window.history.state, "", next);
}

function CategoryCard({ family }: { family: (typeof FAMILIES)[number] }) {
  return (
    <article className={styles.categoryCard}>
      <Link href={family.href} className={styles.categoryImage} aria-label={"Explorar " + family.label}>
        <Image src={family.image} alt={family.alt} fill sizes="(min-width: 1200px) 18vw, (min-width: 680px) 34vw, 85vw" />
      </Link>
      <div className={styles.categoryBody}>
        <h3>{family.label}</h3>
        <p>{family.description}</p>
        <Link href={family.href} className={styles.textLink}>Ver productos <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

function ProductPhoto({ product }: { product: FeaturedProduct }) {
  return (
    <Image src={product.image} alt={product.alt} fill sizes="(min-width: 1200px) 18vw, (min-width: 680px) 32vw, 46vw" className={styles.productSprite} />
  );
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <article className={styles.productCard}>
      <Link href={product.href} className={styles.productImage} aria-label={"Ver ficha de " + product.name}>
        <ProductPhoto product={product} />
      </Link>
      <div className={styles.productBody}>
        <Link href={product.href} className={styles.productName}>{product.name}</Link>
        <p className={styles.productDescriptor}>{product.descriptor}</p>
        <div className={styles.productActions}>
          <Link href={product.href} className={styles.secondaryButton}>Ver ficha</Link>
          <Link href="/cotizar" className={styles.darkButton}>Cotizar <ArrowRight size={14} /></Link>
        </div>
      </div>
    </article>
  );
}

export function W02Catalog({
  initialQuery = "",
  initialFamily = "todas",
}: {
  initialQuery?: string;
  initialFamily?: FamilyFilter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState<FamilyFilter>(initialFamily);

  useEffect(() => {
    updateAddress(query, family);
  }, [query, family]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setFamily(readFamily(params.get("familia")));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const visibleProducts = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return FEATURED_PRODUCTS.filter((product) => {
      if (family !== "todas" && product.family !== family) return false;
      const familyInfo = FAMILIES.find((entry) => entry.id === product.family);
      const haystack = normalize([product.name, product.descriptor, product.terms, familyInfo?.label, familyInfo?.search].join(" "));
      return terms.every((term) => haystack.includes(term));
    });
  }, [family, query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("productos-destacados")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="catalog-title">
        <div className={styles.heroInner}>
          <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Productos</span>
          </nav>
          <div className={styles.heroCopy}>
          <h1 id="catalog-title">Catálogo general</h1>
            <p className={styles.heroDescription}>Componentes de hierro dúctil, HDPE y accesorios diseñados para redes de agua, alcantarillado e infraestructura urbana.</p>
            <form role="search" className={styles.searchForm} onSubmit={submitSearch}>
              <label className={styles.searchField}>
                <span className="sr-only">Buscar productos por nombre, referencia o aplicación</span>
                <span aria-hidden="true" className={styles.searchIcon}><Search size={19} strokeWidth={1.8} /></span>
                <input type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos, referencias o aplicaciones…" autoComplete="off" />
              </label>
              <button type="submit" className={styles.searchButton}>Buscar</button>
            </form>
            <div className={styles.filters} aria-label="Filtrar por familia">
              <span className={styles.filterLabel}>Filtrar por familia:</span>
              <button type="button" aria-pressed={family === "todas"} onClick={() => setFamily("todas")} className={family === "todas" ? styles.filterActive : styles.filterPill}>Todas</button>
              {FAMILIES.map((entry) => (
                <button key={entry.id} type="button" aria-pressed={family === entry.id} onClick={() => setFamily(family === entry.id ? "todas" : entry.id)} className={family === entry.id ? styles.filterActive : styles.filterPill}>{entry.label}</button>
              ))}
            </div>
          </div>
          <div className={styles.qualityStamp}><span>Calidad</span><span>Resistencia</span><span>Confianza</span></div>
        </div>
      </section>

      <section className={styles.categoriesSection} aria-label="Familias de productos">
        <div className={styles.contentWidth}>
          <div className={styles.categoryGrid}>{FAMILIES.map((entry) => <CategoryCard key={entry.id} family={entry} />)}</div>
        </div>
      </section>

      <section className={styles.benefitsSection} aria-labelledby="benefits-title">
        <div className={styles.contentWidth + " " + styles.benefitsInner}>
          <div className={styles.benefitIntro}>
            <h2 id="benefits-title">Soluciones confiables<br />para proyectos que perduran</h2>
            <p>Acompañamos tus proyectos con productos de alto desempeño y asesoría técnica especializada.</p>
          </div>
          <div className={styles.benefitList}>
            <article className={styles.benefitItem}><ShieldCheck aria-hidden="true" /><div><h3>Alta durabilidad</h3><p>Materiales diseñados para un rendimiento confiable y de larga vida útil.</p></div></article>
            <article className={styles.benefitItem}><FileCheck2 aria-hidden="true" /><div><h3>Cumplimiento de normas</h3><p>Productos diseñados según normas nacionales e internacionales.</p></div></article>
            <article className={styles.benefitItem}><Headphones aria-hidden="true" /><div><h3>Asesoría técnica</h3><p>Te ayudamos a identificar la solución adecuada para tu proyecto.</p></div></article>
          </div>
        </div>
      </section>

      <section id="productos-destacados" className={styles.featuredSection} aria-labelledby="featured-title">
        <div className={styles.contentWidth}>
          <div className={styles.sectionHeading}>
            <div><h2 id="featured-title">Productos destacados</h2></div>
            <Link href="/productos" className={styles.textLink}>Ver todos los productos <ArrowRight size={16} /></Link>
          </div>
          {visibleProducts.length ? (
            <div className={styles.productGrid}>
              {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className={styles.emptyState} role="status">
              <h3>No encontramos productos con esos datos</h3>
              <p>Prueba con otra búsqueda o explora una familia del catálogo.</p>
              <button type="button" onClick={() => { setQuery(""); setFamily("todas"); }} className={styles.darkButton}>Ver todos los productos <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>Recursos técnicos</p>
            <h2 id="resources-title">Catálogos y documentación</h2>
            <p>Descarga nuestros catálogos, fichas técnicas y documentación para conocer más sobre nuestros productos y sus aplicaciones.</p>
            <Link href="/recursos" className={styles.darkButton}>Ver todos los recursos <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.catalogMockup}>
            <Image src="/media/productos-page/catalogo-general-book-with-logo.png" alt="Catálogo general FUNDIGSAC con el logo oficial sobre planos técnicos" fill sizes="(min-width: 1200px) 370px, (min-width: 640px) 380px, 80vw" className={styles.catalogCover} />
          </div>
          <div className={styles.resourcesAside}>
            <article className={styles.downloadCard}>
              <h3>Catálogo general</h3>
              <p>Productos y soluciones para redes de agua, alcantarillado e infraestructura urbana.</p>
              <Link href={catalogDocument.href} className={styles.downloadButton}>
                {catalogDocument.download ? <Download size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
                {catalogDocument.download ? "Descargar PDF (12 MB)" : "Solicitar catálogo PDF"}
              </Link>
            </article>
            <Link href="/recursos" className={styles.resourceLink}>Ver todos los catálogos <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.supportSection} aria-labelledby="support-title">
        <div className={styles.supportInner}>
          <span className={styles.supportIcon} aria-hidden="true"><MessageCircle size={23} strokeWidth={1.8} /></span>
          <div className={styles.supportCopy}><h2 id="support-title">¿No encuentras lo que buscas?</h2><p>Nuestro equipo técnico puede ayudarte a elegir la solución ideal para tu proyecto.</p></div>
          <div className={styles.supportActions}><Link href="/cotizar" className={styles.darkButton}>Solicitar asesoría <ArrowRight size={15} /></Link><Link href="/contacto" className={styles.secondaryButton}>Contactar <ArrowRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  );
}
