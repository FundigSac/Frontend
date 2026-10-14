import type { Metadata } from "next";
import { ChevronRight, FileText, Info, Mail, MessageCircle, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { SITE } from "@/shared/config/site";
import { site, whatsappLink } from "@/lib/site-info";
import { ClaimForm } from "../_legal/claim-form";
import { LegalCta, LegalHero } from "../_legal/legal-parts";
import { legalClosingImage, legalHeroImage } from "../_legal/images";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Registra tu reclamo o queja ante FUNDIGSAC de forma rápida, segura y transparente. Recibirás un código de registro y una respuesta por el medio que elijas.",
  alternates: { canonical: "/reclamaciones" },
};

const HOW = [
  { icon: FileText, title: "1. Completa el formulario", text: "Registra tu reclamo o queja con toda la información solicitada." },
  { icon: Mail, title: "2. Recibimos tu solicitud", text: "Te enviaremos un número de registro por correo electrónico." },
  { icon: Search, title: "3. Evaluamos tu caso", text: "Nuestro equipo analizará la información y se pondrá en contacto contigo." },
  { icon: ShieldCheck, title: "4. Te brindamos una respuesta", text: "Recibirás una respuesta en el menor tiempo posible, por el medio que elijas." },
] as const;

const HELP = [
  { icon: Phone, title: "Llámanos", text: "Nuestro equipo te orientará.", href: site.phoneHref, external: false },
  { icon: Mail, title: "Escríbenos", text: SITE.email, href: `mailto:${SITE.email}`, external: false },
  { icon: MessageCircle, title: "WhatsApp", text: "Contáctanos por WhatsApp.", href: whatsappLink("Hola FUNDIGSAC. Necesito ayuda con mi reclamo o queja."), external: true },
] as const;

/** El registro depende de la base de datos: se evalúa en cada petición, no en el build. */
export const dynamic = "force-dynamic";

export default function ComplaintsPage() {
  const registryEnabled = Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV !== "production";
  return (
    <main className="lp lg">
      <LegalHero
        modifier="lg-hero--claims"
        crumb="Libro de reclamaciones"
        title="Libro de Reclamaciones"
        lead="Tu opinión nos ayuda a mejorar. Registra aquí tu reclamo o queja y nos comprometemos a brindarte una pronta atención."
        image={legalHeroImage()}
        alt="Planta de tratamiento de agua frente a las montañas"
      >
        <ul className="lg-hero__panel">
          <li><ShieldCheck aria-hidden="true" size={30} strokeWidth={1.5} /> Tu voz nos importa</li>
          <li><Users aria-hidden="true" size={30} strokeWidth={1.5} /> Atención clara y transparente</li>
          <li><FileText aria-hidden="true" size={30} strokeWidth={1.5} /> Comprometidos con la mejora continua</li>
        </ul>
      </LegalHero>

      <div className="lp-shell" style={{ paddingBottom: "clamp(40px, 6vw, 84px)" }}>
        <div className="lg-claims">
          <ClaimForm enabled={registryEnabled} email={SITE.email} phone={site.phone} whatsapp={whatsappLink("Hola FUNDIGSAC. Quisiera presentar un reclamo o queja.")} />

          <aside className="lg-side" aria-label="Información sobre el libro de reclamaciones">
            <div className="lg-side__card lg-side__card--blue">
              <FileText aria-hidden="true" size={56} strokeWidth={1.3} />
              <div>
                <h3>Tu voz nos importa</h3>
                <p>En FUNDIGSAC, cada reclamo o queja es una oportunidad para mejorar nuestros productos y servicios.</p>
              </div>
            </div>

            <div className="lg-side__card">
              <h3>¿Cómo funciona?</h3>
              <ol className="lg-how">
                {HOW.map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <span className="lg-how__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></span>
                    <div><strong>{title}</strong><span>{text}</span></div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg-side__card lg-side__card--amber">
              <h3><Info aria-hidden="true" size={20} strokeWidth={1.8} /> Información importante</h3>
              <ul>
                <li>Este formulario es únicamente para reclamos y quejas sobre nuestros productos y servicios.</li>
                <li>Completa la información de manera veraz y detallada.</li>
                <li>Nos comunicaremos contigo a través del medio seleccionado.</li>
                <li>El plazo de atención podrá variar según la naturaleza del caso.</li>
              </ul>
            </div>

            <div className="lg-side__card">
              <h3>¿Necesitas ayuda?</h3>
              <p>Si tienes consultas adicionales, puedes comunicarte con nuestro equipo de atención al cliente.</p>
              <ul className="lg-help">
                {HELP.map(({ icon: Icon, title, text, href, external }) => (
                  <li key={title}>
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      <Icon aria-hidden="true" size={24} strokeWidth={1.6} />
                      <div><strong>{title}</strong><span>{text}</span></div>
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg-side__card lg-side__card--pledge">
              <ShieldCheck aria-hidden="true" size={40} strokeWidth={1.5} />
              <div>
                <h3>Nuestro compromiso</h3>
                <p>Gestionamos cada reclamo o queja con responsabilidad, transparencia y respeto, para seguir construyendo relaciones de confianza.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LegalCta
        eyebrow="¿Prefieres hablar directamente?"
        title="Estamos para ayudarte."
        text="Nuestro equipo de atención al cliente puede orientarte sobre el estado de tu reclamo o resolver tus consultas."
        cta="Contactar ahora"
        href="/contacto"
        image={legalClosingImage()}
      />
    </main>
  );
}
