import { CATEGORIES, type CategorySlug } from "@/modules/catalog/registry";
import { cellsOfFamily, compareTable, familyDocuments, findFamily } from "@/modules/catalog/public-catalog";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import { FamilyView } from "../_catalog/family-view";

/*
 * Cada familia tiene su propia ruta estática: el servidor le pasa solo sus productos, y la lista no viaja en el JavaScript.
 */

const categoryOf = (slug: CategorySlug) => CATEGORIES.find((c) => c.slug === slug)!;

export function categoryMetadata(slug: CategorySlug) {
  const category = categoryOf(slug);
  return pageMetadata({ title: category.title ?? category.name, description: category.description, path: `/productos/${category.slug}` });
}

export function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = categoryOf(slug);
  const family = findFamily(slug);
  const cells = cellsOfFamily(slug);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    itemListElement: cells.map((cell, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE.url}${cell.href}`, name: cell.name.es })),
  };
  return (
    <>
      <JsonLd data={[breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }, { name: category.name, path: `/productos/${category.slug}` }], SITE.url), itemList]} />
      <FamilyView family={family} cells={cells} compare={compareTable(slug)} documents={familyDocuments(slug)} />
    </>
  );
}
