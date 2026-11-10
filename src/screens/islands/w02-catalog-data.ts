import { FAMILY_TEXT, PRODUCT_TEXT, type FamilyId } from "./w02-catalog-copy";

/** Familias y productos destacados del catálogo general (/productos). Los textos están en w02-catalog-copy.ts. */

export type FamilyFilter = "todas" | FamilyId;

export type CatalogFamilyCard = { id: FamilyId; href: string; image: string; search: string; cutout?: boolean };

export const FAMILIES: readonly CatalogFamilyCard[] = [
  { id: "valvulas", href: "/productos/valvulas", image: "/media/productos-page/productos2.jpg", search: "hierro ductil compuerta mariposa control" },
  { id: "tuberias", href: "/productos/tuberias", image: "/media/productos-page/productos3.jpg", search: "hdpe pead hierro ductil conduccion" },
  { id: "marcos-y-tapas", href: "/productos/marcos-y-tapas", image: "/media/productos-page/productos4.jpg", search: "tapa tapa circular hierro ductil buzones" },
  { id: "accesorios-hdpe", href: "/productos?familia=accesorios-hdpe", image: "/media/productos-page/productos5.jpg", search: "hdpe pead termofusion codos tees reducciones" },
  { id: "conexiones-y-fittings", href: "/productos?familia=conexiones-y-fittings", image: "/media/productos-page/productos6.jpg", search: "acoples uniones adaptadores bridas conexiones fittings" },
  // Familias con página propia desde la lista de precios: la foto es la del producto sobre fondo blanco.
  { id: "equipos-termofusion", href: "/productos/equipos-termofusion", image: "/media/catalog/maq-hdc.webp", search: "maquinas equipos termofusion electrofusion soldadura polietileno hdpe", cutout: true },
  { id: "medidores", href: "/productos/medidores", image: "/media/catalog/medidor-electromagnetico.webp", search: "medidores caudal electromagnetico woltman agua", cutout: true },
];

export const isFamilyId = (value: string | null | undefined): value is FamilyId => !!value && FAMILIES.some((family) => family.id === value);

/** Nombre, etiqueta y texto alternativo de cada producto están en w02-catalog-copy.ts (ES/EN). */
export type FeaturedProduct = {
  id: string;
  family: FamilyId;
  descriptor: string;
  image: string;
  href: string;
  terms: string;
  /** Ficha de la lista de precios de la que sale el descriptor (lo comprueba tests/unit/catalog/w02-catalog-data.test.ts). */
  sheet?: string;
};

export const FEATURED_PRODUCTS: readonly FeaturedProduct[] = [
  { id: "compuerta", family: "valvulas", descriptor: "DN 40 – DN 600  |  PN 10/16", image: "/media/valvula-hd/v-01.webp", href: "/productos/valvulas/valvula-compuerta", terms: "válvula compuerta cierre agua hierro dúctil" },
  { id: "compuerta-fundigsac", family: "valvulas", descriptor: "DN 50 – DN 600  |  PN 10/16", image: "/media/valvula-fundigsac/f-07.webp", href: "/productos/valvulas/valvula-compuerta-fundigsac", terms: "válvula compuerta fundigsac cierre agua hierro dúctil" },
  { id: "compuerta-garantia-extendida", family: "valvulas", descriptor: "DN 40 – DN 600  |  PN 10/16", image: "/media/valvula-fundigsac-cuadrante/g-01.webp", href: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", terms: "válvula compuerta fundigsac garantía extendida cuadrante cierre agua hierro dúctil" },
  { id: "mariposa", family: "valvulas", descriptor: "DN 50 – DN 1200  |  PN 10/16", image: "/media/productos-page/featured-mariposa.jpg", href: "/productos/valvulas/valvula-mariposa", terms: "válvula mariposa palanca control" },
  { id: "hdpe-pipe", family: "tuberias", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tuberia.jpg", href: "/productos/tuberias", terms: "tubería hdpe pe100 pead conducción" },
  { id: "tapa-d400", family: "marcos-y-tapas", descriptor: "Clase B125 – D400", image: "/media/productos-page/featured-tapa.jpg", href: "/productos/marcos-y-tapas/marco-tapa-d400", terms: "tapa circular marco calzada hierro dúctil" },
  { id: "union-flexible", family: "conexiones-y-fittings", descriptor: "DN 50 – DN 600", image: "/media/productos-page/featured-union.jpg", href: "/productos?familia=conexiones-y-fittings", terms: "unión flexible acople hdpe fitting" },
  { id: "elbow-90", family: "accesorios-hdpe", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-codo.jpg", href: "/productos?familia=accesorios-hdpe", terms: "codo 90 hdpe termofusión" },
  { id: "tee-hdpe", family: "accesorios-hdpe", descriptor: "DN 20 – DN 1200", image: "/media/productos-page/featured-tee.jpg", href: "/productos?familia=accesorios-hdpe", terms: "tee t hdpe derivación" },
  { id: "reduction-hdpe", family: "accesorios-hdpe", descriptor: "DN 32 – DN 630", image: "/media/productos-page/featured-reduccion.jpg", href: "/productos?familia=accesorios-hdpe", terms: "reducción hdpe adaptador" },
  { id: "adapter-hdpe", family: "conexiones-y-fittings", descriptor: "DN 50 – DN 630", image: "/media/productos-page/featured-adaptador.jpg", href: "/productos?familia=conexiones-y-fittings", terms: "adaptador brida hdpe conexión" },
  { id: "air-valve", family: "valvulas", descriptor: "DN 50 – DN 200  |  PN 16", image: "/media/productos-page/featured-valvula-aire.jpg", href: "/productos/valvulas", terms: "válvula aire ventosa purga" },
  { id: "termofusion-hdc", family: "equipos-termofusion", descriptor: "40 – 630 mm", image: "/media/catalog/maq-hdc.webp", href: "/productos/equipos-termofusion/maquina-termofusion-serie-hdc", terms: "máquina termofusión soldadura polietileno hdpe serie hdc", sheet: "maquina-termofusion-serie-hdc" },
  { id: "medidor-electromagnetico", family: "medidores", descriptor: "DN 50 – DN 600", image: "/media/catalog/medidor-electromagnetico.webp", href: "/productos/medidores/medidor-electromagnetico-melec", terms: "medidor caudal electromagnético agua melec", sheet: "medidor-electromagnetico-melec" },
];

export function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es-PE").trim();
}

/** ¿El producto contiene todos los términos? Se busca en los dos idiomas: da igual con qué idioma se vea el sitio. */
export function matchesQuery(product: FeaturedProduct, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const familyInfo = FAMILIES.find((entry) => entry.id === product.family);
  const haystack = normalize([PRODUCT_TEXT.es[product.id].name, PRODUCT_TEXT.en[product.id].name, product.descriptor, product.terms, FAMILY_TEXT.es[product.family].label, FAMILY_TEXT.en[product.family].label, familyInfo?.search].join(" "));
  return terms.every((term) => haystack.includes(term));
}

/**
 * Conteo por familia de los productos que coinciden con la búsqueda (X5-1): lo que mostraría cada filtro si se
 * eligiera. "todas" es el total de la búsqueda.
 */
export function facetCounts(query: string, products: readonly FeaturedProduct[] = FEATURED_PRODUCTS): Record<FamilyFilter, number> {
  const counts = Object.fromEntries([["todas", 0], ...FAMILIES.map((f) => [f.id, 0])]) as Record<FamilyFilter, number>;
  for (const product of products) {
    if (!matchesQuery(product, query)) continue;
    counts.todas += 1;
    counts[product.family] += 1;
  }
  return counts;
}
