import { cellsOfFamily, findCatalogSheet, findFamily, type FamilySlug } from "@/modules/catalog/public-catalog";
import { specLine } from "@/modules/catalog/spec-line";
import { CatalogFamilyView, type CellSpecs } from "@/screens/islands/catalog-family";
import { SITE } from "@/shared/config/site";
import { JsonLd } from "@/shared/seo/json-ld";
import { CategoryPage } from "./category-page";

/** Familias sin pantalla propia del 4 de noviembre: la lista de productos sale del servidor y se marca como ItemList. */
export function FamilyRoute({ slug }: { slug: FamilySlug }) {
  const family = findFamily(slug);
  const cells = cellsOfFamily(slug);
  // Solo lo que dice la ficha publicada de cada producto (X1-2 / B8-3).
  const specs: CellSpecs = {};
  for (const cell of cells) {
    const sheet = findCatalogSheet(cell.slug);
    if (!sheet) continue;
    const line = { es: specLine(sheet.specs.es), en: specLine(sheet.specs.en) };
    if (line.es.length || line.en.length) specs[cell.slug] = line;
  }
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: family.name.es,
    itemListElement: cells.map((cell, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE.url}${cell.href}`, name: cell.name.es })),
  };
  return (
    <CategoryPage slug={slug}>
      <JsonLd data={itemList} />
      <CatalogFamilyView family={family} cells={cells} specs={specs} />
    </CategoryPage>
  );
}
