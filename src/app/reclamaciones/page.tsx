import type { Metadata } from "next";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { claimsClosingImage, claimsHeroImage } from "../_legal/images";
import { ClaimsView } from "../_legal/reclamaciones-view";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Registra tu reclamo o queja ante FUNDIGSAC de forma rápida, segura y transparente. Recibirás un código de registro y una respuesta por el medio que elijas.",
  alternates: { canonical: "/reclamaciones" },
};

/** El registro depende de la base de datos: se evalúa en cada petición, no en el build. */
export const dynamic = "force-dynamic";

export default function ComplaintsPage() {
  const registryEnabled = Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV !== "production";
  return (
    <ClaimsView
      hero={claimsHeroImage()}
      closing={claimsClosingImage()}
      enabled={registryEnabled}
      email={SITE.email}
      phone={site.phone}
      phoneHref={site.phoneHref}
      whatsappNumber={site.whatsappNumber}
    />
  );
}
