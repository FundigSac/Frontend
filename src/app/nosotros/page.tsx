import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import { AboutView } from "./about-view";

export const metadata = pageMetadata({
  title: "Empresa peruana de hierro dúctil",
  description: "Conoce a FUNDIGSAC, empresa peruana especializada en soluciones de hierro dúctil para redes de agua, alcantarillado e infraestructura urbana.",
  path: "/nosotros",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Nosotros", path: "/nosotros" }], SITE.url)} />
      <AboutView />
    </>
  );
}
