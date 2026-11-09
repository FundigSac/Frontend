import { CatalogView, type FamilyFilter } from "@/app/productos/_catalog/catalog-view";
import { CATALOG_CELLS, FAMILIES, cellsOfFamily } from "@/modules/catalog/public-catalog";

const FAMILY_INDEX = FAMILIES.map((f) => ({ slug: f.slug, href: f.href, name: f.name, blurb: f.blurb, count: cellsOfFamily(f.slug).length }));

export function ScreenW02({ initialQuery, initialFamily }: { initialQuery: string; initialFamily: FamilyFilter }) {
  return <CatalogView cells={CATALOG_CELLS} families={FAMILY_INDEX} initialQuery={initialQuery} initialFamily={initialFamily} />;
}
