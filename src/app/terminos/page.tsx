import type { Metadata } from "next";
import Link from "next/link";
import { LegalCta, LegalHero, LEGAL_UPDATED } from "../_legal/legal-parts";
import { LegalToc, type TocItem } from "../_legal/toc";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso del sitio web de FUNDIGSAC: acceso, propiedad intelectual, enlaces a terceros y legislación aplicable.",
  alternates: { canonical: "/terminos" },
};

const SECTIONS = [
  { id: "aceptacion", label: "Aceptación de los términos", text: "Al acceder y utilizar este sitio web, usted acepta cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, le recomendamos no utilizar este sitio." },
  { id: "uso", label: "Uso del sitio web", text: "Este sitio web tiene como finalidad proporcionar información sobre nuestros productos, soluciones y servicios. Usted se compromete a utilizarlo de manera lícita, responsable y de acuerdo con los presentes términos, sin realizar actividades que puedan afectar su funcionamiento, seguridad o disponibilidad." },
  { id: "productos", label: "Información de productos", text: "Nos esforzamos por mantener la información de productos, especificaciones técnicas y demás contenidos actualizada y precisa. Sin embargo, esta información tiene carácter referencial y puede ser modificada sin previo aviso. Para detalles específicos, le recomendamos contactar a nuestro equipo comercial." },
  { id: "propiedad", label: "Propiedad intelectual", text: "Todos los contenidos de este sitio web, incluyendo textos, imágenes, logotipos, gráficos, fichas técnicas, íconos, diseños y demás materiales, son propiedad de FUNDIGSAC o de sus licenciantes, y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado." },
  { id: "enlaces", label: "Enlaces a terceros", text: "Este sitio puede contener enlaces a sitios web de terceros con fines informativos. FUNDIGSAC no se responsabiliza por el contenido, políticas o prácticas de dichos sitios, los cuales están fuera de nuestro control." },
  { id: "responsabilidad", label: "Limitación de responsabilidad", text: "FUNDIGSAC no será responsable por daños directos, indirectos, incidentales o consecuentes que puedan derivarse del uso de este sitio web, de la imposibilidad de acceder al mismo o del uso de la información contenida en él." },
  { id: "privacidad", label: "Privacidad de la información", text: null },
  { id: "modificaciones", label: "Modificaciones", text: "Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigencia desde su publicación en este sitio web. Le recomendamos revisar esta sección periódicamente." },
  { id: "legislacion", label: "Legislación aplicable", text: "Estos Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia relacionada con el uso de este sitio será resuelta en las instancias competentes de Lima, Perú." },
  { id: "contacto", label: "Contacto", text: "Si tienes alguna consulta sobre estos Términos y Condiciones, puedes comunicarte con nosotros a través de nuestros canales de contacto." },
] as const;

const TOC: readonly TocItem[] = SECTIONS.map((s, i) => ({ id: s.id, number: String(i + 1).padStart(2, "0"), label: s.label }));

export default function TermsPage() {
  return (
    <main className="lp lg">
      <LegalHero
        crumb="Términos y condiciones"
        title="Términos y condiciones"
        lead="A continuación, te presentamos los términos y condiciones que rigen el uso de nuestro sitio web y la información que ponemos a tu disposición."
        image="/media/home-v3/hero-planta.webp"
        alt="Planta de tratamiento de agua frente a las montañas"
        wide
      />

      <div className="lp-shell lg-body">
        <div className="lg-doc">
          <LegalToc items={TOC} label="Contenido de los términos" />
          <div>
            <ol className="lg-terms">
              {SECTIONS.map((s, i) => (
                <li className="lg-term" id={s.id} key={s.id}>
                  <span className="lg-term__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div className="lg-term__body">
                    <h2>{s.label}</h2>
                    {s.text ? (
                      <p>{s.text}</p>
                    ) : (
                      <p>
                        El uso de este sitio también se rige por nuestra <Link className="lg-link-inline" href="/privacidad">Política de Privacidad</Link>, donde se detalla cómo recopilamos, utilizamos y protegemos la información personal de los usuarios.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="lg-updated">Última actualización: {LEGAL_UPDATED}</p>
          </div>
        </div>
      </div>

      <LegalCta
        eyebrow="¿Tienes consultas?"
        title="Estamos para ayudarte."
        text="Si tienes alguna pregunta sobre nuestros términos y condiciones o sobre el uso de nuestro sitio web, nuestro equipo está listo para atenderte."
        cta="Contactar con nosotros"
        href="/contacto"
        image="/media/home-v3/hero-planta.webp"
      />
    </main>
  );
}
