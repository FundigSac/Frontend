"use client";

import Image from "next/image";
import { useState } from "react";

type View = { src: string; label: string; alt: string };

const MAIN = {
  src: "/images/stitch/b018bc2b92.jpg",
  alt: "Imagen referencial de una tubería industrial.",
};

const VIEWS: readonly View[] = [
  { src: "/images/stitch/02da4b0467.jpg", label: "Vista referencial 1", alt: "Vista referencial de una tubería industrial." },
  { src: "/images/stitch/ca20261b68.jpg", label: "Vista referencial 2", alt: "Vista referencial de una tubería industrial." },
  { src: "/images/stitch/0efed1ef0d.jpg", label: "Vista referencial 3", alt: "Vista referencial de una tubería industrial." },
  { src: "/images/stitch/d6fbc56855.jpg", label: "Vista referencial 4", alt: "Vista referencial de una tubería industrial." },
];

/** Imagen principal y mosaico de miniaturas; `children` son las superposiciones estáticas del marco. */
export function W08Gallery({ children }: { children: React.ReactNode }) {
  // null = foto principal del diseño. La primera miniatura aparece resaltada desde el inicio (fidelidad con Stitch).
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? MAIN : VIEWS[selected];

  return (
    <>
      <div className="relative bg-surface rounded-xl overflow-hidden shadow-sm aspect-[16/10] flex items-center justify-center p-6">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={1408}
          height={768}
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
          className="w-full h-full object-cover rounded-lg"
          id="main-product-img"
        />
        {children}
      </div>
      {/* Thumbnails Mosaic */}
      <div className="grid grid-cols-4 gap-3" role="group" aria-label="Vistas del producto">
        {VIEWS.map((view, index) => {
          const highlighted = selected === null ? index === 0 : selected === index;
          return (
            <button
              key={view.src}
              type="button"
              aria-pressed={selected === index}
              data-img-idx={index}
              onClick={() => setSelected((value) => (value === index ? null : index))}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container p-1 shadow-sm focus:outline-none"
            >
              <Image src={view.src} alt="" width={1408} height={768} sizes="(min-width: 1024px) 140px, 22vw" className="w-full h-full object-cover rounded" />
              <div className={`absolute inset-0 ${highlighted ? "bg-primary/20 opacity-100" : "bg-primary/0"} group-hover:opacity-40 transition-opacity`} />
              <span className="absolute bottom-1 left-1 right-1 text-[10px] leading-tight font-ui-label text-on-surface bg-surface/90 px-1 py-0.5 rounded truncate">{view.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
