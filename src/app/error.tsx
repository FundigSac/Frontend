"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Error de ejecución en una ruta. Usa solo estilos ya globales: este archivo se empaqueta con el layout raíz. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[route-error]", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="lp">
      <section className="on-dark pb-16" style={{ paddingTop: "calc(var(--header-h) + 48px)", minHeight: "60svh" }}>
        <div className="lp-shell">
          <h1 style={{ fontSize: "var(--fs-h1)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.015em", color: "#ffffff" }}>No pudimos cargar esta página</h1>
          <p className="mt-4" style={{ maxWidth: "60ch", fontSize: "var(--fs-lead)", lineHeight: "28px", color: "rgb(255 255 255 / 86%)" }}>
            Ocurrió un problema temporal. Puedes reintentar o volver al inicio. Si sigue fallando, escríbenos e indica la hora aproximada del error.
          </p>
          {error.digest ? <span className="mt-2 block" style={{ fontSize: "var(--fs-small)", color: "rgb(255 255 255 / 72%)" }}>Código de referencia: {error.digest}</span> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="lp-btn lp-btn--solid lp-btn--lg">
              Reintentar
            </button>
            <Link href="/" className="lp-btn lp-btn--outline lp-btn--lg">
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
