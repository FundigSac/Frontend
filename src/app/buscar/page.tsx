import type { Metadata } from "next";
import { ScreenW22 } from "@/screens/w22";

export const metadata: Metadata = {
  title: "Resultados de búsqueda",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  return <ScreenW22 params={await searchParams} />;
}
