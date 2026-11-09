"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { SHEET_UI } from "./sheet-copy";
import { useCopy } from "./use-copy";

export type TocItem = { id: string; number: string; label: string };

/** Índice de la lámina: fijo desde 1024 px y plegable en móvil. Resalta al instante la sección visible. */
export function LegalToc({ items, label }: { items: readonly TocItem[]; label: string }) {
  const ui = useCopy(SHEET_UI);
  const listId = useId();
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const nodes = items.map((i) => document.getElementById(i.id)).filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    setOpen(false);
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // El índice se pliega antes de desplazar: así el destino no queda descolocado.
    window.requestAnimationFrame(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <nav className="lg-toc" aria-label={label} data-open={open ? "" : undefined}>
      <span className="lg-toc__label">{ui.onThisPage}</span>
      <button type="button" className="lg-toc__toggle" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((v) => !v)}>
        {ui.onThisPage}
        <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
      </button>
      <ol id={listId}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined} onClick={(e) => go(e, item.id)}>
              <span aria-hidden="true">{item.number}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
