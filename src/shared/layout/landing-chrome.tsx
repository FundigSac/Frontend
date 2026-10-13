"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { SITE } from "@/shared/config/site";
import "../../app/landing.css";

type NavLink = { href: string; label: string };
type NavEntry = NavLink & { children?: readonly NavLink[] };

const PRODUCTS: readonly NavLink[] = [
  { href: "/productos", label: "Catálogo general" },
  { href: "/productos/valvulas", label: "Válvulas" },
  { href: "/productos/marcos-y-tapas", label: "Marcos y tapas" },
  { href: "/productos?q=grifo", label: "Grifos" },
  { href: "/productos?q=acople", label: "Acoples" },
  { href: "/productos/tuberias", label: "Tuberías" },
];

const SECTORS: readonly NavLink[] = [
  { href: "/industrias#saneamiento", label: "Saneamiento" },
  { href: "/industrias#agricultura", label: "Agricultura" },
  { href: "/industrias#mineria", label: "Minería" },
];

const RESOURCES: readonly NavLink[] = [
  { href: "/recursos", label: "Fichas técnicas" },
  { href: "/recursos", label: "Documentación" },
  { href: "/recursos", label: "Catálogo digital" },
  { href: "/recursos", label: "Campañas y sobrestock" },
];

const NAV: readonly NavEntry[] = [
  { href: "/productos", label: "Productos", children: PRODUCTS },
  { href: "/industrias", label: "Sectores", children: SECTORS },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/recursos", label: "Recursos", children: RESOURCES },
  { href: "/contacto", label: "Contacto" },
];

export function LandingHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      setMobileOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    // Sobre el hero la cabecera es translúcida; al desplazarse pasa a blanco sólido.
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`lp-header${scrolled || mobileOpen ? " is-solid" : ""}`}>
      <div className="lp-shell lp-header__bar">
        <Link className="lp-header__brand" href="/" aria-label="FUNDIGSAC, inicio">
          <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" priority />
        </Link>

        <nav className="lp-nav" aria-label="Navegación principal" ref={navRef}>
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className={`lp-nav__item${open === item.label ? " is-open" : ""}`}
                onMouseEnter={() => setOpen(item.label)}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  type="button"
                  className="lp-nav__link"
                  aria-expanded={open === item.label}
                  aria-controls={`lp-menu-${item.label}`}
                  onClick={() => setOpen(open === item.label ? null : item.label)}
                >
                  {item.label} <ChevronDown aria-hidden="true" size={15} strokeWidth={2} />
                </button>
                <ul className="lp-nav__menu" id={`lp-menu-${item.label}`}>
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link href={child.href} onClick={() => setOpen(null)}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div key={item.label} className="lp-nav__item">
                <Link className="lp-nav__link" href={item.href}>{item.label}</Link>
              </div>
            ),
          )}
        </nav>

        <div className="lp-header__actions">
          <Link className="lp-header__search" href="/buscar" aria-label="Buscar">
            <Search aria-hidden="true" size={20} strokeWidth={2} />
          </Link>
          <Link href="/cotizar" className="lp-btn lp-btn--solid lp-header__quote">
            Solicitar cotización <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            className="lp-header__toggle"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
          </button>
        </div>
      </div>

      <div id={mobileId} className={`lp-mobile${mobileOpen ? " is-open" : ""}`}>
        <nav className="lp-shell" aria-label="Navegación móvil">
          {NAV.map((item) => (
            <div className="lp-mobile__group" key={item.label}>
              <Link href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              {item.children && (
                <ul>
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link href={child.href} onClick={() => setMobileOpen(false)}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <Link href="/cotizar" className="lp-btn lp-btn--solid" onClick={() => setMobileOpen(false)}>
            Solicitar cotización <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell lp-footer__main">
        <div className="lp-footer__brand-column">
          <Link className="lp-footer__brand" href="/" aria-label="FUNDIGSAC, inicio">
            <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" />
          </Link>
          <p>Soluciones en hierro dúctil para agua, alcantarillado e infraestructura urbana. Impulsando el desarrollo del país.</p>
        </div>
        <nav aria-labelledby="lp-f-productos">
          <h2 id="lp-f-productos">Productos</h2>
          <ul>{PRODUCTS.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-labelledby="lp-f-sectores">
          <h2 id="lp-f-sectores">Sectores</h2>
          <ul>{SECTORS.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-labelledby="lp-f-recursos">
          <h2 id="lp-f-recursos">Recursos</h2>
          <ul>{RESOURCES.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <div>
          <h2>Contacto</h2>
          <address>
            <ul>
              <li>Lima, Perú</li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><Link href="/contacto">Formulario de contacto</Link></li>
            </ul>
          </address>
        </div>
      </div>
      <div className="lp-shell lp-footer__bottom">
        <span>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</span>
        <div className="lp-footer__legal">
          <Link href="/terminos-b2b">Términos de uso</Link>
          <Link href="/privacidad">Política de privacidad</Link>
          <Link href="/reclamaciones">Libro de reclamaciones</Link>
          <a href="/sitemap.xml">Mapa del sitio</a>
        </div>
      </div>
    </footer>
  );
}
