import type { Metadata } from "next";
import { productsBySlug } from "@/lib/site-info";
import { IndustriesView, type SectorData } from "./industries-view";
import "./industrias.css";

export const metadata: Metadata = {
  title: "Saneamiento, minería, agricultura e industria",
  description: "Componentes FUNDIGSAC para saneamiento, minería, agricultura e industria: válvulas, hierro dúctil, tubería HDPE, acoples y medición.",
  alternates: { canonical: "/industrias" },
};

/** Sectores y los productos de muestra de cada uno. Los textos (ES/EN) viven en ./copy.ts. */
const SECTORS = [
  { id: "saneamiento", href: "/industrias/saneamiento", slugs: ["tuberia-hierro-ductil-c40-k9-k7-thd", "valvula-compuerta-bridada-vbbh", "marco-y-tapa-pesada-2seg"] },
  { id: "mineria", href: "/industrias/mineria", slugs: ["codo-hdpe-termofusion-90-sdr11", "acople-gran-rango-agr", "maquina-termofusion-serie-hdc"] },
  { id: "agricultura", href: "/productos/valvulas", slugs: ["valvula-de-aire-roscada-vdar", "filtro-tipo-y-bridado-fyb", "tee-hdpe-termofusion-sdr11"] },
  { id: "industria", href: "/productos?familia=conexiones-y-fittings", slugs: ["brida-iso-2351-pn16-biso", "junta-flexible-din-jfdin", "valvula-mariposa-wafer-timon-vmtwt"] },
] as const;

export default function Industries() {
  const sectors: SectorData[] = SECTORS.map(({ id, href, slugs }) => ({ id, href, items: productsBySlug(...slugs) }));
  return <IndustriesView sectors={sectors} />;
}
