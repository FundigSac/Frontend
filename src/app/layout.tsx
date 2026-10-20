import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AssistantLauncher } from "@/shared/assistant/assistant-launcher";
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

// Pesos 400/600/700, igual que el export de Stitch (font-medium cae a 400 como en el diseño original).
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter", display: "swap", adjustFontFallback: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Válvulas, tuberías y tapas de hierro dúctil | FUNDIGSAC", template: "%s | FUNDIGSAC" },
  description: "Válvulas, tuberías, marcos y tapas de hierro dúctil para redes de agua potable, saneamiento, minería y riego en el Perú. Atención comercial en Lima.",
  robots: { index: SITE_INDEXABLE, follow: SITE_INDEXABLE },
  // Sin `url`: cada página que comparta este bloque heredaría la URL de inicio. La imagen sale de opengraph-image.jpg.
  openGraph: { type: "website", locale: "es_PE", siteName: SITE.name },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
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
                taxID: SITE.ruc,
                url: SITE.url,
                logo: `${SITE.url}/brand/fundigsac.svg`,
                email: SITE.email,
                telephone: site.phone,
                address: { "@type": "PostalAddress", streetAddress: "Jirón Pacasmayo Mz. E Lt. 12", addressLocality: "Cercado de Lima", addressRegion: "Lima", addressCountry: "PE" },
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
          <AssistantLauncher />
          <CartHost />
          <LazyWarmup />
        </ToastProvider>
      </body>
    </html>
  );
}
