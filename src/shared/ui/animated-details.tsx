import type { ComponentPropsWithoutRef } from "react";

/**
 * `<details>` nativo con entrada corta del contenido (receta `mo-drop` de `motion.css`). La altura cambia al instante:
 * animarla obliga a recalcular el diseño en cada fotograma. Conserva teclado, lector de pantalla y uso sin JavaScript.
 */
export function AnimatedDetails({ children, ...props }: ComponentPropsWithoutRef<"details">) {
  return (
    <details data-animated="" {...props}>
      {children}
    </details>
  );
}
