import type { Metadata } from "next";
import { CookiesView } from "../_legal/cookies-view";
import { cookiesHeroImage, cookiesInfoImages } from "../_legal/images";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies y almacenamiento local usa el sitio de FUNDIGSAC, para qué sirven, cuánto duran y cómo aceptar, rechazar o retirar tu consentimiento.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <CookiesView hero={cookiesHeroImage()} info={cookiesInfoImages()} />;
}
