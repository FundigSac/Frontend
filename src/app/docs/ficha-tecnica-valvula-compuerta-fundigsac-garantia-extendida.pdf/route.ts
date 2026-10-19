import { DATASHEETS, stampDatasheet } from "@/modules/datasheets/stamp";

/** La fecha de descarga cambia cada día: la respuesta se genera en cada petición y no se guarda en cachés. */
export const dynamic = "force-dynamic";

export async function GET() {
  const sheet = DATASHEETS["garantia-extendida"];
  const pdf = await stampDatasheet(sheet);
  return new Response(pdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${sheet.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
