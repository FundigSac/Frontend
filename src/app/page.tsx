import { ComponentsCarousel } from "./_landing/components-carousel";
import { HeroCarousel } from "./_landing/hero-carousel";
import { BackingSection, DocsSection } from "./_landing/home-sections";
import { SectorsBand } from "./_landing/sectors-band";
import "./landing.css";

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
    </main>
  );
}
