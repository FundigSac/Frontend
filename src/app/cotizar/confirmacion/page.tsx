import type { Metadata } from "next";
import { cookies } from "next/headers";
import { RECEIPT_COOKIE, readReceiptCookie } from "@/modules/backend/receipt";
import { backendEnabled, callBackend } from "@/modules/backend/server";
import { formatLimaDateTime, leadKindLabel, PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { ScreenW24, type ConfirmationLead } from "@/screens/w24";

export const metadata: Metadata = {
  title: "Confirmación de cotización",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ ref?: string | string[] }> };

/**
 * Solo se muestra "Solicitud registrada" para un folio que la API confirma: el de la constancia firmada que dejó el
 * envío en este navegador (cookie httpOnly). Cualquier otro `?ref=` mostraría un registro que nadie guardó. Sin Backend
 * se reconoce además el marcador de "pendiente de conexión".
 */
export default async function QuoteConfirmationPage({ searchParams }: Props) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
  if (ref === PENDING_QUOTE_REFERENCE) {
    return <ScreenW24 lead={{ reference: ref, dateLabel: formatLimaDateTime(new Date()), typeLabel: leadKindLabel("quote") }} unavailable={false} />;
  }
  if (!ref || !backendEnabled()) return <ScreenW24 lead={null} unavailable={false} />;

  const receipt = await readReceiptCookie((await cookies()).get(RECEIPT_COOKIE)?.value);
  if (!receipt || receipt.folio !== ref) return <ScreenW24 lead={null} unavailable={false} />;
  const result = await callBackend<{ folio: string; receivedAt: string }>(`/api/v1/quotes/${encodeURIComponent(receipt.folio)}/receipt`, {
    headers: { "X-Receipt-Token": receipt.token },
  });
  if (!result.ok) return <ScreenW24 lead={null} unavailable={result.reason !== "http"} />;
  const lead: ConfirmationLead = { reference: result.data.folio, dateLabel: formatLimaDateTime(new Date(result.data.receivedAt)), typeLabel: leadKindLabel("quote") };
  return <ScreenW24 lead={lead} unavailable={false} />;
}
