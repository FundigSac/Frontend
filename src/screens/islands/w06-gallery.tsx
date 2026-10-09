"use client";

import Image from "next/image";
import { useState } from "react";

type View = { src: string; label: string; alt: string };

const MAIN: View = {
  src: "/images/stitch/e040dd773f.jpg",
  label: "Imagen referencial",
  alt: "Imagen referencial de una válvula industrial.",
};

const VIEWS: readonly View[] = [
  { src: "/images/stitch/a3ab792d88.jpg", label: "Vista referencial 1", alt: "Vista referencial de una válvula industrial." },
  { src: "/images/stitch/622f180f9a.jpg", label: "Vista referencial 2", alt: "Vista referencial de una válvula industrial." },
  { src: "/images/stitch/8f911a83cf.jpg", label: "Vista referencial 3", alt: "Vista referencial de una válvula industrial." },
  { src: "/images/stitch/67191e3db2.jpg", label: "Vista referencial 4", alt: "Vista referencial de una válvula industrial." },
];

const MAIN_SIZES = "(min-width: 1024px) 600px, 100vw";
const THUMB_SIZES = "(min-width: 1024px) 150px, 22vw";

export function W06Gallery() {
  // null = foto principal del diseño. El primer thumbnail se pinta resaltado desde el inicio (fidelidad con Stitch).
  const [selected, setSelected] = useState<number | null>(null);
  const view = selected === null ? MAIN : VIEWS[selected];

  return (
    <>
      <div className="relative bg-surface rounded-xl overflow-hidden shadow-sm aspect-[4/3] flex items-center justify-center p-6">
        <span className="absolute left-4 top-4 z-10 rounded bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label font-semibold text-on-surface shadow-sm">Imagen referencial</span>
        <span className="absolute right-4 top-4 z-10 rounded bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-muted shadow-sm">Información técnica pendiente</span>
        <Image
          key={view.src}
          src={view.src}
          alt={view.alt}
          width={1408}
          height={768}
          sizes={MAIN_SIZES}
          priority
          className="w-full h-full object-contain mix-blend-multiply"
          id="mainProductView"
        />
        <div className="absolute bottom-3 left-4 text-text-muted font-ui-label text-[11px]" aria-live="polite">
          Vista: {view.label}
        </div>
      </div>
      {/* Technical Thumbnails Selector */}
      <div className="grid grid-cols-4 gap-3" role="group" aria-label="Vistas del producto">
        {VIEWS.map((item, index) => {
          const highlighted = selected === null ? index === 0 : selected === index;
          return (
            <button
              key={item.src}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected((current) => (current === index ? null : index))}
              className={`group flex flex-col items-center ${highlighted ? "bg-surface-container-low" : "bg-surface-elevated"} p-2 rounded-lg hover:bg-surface-container transition-colors text-left`}
            >
              <div className="w-full aspect-[4/3] bg-surface rounded overflow-hidden flex items-center justify-center mb-1.5">
                <Image src={item.src} alt="" width={1408} height={768} sizes={THUMB_SIZES} className="w-full h-full object-contain" />
              </div>
          <span className="font-ui-label text-[11px] text-on-surface-variant group-hover:text-primary leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
