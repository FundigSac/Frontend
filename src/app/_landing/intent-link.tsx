"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Enlace que se precarga solo cuando hay intención (puntero encima, foco o dedo). La portada tiene más de veinte enlaces
 * visibles: precargarlos al entrar en pantalla descargaba estilos y datos de páginas que la mayoría no abre.
 */
export function IntentLink({ onMouseEnter, onFocus, onTouchStart, ...props }: React.ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    />
  );
}
