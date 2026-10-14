import type { Metadata } from "next";
import { FloatingActions } from "@/app/_landing/floating-actions";
import "@/app/landing.css";
import "../agricultura/agricultura.css";
import "../_sector/sector.css";
import { MiningSections } from "./sections";

export const metadata: Metadata = {
  title: "Minería",
  description: "Válvulas de compuerta, tuberías HDPE, acoples y bridas FUNDIGSAC de hierro dúctil para agua de proceso, pulpas, relaves y control de procesos mineros.",
  alternates: { canonical: "/industrias/mineria" },
};

export default function MiningPage() {
  return (
    <>
      <MiningSections />
      <FloatingActions />
    </>
  );
}
