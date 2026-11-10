import { W04Tuberias } from "@/screens/islands/w04-tuberias";
import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("tuberias");

export default function TuberiasPage() {
  return (
    <CategoryPage slug="tuberias">
      <W04Tuberias />
    </CategoryPage>
  );
}
