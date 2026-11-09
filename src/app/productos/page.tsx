import type { Metadata } from "next";
import { CATALOG_CELLS, FAMILIES, cellsOfFamily, type FamilySlug } from "@/modules/catalog/public-catalog";
import { CatalogView, type FamilyFilter } from "./_catalog/catalog-view";

export const metadata: Metadata = {
  title: "Catálogo de válvulas, tuberías HDPE y accesorios",
  description: "Catálogo FUNDIGSAC de válvulas, tuberías, marcos y tapas de hierro dúctil, accesorios HDPE y conexiones para redes de agua, alcantarillado e infraestructura.",
  alternates: { canonical: "/productos" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function validFamily(value: string): FamilyFilter {
  return FAMILIES.some((f) => f.slug === value) ? (value as FamilySlug) : "todas";
}

const FAMILY_INDEX = FAMILIES.map((f) => ({ slug: f.slug, href: f.href, name: f.name, blurb: f.blurb, count: cellsOfFamily(f.slug).length }));

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <CatalogView cells={CATALOG_CELLS} families={FAMILY_INDEX} initialQuery={firstValue(params.q).slice(0, 120)} initialFamily={validFamily(firstValue(params.familia))} />;
}
