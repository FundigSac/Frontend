import type { Metadata } from "next";
import { ScreenW19 } from "@/screens/w19";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y tratamiento de datos personales de FUNDIGSAC.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return <ScreenW19 />;
}
