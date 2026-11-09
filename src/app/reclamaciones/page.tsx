import type { Metadata } from "next";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { ClaimsView } from "../_legal/reclamaciones-view";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Presenta tu reclamo o queja ante FUNDIGSAC (Ley N.° 29571). Te respondemos por escrito, por el medio que elijas, en un plazo máximo de 15 días hábiles.",
  alternates: { canonical: "/reclamaciones" },
};

export default function ComplaintsPage() {
  return <ClaimsView email={SITE.email} phoneHref={site.phoneHref} whatsappNumber={site.whatsappNumber} />;
}
