"use client";

import { useMemo } from "react";
import { useActiveSection } from "@/shared/ui/content-scrollspy";

export type TocItem = { id: string; number: string; label: string };

const OFFSET = 140; // mismo umbral que el diseño original (encabezado fijo + barra de progreso)
const ON = "text-primary font-semibold bg-surface-container";
const OFF = "text-on-surface-variant hover:text-primary hover:bg-surface";

/** Índice editorial con resaltado de la sección activa (scroll-spy) y enlaces ancla con `scroll-margin-top`. */
export function W19Toc({ items }: { items: readonly TocItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const [active, setActive] = useActiveSection(ids, OFFSET);

  return (
    <nav className="space-y-1.5 font-body-compact text-body-compact" id="toc-nav" aria-label="Índice de la política">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          className={`toc-link flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${active === item.id ? ON : OFF}`}
          onClick={() => setActive(item.id)}
        >
          <span className="text-text-muted font-ui-label text-ui-label w-5">
            {item.number}
          </span>
          <span className="truncate">
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
