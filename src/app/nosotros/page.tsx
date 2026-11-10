import type { Metadata } from "next";
import { AboutView } from "./about-view";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a FUNDIGSAC: empresa peruana especializada en soluciones en hierro dúctil para agua, alcantarillado e infraestructura urbana.",
  alternates: { canonical: "/nosotros" },
};

export default function AboutPage() {
  return <AboutView />;
}
