"use client";

import Image from "next/image";
import { useState } from "react";

type View = { src: string; label: string; alt: string; thumbClass: string };

const MAIN = {
  src: "/images/stitch/85ae6c87ca.jpg",
  alt: "Imagen referencial de una válvula industrial.",
};

const VIEWS: readonly View[] = [
  { src: "/images/stitch/09565b0ba8.jpg", label: "Vista referencial 1", alt: "Vista referencial de una válvula industrial.", thumbClass: "text-on-surface font-medium" },
  { src: "/images/stitch/e2a8bdba20.jpg", label: "Vista referencial 2", alt: "Vista referencial de una válvula industrial.", thumbClass: "text-text-secondary" },
  { src: "/images/stitch/cc33a8c3d9.jpg", label: "Vista referencial 3", alt: "Vista referencial de una válvula industrial.", thumbClass: "text-text-secondary" },
  { src: "/images/stitch/0d604b6425.jpg", label: "Vista referencial 4", alt: "Vista referencial de una válvula industrial.", thumbClass: "text-text-secondary" },
];

/**
 * Imagen principal + miniaturas. `children` son las superposiciones estáticas (badges, botón 3D, tolerancia)
 * que se renderizan en servidor dentro del marco de la imagen.
 */
export function W07Gallery({ children }: { children: React.ReactNode }) {
  // null = foto principal. Como en el diseño, ninguna miniatura tiene aro hasta que se elige una.
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? { src: MAIN.src, alt: MAIN.alt } : VIEWS[selected];

  return (
    <>
      <div className="relative w-full aspect-[4/3] rounded-xl bg-surface overflow-hidden shadow-sm flex items-center justify-center group">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={1408}
          height={768}
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
          className="w-full h-full object-cover transition-opacity duration-300"
          id="main-valve-img"
        />
        <span className="sr-only" aria-live="polite">
          {selected === null ? "Vista principal" : `Vista: ${VIEWS[selected].label}`}
        </span>
        {children}
      </div>
      {/* Miniaturas de inspección de subconjunto */}
      <div className="grid grid-cols-4 gap-3" role="group" aria-label="Vistas del producto">
        {VIEWS.map((view, index) => (
          <button
            key={view.src}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected((value) => (value === index ? null : index))}
            className={`thumbnail-btn flex flex-col items-center gap-1.5 p-1 rounded-lg bg-surface hover:bg-surface-container transition-all text-left${selected === index ? " ring-2 ring-primary" : ""}`}
          >
            <div className="w-full aspect-[4/3] rounded overflow-hidden bg-surface-container-high">
              <Image src={view.src} alt="" width={1408} height={768} sizes="(min-width: 1024px) 140px, 22vw" className="w-full h-full object-cover" />
            </div>
            <span className={`font-ui-label text-[10px] ${view.thumbClass} truncate w-full px-1 text-center`}>{view.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
