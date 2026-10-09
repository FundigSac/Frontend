"use client";

import Image from "next/image";
import { useState } from "react";

type View = { src: string; label: string; alt: string };

const MAIN = {
  src: "/images/stitch/245160faac.jpg",
  alt: "Imagen referencial de un marco y una tapa industriales.",
};

const VIEWS: readonly View[] = [
  { src: "/images/stitch/b56a4f115e.jpg", label: "Vista referencial 1", alt: "Vista referencial de un marco y una tapa industriales." },
  { src: "/images/stitch/dc0ead5942.jpg", label: "Vista referencial 2", alt: "Vista referencial de un marco y una tapa industriales." },
  { src: "/images/stitch/0c86b532f2.jpg", label: "Vista referencial 3", alt: "Vista referencial de un marco y una tapa industriales." },
  { src: "/images/stitch/dcd2a89b2c.jpg", label: "Vista referencial 4", alt: "Vista referencial de un marco y una tapa industriales." },
];

const LABEL = "absolute bottom-1 inset-x-1 text-center font-ui-label text-[10px] leading-tight text-brand-on bg-inverse-surface/80 rounded py-0.5 font-semibold";

/** Imagen principal + miniaturas; `children` son las superposiciones estáticas del marco de la imagen. */
export function W09Gallery({ children }: { children: React.ReactNode }) {
  // null = foto principal del diseño. La primera miniatura aparece con aro desde el inicio (fidelidad con Stitch).
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? MAIN : VIEWS[selected];

  return (
    <>
      <div className="relative bg-surface rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center group shadow-sm">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={1408}
          height={768}
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          id="main-product-view"
        />
        {children}
      </div>
      {/* Thumbnails Gallery & Interactive State */}
      <div className="grid grid-cols-4 gap-3" role="group" aria-label="Vistas del producto">
        {VIEWS.map((view, index) => {
          const ring = selected === null ? index === 0 : selected === index;
          return (
            <button
              key={view.src}
              type="button"
              aria-pressed={selected === index}
              data-img-target={index + 1}
              onClick={() => setSelected((value) => (value === index ? null : index))}
              className={`thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container transition-all ${ring ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-outline-variant"} p-0.5`}
            >
              <Image src={view.src} alt="" width={1408} height={768} sizes="(min-width: 1024px) 140px, 22vw" className="w-full h-full object-cover rounded" />{" "}
              <span className={LABEL}>{view.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
