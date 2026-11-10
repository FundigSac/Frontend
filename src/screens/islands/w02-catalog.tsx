"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Download, FileCheck2, Headphones, Mail, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { documentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { FAMILY_TEXT, PRODUCT_TEXT, UI, type FamilyId } from "./w02-catalog-copy";
import styles from "./w02-catalog.module.css";

type FamilyFilter = "todas" | FamilyId;

const FAMILIES: readonly { id: FamilyId; href: string; image: string; search: string }[] = [
  { id: "valvulas", href: "/productos/valvulas", image: "/media/productos-page/productos2.jpg", search: "hierro ductil compuerta mariposa control" },
  { id: "tuberias", href: "/productos/tuberias", image: "/media/productos-page/productos3.jpg", search: "hdpe pead hierro ductil conduccion" },
  { id: "marcos-y-tapas", href: "/productos/marcos-y-tapas", image: "/media/productos-page/productos4.jpg", search: "tapa tapa circular hierro ductil buzones" },
  { id: "accesorios-hdpe", href: "/productos?familia=accesorios-hdpe", image: "/media/productos-page/productos5.jpg", search: "hdpe pead termofusion codos tees reducciones" },
  { id: "conexiones-y-fittings", href: "/productos?familia=conexiones-y-fittings", image: "/media/productos-page/productos6.jpg", search: "acoples uniones adaptadores bridas conexiones fittings" },
];

/** Nombre, etiqueta y texto alternativo de cada producto están en w02-catalog-copy.ts (ES/EN). */
type FeaturedProduct = {
  id: string;
  family: FamilyId;
  descriptor: string;
  image: string;
  href: string;
  terms: string;
};

const FEATURED_PRODUCTS: readonly FeaturedProduct[] = [
  { id: "compuerta", family: "valvulas", descriptor: "DN 40 – DN 600  |  PN 10/16", image: "/media/valvula-hd/v-01.webp", href: "/productos/valvulas/valvula-compuerta", terms: "válvula compuerta cierre agua hierro dúctil" },
  { id: "compuerta-fundigsac", family: "valvulas", descriptor: "DN 50 – DN 600  |  PN 10/16", image: "/media/valvula-fundigsac/f-07.webp", href: "/productos/valvulas/valvula-compuerta-fundigsac", terms: "válvula compuerta fundigsac cierre agua hierro dúctil" },
  { id: "compuerta-garantia-extendida", family: "valvulas", descriptor: "DN 40 – DN 600  |  PN 10/16", image: "/media/valvula-fundigsac-cuadrante/g-01.webp", href: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", terms: "válvula compuerta fundigsac garantía extendida cuadrante cierre agua hierro dúctil" },
  { id: "mariposa", family: "valvulas", descriptor: "DN 50 – DN 1200  |  PN 10/16", image: "/media/productos-page/featured-mariposa.jpg", href: "/productos/valvulas/valvula-mariposa", terms: "válvula mariposa palanca control" },
  { id: "hdpe-pipe", family: "tuberias", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tuberia.jpg", href: "/productos/tuberias", terms: "tubería hdpe pe100 pead conducción" },
  { id: "tapa-d400", family: "marcos-y-tapas", descriptor: "Clase B125 – D400", image: "/media/productos-page/featured-tapa.jpg", href: "/productos/marcos-y-tapas/marco-tapa-d400", terms: "tapa circular marco calzada hierro dúctil" },
  { id: "union-flexible", family: "conexiones-y-fittings", descriptor: "DN 50 – DN 600", image: "/media/productos-page/featured-union.jpg", href: "/productos?familia=conexiones-y-fittings", terms: "unión flexible acople hdpe fitting" },
  { id: "elbow-90", family: "accesorios-hdpe", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-codo.jpg", href: "/productos?familia=accesorios-hdpe", terms: "codo 90 hdpe termofusión" },
  { id: "tee-hdpe", family: "accesorios-hdpe", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tee.jpg", href: "/productos?familia=accesorios-hdpe", terms: "tee t hdpe derivación" },
  { id: "reduction-hdpe", family: "accesorios-hdpe", descriptor: "DN 32 – DN 630", image: "/media/productos-page/featured-reduccion.jpg", href: "/productos?familia=accesorios-hdpe", terms: "reducción hdpe adaptador" },
  { id: "adapter-hdpe", family: "conexiones-y-fittings", descriptor: "DN 50 – DN 630", image: "/media/productos-page/featured-adaptador.jpg", href: "/productos?familia=conexiones-y-fittings", terms: "adaptador brida hdpe conexión" },
  { id: "air-valve", family: "valvulas", descriptor: "DN 50 – DN 200  |  PN 16", image: "/media/productos-page/featured-valvula-aire.jpg", href: "/productos/valvulas", terms: "válvula aire ventosa purga" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE").trim();
}

function readFamily(value: string | null): FamilyFilter {
  return value && FAMILIES.some((family) => family.id === value) ? value as FamilyId : "todas";
}

/** Parámetros de dirección que corresponden a un estado (los espacios al teclear no llegan a la URL). */
function addressSearch(query: string, family: FamilyFilter) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (family !== "todas") params.set("familia", family);
  return params.toString();
}

function updateAddress(query: string, family: FamilyFilter) {
  const search = addressSearch(query, family);
  const next = window.location.pathname + (search ? "?" + search : "") + window.location.hash;
  // Con `null` Next.js completa su propio estado e informa al router de la nueva URL (useSearchParams); pasar
  // window.history.state tal cual se salta esa integración y el router seguiría con los parámetros anteriores.
  window.history.replaceState(null, "", next);
}

function CategoryCard({ family }: { family: (typeof FAMILIES)[number] }) {
  const [lang] = useLang();
  const t = UI[lang];
  const text = FAMILY_TEXT[lang][family.id];
  return (
    <article className={styles.categoryCard}>
      <Link href={family.href} className={styles.categoryImage} aria-label={t.explore + text.label}>
        <Image src={family.image} alt={text.alt} fill sizes="(min-width: 1181px) 18vw, (min-width: 641px) 32vw, 46vw" />
      </Link>
      <div className={styles.categoryBody}>
        <h3>{text.label}</h3>
        <p>{text.description}</p>
        <Link href={family.href} className={styles.textLink}>{t.viewProducts} <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

function ProductPhoto({ product }: { product: FeaturedProduct }) {
  const [lang] = useLang();
  return (
    <Image src={product.image} alt={PRODUCT_TEXT[lang][product.id].alt} fill sizes="(min-width: 1200px) 18vw, (min-width: 680px) 32vw, 46vw" className={styles.productSprite} />
  );
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  const [lang] = useLang();
  const t = UI[lang];
  const text = PRODUCT_TEXT[lang][product.id];
  return (
    <article className={styles.productCard}>
      <Link href={product.href} className={styles.productImage} aria-label={t.viewSheetOf + text.name + (text.badge ? " · " + text.badge : "")}>
        <ProductPhoto product={product} />
        {text.badge && <span className={styles.productBadge}>{text.badge}</span>}
      </Link>
      <div className={styles.productBody}>
        <Link href={product.href} className={styles.productName}>{text.name}</Link>
        <p className={styles.productDescriptor}>{text.descriptor ?? product.descriptor}</p>
        <div className={styles.productActions}>
          <Link href={product.href} className={styles.secondaryButton}>{t.viewSheet}</Link>
          <Link href="/cotizar" className={styles.darkButton}>{t.quote} <ArrowRight size={14} /></Link>
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
  const [lang] = useLang();
  const t = UI[lang];
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState<FamilyFilter>(initialFamily);
  // Desde que la persona filtra o busca, las tarjetas que aparecen entran con una animación corta (motion.css).
  const [filtered, setFiltered] = useState(false);
  // Cambia al navegar con un enlace de la propia página (p. ej. /productos?familia=accesorios-hdpe): el componente sigue
  // montado, así que el estado inicial no se vuelve a leer. Las escrituras de updateAddress también pasan por aquí, pero
  // la dirección ya coincide con el estado y no cambia nada.
  const addressKey = useSearchParams().toString();
  const seenAddressKey = useRef(addressKey);

  const latest = useRef({ query, family });

  useEffect(() => {
    latest.current = { query, family };
    updateAddress(query, family);
  }, [query, family]);

  const readAddress = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q") ?? "";
    // Los espacios al teclear no llegan a la URL (se recorta): no pisar lo escrito si solo difiere en eso.
    setQuery((current) => (current.trim() === nextQuery.trim() ? current : nextQuery));
    setFamily(readFamily(params.get("familia")));
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", readAddress);
    return () => window.removeEventListener("popstate", readAddress);
  }, [readAddress]);

  useEffect(() => {
    if (seenAddressKey.current === addressKey) return;
    seenAddressKey.current = addressKey;
    // El router avisa con retraso de las escrituras propias: si la dirección real ya es otra (se siguió tecleando), el aviso
    // es viejo y releerlo pisaría lo escrito. Tampoco hay nada que hacer si ya coincide con el estado.
    const location = new URLSearchParams(window.location.search).toString();
    if (location !== addressKey) return;
    if (location === addressSearch(latest.current.query, latest.current.family)) return;
    readAddress();
  }, [addressKey, readAddress]);

  const visibleProducts = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return FEATURED_PRODUCTS.filter((product) => {
      if (family !== "todas" && product.family !== family) return false;
      const familyInfo = FAMILIES.find((entry) => entry.id === product.family);
      // Se busca en los dos idiomas: da igual con qué idioma se vea el sitio.
      const haystack = normalize([PRODUCT_TEXT.es[product.id].name, PRODUCT_TEXT.en[product.id].name, product.descriptor, product.terms, FAMILY_TEXT.es[product.family].label, FAMILY_TEXT.en[product.family].label, familyInfo?.search].join(" "));
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

  function pickFamily(next: FamilyFilter) {
    setFiltered(true);
    setFamily(next);
    window.setTimeout(() => {
      document.getElementById("productos-destacados")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }, 60);
  }

  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");

  return (
    <main lang={lang} className={styles.page}>
      <section className={styles.hero} aria-labelledby="catalog-title">
        <span className={styles.topVeil} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav aria-label={t.crumbsLabel} className={styles.breadcrumbs}>
            <Link href="/">{t.home}</Link><span aria-hidden="true">›</span><span aria-current="page">{t.products}</span>
          </nav>
          <div className={styles.heroCopy} data-enter>
          <h1 id="catalog-title">{t.title}</h1>
            <p className={styles.heroDescription}>{t.lead}</p>
            <form role="search" className={styles.searchForm} onSubmit={submitSearch}>
              <label className={styles.searchField}>
                <span className="sr-only">{t.searchLabel}</span>
                <span aria-hidden="true" className={styles.searchIcon}><Search size={19} strokeWidth={1.8} /></span>
                <input type="search" name="q" value={query} onChange={(event) => { setFiltered(true); setQuery(event.target.value); }} placeholder={t.searchPlaceholder} autoComplete="off" />
              </label>
              <button type="submit" className={styles.searchButton}>{t.search}</button>
            </form>
            <div className={styles.filters} aria-label={t.filterAria}>
              <span className={styles.filterLabel}>{t.filterLabel}</span>
              <button type="button" aria-pressed={family === "todas"} onClick={() => pickFamily("todas")} className={family === "todas" ? styles.filterActive : styles.filterPill}>{t.all}</button>
              {FAMILIES.map((entry) => (
                <button key={entry.id} type="button" aria-pressed={family === entry.id} onClick={() => pickFamily(family === entry.id ? "todas" : entry.id)} className={family === entry.id ? styles.filterActive : styles.filterPill}>{FAMILY_TEXT[lang][entry.id].label}</button>
              ))}
            </div>
          </div>
          <div className={styles.qualityStamp}>{t.quality.map((word) => <span key={word}>{word}</span>)}</div>
        </div>
      </section>

      <section className={styles.categoriesSection} aria-labelledby="families-title">
        <div className={styles.contentWidth}>
          {/* Título solo para lectores de pantalla: las tarjetas usan h3 y sin él la jerarquía saltaba de h1 a h3. */}
          <h2 id="families-title" className="sr-only">{t.familiesTitle}</h2>
          <div className={styles.categoryGrid} data-reveal="stagger">{FAMILIES.map((entry) => <CategoryCard key={entry.id} family={entry} />)}</div>
        </div>
      </section>

      <section className={styles.benefitsSection} aria-labelledby="benefits-title">
        <div className={styles.contentWidth + " " + styles.benefitsInner}>
          <div className={styles.benefitIntro} data-reveal>
            <h2 id="benefits-title">{t.benefitsTitle[0]}<br />{t.benefitsTitle[1]}</h2>
            <p>{t.benefitsLead}</p>
          </div>
          <div className={styles.benefitList} data-reveal="stagger">
            <article className={styles.benefitItem}><ShieldCheck aria-hidden="true" /><div><h3>{t.benefits[0].title}</h3><p>{t.benefits[0].text}</p></div></article>
            <article className={styles.benefitItem}><FileCheck2 aria-hidden="true" /><div><h3>{t.benefits[1].title}</h3><p>{t.benefits[1].text}</p></div></article>
            <article className={styles.benefitItem}><Headphones aria-hidden="true" /><div><h3>{t.benefits[2].title}</h3><p>{t.benefits[2].text}</p></div></article>
          </div>
        </div>
      </section>

      <section id="productos-destacados" className={styles.featuredSection} aria-labelledby="featured-title">
        <div className={styles.contentWidth}>
          <div className={styles.sectionHeading} data-reveal>
            <div><h2 id="featured-title">{t.featuredTitle}</h2></div>
            <Link href="/productos" className={styles.textLink}>{t.viewAll} <ArrowRight size={16} /></Link>
          </div>
          {visibleProducts.length ? (
            <div className={styles.productGrid} data-results data-filtered={filtered ? "" : undefined}>
              {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className={styles.emptyState} role="status">
              <h3>{t.emptyTitle}</h3>
              <p>{t.emptyText}</p>
              <button type="button" onClick={() => { setQuery(""); setFamily("todas"); }} className={styles.darkButton}>{t.viewAll} <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy} data-reveal="stagger">
            <p className={styles.eyebrow}>{t.resEyebrow}</p>
            <h2 id="resources-title">{t.resTitle}</h2>
            <p>{t.resText}</p>
            <Link href="/contacto?motivo=documentacion" className={styles.darkButton}>{t.resCta} <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.catalogMockup} data-reveal="right">
            <Image src="/media/productos-page/catalogo-general-book-with-logo.png" alt={t.coverAlt} fill sizes="(min-width: 1200px) 370px, (min-width: 640px) 380px, 80vw" className={styles.catalogCover} />
            <Image src="/media/productos-page/catalogo-general-cover-cutout.png" alt="" aria-hidden="true" fill sizes="(min-width: 1200px) 370px, (min-width: 640px) 380px, 80vw" className={styles.catalogCoverDark} />
          </div>
          <div className={styles.resourcesAside} data-reveal style={{ ["--d" as string]: "140ms" }}>
            <article className={styles.downloadCard}>
              <h3>{t.cardTitle}</h3>
              <p>{t.cardText}</p>
              <Link href={catalogDocument.href} className={styles.downloadButton}>
                {catalogDocument.download ? <Download size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
                {catalogDocument.download ? t.download : t.request}
              </Link>
            </article>
            <Link href="/contacto?motivo=documentacion" className={styles.resourceLink}>{t.allCatalogs} <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.supportSection} aria-labelledby="support-title">
        <div className={styles.supportInner} data-reveal>
          <span className={styles.supportIcon} aria-hidden="true"><MessageCircle size={23} strokeWidth={1.8} /></span>
          <div className={styles.supportCopy}><h2 id="support-title">{t.supportTitle}</h2><p>{t.supportText}</p></div>
          <div className={styles.supportActions}><Link href="/cotizar" className={styles.darkButton}>{t.advice} <ArrowRight size={15} /></Link><Link href="/contacto" className={styles.secondaryButton}>{t.contact} <ArrowRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  );
}
