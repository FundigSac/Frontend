import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("medidores");

export default function FamilyRoute() {
  return <CategoryPage slug="medidores" />;
}
