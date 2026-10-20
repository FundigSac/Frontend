import "server-only";
import { authSecret, sign, verify } from "@/modules/auth/server";

/**
 * Constancia de la última cotización registrada desde este navegador: folio y token de la API, firmados en una cookie
 * httpOnly que solo viaja a /cotizar durante 30 minutos. Así /cotizar/confirmacion confirma un folio real sin poner el
 * token en la URL, y un `?ref=` inventado no muestra "Solicitud registrada".
 */
export const RECEIPT_COOKIE = "fundigsac-receipt";
export const RECEIPT_MAX_AGE = 30 * 60;

type Stored = { f: string; t: string };

export async function receiptCookieValue(receipt: { folio: string; receiptToken: string }): Promise<string | null> {
  const secret = authSecret();
  if (!secret || !receipt.folio || !receipt.receiptToken) return null;
  return sign<Stored>(secret, { f: receipt.folio, t: receipt.receiptToken }, RECEIPT_MAX_AGE);
}

export async function readReceiptCookie(value: string | undefined): Promise<{ folio: string; token: string } | null> {
  const secret = authSecret();
  if (!secret) return null;
  const data = await verify<Stored>(secret, value);
  return data && typeof data.f === "string" && typeof data.t === "string" ? { folio: data.f, token: data.t } : null;
}
