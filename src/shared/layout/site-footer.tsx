"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import "../../app/home.css";

const FOOTER_GROUPS = [
  {
    title: "Catálogo",
    links: [
      { href: "/productos", label: "Productos" },
      { href: "/soluciones", label: "Soluciones" },
    ],
  },
  {
    title: "Atención",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/cotizar", label: "Solicitar cotización" },
      { href: "/login", label: "Mi cuenta" },
    ],
  },
  {
    title: "Información legal",
    links: [
      { href: "/privacidad", label: "Privacidad" },
      { href: "/cookies", label: "Cookies" },
      { href: "/terminos-b2b", label: "Términos B2B" },
      { href: "/reclamaciones", label: "Libro de reclamaciones" },
    ],
  },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return <HomeFooter />;
  if (pathname === "/productos" || pathname === "/productos/valvulas" || pathname === "/productos/tuberias" || pathname === "/productos/marcos-y-tapas" || pathname === "/productos/valvulas/valvula-compuerta") return <ProductsFooter />;

  return (
    <footer className="w-full border-t border-border bg-surface-container-low">
      <div className="mx-auto max-w-[1200px] px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          <div className="max-w-sm">
            <Link className="inline-flex flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" href="/" aria-label="FUNDIGSAC, ir al inicio">
              <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC · Soluciones en hierro dúctil" className="h-auto w-[178px]" />
            </Link>
            <p className="mt-4 max-w-[34ch] font-body-compact text-body-compact text-on-surface-variant">
              Tuberías, válvulas y componentes de hierro dúctil para proyectos de infraestructura.
            </p>
            <nav aria-label="Acerca de FUNDIGSAC" className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link className="inline-flex min-h-8 items-center font-body-compact text-body-compact text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/nosotros">
                Nosotros
              </Link>
              <Link className="inline-flex min-h-8 items-center font-body-compact text-body-compact text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/recursos">
                Recursos
              </Link>
            </nav>
          </div>

          <nav aria-label="Enlaces del pie de página" className="contents">
            {FOOTER_GROUPS.map((group) => (
              <section key={group.title} aria-labelledby={"footer-" + group.title}>
                <h2 id={"footer-" + group.title} className="font-ui-label text-ui-label font-bold text-on-surface">
                  {group.title}
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        className="inline-flex min-h-8 items-center font-body-compact text-body-compact text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="mt-9 border-t border-border pt-4">
          <p className="font-ui-label text-ui-label text-text-muted">© {new Date().getFullYear()} FUNDIGSAC</p>
        </div>
      </div>
    </footer>
  );
}

function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__main">
        <div className="home-footer__brand-column">
          <Link className="home-footer__brand" href="/" aria-label="FUNDIGSAC, inicio">
            <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC · Soluciones en hierro dúctil" className="home-footer__logo" />
          </Link>
          <p>Productos de hierro dúctil para agua, alcantarillado e infraestructura urbana.</p>
          <div className="home-footer__social" aria-label="Redes sociales">
            <span aria-label="LinkedIn"><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.58 5.82H.46V15h3.12V5.82ZM2.02 4.57a1.81 1.81 0 1 0-.02-3.62 1.81 1.81 0 0 0 .02 3.62ZM15.54 9.74c0-2.77-1.48-4.06-3.45-4.06a2.98 2.98 0 0 0-2.69 1.48V5.82H6.28V15H9.4v-4.55c0-1.2.23-2.35 1.7-2.35 1.45 0 1.47 1.36 1.47 2.43V15h3.12l-.15-5.26Z" /></svg></span>
            <span aria-label="YouTube"><svg viewBox="0 0 18 14" fill="currentColor" aria-hidden="true"><path d="M17.6 2.2A2.26 2.26 0 0 0 16 .6C14.6.2 9 .2 9 .2S3.4.2 2 .6A2.26 2.26 0 0 0 .4 2.2C0 3.6 0 7 0 7s0 3.4.4 4.8A2.26 2.26 0 0 0 2 13.4c1.4.4 7 .4 7 .4s5.6 0 7-.4a2.26 2.26 0 0 0 1.6-1.6C18 10.4 18 7 18 7s0-3.4-.4-4.8ZM7.2 10V4l4.9 3-4.9 3Z" /></svg></span>
          </div>
        </div>
        <nav className="home-footer__group" aria-label="Productos">
          <h2>Productos</h2>
          <Link href="/productos">Catálogo general</Link>
          <Link href="/productos/valvulas">Válvulas</Link>
          <Link href="/productos/tuberias">Tuberías</Link>
          <Link href="/productos/marcos-y-tapas">Marcos y tapas</Link>
        </nav>
        <nav className="home-footer__group" aria-label="Empresa">
          <h2>Empresa</h2>
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/soluciones">Soluciones</Link>
          <Link href="/recursos">Recursos</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <nav className="home-footer__group" aria-label="Información legal">
          <h2>Legal</h2>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/reclamaciones">Libro de reclamaciones</Link>
        </nav>
      </div>
      <div className="home-footer__bottom">
        <span>© {new Date().getFullYear()} FUNDIGSAC. Todos los derechos reservados.</span>
        <div><Link href="/terminos-b2b">Términos de uso</Link><Link href="/privacidad">Política de privacidad</Link><Link href="/sitemap.xml">Mapa del sitio</Link></div>
      </div>
    </footer>
  );
}

function ProductsFooter() {
  return (
    <footer className="home-footer home-footer--light">
      <div className="home-footer__main">
        <div className="home-footer__brand-column">
          <Link className="home-footer__brand" href="/" aria-label="FUNDIGSAC, inicio">
            <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC · Soluciones en hierro dúctil" className="home-footer__logo" />
          </Link>
          <p>Soluciones en componentes de hierro dúctil, HDPE y accesorios para redes de agua, alcantarillado e infraestructura urbana.</p>
          <div className="home-footer__social" aria-label="Redes sociales">
            <span aria-label="LinkedIn"><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.58 5.82H.46V15h3.12V5.82ZM2.02 4.57a1.81 1.81 0 1 0-.02-3.62 1.81 1.81 0 0 0 .02 3.62ZM15.54 9.74c0-2.77-1.48-4.06-3.45-4.06a2.98 2.98 0 0 0-2.69 1.48V5.82H6.28V15H9.4v-4.55c0-1.2.23-2.35 1.7-2.35 1.45 0 1.47 1.36 1.47 2.43V15h3.12l-.15-5.26Z" /></svg></span>
            <span aria-label="YouTube"><svg viewBox="0 0 18 14" fill="currentColor" aria-hidden="true"><path d="M17.6 2.2A2.26 2.26 0 0 0 16 .6C14.6.2 9 .2 9 .2S3.4.2 2 .6A2.26 2.26 0 0 0 .4 2.2C0 3.6 0 7 0 7s0 3.4.4 4.8A2.26 2.26 0 0 0 2 13.4c1.4.4 7 .4 7 .4s5.6 0 7-.4a2.26 2.26 0 0 0 1.6-1.6C18 10.4 18 7 18 7s0-3.4-.4-4.8ZM7.2 10V4l4.9 3-4.9 3Z" /></svg></span>
          </div>
        </div>
        <nav className="home-footer__group" aria-label="Productos">
          <h2>Productos</h2>
          <Link href="/productos/valvulas">Válvulas</Link>
          <Link href="/productos/tuberias">Tuberías</Link>
          <Link href="/productos/marcos-y-tapas">Marcos y tapas</Link>
          <Link href="/productos?familia=accesorios-hdpe">Accesorios HDPE</Link>
          <Link href="/productos?familia=conexiones-y-fittings">Conexiones y fittings</Link>
          <Link href="/productos" className="home-footer__more">Ver catálogo completo <ArrowRight size={14} aria-hidden="true" /></Link>
        </nav>
        <nav className="home-footer__group" aria-label="Soluciones">
          <h2>Soluciones</h2>
          <Link href="/soluciones">Agua potable</Link>
          <Link href="/soluciones">Alcantarillado</Link>
          <Link href="/soluciones">Infraestructura urbana</Link>
          <Link href="/soluciones">Proyectos especiales</Link>
        </nav>
        <nav className="home-footer__group" aria-label="Recursos">
          <h2>Recursos</h2>
          <Link href="/recursos">Catálogos</Link>
          <Link href="/recursos">Fichas técnicas</Link>
          <Link href="/recursos">Normas y guías</Link>
          <Link href="/recursos">Soporte técnico</Link>
        </nav>
        <nav className="home-footer__group" aria-label="Nosotros">
          <h2>Nosotros</h2>
          <Link href="/nosotros">Quiénes somos</Link>
          <Link href="/nosotros">Calidad</Link>
          <Link href="/nosotros">Sostenibilidad</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
      </div>
      <div className="home-footer__bottom">
        <span>© {new Date().getFullYear()} FUNDIGSAC. Todos los derechos reservados.</span>
        <div><Link href="/terminos-b2b">Términos y condiciones</Link><Link href="/privacidad">Política de privacidad</Link><Link href="/cookies">Cookies</Link><Link href="/reclamaciones">Libro de reclamaciones</Link></div>
      </div>
    </footer>
  );
}
