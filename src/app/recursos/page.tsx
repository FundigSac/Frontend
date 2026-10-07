import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, MessageCircle, Ruler } from "lucide-react";
import { CtaBand, PageHero, SectionHead } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { whatsappLink } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Guía para cotizar, glosario técnico (DN, PN, SDR, termofusión, brida) y preguntas frecuentes sobre productos FUNDIGSAC.",
  alternates: { canonical: "/recursos" },
};

const checklist = [
  "Producto o código de referencia (por ejemplo VCSW, AGR o HDL 200-2M).",
  "Diámetro nominal (DN) o diámetro exterior del tubo en milímetros.",
  "Clase de presión (PN) o serie del tubo (SDR).",
  "Tipo de conexión: brida, termofusión, acople, rosca o embone.",
  "Cantidad por medida y fecha en que necesitas el material.",
  "Ciudad o lugar de la obra y datos de contacto.",
];

const glossary = [
  { term: "DN", tag: "Diámetro nominal", text: "Designación de tamaño de una tubería o accesorio. No es una medida exacta: sirve para que piezas del mismo DN encajen entre sí." },
  { term: "PN", tag: "Presión nominal", text: "Clase de presión de la pieza, expresada en bar. Una pieza PN16 está pensada para una presión nominal de 16 bar." },
  { term: "SDR", tag: "Relación dimensional", text: "Cociente entre el diámetro exterior y el espesor de pared del tubo. A menor SDR, mayor espesor y mayor resistencia a la presión." },
  { term: "Termofusión", tag: "Unión de PE", text: "Soldadura de tubos y accesorios de polietileno: se calientan los extremos con una placa calefactora y se unen bajo presión." },
  { term: "Electrofusión", tag: "Unión de PE", text: "Unión con accesorios que llevan una resistencia eléctrica integrada. Una máquina aplica la tensión y el accesorio se suelda al tubo." },
  { term: "Brida", tag: "Conexión", text: "Unión desmontable con dos caras atornilladas. Debe coincidir la norma (ISO, ANSI, DIN) y la clase de presión entre ambas piezas." },
  { term: "Acople gran rango", tag: "Unión", text: "Acople que se adapta a un intervalo de diámetros exteriores, útil para reparar o unir tubos de distinta procedencia." },
  { term: "Junta flexible", tag: "Absorción", text: "Pieza de caucho con bridas que absorbe vibraciones y pequeños movimientos entre tuberías y equipos." },
  { term: "Ventosa", tag: "Válvula de aire", text: "Válvula que expulsa o admite aire en la tubería para evitar bolsas de aire y vacíos." },
  { term: "SCH40", tag: "Serie de espesor", text: "Serie de espesor de pared (schedule 40) usada en tubería y codos de acero." },
];

const faqs = [
  { q: "¿Cómo solicito una cotización?", a: "Agrega los productos a tu lista desde cada ficha, indica medida y cantidad y envía el mensaje por WhatsApp. También puedes escribirnos por correo o llamarnos." },
  { q: "¿Por qué no veo precios en todos los productos?", a: "El precio y la disponibilidad cambian con el tiempo y con la medida. Los confirmamos al cotizar para darte información vigente." },
  { q: "¿Las medidas del catálogo son definitivas?", a: "Las medidas provienen de nuestros documentos de referencia. Antes de comprar confirmamos contigo la medida, la clase de presión y la compatibilidad con tu red." },
  { q: "¿Tienen fichas técnicas?", a: "Podemos facilitarte la documentación de una referencia cuando la solicitas. Indícanos el producto y la medida desde la página de contacto." },
  { q: "¿Pueden fabricar una pieza a medida?", a: "Sí evaluamos piezas a medida. Envíanos plano o descripción, cantidad y plazo para revisar la factibilidad." },
  { q: "¿Cómo elijo entre SDR11 y SDR17?", a: "SDR11 tiene mayor espesor de pared que SDR17 y soporta mayor presión. En nuestros accesorios HDPE la serie depende de la medida; confírmala con el equipo según la presión de tu red." },
];

export default function Resources() {
  return <main>
    <PageHero
      crumbs={[{ label: "Recursos" }]}
      eyebrow="Guías y consulta técnica"
      title="Recursos para elegir y cotizar mejor"
      lead="Una guía rápida para preparar tu cotización, un glosario con los términos que verás en el catálogo y respuestas a las dudas más comunes."
      actions={<><Link className="button" href="/cotizar">Preparar cotización <ArrowRight size={18} /></Link><a className="button button-outline" href="#glosario">Ir al glosario</a></>}
    />

    <section className="x-section">
      <div className="container x-split x-split--wide-left" style={{ alignItems: "start" }}>
        <Reveal>
          <SectionHead eyebrow="Guía rápida" title="Qué datos enviar para cotizar" lead="Con esta información podemos confirmar tu pedido sin idas y vueltas." />
          <ul className="x-check">{checklist.map(item => <li key={item}>{item}</li>)}</ul>
        </Reveal>
        <Reveal delay={120}>
          <div className="x-card"><span className="x-icon"><ClipboardList size={22} aria-hidden="true" /></span><h3>¿Tienes una lista de materiales?</h3><p>Envíala completa y te devolvemos las referencias confirmadas, con precio y disponibilidad.</p><Link className="x-more" href="/cotizar">Preparar cotización <ArrowRight size={16} aria-hidden="true" /></Link></div>
        </Reveal>
      </div>
    </section>

    <section className="x-section x-section--tint" id="glosario" style={{ scrollMarginTop: 90 }}>
      <div className="container">
        <Reveal><SectionHead eyebrow="Glosario técnico" title="Términos que verás en el catálogo" /></Reveal>
        <div className="x-terms x-terms--3">{glossary.map((g, i) => <Reveal key={g.term} delay={(i % 3) * 70}><dl><dt>{g.term}<small>{g.tag}</small></dt><dd>{g.text}</dd></dl></Reveal>)}</div>
      </div>
    </section>

    <section className="x-section" id="preguntas" style={{ scrollMarginTop: 90 }}>
      <div className="container x-split x-split--wide-left" style={{ alignItems: "start" }}>
        <Reveal><SectionHead eyebrow="Preguntas frecuentes" title="Respuestas rápidas" lead="¿No encuentras la tuya? Escríbenos y te respondemos." />
          <p><a className="text-link" href={whatsappLink("Hola FUNDIGSAC. Tengo una consulta técnica.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" /> Consultar por WhatsApp</a></p></Reveal>
        <div className="x-faq">{faqs.map(f => <Reveal key={f.q}><details><summary>{f.q}</summary><div><p>{f.a}</p></div></details></Reveal>)}</div>
      </div>
    </section>

    <section className="x-section x-section--tint">
      <div className="container x-grid x-grid--2">
        <Reveal><article className="x-card"><span className="x-icon"><FileText size={22} aria-hidden="true" /></span><h3>Fichas técnicas y documentación</h3><p>Las publicaremos cuando sus versiones y permisos de distribución estén verificados. Mientras tanto, pídenos la ficha de la referencia que te interesa.</p><Link className="x-more" href="/contacto">Solicitar documentación <ArrowRight size={16} aria-hidden="true" /></Link></article></Reveal>
        <Reveal delay={100}><article className="x-card"><span className="x-icon"><Ruler size={22} aria-hidden="true" /></span><h3>Ayuda para elegir la medida</h3><p>Si no sabes qué DN, PN o SDR necesitas, descríbenos tu red y te orientamos.</p><Link className="x-more" href="/contacto">Hablar con el equipo <ArrowRight size={16} aria-hidden="true" /></Link></article></Reveal>
      </div>
    </section>

    <CtaBand title="¿Listo para cotizar?" text="Arma tu lista en minutos y envíala por WhatsApp." primary={{ href: "/productos", label: "Explorar catálogo" }} secondary={{ href: "/cotizar", label: "Ir a mi cotización" }} />
  </main>;
}
