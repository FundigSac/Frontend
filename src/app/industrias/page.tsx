import type { Metadata } from "next";
import { FloatingActions } from "@/app/_landing/floating-actions";
import { productsBySlug } from "@/lib/site-info";
import "@/app/landing.css";
import "./_sector/sector.css";
import "./industrias.css";
import { IndustriesView, type SectorData } from "./industries-view";

export const metadata: Metadata = {
  title: "Saneamiento, minería, agricultura e industria",
  description: "Componentes FUNDIGSAC para saneamiento, minería, agricultura e industria: válvulas, hierro dúctil, tubería HDPE, acoples y medición.",
  alternates: { canonical: "/industrias" },
};

/** Familia del catálogo a la que lleva cada celda. */
const FAMILY_HREF: Record<string, string> = {
  valvulas: "/productos/valvulas",
  "hierro-ductil": "/productos/tuberias",
  hdpe: "/productos?familia=accesorios-hdpe",
  equipos: "/productos?familia=accesorios-hdpe",
  acoples: "/productos?familia=conexiones-y-fittings",
};

/** Nombre en inglés de los productos que catalog-en.ts aún no traduce. */
const NAME_EN: Record<string, string> = { "valvula-de-aire-3-funciones-premium-vdap": "Premium 3-function air valve VDAP" };

/** Sectores y sus productos de muestra. Los textos (ES/EN) viven en ./copy.ts. */
const SECTORS = [
  { id: "saneamiento", href: "/industrias/saneamiento", slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "valvula-compuerta-bridada-vbbh", "marco-y-tapa-pesada-2seg"] },
  { id: "mineria", href: "/industrias/mineria", slugs: ["codo-hdpe-termofusion-90-sdr11", "acople-gran-rango-agr", "maquina-termofusion-serie-hdc"] },
  { id: "agricultura", href: "/industrias/agricultura", slugs: ["valvula-de-aire-3-funciones-premium-vdap", "filtro-tipo-y-bridado-fyb", "tee-hdpe-termofusion-sdr11"] },
  { id: "industria", href: "/productos?familia=conexiones-y-fittings", slugs: ["brida-iso-2351-pn16-biso", "junta-flexible-din-jfdin", "valvula-mariposa-wafer-timon-vmtwt"] },
] as const;

export default function Industries() {
  const sectors: SectorData[] = SECTORS.map(({ id, href, slugs }) => ({
    id,
    href: id === "industria" ? "#industria" : href,
    items: productsBySlug(...slugs).map((p) => ({
      slug: p.slug,
      name: p.name,
      image: p.image,
      illustrative: p.imageIllustrative,
      nameEn: NAME_EN[p.slug],
      href: /\b(marco|tapa)\b/i.test(p.name) ? "/productos/marcos-y-tapas" : FAMILY_HREF[p.category] ?? "/productos",
    })),
  }));
  return (
    <>
      <IndustriesView sectors={sectors} />
      <FloatingActions />
    </>
  );
}
