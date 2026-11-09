import type { Metadata } from "next";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { ContactView } from "./contact-view";

export const metadata: Metadata = {
  title: "Contacto y cotizaciones en Lima",
  description: "Contacta al equipo técnico-comercial de FUNDIGSAC en el Cercado de Lima: teléfono y WhatsApp +51 908 849 664, correo cotizaciones@fundigsac.com y formulario.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return <ContactView site={{ email: SITE.email, phone: site.phone, phoneHref: site.phoneHref, whatsappNumber: site.whatsappNumber }} />;
}
