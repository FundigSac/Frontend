import type { Metadata } from "next";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CookiePrefs } from "../_legal/cookie-prefs";
import { LegalHero } from "../_legal/legal-parts";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies utiliza el sitio web de FUNDIGSAC, para qué sirven y cómo gestionar tus preferencias.",
  alternates: { canonical: "/cookies" },
};

const INFO = [
  { image: "/media/home-v3/hero-planta.webp", position: "30% 60%", title: "¿Qué son las cookies?", alt: "Planta de tratamiento de agua", text: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tu información y preferencias durante un tiempo, facilitando tu próxima visita." },
  { image: "/media/mineria/acople-bridado.webp", position: "50% 50%", title: "¿Cómo las usamos?", alt: "Acople bridado de hierro dúctil", text: "En FUNDIGSAC utilizamos cookies para garantizar el funcionamiento del sitio, analizar su uso, mejorar nuestros contenidos y, con tu consentimiento, mostrarte información relevante sobre nuestros productos y soluciones." },
  { image: "/media/saneamiento/hero.webp", position: "40% 60%", title: "Duración de las cookies", alt: "Válvula compuerta frente a una planta de agua", text: "Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o persistentes (permanecen durante un tiempo determinado en tu dispositivo). La duración varía según el tipo de cookie y su finalidad." },
] as const;

const FAQ = [
  { q: "¿Qué tipos de cookies utiliza FUNDIGSAC?", a: "Utilizamos cookies necesarias para el funcionamiento del sitio y la seguridad de los formularios, y —solo si las aceptas— cookies analíticas y funcionales. Hoy no instalamos cookies publicitarias." },
  { q: "¿Puedo cambiar mis preferencias de cookies más adelante?", a: "Sí. Puedes volver a esta página o usar el enlace «Preferencias de cookies» del pie de página cuando quieras para modificar tu elección." },
  { q: "¿Cómo puedo gestionar o eliminar las cookies desde mi navegador?", a: "Todos los navegadores permiten bloquear o eliminar cookies desde su configuración de privacidad. Ten en cuenta que, si bloqueas las necesarias, algunas funciones del sitio podrían dejar de estar disponibles." },
  { q: "¿Las cookies recopilan información personal?", a: "Las cookies necesarias no recopilan datos para seguimiento. Las analíticas, si las activas, recopilan información agregada y anónima sobre el uso del sitio. Para más detalle consulta nuestra Política de Privacidad." },
  { q: "¿Qué sucede si rechazo las cookies opcionales?", a: "Podrás seguir navegando con normalidad. Solo dejaremos de recoger información de uso y de recordar preferencias opcionales, como la personalización de la experiencia." },
] as const;

export default function CookiesPage() {
  return (
    <main className="lp lg">
      <LegalHero
        crumb="Política de cookies"
        title="Política de cookies"
        lead="En FUNDIGSAC utilizamos cookies para mejorar tu experiencia de navegación, analizar el uso del sitio y ofrecer contenidos relevantes."
        image="/media/home-v3/hero-planta.webp"
        alt="Planta de tratamiento de agua frente a las montañas"
        wide
      />

      <div className="lp-shell lg-body" style={{ paddingBottom: 0 }}>
        <CookiePrefs />

        <ul className="lg-info-grid">
          {INFO.map((item) => (
            <li className="lg-info" key={item.title}>
              <div className="lg-info__media">
                <Image src={item.image} alt={item.alt} fill quality={70} sizes="(max-width: 720px) 92vw, 33vw" style={{ objectPosition: item.position }} />
              </div>
              <span className="lg-bar" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <section className="lg-faq-wrap lg-body" style={{ marginTop: "clamp(40px, 6vw, 80px)" }} aria-labelledby="lg-faq-title">
        <div className="lp-shell">
          <div className="lg-faq-head">
            <div>
              <p className="lg-eyebrow">Información adicional</p>
              <h2 id="lg-faq-title" className="lg-section-title" style={{ marginTop: 14 }}>Preguntas frecuentes</h2>
            </div>
            <p className="lg-text">Resolvemos las dudas más comunes sobre el uso de cookies en nuestro sitio web.</p>
          </div>
          <div className="lg-faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
                </summary>
                <div>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
