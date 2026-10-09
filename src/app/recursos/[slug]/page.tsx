import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { ScreenW14 } from "@/screens/w14";

/**
 * Páginas de detalle de recursos. Importa W14 directamente (no el registro de catálogo) para que un error
 * en otra pantalla no rompa esta ruta. Los metadatos se mantienen en sincronía con RESOURCES de catalog/registry.
 */
const RESOURCE_PAGES: Record<string, { name: string; description: string; Screen: ComponentType }> = {
  "detalle-tecnico": {
    name: "Detalle de recurso técnico",
    description: "Estado y disponibilidad de los documentos técnicos oficiales; publicación pendiente de aprobación.",
    Screen: ScreenW14,
  },
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(RESOURCE_PAGES).map((slug) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = Object.hasOwn(RESOURCE_PAGES, slug) ? RESOURCE_PAGES[slug] : undefined;
  if (!item) return {};
  return { title: item.name, description: item.description, alternates: { canonical: `/recursos/${slug}` } };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const item = Object.hasOwn(RESOURCE_PAGES, slug) ? RESOURCE_PAGES[slug] : undefined;
  if (!item) notFound();
  return <item.Screen />;
}
