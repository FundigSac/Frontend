import type { Metadata } from "next";
import { FloatingActions } from "./_landing/floating-actions";
import { HomeHero } from "./_landing/hero";
import { BackingSection, DocsSection, FamiliesSection, LocationSection, SectorsSection } from "./_landing/home-sections";
import "./landing.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <main className="lp">
      <HomeHero />
      <FamiliesSection />
      <SectorsSection />
      <BackingSection />
      <DocsSection />
      <LocationSection />
      <FloatingActions />
    </main>
  );
}
