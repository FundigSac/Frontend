import { pageMetadata } from "@/shared/seo/page-metadata";
import { FloatingActions } from "./_landing/floating-actions";
import { HomeHero } from "./_landing/hero";
import { BackingSection, DocsSection, FamiliesSection, LocationSection, SectorsSection } from "./_landing/home-sections";
import "./landing.css";

export const metadata = pageMetadata({
  title: "Válvulas y tuberías de hierro dúctil en Perú",
  description: "Válvulas, tubería de hierro dúctil, marcos y tapas para agua y saneamiento. Revisa cada ficha técnica y solicita tu cotización a FUNDIGSAC desde Lima.",
  path: "/",
});

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
