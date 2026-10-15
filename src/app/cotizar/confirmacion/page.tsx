import type { Metadata } from "next";
import { formatLimaDateTime, isLeadReference, leadKindLabel } from "@/modules/quote/format";
import { ScreenW24, type ConfirmationLead } from "@/screens/w24";

export const metadata: Metadata = {
  title: "Confirmación de cotización",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ ref?: string | string[] }> };

/** Etapa de diseño: sin BD, el folio recibido se muestra tal cual. */
export default async function QuoteConfirmationPage({ searchParams }: Props) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
  const lead: ConfirmationLead | null = isLeadReference(ref)
    ? { reference: ref, dateLabel: formatLimaDateTime(new Date()), typeLabel: leadKindLabel("quote") }
    : null;
  return <ScreenW24 lead={lead} unavailable={false} />;
}
