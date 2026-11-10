import type { Metadata } from "next";
import { FloatingActions } from "@/app/_landing/floating-actions";
import "@/app/landing.css";
import "../agricultura/agricultura.css";
import "../_sector/sector.css";
import { SanitationSections } from "./sections";

export const metadata: Metadata = {
  title: "Hierro dúctil para agua potable y saneamiento",
  description: "Válvulas de compuerta, marcos y tapas, tuberías y acoples de hierro dúctil para redes de agua potable, alcantarillado sanitario y plantas de tratamiento.",
  alternates: { canonical: "/industrias/saneamiento" },
};

export default function SanitationPage() {
  return (
    <>
      <SanitationSections />
      <FloatingActions />
    </>
  );
}
