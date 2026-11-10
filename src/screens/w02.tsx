import { W02Catalog } from "@/screens/islands/w02-catalog";
import type { FamilyFilter } from "@/screens/islands/w02-catalog-data";


export function ScreenW02({
  initialQuery,
  initialFamily,
}: {
  initialQuery: string;
  initialFamily: FamilyFilter;
}) {
  return <W02Catalog initialQuery={initialQuery} initialFamily={initialFamily} />;
}
