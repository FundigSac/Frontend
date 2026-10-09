import type { Metadata } from "next";
import { formatLimaDateTime, isLeadReference, leadKindLabel } from "@/modules/quote/format";
import { findLeadSummary } from "@/modules/leads/service";
import { ScreenW24, type ConfirmationLead } from "@/screens/w24";

export const metadata: Metadata = {
  title: "Confirmación de cotización",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ ref?: string | string[] }> };

export default async function QuoteConfirmationPage({ searchParams }: Props) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();

  let lead: ConfirmationLead | null = null;
  let unavailable = false;
  if (isLeadReference(ref)) {
    try {
      const summary = await findLeadSummary(ref);
      // Sólo se confirman cotizaciones: otros folios (reclamos, contactos) no se exponen en esta ruta.
      if (summary && summary.kind === "quote") {
        lead = { reference: summary.reference, dateLabel: formatLimaDateTime(summary.createdAt), typeLabel: leadKindLabel(summary.kind) };
      }
    } catch (error) {
      console.error("[cotizar/confirmacion] no se pudo consultar el folio", error instanceof Error ? error.message : "error");
      unavailable = true;
    }
  }
  return <ScreenW24 lead={lead} unavailable={unavailable} />;
}
