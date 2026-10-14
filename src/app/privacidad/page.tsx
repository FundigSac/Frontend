import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Lock, Mail, ScrollText, ShieldCheck, Users } from "lucide-react";
import { SITE } from "@/shared/config/site";
import { LegalCta, LegalHero, LEGAL_UPDATED } from "../_legal/legal-parts";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo FUNDIGSAC recopila, usa, protege y conserva tus datos personales, y cómo ejercer tus derechos de acceso, rectificación, cancelación y oposición.",
  alternates: { canonical: "/privacidad" },
};

const PILLARS = [
  { icon: ShieldCheck, title: "Legalidad", text: "Tratamos tus datos de forma lícita y transparente." },
  { icon: Users, title: "Finalidad", text: "Usamos tus datos solo para fines específicos y legítimos." },
  { icon: Lock, title: "Seguridad", text: "Implementamos medidas para proteger tu información." },
  { icon: ScrollText, title: "Transparencia", text: "Te informamos de manera clara sobre el tratamiento de tus datos." },
] as const;

const SECTIONS = [
  { title: "Información que recopilamos", text: "Podemos recopilar datos personales que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono, cargo, empresa y cualquier otra información que nos compartas a través de nuestros formularios, correos o canales de contacto." },
  { title: "Uso de la información", text: "Utilizamos tus datos personales para: (i) atender tus consultas y solicitudes, (ii) brindarte información sobre nuestros productos y servicios, (iii) gestionar relaciones comerciales, (iv) enviarte comunicaciones relevantes y (v) mejorar nuestra atención y experiencia de usuario." },
  { title: "Base legal para el tratamiento", text: "Tratamos tus datos personales con tu consentimiento, cuando corresponda, o en base a nuestro interés legítimo para desarrollar actividades comerciales, de comunicación y atención de consultas, conforme a la normativa aplicable de protección de datos personales." },
  { title: "Conservación de los datos", text: "Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades descritas en esta política, o mientras exista una relación comercial activa. Posteriormente, serán eliminados o anonimizados de forma segura." },
  { title: "Derechos del titular", text: "Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO), así como cualquier otro derecho reconocido por la normativa vigente, escribiéndonos a través de nuestros canales de contacto indicados en esta página." },
  { title: "Seguridad de la información", text: "Implementamos medidas técnicas, administrativas y organizativas para proteger tus datos personales contra el acceso no autorizado, pérdida, alteración o divulgación indebida." },
  { title: "Cambios en esta política", text: "Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o en la normativa aplicable. Te recomendamos revisarla periódicamente. Cualquier modificación será publicada en esta misma página." },
] as const;

export default function PrivacyPage() {
  return (
    <main className="lp lg">
      <LegalHero
        crumb="Política de privacidad"
        title="Política de privacidad"
        lead="En FUNDIGSAC protegemos la información personal que nos confías, con un trato responsable, seguro y transparente."
        image="/media/home-v3/hero-planta.webp"
        alt="Planta de tratamiento de agua frente a las montañas"
        wide
      />

      <div className="lp-shell lg-body">
        <div className="lg-intro">
          <div>
            <span className="lg-bar" aria-hidden="true" />
            <h2 className="lg-section-title">Nuestro compromiso con tu privacidad</h2>
            <p className="lg-text">
              En FUNDIGSAC valoramos la confianza de nuestros clientes, proveedores y visitantes. Esta Política de Privacidad explica cómo recopilamos, usamos, protegemos y tratamos tus datos personales, de acuerdo con la normativa vigente en materia de protección de datos en el Perú.
            </p>
          </div>
          <aside className="lg-callout" aria-label="Resumen">
            <span className="lg-callout__icon" aria-hidden="true"><ShieldCheck size={30} strokeWidth={1.6} /></span>
            <div>
              <small>Tratamiento responsable</small>
              <h3>Tu información, protegida</h3>
              <p>Aplicamos medidas técnicas y organizativas para garantizar la seguridad y confidencialidad de tus datos personales.</p>
            </div>
          </aside>
        </div>

        <ul className="lg-pillars">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li className="lg-pillar" key={title}>
              <Icon aria-hidden="true" size={34} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>

        <div className="lg-privacy">
          <ol className="lg-steps">
            {SECTIONS.map((s, i) => (
              <li className="lg-step" key={s.title}>
                <span className="lg-step__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="lg-aside" aria-labelledby="lg-aside-title">
            <div className="lg-aside__media">
              <Image src="/media/home-v3/respaldo-ingeniero.webp" alt="Profesional de FUNDIGSAC revisando documentación técnica" fill quality={70} sizes="(max-width: 900px) 92vw, 400px" />
            </div>
            <span className="lg-bar" style={{ marginTop: 22 }} aria-hidden="true" />
            <h3 id="lg-aside-title" style={{ marginTop: 14 }}>¿Tienes preguntas sobre tu privacidad?</h3>
            <p>Si tienes consultas sobre el tratamiento de tus datos personales o deseas ejercer tus derechos, puedes contactarnos a través de nuestros canales oficiales.</p>
            <Link className="lp-btn lp-btn--solid" href="/contacto">
              Ir al formulario de contacto <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <hr />
            <h4>También puedes</h4>
            <ul className="lg-contact-list">
              <li>
                <Mail aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>Escríbenos por correo</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </li>
              <li>
                <FileText aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>Envía tu solicitud</strong>
                  <span>Indica el tipo de solicitud y tus datos de contacto.</span>
                </div>
              </li>
              <li>
                <CalendarDays aria-hidden="true" size={26} strokeWidth={1.5} />
                <div>
                  <strong>Última actualización</strong>
                  <span>{LEGAL_UPDATED}</span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <LegalCta
        eyebrow="Trabajamos con confianza"
        title="Construyamos proyectos de agua de forma segura y transparente."
        text="Estamos a tu disposición para resolver cualquier consulta y brindarte la información que necesites."
        cta="Solicitar cotización"
        href="/cotizar"
        image="/media/saneamiento/cierre.webp"
      />
    </main>
  );
}
