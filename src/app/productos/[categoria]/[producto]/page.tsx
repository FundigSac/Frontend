import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, PRODUCTS, findProduct } from "@/modules/catalog/registry";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";

type Props = { params: Promise<{ categoria: string; producto: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ categoria: p.category, producto: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/productos/${product.category}/${product.slug}` } };
}

export default async function ProductPage({ params }: Props) {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  if (!product) notFound();
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const path = `/productos/${product.category}/${product.slug}`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList(
            [{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }, { name: category?.name ?? product.category, path: `/productos/${product.category}` }, { name: product.name, path }],
            SITE.url,
          ),
          // Estas pantallas representan exports de diseño, no productos aprobados del catálogo maestro.
          { "@context": "https://schema.org", "@type": "WebPage", name: product.name, description: product.description, url: `${SITE.url}${path}` },
        ]}
      />
      <product.Screen />
    </>
  );
}
