import type { Metadata } from "next";
import { ScreenW12 } from "@/screens/w12";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a FUNDIGSAC: ingeniería y suministro de hierro dúctil para infraestructura en el Perú.",
  alternates: { canonical: "/nosotros" },
};

export default function AboutPage() {
  return <ScreenW12 />;
}
