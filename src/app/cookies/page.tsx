import type { Metadata } from "next";
import { ScreenW20 } from "@/screens/w20";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre las cookies que utiliza el sitio web de FUNDIGSAC.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <ScreenW20 />;
}
