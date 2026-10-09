import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SOLUTIONS } from "@/modules/catalog/registry";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => SOLUTIONS.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = SOLUTIONS.find((s) => s.slug === slug);
  if (!item) return {};
  return { title: item.name, description: item.description, alternates: { canonical: `/soluciones/${item.slug}` } };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const item = SOLUTIONS.find((s) => s.slug === slug);
  if (!item) notFound();
  return <item.Screen />;
}
