import { CATALOG_CELLS, FAMILIES, cellsOfFamily } from "@/modules/catalog/public-catalog";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import { CatalogView } from "./_catalog/catalog-view";

export const metadata = pageMetadata({
  title: "Catálogo de válvulas, tuberías y tapas",
  description: "Catálogo FUNDIGSAC de válvulas, tubería de hierro dúctil, marcos y tapas para redes de agua y alcantarillado. Consulta medidas y pide tu cotización.",
  path: "/productos",
});

const FAMILY_INDEX = FAMILIES.map((f) => ({ slug: f.slug, href: f.href, name: f.name, blurb: f.blurb, count: cellsOfFamily(f.slug).length }));

// Sin leer searchParams la página es estática y sale del CDN. ?q= y ?familia= los aplica CatalogView en el navegador.
export default function CatalogPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }], SITE.url)} />
      <CatalogView cells={CATALOG_CELLS} families={FAMILY_INDEX} />
    </>
  );
}
