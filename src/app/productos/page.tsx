import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { CatalogCard } from "@/components/ui/catalog-card";
import { CtaBand, PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";

type Params = { q?: string; categoria?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const { q = "", categoria = "" } = await searchParams;
  const current = categories.find(c => c.slug === categoria);
  return {
    title: current?.name ?? "Productos",
    description: current
      ? `${current.name} del catálogo FUNDIGSAC: referencias, medidas y códigos. Solicita cotización.`
      : "Catálogo de válvulas, acoples, bridas, hierro dúctil, accesorios HDPE, equipos de termofusión y medidores FUNDIGSAC.",
    alternates: { canonical: current ? `/productos?categoria=${current.slug}` : "/productos" },
    ...(q.trim() ? { robots: { index: false, follow: true } } : {}),
  };
}

const norm = (text: string) => text.toLocaleLowerCase("es-PE").replace(/\s+/g, "");

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", categoria = "" } = await searchParams;
  const query = norm(q.trim());
  const current = categories.find(c => c.slug === categoria);
  const matches = products.filter(p =>
    (!categoria || p.category === categoria) &&
    (!query || norm([p.name, p.summary, p.slug, p.specs?.flat().join(" ") ?? "", p.variants?.map(v => v.label + " " + (v.sdr ?? "")).join(" ") ?? ""].join(" ")).includes(query)));
  const grouped = !categoria && !query;
  const counts = Object.fromEntries(categories.map(c => [c.slug, products.filter(p => p.category === c.slug).length]));

  return <main>
    <PageHero
      compact
      crumbs={current ? [{ label: "Productos", href: "/productos" }, { label: current.name }] : [{ label: "Productos" }]}
      eyebrow="Catálogo"
      title={current?.name ?? "Catálogo de productos"}
      lead="Referencias con código, medidas y fotografía. Confirma precio y disponibilidad al cotizar."
    >
      <form action="/productos" className="x-search" role="search" style={{ marginTop: 28 }}>
        <Search size={20} aria-hidden="true" />
        <input aria-label="Buscar en catálogo" name="q" defaultValue={q} placeholder="Nombre, código, DN, SDR o modelo" autoComplete="off" />
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <button type="submit">Buscar</button>
      </form>
    </PageHero>

    <section className="x-section x-section--tight">
      <div className="container">
        <nav className="x-tabs" aria-label="Familias de producto">
          <Link className={`x-tab${!categoria ? " is-active" : ""}`} href="/productos" aria-current={!categoria ? "page" : undefined}>Todos <small>{products.length}</small></Link>
          {categories.map(c => <Link key={c.slug} className={`x-tab${categoria === c.slug ? " is-active" : ""}`} href={`/productos?categoria=${c.slug}`} aria-current={categoria === c.slug ? "page" : undefined}>{c.name} <small>{counts[c.slug]}</small></Link>)}
        </nav>

        {grouped
          ? categories.map((c, ci) => {
              const items = products.filter(p => p.category === c.slug);
              return <section key={c.slug} className="x-group" aria-labelledby={`g-${c.slug}`}>
                <div className="x-group-head"><div><h2 id={`g-${c.slug}`}>{c.name}</h2><p>{items.length} {items.length === 1 ? "referencia" : "referencias"}</p></div><Link className="text-link" href={`/productos?categoria=${c.slug}`}>Ver todo <ArrowRight size={16} aria-hidden="true" /></Link></div>
                <div className="x-pgrid">{items.slice(0, 8).map((p, i) => <Reveal key={p.slug} delay={(i % 4) * 60}><CatalogCard product={p} priority={ci === 0 && i < 4} /></Reveal>)}</div>
                {items.length > 8 && <p className="x-after"><Link className="button button-outline" href={`/productos?categoria=${c.slug}`}>Ver las {items.length} referencias <ArrowRight size={17} /></Link></p>}
              </section>;
            })
          : <section aria-label="Resultados del catálogo">
              <p className="x-count" role="status">{matches.length} {matches.length === 1 ? "producto" : "productos"}{q && <> para “{q}”</>}</p>
              {matches.length
                ? <div className="x-pgrid">{matches.map((p, i) => <CatalogCard key={p.slug} product={p} priority={i < 4} />)}</div>
                : <div className="x-empty"><h2>Sin resultados</h2><p>Prueba con el nombre de un producto, un código (por ejemplo VCSW) o una medida, o explora todas las familias.</p><Link className="button" href="/productos">Ver catálogo completo</Link></div>}
            </section>}
      </div>
    </section>

    <CtaBand title="¿No encuentras lo que buscas?" text="Cuéntanos qué necesitas. Si no está publicado, lo consultamos por ti." primary={{ href: "/contacto", label: "Consultar con el equipo" }} secondary={{ href: "/cotizar", label: "Ir a mi cotización" }} />
  </main>;
}
