import type { Metadata } from "next";
import { formatLimaDateTime, leadKindLabel, PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { ScreenW24, type ConfirmationLead } from "@/screens/w24";

export const metadata: Metadata = {
  title: "Confirmación de cotización",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ ref?: string | string[] }> };

/**
 * Etapa de diseño: sin BD no hay folios reales que consultar. Solo se reconoce el marcador de "pendiente de conexión";
 * cualquier otro `?ref=` mostraría "Solicitud registrada" para un folio que nadie guardó.
 */
export default async function QuoteConfirmationPage({ searchParams }: Props) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
  const lead: ConfirmationLead | null = ref === PENDING_QUOTE_REFERENCE
    ? { reference: ref, dateLabel: formatLimaDateTime(new Date()), typeLabel: leadKindLabel("quote") }
    : null;
  return <ScreenW24 lead={lead} unavailable={false} />;
}
