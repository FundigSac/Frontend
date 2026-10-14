import type { Metadata } from "next";
import { legalHeroImage } from "../_legal/images";
import { PrivacyView } from "../_legal/privacidad-view";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo FUNDIGSAC recopila, usa, protege y conserva tus datos personales, y cómo ejercer tus derechos de acceso, rectificación, cancelación y oposición.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return <PrivacyView hero={legalHeroImage()} />;
}
