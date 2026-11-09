import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("valvulas");

export default function FamilyRoute() {
  return <CategoryPage slug="valvulas" />;
}
