import type { Metadata } from "next";
import { SitemapView } from "../_legal/mapa-view";

export const metadata: Metadata = {
  title: "Mapa del sitio",
  description: "Encuentra rápidamente cada sección de FUNDIGSAC: productos, sectores, recursos técnicos, atención y documentos legales.",
  alternates: { canonical: "/mapa-del-sitio" },
};

export default function SitemapPage() {
  return <SitemapView />;
}
