import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { JsonLd, breadcrumbList } from "@/shared/seo/json-ld";
import { pageMetadata } from "@/shared/seo/page-metadata";
import { ContactView } from "./contact-view";

export const metadata = pageMetadata({
  title: "Contacto y cotizaciones en Lima",
  description: "Contacta al equipo técnico-comercial de FUNDIGSAC en el Cercado de Lima: teléfono y WhatsApp +51 908 849 664, correo y formulario de consulta.",
  path: "/contacto",
});

// Solo datos confirmados. La calle, el horario y el correo se añaden cuando la empresa los valide (Report/competencia/PLAN_SEO.md, V-02 a V-05).
const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#local`,
  name: SITE.name,
  url: `${SITE.url}/contacto`,
  parentOrganization: { "@id": `${SITE.url}/#organizacion` },
  telephone: site.phone,
  address: { "@type": "PostalAddress", addressLocality: "Cercado de Lima", addressRegion: "Lima", addressCountry: "PE" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[breadcrumbList([{ name: "Inicio", path: "/" }, { name: "Contacto", path: "/contacto" }], SITE.url), LOCAL_BUSINESS]} />
      <ContactView site={{ email: SITE.email, phone: site.phone, phoneHref: site.phoneHref, whatsappNumber: site.whatsappNumber }} />
    </>
  );
}
