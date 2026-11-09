import { FloatingActions } from "@/app/_landing/floating-actions";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import "@/app/landing.css";
import "../_sector/sector.css";
import { AgricultureSections } from "./sections";

export const metadata = pageMetadata({
  title: "Válvulas y tuberías para riego en Perú",
  description: "Válvulas de compuerta, check, filtros Y y tuberías FUNDIGSAC para sistemas de riego agrícola en Perú. Consulta opciones y solicita tu cotización técnica.",
  path: "/industrias/agricultura",
});

export default function AgriculturePage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Industrias", path: "/industrias" }, { name: "Agricultura", path: "/industrias/agricultura" }], SITE.url)} />
      <AgricultureSections />
      <FloatingActions />
    </>
  );
}
