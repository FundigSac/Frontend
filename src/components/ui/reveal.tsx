import "@/styles/pages.css";
import type { CSSProperties, ReactNode } from "react";

/**
 * Entrada al hacer scroll con el sistema común de movimiento (`data-reveal`, src/shared/motion): componente de
 * servidor, sin JavaScript propio. El contenido es visible sin JavaScript y lo ya visible al cargar no se anima.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "article" | "section" }) {
  const style = delay ? ({ "--d": `${delay}ms` } as CSSProperties) : undefined;
  return <Tag className={`x-reveal ${className}`.trim()} data-reveal="" style={style}>{children}</Tag>;
}
