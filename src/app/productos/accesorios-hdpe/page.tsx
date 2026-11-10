import { categoryMetadata } from "../_category/category-page";
import { FamilyRoute } from "../_category/family-route";

export const metadata = categoryMetadata("accesorios-hdpe");

export default function Page() {
  return <FamilyRoute slug="accesorios-hdpe" />;
}
