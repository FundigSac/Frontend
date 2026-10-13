import type { Metadata } from "next";
import { FloatingActions } from "@/app/_landing/floating-actions";
import "@/app/landing.css";
import "./agricultura.css";
import { AgricultureSections } from "./sections";

export const metadata: Metadata = {
  title: "Agricultura",
  description: "Válvulas de compuerta, ventosas, filtros Y, tubería HDPE y válvulas de retención FUNDIGSAC para sistemas de riego agrícola.",
  alternates: { canonical: "/industrias/agricultura" },
};

export default function AgriculturePage() {
  return (
    <>
      <AgricultureSections />
      <FloatingActions />
    </>
  );
}
