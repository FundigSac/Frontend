import Link from "next/link";

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
  return (
    <footer className="w-full border-t border-border bg-surface-container-low">
      <div className="mx-auto max-w-[1200px] px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          <div className="max-w-sm">
            <Link className="inline-flex flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" href="/" aria-label="FUNDIGSAC, ir al inicio">
              <span className="font-headline-card text-headline-card font-bold tracking-tight text-primary">FUNDIGSAC</span>
              <span className="mt-0.5 font-ui-label text-ui-label font-bold uppercase tracking-widest text-text-muted">Hierro dúctil · Perú</span>
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
