import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, findProduct } from "@/modules/catalog/registry";

type Props = { params: Promise<{ categoria: string; producto: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.filter((p) => p.Viewer3D).map((p) => ({ categoria: p.category, producto: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  if (!product?.Viewer3D) return {};
  return { title: `Visor 3D · ${product.name}`, description: `Visualización 3D de ${product.name}.`, robots: { index: false, follow: true } };
}

export default async function Viewer3DPage({ params }: Props) {
  const { categoria, producto } = await params;
  const product = findProduct(categoria, producto);
  if (!product?.Viewer3D) notFound();
  return <product.Viewer3D />;
}
