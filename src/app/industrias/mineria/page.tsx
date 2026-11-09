import { FloatingActions } from "@/app/_landing/floating-actions";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import "@/app/landing.css";
import "../_sector/sector.css";
import { MiningSections } from "./sections";

export const metadata = pageMetadata({
  title: "Válvulas y tuberías para minería en Perú",
  description: "Válvulas de compuerta, tuberías, acoples y bridas FUNDIGSAC de hierro dúctil para agua de proceso y control de fluidos en operaciones mineras del Perú.",
  path: "/industrias/mineria",
});

export default function MiningPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Industrias", path: "/industrias" }, { name: "Minería", path: "/industrias/mineria" }], SITE.url)} />
      <MiningSections />
      <FloatingActions />
    </>
  );
}
