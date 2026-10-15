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

export default function ComplaintsPage() {
  return (
    <ClaimsView
      hero={claimsHeroImage()}
      closing={claimsClosingImage()}
      email={SITE.email}
      phoneHref={site.phoneHref}
      whatsappNumber={site.whatsappNumber}
    />
  );
}
