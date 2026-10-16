import { W03Valvulas } from "@/screens/islands/w03-valvulas";
import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("valvulas");

export default function ValvulasPage() {
  return (
    <CategoryPage slug="valvulas">
      <W03Valvulas />
    </CategoryPage>
  );
}
