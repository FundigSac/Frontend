/**
 * Navegación con flechas para grupos de controles (tabs, radio groups, listas de botones).
 * Devuelve el nuevo índice o `null` si la tecla no navega.
 */
export function rovingKeyIndex(key: string, index: number, count: number, orientation: "horizontal" | "vertical" | "both" = "horizontal"): number | null {
  if (count <= 0) return null;
  const next = orientation !== "vertical" ? "ArrowRight" : "ArrowDown";
  const prev = orientation !== "vertical" ? "ArrowLeft" : "ArrowUp";
  const isNext = key === next || (orientation === "both" && key === "ArrowDown");
  const isPrev = key === prev || (orientation === "both" && key === "ArrowUp");
  if (isNext) return (index + 1) % count;
  if (isPrev) return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/** ¿El usuario pidió reducir el movimiento? (seguro en SSR: devuelve false). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
