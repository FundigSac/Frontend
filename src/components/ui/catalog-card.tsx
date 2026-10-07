import "@/styles/pages.css";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories, type Product } from "@/lib/catalog";

export function categoryName(slug: string) { return categories.find(c => c.slug === slug)?.name ?? slug; }

/** Tarjeta de producto con la fotografía sobre fondo suave y transparencias respetadas. */
export function CatalogCard({ product, priority = false, compact = false }: { product: Product; priority?: boolean; compact?: boolean }) {
  const measures = product.variants?.length;
  return <Link prefetch={false} href={`/productos/${product.slug}`} className={`x-pcard${compact ? " x-pcard--compact" : ""}`}>
    <span className="x-pcard-media">
      {product.image ? <Image src={product.image} alt={product.imageIllustrative ? `Ilustración de ${product.name}` : product.name} fill priority={priority} sizes="(max-width: 600px) 46vw, (max-width: 1100px) 31vw, 22vw" /> : <span className="x-pcard-empty" aria-hidden="true">{product.name.slice(0, 1)}</span>}
    </span>
    <span className="x-pcard-body">
      <span className="x-pcard-cat">{categoryName(product.category)}</span>
      <span className="x-pcard-name">{product.name}</span>
      {!compact && <span className="x-pcard-meta">{measures ? `${measures} ${measures === 1 ? "medida" : "medidas"}` : "Consultar ficha"}</span>}
      <span className="x-pcard-action">Ver producto <ArrowUpRight size={16} aria-hidden="true" /></span>
    </span>
  </Link>;
}
