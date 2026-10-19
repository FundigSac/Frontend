"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Globe, LogIn, LogOut, Menu, Moon, Search, ShoppingCart, Sun, UserPlus, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth, signOut, type AuthUser } from "@/modules/auth/use-auth";
import { openCart } from "@/modules/cart/cart-store";
import { SITE } from "@/shared/config/site";
import { openCookiePreferences } from "./cookie-events";
import { isHeroOverlayHeader, isProductPath } from "./landing-paths";
import { useHome } from "./home-copy";
import { COPY, useLang, useQuoteCount, useTheme, type Lang } from "./landing-prefs";
import "../../app/landing.css";
import "../../app/products-dark.css";
import "../../modules/auth/auth.css";

type NavLink = { href: string; label: string };
type NavEntry = NavLink & { children?: readonly NavLink[] };

const PRODUCT_HREFS = ["/productos", "/productos/valvulas", "/productos/marcos-y-tapas", "/cotizar", "/productos?q=acople", "/productos/tuberias"];
const SECTOR_HREFS = ["/industrias/saneamiento", "/industrias/agricultura", "/industrias/mineria"];

function buildNav(t: (typeof COPY)[Lang]): readonly NavEntry[] {
  const link = (hrefs: readonly string[], labels: readonly string[]): NavLink[] => labels.map((label, i) => ({ href: hrefs[i], label }));
  return [
    { href: "/", label: t.nav.home },
    { href: "/productos", label: t.nav.products, children: link(PRODUCT_HREFS, t.products) },
    { href: "/industrias", label: t.nav.sectors, children: link(SECTOR_HREFS, t.sectors) },
    { href: "/nosotros", label: t.nav.about },
    { href: "/recursos", label: t.nav.resources, children: link(["/recursos", "/recursos", "/recursos", "/recursos"], t.resources) },
    { href: "/contacto", label: t.nav.contact },
  ];
}

function Avatar({ user }: { user: AuthUser }) {
  const [broken, setBroken] = useState(false);
  return user.picture && !broken ? (
    // Foto de perfil de Google (CSP: img-src https://*.googleusercontent.com); sin referrer para no filtrar la ruta.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp-avatar" src={user.picture} alt="" width={28} height={28} referrerPolicy="no-referrer" onError={() => setBroken(true)} />
  ) : (
    <span className="lp-avatar lp-avatar--initial" aria-hidden="true">{(user.name.trim()[0] ?? "?").toUpperCase()}</span>
  );
}

export function LandingHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useLang();
  const [theme, setTheme] = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const quoteCount = useQuoteCount();
  const { user } = useAuth();
  const t = COPY[lang];
  const NAV = buildNav(t);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const mobileId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Al cerrar con Escape, el foco vuelve al botón que abrió el menú (no se pierde en el documento).
      if (document.querySelector(".lp-mobile.is-open")) toggleRef.current?.focus();
      else (document.activeElement as Element | null)?.closest?.(".lp-nav__item, .lp-lang, .lp-account")?.querySelector<HTMLElement>(":scope > button")?.focus();
      setOpen(null);
      setMobileOpen(false);
      setSearchOpen(false);
      setLangOpen(false);
      setAccountOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
      if (!(e.target as Element).closest?.(".lp-lang")) setLangOpen(false);
      if (!(e.target as Element).closest?.(".lp-account")) setAccountOpen(false);
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

  // Menú móvil abierto: la página de atrás queda inerte (Tab no sale del menú) y el menú se cierra si la ventana
  // pasa al ancho de escritorio, donde no se ve.
  useEffect(() => {
    if (!mobileOpen) return;
    const behind = [document.getElementById("contenido"), document.querySelector<HTMLElement>(".lp-footer")].filter((el): el is HTMLElement => !!el);
    behind.forEach((el) => (el.inert = true));
    const desktop = window.matchMedia("(min-width: 1261px)");
    const onWide = () => desktop.matches && setMobileOpen(false);
    desktop.addEventListener("change", onWide);
    return () => {
      behind.forEach((el) => (el.inert = false));
      desktop.removeEventListener("change", onWide);
    };
  }, [mobileOpen]);

  return (
    <header className={`lp-header${isHeroOverlayHeader(pathname, segment) ? " lp-header--sector" : ""}${isProductPath(pathname) ? " lp-header--catalog" : ""}${scrolled || mobileOpen ? " is-solid" : ""}`}>
      <div className="lp-shell lp-header__bar">
        <Link className="lp-header__brand" href="/" aria-label={t.a11y.home}>
          <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" priority />
        </Link>

        <nav className="lp-nav" aria-label={t.a11y.mainNav} ref={navRef}>
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className={`lp-nav__item${open === item.label ? " is-open" : ""}`}
                onMouseEnter={() => setOpen(item.label)}
                onMouseLeave={() => setOpen(null)}
                // Al salir con Tab, el submenú se cierra en vez de quedar abierto tapando la página.
                onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen((o) => (o === item.label ? null : o))}
              >
                <button
                  type="button"
                  className={`lp-nav__link${isActive(item.href) ? " is-active" : ""}`}
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
                <Link className={`lp-nav__link${isActive(item.href) ? " is-active" : ""}`} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>
              </div>
            ),
          )}
        </nav>

        <div className="lp-header__actions">
          <form
            className={`lp-search${searchOpen ? " is-open" : ""}`}
            role="search"
            onMouseEnter={() => setSearchOpen(true)}
            onMouseLeave={() => {
              if (!query && document.activeElement !== searchRef.current) setSearchOpen(false);
            }}
            onBlur={(e) => {
              if (!query && !e.currentTarget.contains(e.relatedTarget as Node)) setSearchOpen(false);
            }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              setSearchOpen(false);
              setQuery("");
              router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
            }}
          >
            <input
              ref={searchRef}
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              autoComplete="off"
              tabIndex={searchOpen ? 0 : -1}
            />
            <button
              type={searchOpen && query.trim() ? "submit" : "button"}
              className="lp-header__search"
              aria-label={t.search}
              onClick={() => {
                if (!searchOpen || !query.trim()) {
                  setSearchOpen(true);
                  searchRef.current?.focus();
                }
              }}
            >
              <Search aria-hidden="true" size={20} strokeWidth={2} />
            </button>
          </form>
          <div className="lp-lang">
            <button
              type="button"
              className="lp-icon-btn lp-lang__btn"
              aria-label={`${lang.toUpperCase()}: ${t.language}`}
              aria-expanded={langOpen}
              onClick={() => setLangOpen(!langOpen)}
            >
              <Globe aria-hidden="true" size={19} strokeWidth={1.8} />
              <span aria-hidden="true">{lang.toUpperCase()}</span>
            </button>
            {/* Desplegable simple: dos botones con estado (un listbox exigiría navegación con flechas y opciones sin botones). */}
            <ul className={`lp-lang__menu${langOpen ? " is-open" : ""}`} aria-label={t.language}>
              {([["es", "Español"], ["en", "English"]] as const).map(([code, name]) => (
                <li key={code}>
                  <button type="button" lang={code} aria-pressed={lang === code} onClick={() => { setLang(code); setLangOpen(false); }}>
                    <span>{name}</span>
                    {lang === code && <Check aria-hidden="true" size={15} strokeWidth={2.4} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="lp-icon-btn lp-theme"
            aria-label={theme === "dark" ? t.theme.toLight : t.theme.toDark}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="lp-theme__sun" aria-hidden="true" size={19} strokeWidth={1.8} />
            <Moon className="lp-theme__moon" aria-hidden="true" size={19} strokeWidth={1.8} />
          </button>
          <div className="lp-account">
            <button
              type="button"
              className="lp-icon-btn lp-account__btn"
              aria-label={user ? `${t.account.label}: ${user.name}` : t.account.label}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => { setAccountOpen(!accountOpen); setLangOpen(false); }}
            >
              {user ? <Avatar user={user} /> : <UserRound aria-hidden="true" size={19} strokeWidth={1.8} />}
            </button>
            <div className={`lp-account__menu${accountOpen ? " is-open" : ""}`} role="menu" aria-label={t.account.label}>
              {user ? (
                <>
                  <p className="lp-account__who">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </p>
                  <Link role="menuitem" href="/carrito" onClick={() => setAccountOpen(false)}>
                    <ShoppingCart aria-hidden="true" size={17} strokeWidth={2} /> {t.cart}
                  </Link>
                  <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); void signOut(); }}>
                    <LogOut aria-hidden="true" size={17} strokeWidth={2} /> {t.account.logout}
                  </button>
                </>
              ) : (
                <>
                  <p>{t.account.hint}</p>
                  <Link role="menuitem" className="lp-account__primary" href="/login" prefetch={false} onClick={() => setAccountOpen(false)}>
                    <LogIn aria-hidden="true" size={17} strokeWidth={2} /> {t.account.login}
                  </Link>
                  <Link role="menuitem" href="/registro" prefetch={false} onClick={() => setAccountOpen(false)}>
                    <UserPlus aria-hidden="true" size={17} strokeWidth={2} /> {t.account.signup}
                  </Link>
                </>
              )}
            </div>
          </div>
          <button type="button" className="lp-icon-btn lp-cart" aria-label={`${t.cart}${quoteCount ? ` (${quoteCount})` : ""}`} aria-haspopup="dialog" onClick={() => { openCart(); setMobileOpen(false); }}>
            <ShoppingCart aria-hidden="true" size={19} strokeWidth={1.8} />
            {quoteCount > 0 && <span className="lp-cart__badge" aria-hidden="true">{quoteCount > 99 ? "99+" : quoteCount}</span>}
          </button>
          <Link href="/cotizar" className="lp-btn lp-btn--solid lp-header__quote">
            {t.quote} <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="lp-header__toggle"
            aria-label={mobileOpen ? t.menuClose : t.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            onClick={() => { setMobileOpen(!mobileOpen); setLangOpen(false); }}
          >
            {mobileOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
          </button>
        </div>
      </div>

      <div id={mobileId} className={`lp-mobile${mobileOpen ? " is-open" : ""}`}>
        <nav className="lp-shell" aria-label={t.a11y.mobileNav}>
          {NAV.map((item) => (
            <div className="lp-mobile__group" key={item.label}>
              <Link href={item.href} className={isActive(item.href) ? "is-active" : undefined} aria-current={isActive(item.href) && !item.children ? "page" : undefined} onClick={() => setMobileOpen(false)}>{item.label}</Link>
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
          <div className="lp-mobile__prefs">
            {(["es", "en"] as const).map((code) => (
              <button key={code} type="button" className={lang === code ? "is-active" : ""} aria-pressed={lang === code} onClick={() => setLang(code)}>
                <Globe aria-hidden="true" size={15} strokeWidth={1.8} /> {code === "es" ? "Español" : "English"}
              </button>
            ))}
            <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun aria-hidden="true" size={15} strokeWidth={1.8} /> : <Moon aria-hidden="true" size={15} strokeWidth={1.8} />}
              {theme === "dark" ? t.theme.toLight : t.theme.toDark}
            </button>
          </div>
          {user ? (
            <div className="lp-mobile__account lp-mobile__account--user">
              <p>
                <Avatar user={user} />
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
              </p>
              <button type="button" onClick={() => { setMobileOpen(false); void signOut(); }}>
                <LogOut aria-hidden="true" size={16} strokeWidth={2} /> {t.account.logout}
              </button>
            </div>
          ) : (
            <div className="lp-mobile__account">
              <Link href="/login" prefetch={false} onClick={() => setMobileOpen(false)}>
                <LogIn aria-hidden="true" size={16} strokeWidth={2} /> {t.account.login}
              </Link>
              <Link href="/registro" prefetch={false} onClick={() => setMobileOpen(false)}>
                <UserPlus aria-hidden="true" size={16} strokeWidth={2} /> {t.account.signup}
              </Link>
            </div>
          )}
          <Link href="/cotizar" className="lp-btn lp-btn--solid" onClick={() => setMobileOpen(false)}>
            {t.quote} <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LandingFooter() {
  const [lang] = useLang();
  const f = useHome().footer;
  const tn = COPY[lang];
  const [PRODUCTS, SECTORS, RESOURCES] = buildNav(COPY[lang]).filter((n) => n.children).map((n) => n.children!);
  return (
    <footer className="lp-footer">
      <div className="lp-shell lp-footer__main">
        <div className="lp-footer__brand-column">
          <Link className="lp-footer__brand" href="/" aria-label={tn.a11y.home}>
            <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" />
          </Link>
          <p>{f.about}</p>
        </div>
        <nav aria-labelledby="lp-f-productos">
          <h2 id="lp-f-productos">{f.products}</h2>
          <ul>{PRODUCTS.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-labelledby="lp-f-sectores">
          <h2 id="lp-f-sectores">{f.sectors}</h2>
          <ul>{SECTORS.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-labelledby="lp-f-recursos">
          <h2 id="lp-f-recursos">{f.resources}</h2>
          <ul>{RESOURCES.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <div>
          <h2>{f.contact}</h2>
          <address>
            <ul>
              <li>{f.place}</li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email.split("@")[0]}@<wbr />{SITE.email.split("@")[1]}</a></li>
              <li><Link href="/contacto">{f.form}</Link></li>
              <li><Link href="/carrito">{tn.cart}</Link></li>
            </ul>
          </address>
        </div>
      </div>
      <div className="lp-shell lp-footer__bottom">
        <span>© {new Date().getFullYear()} {SITE.name}. {f.rights}</span>
        <div className="lp-footer__legal">
          <Link href="/terminos">{f.terms}</Link>
          <Link href="/privacidad">{f.privacy}</Link>
          <Link href="/cookies" prefetch={false}>{f.cookies}</Link>
          <Link href="/eliminar-cuenta">{f.deletion}</Link>
          <button type="button" className="lp-footer__linkbtn" onClick={openCookiePreferences}>{f.cookiePrefs}</button>
          <Link href="/reclamaciones">{f.complaints}</Link>
        </div>
      </div>
    </footer>
  );
}

/** Enlace "Saltar al contenido" en el idioma elegido (el layout es de servidor y no conoce la preferencia). */
export function SkipLink() {
  const [lang] = useLang();
  return <a className="skip-link" href="#contenido">{COPY[lang].a11y.skip}</a>;
}
