"use client";

import { useActiveSection } from "@/shared/ui/content-scrollspy";

export const W20_TOC = [
  { id: "section-1", label: "1. Qué son las cookies" },
  { id: "section-2", label: "2. Cookies necesarias" },
  { id: "section-3", label: "3. Autenticación" },
  { id: "section-4", label: "4. Cookies opcionales" },
  { id: "section-5", label: "5. Control desde el navegador" },
  { id: "section-6", label: "6. Revisión de esta página" },
] as const;

const IDS = W20_TOC.map((i) => i.id);

/** Índice de la política de cookies con resaltado de la sección visible (scroll-spy). */
export function W20Toc() {
  const [active, setActive] = useActiveSection(IDS, 140);
  return (
    <nav className="space-y-1 font-body-compact text-body-compact" aria-label="Índice de la política de cookies">
      {W20_TOC.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          className={`block py-2 px-3 rounded transition-colors ${active === item.id ? "bg-surface-container text-primary font-semibold" : "hover:bg-surface-container text-text-secondary hover:text-primary"}`}
          onClick={() => setActive(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
