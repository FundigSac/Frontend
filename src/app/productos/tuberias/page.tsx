import { CategoryPage, categoryMetadata } from "../_category/category-page";

export const metadata = categoryMetadata("tuberias");

export default function FamilyRoute() {
  return <CategoryPage slug="tuberias" />;
}
