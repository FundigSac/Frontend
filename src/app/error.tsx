"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Error de ejecución en una ruta: mismo lenguaje visual que W21 (sin exponer detalles técnicos). */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[route-error]", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="w-full pt-[76px] bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container text-primary font-ui-label text-ui-label tracking-wider uppercase shadow-sm">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-danger" />
          <span>Error inesperado</span>
        </div>
        <h1 className="font-headline-section text-headline-section text-on-surface tracking-tight font-bold">No pudimos cargar esta página</h1>
        <p className="font-body-default text-body-default text-text-secondary max-w-xl">
          Ocurrió un problema temporal. Puede reintentar o volver al inicio. Si persiste, contáctenos e indique la hora aproximada del error.
          {error.digest ? <span className="block mt-2 font-ui-label text-ui-label text-text-muted">Código de referencia: {error.digest}</span> : null}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-all shadow-sm">
            Reintentar
          </button>
          <Link href="/" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-surface-container-lowest text-on-surface border border-border font-button-text text-button-text hover:bg-surface-container transition-all shadow-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
