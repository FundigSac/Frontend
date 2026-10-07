import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://fundigsac.com"),
  title: { default: "FUNDIGSAC | Componentes para redes hidráulicas", template: "%s | FUNDIGSAC" },
  description: "Válvulas, sistemas HDPE y equipos para infraestructura hidráulica. Explora el catálogo y solicita una cotización.",
  openGraph: { type: "website", locale: "es_PE", siteName: "FUNDIGSAC" },
};

const organization = { "@context": "https://schema.org", "@type": "Organization", name: "FUNDIGSAC", url: "https://fundigsac.com/", telephone: "+51908849664", email: "ventas@fundigsac.com" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={inter.variable}
    >
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/><a className="skip-link" href="#contenido">Saltar al contenido</a><SiteHeader/><div id="contenido">{children}</div><SiteFooter/></body>
    </html>
  );
}
