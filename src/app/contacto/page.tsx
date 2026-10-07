import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ui/contact-form";
import { PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { site, whatsappLink } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a FUNDIGSAC por teléfono, WhatsApp o correo para cotizaciones, consultas técnicas y fichas de producto. Cercado de Lima, Perú.",
  alternates: { canonical: "/contacto" },
};

export default function Contact() {
  return <main>
    <PageHero
      compact
      crumbs={[{ label: "Contacto" }]}
      eyebrow="Atención comercial"
      title="Hablemos de tu requerimiento"
      lead="Indícanos producto, medida y cantidad. Te respondemos con las referencias confirmadas, precio y disponibilidad."
      actions={<><a className="button" href={whatsappLink("Hola FUNDIGSAC. Quisiera consultar por un producto.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Abrir WhatsApp</a><a className="button button-outline" href={site.phoneHref}><Phone size={18} aria-hidden="true" /> Llamar</a></>}
    />

    <section className="x-section">
      <div className="container x-split x-split--wide-left" style={{ alignItems: "start" }}>
        <div>
          <Reveal><SectionHead eyebrow="Canales directos" title="Elige cómo prefieres escribirnos" /></Reveal>
          <div className="x-grid x-grid--2">
            <Reveal><a className="x-contact-card" href={site.phoneHref}><span className="x-icon"><Phone size={22} aria-hidden="true" /></span><div><h3>Teléfono</h3><span className="x-val">{site.phone}</span><p>Atención directa con el equipo.</p></div></a></Reveal>
            <Reveal delay={80}><a className="x-contact-card" href={whatsappLink("Hola FUNDIGSAC. Quisiera consultar por un producto.")} target="_blank" rel="noopener noreferrer"><span className="x-icon"><MessageCircle size={22} aria-hidden="true" /></span><div><h3>WhatsApp</h3><span className="x-val">{site.phone}</span><p>Envía medidas y cantidades por mensaje.</p></div></a></Reveal>
            <Reveal delay={160}><a className="x-contact-card" href={`mailto:${site.email}`}><span className="x-icon"><Mail size={22} aria-hidden="true" /></span><div><h3>Correo</h3><span className="x-val">{site.email}</span><p>Ideal para listas de materiales.</p></div></a></Reveal>
            <Reveal delay={240}><div className="x-contact-card"><span className="x-icon"><Clock size={22} aria-hidden="true" /></span><div><h3>Horario</h3><span className="x-val">{site.hours}</span><p>Hora de Perú.</p></div></div></Reveal>
          </div>
          <Reveal delay={120}><a className="x-contact-card x-contact-card--wide" href={site.mapsUrl} target="_blank" rel="noopener noreferrer"><span className="x-icon"><MapPin size={22} aria-hidden="true" /></span><div><h3>Dirección</h3><span className="x-val">{site.address}</span><p>Abrir en Google Maps <ArrowRight size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} /></p></div></a></Reveal>
        </div>
        <Reveal delay={100}><ContactForm /></Reveal>
      </div>
    </section>

    <section className="x-section x-section--tint">
      <div className="container x-split" style={{ alignItems: "start" }}>
        <Reveal><SectionHead eyebrow="Para responderte más rápido" title="Incluye estos datos en tu mensaje" lead="Cuanta más información, más rápido confirmamos tu pedido." /></Reveal>
        <Reveal delay={100}><ul className="x-check"><li>Producto o código de referencia.</li><li>Diámetro nominal (DN) o diámetro exterior del tubo.</li><li>Clase de presión (PN) o serie (SDR), si la conoces.</li><li>Cantidad y fecha en que necesitas el material.</li><li>Tu empresa, ciudad y un teléfono de contacto.</li></ul><p style={{ marginTop: 20 }}><Link className="text-link" href="/cotizar">¿Ya elegiste productos? Prepara tu cotización <ArrowRight size={16} /></Link></p></Reveal>
      </div>
    </section>
  </main>;
}
