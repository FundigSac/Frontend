import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AssistantLauncher } from "@/shared/assistant/assistant-launcher";
import { GoogleAnalytics } from "@/shared/analytics/google-analytics";
import { CartHost } from "@/shared/cart/cart-host";
import { SITE_INDEXABLE } from "@/shared/config/env";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { CookieBanner } from "@/shared/layout/cookie-banner";
import { LandingFooter, LandingHeader, SkipLink } from "@/shared/layout/landing-chrome";
import { ScrollToTop } from "@/shared/layout/scroll-to-top";
import { LazyWarmup } from "@/shared/media/lazy-warmup";
import { MotionRoot } from "@/shared/motion/motion-root";
import { JsonLd } from "@/shared/seo/json-ld";
import { SourceGuard } from "@/shared/security/source-guard";
import { ToastProvider } from "@/shared/ui/toast";
import "./globals.css";

// Una sola familia variable con eje de ancho: los títulos usan font-stretch 85 %. La monoespaciada es solo para códigos y medidas.
const plex = IBM_Plex_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Válvulas industriales y tuberías HDPE en Perú | FUNDIGSAC", template: "%s | FUNDIGSAC" },
  description: "Válvulas de compuerta bridadas, check y mariposa, tuberías HDPE y de hierro dúctil, marcos, tapas y accesorios para agua y saneamiento en Perú.",
  robots: { index: SITE_INDEXABLE, follow: SITE_INDEXABLE },
  // Sin `url`: cada página que comparta este bloque heredaría la URL de inicio. La imagen sale de opengraph-image.jpg.
  openGraph: { type: "website", locale: "es_PE", siteName: SITE.name },
  twitter: { card: "summary_large_image" },
  // Propiedad de Search Console (prefijo de URL) del dominio canónico. No es secreto: Google solo comprueba que esté publicada.
  verification: { google: "vW6DdHGIHuwfbfSHuNzvmeeYQh-XdmnFbwzrF2u7b50" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth" className={`${plex.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="bg-background font-body-default text-body-default text-on-surface antialiased">
        <SourceGuard />
        <ToastProvider>
          <JsonLd
            data={[
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${SITE.url}/#organizacion`,
                name: SITE.name,
                legalName: SITE.registeredName,
                // Sin taxID: el RUC configurado no pasa el dígito verificador de SUNAT; se agrega cuando esté confirmado.
                url: SITE.url,
                logo: `${SITE.url}/brand/fundigsac.svg`,
                email: SITE.email,
                telephone: site.phone,
                // Se omite la calle hasta confirmar la dirección: las webs publican direcciones distintas.
                address: { "@type": "PostalAddress", addressLocality: "Cercado de Lima", addressRegion: "Lima", addressCountry: "PE" },
                contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: site.phone, email: SITE.email, areaServed: "PE", availableLanguage: ["es"] },
                // Perfiles oficiales publicados en fundigsac.com.
                sameAs: [site.instagram, site.facebook],
              },
              { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE.url}/#sitio`, name: SITE.name, url: SITE.url, inLanguage: "es-PE", publisher: { "@id": `${SITE.url}/#organizacion` } },
            ]}
          />
          <MotionRoot />
          <SkipLink />
          <ScrollToTop />
          <LandingHeader />
          <div id="contenido">{children}</div>
          <LandingFooter />
          <CookieBanner />
          <GoogleAnalytics />
          <AssistantLauncher />
          <CartHost />
          <LazyWarmup />
        </ToastProvider>
      </body>
    </html>
  );
}
