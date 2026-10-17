import type { Metadata } from "next";
import { ComponentsCarousel } from "./_landing/components-carousel";
import { HeroCarousel } from "./_landing/hero-carousel";
import { BackingSection, DocsSection, LocationSection } from "./_landing/home-sections";
import { FloatingActions } from "./_landing/floating-actions";
import { SectorsBand } from "./_landing/sectors-band";
import "./landing.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <main className="lp">
      <HeroCarousel />

      <section className="lp-components" aria-labelledby="lp-components-title">
        <ComponentsCarousel />
      </section>

      <SectorsBand />
      <BackingSection />
      <DocsSection />
      <LocationSection />
      <FloatingActions />
    </main>
  );
}
