import { pageMetadata } from "@/shared/seo/page-metadata";
import { ComponentsCarousel } from "./_landing/components-carousel";
import { HeroCarousel } from "./_landing/hero-carousel";
import { HomeIntro } from "./_landing/intro";
import { BackingSection, DocsSection, LocationSection } from "./_landing/home-sections";
import { FloatingActions } from "./_landing/floating-actions";
import { SectorsBand } from "./_landing/sectors-band";
import { SmoothScroll } from "./_landing/smooth-scroll";
import "./landing.css";

export const metadata = pageMetadata({
  title: "Válvulas y tuberías de hierro dúctil en Perú",
  description: "Válvulas, tubería de hierro dúctil, marcos y tapas para agua y saneamiento. Revisa cada ficha técnica y solicita tu cotización a FUNDIGSAC desde Lima.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="lp">
      <HomeIntro />
      <HeroCarousel />

      <section className="lp-components" aria-labelledby="lp-components-title">
        <ComponentsCarousel />
      </section>

      <SectorsBand />
      <BackingSection />
      <DocsSection />
      <LocationSection />
      <FloatingActions />
      <SmoothScroll />
    </main>
  );
}
