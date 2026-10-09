import { W02Catalog } from "@/screens/islands/w02-catalog";

type FamilyFilter = "todas" | "valvulas" | "tuberias" | "marcos-y-tapas" | "accesorios-hdpe" | "conexiones-y-fittings";

export function ScreenW02({
  initialQuery,
  initialFamily,
}: {
  initialQuery: string;
  initialFamily: FamilyFilter;
}) {
  return <W02Catalog initialQuery={initialQuery} initialFamily={initialFamily} />;
}
