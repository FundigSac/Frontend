import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { site, whatsappLink } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Cómo presentar un reclamo o queja ante FUNDIGSAC mientras se habilita el registro digital.",
  alternates: { canonical: "/libro-de-reclamos" },
};

const subject = "Reclamo FUNDIGSAC";
const template = [
  "Nombre completo:",
  "Documento de identidad (DNI / RUC):",
  "Teléfono y correo de contacto:",
  "Producto o servicio relacionado:",
  "Fecha del hecho:",
  "Tipo: Reclamo (disconformidad con el producto o servicio) / Queja (malestar sin relación directa con el producto)",
  "Detalle de lo ocurrido:",
  "Lo que solicitas:",
].join("\n");
const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(template)}`;

export default function Complaints() {
  return <main>
    <PageHero
      compact
      crumbs={[{ label: "Libro de reclamaciones" }]}
      eyebrow="Atención al cliente"
      title="Libro de reclamaciones"
      lead="Estamos preparando el registro digital seguro de reclamos. Mientras tanto, puedes presentar el tuyo por los canales de abajo y lo atenderemos."
    />

    <section className="x-section">
      <div className="container x-split x-split--wide-left" style={{ alignItems: "start" }}>
        <div>
          <Reveal><SectionHead eyebrow="Canales de atención" title="Presenta tu reclamo" lead="Usa el asunto «Reclamo FUNDIGSAC» para que lo identifiquemos de inmediato." /></Reveal>
          <div className="x-grid x-grid--2">
            <Reveal><a className="x-contact-card" href={mailto}><span className="x-icon"><Mail size={22} aria-hidden="true" /></span><div className="x-channel"><h3>Por correo</h3><span className="x-val">{site.email}</span><p>Se abre un mensaje con los datos que debes completar.</p></div></a></Reveal>
            <Reveal delay={80}><a className="x-contact-card" href={site.phoneHref}><span className="x-icon"><Phone size={22} aria-hidden="true" /></span><div className="x-channel"><h3>Por teléfono</h3><span className="x-val">{site.phone}</span><p>{site.hours}.</p></div></a></Reveal>
            <Reveal delay={160}><a className="x-contact-card" href={whatsappLink("Hola FUNDIGSAC. Quisiera presentar un reclamo.")} target="_blank" rel="noopener noreferrer"><span className="x-icon"><MessageCircle size={22} aria-hidden="true" /></span><div className="x-channel"><h3>Por WhatsApp</h3><span className="x-val">{site.phone}</span><p>Indica que se trata de un reclamo.</p></div></a></Reveal>
          </div>
        </div>
        <Reveal delay={100}>
          <div className="x-card">
            <h3>Datos que debes incluir</h3>
            <pre className="x-mail-body">{template}</pre>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="x-section x-section--tint">
      <div className="container x-split" style={{ alignItems: "start" }}>
        <Reveal><SectionHead eyebrow="Qué sigue" title="Cómo se atiende" /></Reveal>
        <Reveal delay={100}><ol className="x-steps">
          <li><h3>Recibimos tu solicitud</h3><p>Confirmamos la recepción por el mismo canal que usaste.</p></li>
          <li><h3>Revisamos el caso</h3><p>Verificamos los hechos y los productos involucrados.</p></li>
          <li><h3>Te damos respuesta</h3><p>Comunicamos el resultado y, si corresponde, la solución.</p></li>
        </ol></Reveal>
      </div>
    </section>

    <section className="x-section--tight"><div className="container"><div className="x-note"><p><strong>Registro digital en preparación.</strong> El formulario en línea se habilitará cuando cuente con recepción, acuse y seguimiento verificables.</p></div></div></section>
  </main>;
}
