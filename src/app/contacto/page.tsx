import type { Metadata } from "next";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { ContactView } from "./contact-view";

export const metadata: Metadata = {
  title: "Contacto y cotizaciones en Lima",
  description: "Contacta al equipo técnico-comercial de FUNDIGSAC en el Cercado de Lima: teléfono y WhatsApp +51 908 849 664, correo cotizaciones@fundigsac.com y formulario.",
  alternates: { canonical: "/contacto" },
};

type Props = { searchParams: Promise<{ motivo?: string | string[]; documento?: string | string[] }> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const motivo = first(params.motivo);
  const documento = first(params.documento)?.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
  return (
    <ContactView
      site={{ email: SITE.email, phone: site.phone, phoneHref: site.phoneHref, whatsappNumber: site.whatsappNumber }}
      prefill={{
        reason: motivo === "documentacion" || motivo === "reunion" ? motivo : documento ? "documentacion" : undefined,
        document: documento || undefined,
      }}
      hero="/media/contacto/sede.webp"
      closing="/media/contacto/equipo.webp"
    />
  );
}
