import { categoryMetadata } from "../_category/category-page";
import { FamilyRoute } from "../_category/family-route";

export const metadata = categoryMetadata("conexiones-y-fittings");

export default function Page() {
  return <FamilyRoute slug="conexiones-y-fittings" />;
}
