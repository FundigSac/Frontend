import type { Metadata } from "next";
import { backendEnabled } from "@/modules/backend/server";
import { findQuoteProduct } from "@/modules/quote/products";
import { ScreenW16 } from "@/screens/w16";
import { ScreenW17 } from "@/screens/w17";

type Props = { searchParams: Promise<{ producto?: string | string[] }> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const product = findQuoteProduct(first((await searchParams).producto));
  return {
    title: product ? `Cotizar ${product.shortName}` : "Solicitar cotización",
    description: "Solicita una cotización técnica de válvulas, tuberías, marcos y tapas de hierro dúctil FUNDIGSAC: indica familia, medidas, cantidad y destino del proyecto.",
    // La variante con producto precargado es una vista del mismo trámite: la canónica es /cotizar.
    alternates: { canonical: "/cotizar" },
  };
}

export default async function QuotePage({ searchParams }: Props) {
  const slug = first((await searchParams).producto);
  // Contrato tipado: sólo slugs del catálogo; cualquier otro valor se ignora y se muestra la cotización general.
  const product = findQuoteProduct(slug);
  // La frase bajo el título dice qué ocurre al enviar: registro con folio, o mensaje listo para correo o WhatsApp.
  const online = backendEnabled();
  return product ? <ScreenW17 slug={product.slug} online={online} /> : <ScreenW16 online={online} />;
}
