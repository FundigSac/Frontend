import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones Comerciales B2B",
  description: "Términos y condiciones comerciales para clientes corporativos de FUNDIGSAC.",
  robots: { index: false, follow: true },
};

export default function TermsB2BPage() {
  return (
    <main className="w-full pt-[76px] bg-background min-h-screen">
      <section className="w-full bg-surface-container-lowest py-10 lg:py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 font-ui-label text-ui-label text-text-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                home
              </span>
              <span>
                Inicio
              </span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline" aria-hidden="true">
              chevron_right
            </span>
            <span aria-current="page" className="text-on-surface font-semibold">
              Términos y condiciones B2B
            </span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-8 bg-surface-elevated rounded-xl p-6 sm:p-10 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container text-primary font-ui-label text-ui-label uppercase tracking-wider font-bold">
                <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                  gavel
                </span>
                <span>
                  Documento en preparación
                </span>
              </div>
              <h1 className="font-headline-section text-headline-section text-on-surface tracking-tight font-bold">
                Términos y Condiciones Comerciales B2B
              </h1>
              <p className="font-body-default text-body-default text-text-secondary max-w-2xl">
                El texto legal definitivo de los términos comerciales está pendiente de revisión y aprobación por parte de FUNDIGSAC S.A.C. y su asesoría legal. Mientras tanto, las condiciones aplicables a una cotización específica (plazos, forma de pago, entrega y garantías) se confirman por escrito en la proforma correspondiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/cotizar"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-all shadow-sm"
                >
                  Solicitar cotización
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-surface text-on-surface font-button-text text-button-text hover:bg-surface-container transition-colors"
                >
                  Consultar condiciones por escrito
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-surface rounded-xl p-6 space-y-3">
                <span className="font-ui-label text-ui-label text-text-muted uppercase tracking-wider block font-bold">
                  Documentos relacionados
                </span>
                <Link href="/privacidad" className="flex items-center gap-2 font-button-text text-button-text text-primary hover:underline">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    policy
                  </span>
                  <span>
                    Política de Privacidad
                  </span>
                </Link>
                <Link href="/cookies" className="flex items-center gap-2 font-button-text text-button-text text-primary hover:underline">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    cookie
                  </span>
                  <span>
                    Política de Cookies
                  </span>
                </Link>
                <Link href="/reclamaciones" className="flex items-center gap-2 font-button-text text-button-text text-primary hover:underline">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    menu_book
                  </span>
                  <span>
                    Libro de Reclamaciones
                  </span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
