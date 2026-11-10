import type { Metadata } from "next";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { DeletionView } from "../_legal/deletion-view";
import { deletionClosingImage, deletionHeroImage } from "../_legal/images";

export const metadata: Metadata = {
  title: "Eliminar cuenta y datos personales",
  description: "Cómo solicitar la eliminación de tu cuenta FUNDIGSAC y de tus datos personales: qué se borra, qué se conserva por ley y plazos de respuesta (Ley N.° 29733).",
  alternates: { canonical: "/eliminar-cuenta" },
};

export default function AccountDeletionPage() {
  return (
    <DeletionView
      hero={deletionHeroImage()}
      closing={deletionClosingImage()}
      email={SITE.email}
      phoneHref={site.phoneHref}
      whatsappNumber={site.whatsappNumber}
    />
  );
}
