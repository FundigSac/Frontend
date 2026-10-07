import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Solicitar cotización",
  description: "Prepara tu consulta de productos FUNDIGSAC con medidas y cantidades y envíala por WhatsApp.",
  alternates: { canonical: "/cotizar" },
};

export default function QuotePage() {
  return <main>
    <PageHero
      compact
      crumbs={[{ label: "Solicitar cotización" }]}
      eyebrow="Cotización"
      title="Solicitar cotización"
      lead="Revisa los productos de tu lista, completa tus datos y abre una consulta por WhatsApp con todo listo."
      actions={<Link className="button button-outline" href="/productos">Agregar más productos <ArrowRight size={18} /></Link>}
    />
    <section className="x-section x-quote">
      <div className="container">
        <ol className="x-quote-steps">
          <li><div><strong>Elige productos</strong><span>Desde cada ficha, con su medida.</span></div></li>
          <li><div><strong>Revisa cantidades</strong><span>Ajusta unidades o quita lo que no necesites.</span></div></li>
          <li><div><strong>Envía por WhatsApp</strong><span>Te confirmamos precio y disponibilidad.</span></div></li>
        </ol>
        <Reveal><QuoteForm /></Reveal>
      </div>
    </section>
  </main>;
}
