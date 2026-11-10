import { categoryMetadata } from "../_category/category-page";
import { FamilyRoute } from "../_category/family-route";

export const metadata = categoryMetadata("equipos-termofusion");

export default function Page() {
  return <FamilyRoute slug="equipos-termofusion" />;
}
