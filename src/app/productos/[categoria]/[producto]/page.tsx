import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { findCatalogSheet } from "@/modules/catalog/public-catalog";
import { CATEGORIES, PRODUCTS, findProduct, type ProductEntry } from "@/modules/catalog/registry";
import { W06Ficha } from "@/screens/islands/w06-ficha";
import { DATASHEETS } from "@/screens/islands/w06-ficha-data";
import { W06FichaFundigsac, W06FichaGarantiaExtendida } from "@/screens/islands/w06-ficha-garantia";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata, withBrand } from "@/shared/seo/page-metadata";
import { SheetView } from "../../_catalog/sheet-view";

type Props = { params: Promise<{ categoria: string; producto: string }> };

/** Las compuertas con ficha técnica oficial tienen pantalla propia; el resto usa la ficha genérica del catálogo. */
const SCREENS: Record<string, { Screen: ComponentType }> = {
  "valvula-compuerta": { Screen: W06Ficha },
  "valvula-compuerta-fundigsac": { Screen: W06FichaFundigsac },
  "valvula-compuerta-fundigsac-garantia-extendida": { Screen: W06FichaGarantiaExtendida },
};

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ categoria: p.category, producto: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  if (!product) return {};
  return {
    ...pageMetadata({ title: withBrand(product.title ?? product.name), description: product.description, path: `/productos/${product.category}/${product.slug}` }),
    // Las pantallas de referencia (datos sin validar) no deben aparecer en buscadores aunque el sitio se indexe.
    ...(product.indexable === false ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Ficha técnica oficial de cada compuerta con pantalla propia. */
const W06_SPECS: Record<string, readonly (readonly [string, string])[]> = {
  "valvula-compuerta": DATASHEETS.base.specs,
  "valvula-compuerta-fundigsac": DATASHEETS.fundigsac.specs,
  "valvula-compuerta-fundigsac-garantia-extendida": DATASHEETS.extendida.specs,
};

// Normas, ensayos y garantías entran al marcado solo cuando se validen (PLAN_SEO.md, V-08 a V-10). La marca ya va en `brand`.
const PENDING_LABEL = /norma|dise[ñn]o|conformidad|certific|garant|marcado|prueba|ensayo|^marca$|^serie$|^fabricante$/i;
const PENDING_VALUE = /\b(?:EN\s?\d|DIN\s?\d|AWWA|ASTM|WRAS|ISO\s?\d{4}|NTP|SEDAPAL|OTASS)|por confirmar/i;
// La calidad del material se publica sin la referencia a la norma que la acompaña entre paréntesis.
const plainValue = (value: string) => value.replace(/\s*\((?:ASTM|ISO|AWWA)[^)]*\)/g, "");

/** Filas de la tabla técnica visible, como pares nombre y valor. */
function specProperties(slug: string) {
  const rows = W06_SPECS[slug] ?? findCatalogSheet(slug)?.specs.es ?? [];
  return rows
    .map(([name, value]) => [name, plainValue(value)] as const)
    .filter(([label, value]) => !PENDING_LABEL.test(label) && !PENDING_VALUE.test(value))
    .map(([name, value]) => ({ "@type": "PropertyValue", name, value }));
}

/**
 * Product solo con datos publicados en la ficha (nombre, descripción, foto, código, marca impresa y tabla técnica).
 * Sin `offers`, `review` ni `aggregateRating`: no hay precios públicos ni reseñas, y no se inventan.
 */
function productJsonLd(product: ProductEntry, categoryName: string, url: string) {
  const properties = specProperties(product.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url,
    category: categoryName,
    ...(product.image ? { image: `${SITE.url}${product.image}` } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(properties.length > 0 ? { additionalProperty: properties } : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  const sheet = product ? findCatalogSheet(product.slug) : undefined;
  const view = product && SCREENS[product.slug];
  if (!product || (!view && !sheet)) notFound();
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const path = `/productos/${product.category}/${product.slug}`;
  const url = `${SITE.url}${path}`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList(
            [{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }, { name: category?.name ?? product.category, path: `/productos/${product.category}` }, { name: product.name, path }],
            SITE.url,
          ),
          // Las pantallas de referencia representan exports de diseño, no productos aprobados: solo WebPage.
          product.indexable === false
            ? { "@context": "https://schema.org", "@type": "WebPage", name: product.name, description: product.description, url }
            : productJsonLd(product, category?.name ?? product.category, url),
        ]}
      />
      {sheet ? <SheetView sheet={sheet} /> : view && <view.Screen />}
    </>
  );
}
