import { FloatingActions } from "@/app/_landing/floating-actions";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import "@/app/landing.css";
import "../agricultura/agricultura.css";
import "../_sector/sector.css";
import { SanitationSections } from "./sections";

export const metadata = pageMetadata({
  title: "Hierro dúctil para agua y saneamiento",
  description: "Válvulas de compuerta, marcos y tapas, tuberías y acoples de hierro dúctil para redes de agua potable, alcantarillado y plantas de tratamiento en Perú.",
  path: "/industrias/saneamiento",
});

export default function SanitationPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Industrias", path: "/industrias" }, { name: "Saneamiento", path: "/industrias/saneamiento" }], SITE.url)} />
      <SanitationSections />
      <FloatingActions />
    </>
  );
}
