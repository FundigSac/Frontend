import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { CATEGORIES, PRODUCTS, findProduct, type ProductEntry } from "@/modules/catalog/registry";
import { findValveSheet } from "@/modules/catalog/valve-sheets";
import { ValveSheetView } from "@/screens/islands/valve-sheet";
import { W06Ficha } from "@/screens/islands/w06-ficha";
import { W06FichaFundigsac, W06FichaGarantiaExtendida } from "@/screens/islands/w06-ficha-garantia";
import { ScreenW07 } from "@/screens/w07";
import { ScreenW08 } from "@/screens/w08";
import { ScreenW09 } from "@/screens/w09";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";

type Props = { params: Promise<{ categoria: string; producto: string }> };

/** Pantalla de cada producto (aquí y no en el registro, para que el CSS de la ficha solo cargue en esta ruta). */
const SCREENS: Record<string, { Screen: ComponentType }> = {
  "valvula-compuerta": { Screen: W06Ficha },
  "valvula-compuerta-fundigsac": { Screen: W06FichaFundigsac },
  "valvula-compuerta-fundigsac-garantia-extendida": { Screen: W06FichaGarantiaExtendida },
  "valvula-mariposa": { Screen: ScreenW07 },
  "tuberia-tyton": { Screen: ScreenW08 },
  "marco-tapa-d400": { Screen: ScreenW09 },
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
  const sheet = product ? findValveSheet(product.slug) : undefined;
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
      {sheet ? <ValveSheetView slug={sheet.slug} /> : view && <view.Screen />}
    </>
  );
}
