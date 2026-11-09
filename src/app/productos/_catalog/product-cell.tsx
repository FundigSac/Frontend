"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CircleDashed, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CatalogCell } from "@/modules/catalog/public-catalog";
import { addToCart } from "@/modules/cart/cart-store";
import type { Lang } from "@/shared/layout/landing-prefs";
import { UI } from "./copy";
import styles from "./catalog.module.css";

type Props = {
  cell: CatalogCell;
  lang: Lang;
  /** Posición en la rejilla: las primeras cuatro fotos no se difieren. */
  index: number;
  /** Tras filtrar, las celdas nuevas entran con mo-pop y dejan de depender del revelado al desplazar. */
  filtered?: boolean;
  isNew?: boolean;
  sizes?: string;
  /** Nivel del nombre: h2 en listados que van directo bajo el H1, h3 dentro de una sección con su propio H2. */
  heading?: "h2" | "h3";
};

const GRID_SIZES = "(min-width: 1261px) 25vw, (min-width: 860px) 33vw, 50vw";

/** Celda de producto: foto sobre superficie neutra, nombre, código y las dos acciones. */
export function ProductCell({ cell, lang, index, filtered = false, isNew = false, sizes = GRID_SIZES, heading: Heading = "h3" }: Props) {
  const t = UI[lang];
  const name = cell.name[lang];
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = () => {
    // El equipo comercial lee la solicitud en español.
    addToCart({ slug: cell.slug, name: cell.name.es, image: cell.image, href: cell.href });
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  const data = [cell.code, cell.range].filter(Boolean).join(" · ");

  return (
    <article
      className={`celda ${styles.cell}${isNew ? " mo-pop" : ""}`}
      data-reveal={filtered ? undefined : ""}
      style={isNew ? { animationDelay: `${Math.min(index, 4) * 25}ms` } : { ["--d" as string]: `${(index % 4) * 50}ms` }}
    >
      <Link href={cell.href} className={`celda__media ${styles.media}`} aria-label={t.viewSheetOf + name}>
        <Image src={cell.image} alt={cell.alt[lang]} width={640} height={640} sizes={sizes} loading={index < 4 ? "eager" : "lazy"} fetchPriority={index < 4 ? "low" : undefined} />
      </Link>
      <div className={styles.cellBody}>
        <Heading className={styles.cellName}><Link href={cell.href}>{name}</Link></Heading>
        {data && <span className={`dato ${styles.cellData}`}>{data}</span>}
        <span className={styles.cellNote}>{cell.note[lang]}</span>
        {cell.status === "por-confirmar" && (
          <span className={styles.pendingTag}><CircleDashed size={14} aria-hidden="true" />{t.pending}</span>
        )}
      </div>
      <div className={styles.cellActions}>
        <Link href={cell.href} className={styles.cellLink}>{t.viewSheet}</Link>
        <button type="button" className={styles.cellAdd} onClick={add} data-added={added || undefined} aria-label={added ? t.addedOf(name) : t.addOf(name)}>
          {added ? <Check key="ok" size={16} strokeWidth={2.4} aria-hidden="true" className="mo-check" /> : <Plus key="add" size={16} strokeWidth={2.2} aria-hidden="true" />}
          <span>{added ? t.added : t.add}</span>
        </button>
      </div>
    </article>
  );
}
