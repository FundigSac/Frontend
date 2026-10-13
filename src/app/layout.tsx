import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_INDEXABLE } from "@/shared/config/env";
import { SITE } from "@/shared/config/site";
import { SiteFooter } from "@/shared/layout/site-footer";
import { CookieBanner } from "@/shared/layout/cookie-banner";
import { SiteHeader } from "@/shared/layout/site-header";
import { JsonLd } from "@/shared/seo/json-ld";
import { ToastProvider } from "@/shared/ui/toast";
import "./globals.css";

// Pesos 400/600/700, igual que el export de Stitch (font-medium cae a 400 como en el diseño original).
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter", display: "swap", adjustFontFallback: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "FUNDIGSAC | Hierro dúctil · Saneamiento e Infraestructura", template: "%s | FUNDIGSAC" },
  description: "Válvulas, tuberías, marcos y tapas de hierro dúctil para redes de agua potable, saneamiento y minería en el Perú.",
  robots: { index: SITE_INDEXABLE, follow: SITE_INDEXABLE },
  openGraph: { type: "website", locale: "es_PE", siteName: SITE.name, url: SITE.url },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-background font-body-default text-body-default text-on-surface antialiased">
        <ToastProvider>
          <JsonLd
            data={[
              { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, legalName: SITE.legalName, url: SITE.url, logo: `${SITE.url}/brand/fundigsac.svg`, email: SITE.email },
              { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "es-PE", potentialAction: { "@type": "SearchAction", target: `${SITE.url}/buscar?q={search_term_string}`, "query-input": "required name=search_term_string" } },
            ]}
          />
          <a className="skip-link" href="#contenido">Saltar al contenido</a>
          <SiteHeader />
          <div id="contenido">{children}</div>
          <SiteFooter />
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
