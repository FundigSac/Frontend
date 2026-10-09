import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, findCategory } from "@/modules/catalog/registry";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";

type Props = { params: Promise<{ categoria: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ categoria: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = findCategory((await params).categoria);
  if (!category) return {};
  return { title: category.name, description: category.description, alternates: { canonical: `/productos/${category.slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const category = findCategory((await params).categoria);
  if (!category) notFound();
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Productos", path: "/productos" }, { name: category.name, path: `/productos/${category.slug}` }], SITE.url)} />
      <category.Screen />
    </>
  );
}
