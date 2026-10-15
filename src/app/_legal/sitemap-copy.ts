import type { Pair } from "./copy";

type Group = { title: string; text: string; links: readonly { href: string; label: string }[] };

/** Mapa del sitio (página HTML para personas; el sitemap.xml queda para buscadores). */
export const SITEMAP: Pair<{
  crumb: string;
  title: string;
  lead: string;
  groups: readonly Group[];
  cta: { eyebrow: string; title: string; text: string; cta: string };
}> = {
  es: {
    crumb: "Mapa del sitio",
    title: "Mapa del sitio",
    lead: "Encuentra rápidamente cada sección de FUNDIGSAC: productos, sectores, recursos técnicos, atención y documentos legales.",
    groups: [
      {
        title: "Productos",
        text: "Hierro dúctil para redes de agua e infraestructura.",
        links: [
          { href: "/productos", label: "Catálogo general" },
          { href: "/productos/valvulas", label: "Válvulas" },
          { href: "/productos/marcos-y-tapas", label: "Marcos y tapas" },
          { href: "/cotizar", label: "Grifos" },
          { href: "/productos?q=acople", label: "Acoples" },
          { href: "/productos/tuberias", label: "Tuberías" },
          { href: "/soluciones", label: "Soluciones" },
        ],
      },
      {
        title: "Sectores",
        text: "Soluciones pensadas para cada industria.",
        links: [
          { href: "/industrias", label: "Todos los sectores" },
          { href: "/industrias/saneamiento", label: "Saneamiento" },
          { href: "/industrias/agricultura", label: "Agricultura" },
          { href: "/industrias/mineria", label: "Minería" },
        ],
      },
      {
        title: "Empresa y recursos",
        text: "Conócenos, descarga información y pide tu cotización.",
        links: [
          { href: "/nosotros", label: "Nosotros" },
          { href: "/recursos", label: "Recursos técnicos" },
          { href: "/cotizar", label: "Solicitar cotización" },
          { href: "/contacto", label: "Contacto" },
          { href: "/buscar", label: "Buscar en el sitio" },
        ],
      },
      {
        title: "Información legal",
        text: "Tus derechos y cómo tratamos tu información.",
        links: [
          { href: "/terminos", label: "Términos y condiciones" },
          { href: "/privacidad", label: "Política de privacidad" },
          { href: "/cookies", label: "Política de cookies" },
          { href: "/reclamaciones", label: "Libro de reclamaciones" },
        ],
      },
      {
        title: "Tu cuenta",
        text: "Accede o crea tu cuenta de FUNDIGSAC.",
        links: [
          { href: "/login", label: "Iniciar sesión" },
          { href: "/registro", label: "Crear cuenta" },
        ],
      },
    ],
    cta: { eyebrow: "¿No encuentras lo que buscas?", title: "Estamos para ayudarte.", text: "Escríbenos y nuestro equipo te orientará hacia el producto, documento o sector que necesitas.", cta: "Contactar con nosotros" },
  },
  en: {
    crumb: "Sitemap",
    title: "Sitemap",
    lead: "Quickly find every section of FUNDIGSAC: products, industries, technical resources, customer service and legal documents.",
    groups: [
      {
        title: "Products",
        text: "Ductile iron for water networks and infrastructure.",
        links: [
          { href: "/productos", label: "Full catalog" },
          { href: "/productos/valvulas", label: "Valves" },
          { href: "/productos/marcos-y-tapas", label: "Frames and covers" },
          { href: "/cotizar", label: "Hydrants" },
          { href: "/productos?q=acople", label: "Couplings" },
          { href: "/productos/tuberias", label: "Pipes" },
          { href: "/soluciones", label: "Solutions" },
        ],
      },
      {
        title: "Industries",
        text: "Solutions designed for each industry.",
        links: [
          { href: "/industrias", label: "All industries" },
          { href: "/industrias/saneamiento", label: "Sanitation" },
          { href: "/industrias/agricultura", label: "Agriculture" },
          { href: "/industrias/mineria", label: "Mining" },
        ],
      },
      {
        title: "Company and resources",
        text: "Get to know us, download information and request a quote.",
        links: [
          { href: "/nosotros", label: "About us" },
          { href: "/recursos", label: "Technical resources" },
          { href: "/cotizar", label: "Request a quote" },
          { href: "/contacto", label: "Contact" },
          { href: "/buscar", label: "Search the site" },
        ],
      },
      {
        title: "Legal information",
        text: "Your rights and how we handle your information.",
        links: [
          { href: "/terminos", label: "Terms and conditions" },
          { href: "/privacidad", label: "Privacy policy" },
          { href: "/cookies", label: "Cookie policy" },
          { href: "/reclamaciones", label: "Complaints book" },
        ],
      },
      {
        title: "Your account",
        text: "Sign in or create your FUNDIGSAC account.",
        links: [
          { href: "/login", label: "Sign in" },
          { href: "/registro", label: "Create account" },
        ],
      },
    ],
    cta: { eyebrow: "Can’t find what you need?", title: "We are here to help.", text: "Write to us and our team will point you to the product, document or industry you are looking for.", cta: "Contact us" },
  },
};
