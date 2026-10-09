import type { Metadata } from "next";
import { ScreenW02 } from "@/screens/w02";

export const metadata: Metadata = {
  title: "Catálogo general de productos",
  description: "Catálogo de válvulas, tuberías, marcos y tapas de hierro dúctil FUNDIGSAC.",
  alternates: { canonical: "/productos" },
};

type SearchParams = Record<string, string | string[] | undefined>;
type FamilyFilter = "todas" | "valvulas" | "tuberias" | "marcos-y-tapas";

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function validFamily(value: string): FamilyFilter {
  return value === "valvulas" || value === "tuberias" || value === "marcos-y-tapas"
    ? value
    : "todas";
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const initialQuery = firstValue(params.q).slice(0, 120);
  const initialFamily = validFamily(firstValue(params.familia));

  return <ScreenW02 initialQuery={initialQuery} initialFamily={initialFamily} />;
}
