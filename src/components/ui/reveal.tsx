"use client";
import "@/styles/pages.css";
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

/**
 * Anima la entrada al hacer scroll. El contenido es visible sin JavaScript y
 * solo se oculta (opacidad y desplazamiento, sin cambiar el layout) cuando el
 * elemento aún está fuera de la pantalla.
 */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "article" | "section" }) {
  const ref = useRef<HTMLDivElement & HTMLLIElement & HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;
    el.classList.add("x-hide");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("is-in");
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const cls = `x-reveal ${className}`.trim();
  const style = { "--d": `${delay}ms` } as CSSProperties;
  if (as === "li") return <li ref={ref as RefObject<HTMLLIElement>} className={cls} style={style}>{children}</li>;
  if (as === "article") return <article ref={ref as RefObject<HTMLElement>} className={cls} style={style}>{children}</article>;
  if (as === "section") return <section ref={ref as RefObject<HTMLElement>} className={cls} style={style}>{children}</section>;
  return <div ref={ref as RefObject<HTMLDivElement>} className={cls} style={style}>{children}</div>;
}
