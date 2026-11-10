import type { ReactNode } from "react";
import { CATEGORIES, type CategorySlug } from "@/modules/catalog/registry";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";

/*
 * Cada familia (válvulas, tuberías, marcos y tapas) tiene su propia ruta estática que importa solo su pantalla.
 * Con una única ruta /productos/[categoria] el CSS de las tres pantallas viajaba junto en cada página (~90 KB).
 */

const categoryOf = (slug: CategorySlug) => CATEGORIES.find((c) => c.slug === slug)!;

export function categoryMetadata(slug: CategorySlug) {
  const category = categoryOf(slug);
  return pageMetadata({ title: category.title ?? category.name, description: category.description, path: `/productos/${category.slug}` });
}

export function CategoryPage({ slug, children }: { slug: CategorySlug; children: ReactNode }) {
  const category = categoryOf(slug);
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }, { name: category.name, path: `/productos/${category.slug}` }], SITE.url)} />
      {children}
    </>
  );
}
