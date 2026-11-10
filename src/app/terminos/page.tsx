import type { Metadata } from "next";
import { legalClosingImage, legalHeroImage } from "../_legal/images";
import { TermsView } from "../_legal/terminos-view";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso del sitio web de FUNDIGSAC: acceso, propiedad intelectual, enlaces a terceros y legislación aplicable.",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return <TermsView hero={legalHeroImage()} closing={legalClosingImage()} />;
}
