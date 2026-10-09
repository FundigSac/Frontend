import type { ReactNode } from "react";

/**
 * Pantallas de acceso: tarjeta compacta centrada, sin hero ni imágenes. Se mantiene la cabecera y el pie globales.
 * (Rutas fuera de la URL: el grupo "(auth)" no aparece en la dirección.)
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full pt-[76px] bg-background">
      <div className="flex min-h-[calc(100dvh-76px)] items-start justify-center px-4 py-8 sm:items-center sm:py-12">{children}</div>
    </main>
  );
}
