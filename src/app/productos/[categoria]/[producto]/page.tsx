import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { findCatalogSheet } from "@/modules/catalog/public-catalog";
import { CATEGORIES, PRODUCTS, findProduct, type ProductEntry } from "@/modules/catalog/registry";
import { W06Ficha } from "@/screens/islands/w06-ficha";
import { W06FichaFundigsac, W06FichaGarantiaExtendida } from "@/screens/islands/w06-ficha-garantia";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
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
    // `title` ya lleva la marca: sin la plantilla para no repetir "FUNDIGSAC".
    title: product.title ? { absolute: product.title } : product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.category}/${product.slug}` },
    // Las pantallas de referencia (datos sin validar) no deben aparecer en buscadores aunque el sitio se indexe.
    ...(product.indexable === false ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Product solo con datos publicados en la ficha (nombre, descripción, foto, código y marca impresa).
 * Sin `offers`, `review` ni `aggregateRating`: no hay precios públicos ni reseñas, y no se inventan.
 */
function productJsonLd(product: ProductEntry, categoryName: string, url: string) {
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
