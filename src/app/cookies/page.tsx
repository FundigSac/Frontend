import type { Metadata } from "next";
import { CookiesView } from "../_legal/cookies-view";
import { legalHeroImage } from "../_legal/images";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies utiliza el sitio web de FUNDIGSAC, para qué sirven y cómo gestionar tus preferencias.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <CookiesView hero={legalHeroImage()} />;
}
