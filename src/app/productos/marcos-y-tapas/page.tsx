import { W05Marcos } from "@/screens/islands/w05-marcos";
import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("marcos-y-tapas");

export default function MarcosYTapasPage() {
  return (
    <CategoryPage slug="marcos-y-tapas">
      <W05Marcos />
    </CategoryPage>
  );
}
