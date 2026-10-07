import type { Metadata } from "next";
import Link from "next/link";
import { categories, products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export const metadata: Metadata = {title:"Productos",description:"Catálogo de válvulas, accesorios HDPE, acoples y equipos de termofusión FUNDIGSAC.",alternates:{canonical:"/productos"}};
export default async function ProductsPage({searchParams}:{searchParams:Promise<{q?:string;categoria?:string}>}) {
  const {q="",categoria=""}=await searchParams;
  const query=q.trim().toLocaleLowerCase("es-PE").replace(/\s+/g,"");
  const items=products.filter(p=>(!categoria||p.category===categoria)&&(!query||[p.name,p.summary,p.slug,p.specs?.flat().join(" ")??"",p.variants?.map(v=>v.label+" "+(v.sdr??"")).join(" ")??""].join(" ").toLocaleLowerCase("es-PE").replace(/\s+/g,"").includes(query)));
  const current=categories.find(c=>c.slug===categoria);
  return <main className="container inner-page"><nav className="breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><span>Productos</span></nav><div className="page-heading"><h1>{current?.name??"Productos"}</h1><p>Explora referencias de catálogo. Confirma precio y disponibilidad antes de comprar.</p></div><form action="/productos" className="catalog-search search-form"><input aria-label="Buscar en catálogo" name="q" defaultValue={q} placeholder="Nombre, DN, SDR o modelo"/>{categoria&&<input type="hidden" name="categoria" value={categoria}/>}<button type="submit">Buscar</button></form><div className="catalog-layout"><aside className="catalog-filters"><h2>Familias</h2><Link className={!categoria?"selected":""} href="/productos">Todos los productos</Link>{categories.map(c=><Link className={categoria===c.slug?"selected":""} key={c.slug} href={`/productos?categoria=${c.slug}`}>{c.name}</Link>)}</aside><section aria-label="Resultados del catálogo"><div className="result-count">{items.length} {items.length===1?"producto":"productos"}{q&&<> para “{q}”</>}</div>{items.length?<div className="product-grid catalog-grid">{items.map(product=><ProductCard product={product} key={product.slug}/>)}</div>:<div className="empty-state"><h2>Sin resultados</h2><p>Prueba con un nombre de producto o explora todas las familias.</p><Link className="text-link" href="/productos">Ver catálogo completo</Link></div>}</section></div></main>;
}
