import Image from "next/image";
import Link from "next/link";

export function ScreenW10() {
  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <section aria-labelledby="solutions-title" className="bg-surface-bright">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-9 sm:px-6 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <nav aria-label="Ruta de navegación" className="mb-8 font-ui-label text-ui-label text-text-muted">
              <ol className="flex items-center gap-2">
                <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-on-surface">Soluciones</li>
              </ol>
            </nav>
            <p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Infraestructura · Hierro dúctil</p>
            <h1 id="solutions-title" className="mt-3 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-.035em] text-on-surface">
              Soluciones para redes y conducción
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-text-secondary sm:text-[17px]">
              Explora las familias de productos de hierro dúctil y solicita información técnica confirmada para tu proyecto.
            </p>
            <Link
              href="/cotizar"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-center text-[15px] font-semibold text-on-primary shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-container hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transform-none"
            >
              Solicitar cotización
            </Link>
          </div>

          <figure className="relative isolate m-0 aspect-[16/10] overflow-hidden rounded-[14px] border border-border bg-surface">
            <Image
              src="/images/stitch/21e22fdbc5.jpg"
              alt="Instalación de tubería en una zanja, presentada como referencia visual"
              width={1408}
              height={768}
              sizes="(min-width: 1024px) 610px, (min-width: 640px) 90vw, 100vw"
              preload
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 text-xs font-medium text-text-secondary shadow-sm sm:bottom-5 sm:left-5">
              Imagen referencial
            </figcaption>
          </figure>
        </div>
      </section>
      <section aria-labelledby="water-title" className="bg-background">
        <div className="mx-auto grid max-w-[1200px] items-center gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-12 lg:px-8 lg:py-16">
          <figure className="relative m-0 aspect-[16/10] overflow-hidden rounded-[14px] border border-border bg-surface">
            <Image
              src="/images/stitch/d52774d1fd.jpg"
              alt="Tubería instalada para conducción de agua, presentada como referencia visual"
              width={1408}
              height={768}
              sizes="(min-width: 1024px) 590px, (min-width: 640px) 90vw, 100vw"
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 text-xs font-medium text-text-secondary shadow-sm sm:bottom-5 sm:left-5">
              Imagen referencial
            </figcaption>
          </figure>
          <div className="max-w-xl">
            <p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Solución</p>
            <h2 id="water-title" className="mt-2 text-2xl font-semibold leading-tight tracking-[-.025em] text-on-surface sm:text-3xl">
              Redes matrices de agua
            </h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              Revisa la información disponible sobre productos relacionados con redes matrices y conducción de agua.
            </p>
            <Link
              href="/soluciones/redes-matrices"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold text-primary underline decoration-border underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Ver detalle de la solución <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {[
        { id: "drainage-title", eyebrow: "Alcantarillado y drenaje", title: "Conducción de aguas residuales y drenaje pluvial", image: "/images/stitch/337606625a.jpg", alt: "Instalación de tuberías y obras de drenaje, imagen referencial.", side: "image-first" },
        { id: "roads-title", eyebrow: "Infraestructura vial", title: "Infraestructura vial urbana y autopistas", image: "/images/stitch/25544873b5.jpg", alt: "Tapa y marco en un entorno vial, imagen referencial.", side: "text-first" },
        { id: "mining-title", eyebrow: "Minería e industria", title: "Conducción en minería e industria pesada", image: "/images/stitch/60b8c5f890.jpg", alt: "Instalación industrial de conducción, imagen referencial.", side: "image-first" },
      ].map((block) => <section key={block.id} aria-labelledby={block.id} className="bg-background">
        <div className={`mx-auto grid max-w-[1200px] items-center gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:gap-12 lg:px-8 lg:py-16 ${block.side === "text-first" ? "lg:grid-cols-[.92fr_1.08fr]" : "lg:grid-cols-[1.08fr_.92fr]"}`}>
          <figure className={`relative m-0 aspect-[16/10] overflow-hidden rounded-[14px] border border-border bg-surface ${block.side === "text-first" ? "lg:order-2" : ""}`}><Image src={block.image} alt={block.alt} width={1408} height={768} sizes="(min-width: 1024px) 590px, 100vw" className="h-full w-full object-cover"/><figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 font-ui-label text-ui-label text-text-secondary">Imagen referencial</figcaption></figure>
          <div className="max-w-xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">{block.eyebrow} · aplicación por validar</p><h2 id={block.id} className="mt-2 font-headline-section text-headline-section font-semibold leading-tight text-on-surface">{block.title}</h2><p className="mt-4 font-body-default text-body-default leading-relaxed text-text-secondary">La descripción de esta aplicación, su compatibilidad y las condiciones de uso están pendientes de confirmación por FUNDIGSAC. Los detalles se revisarán según los antecedentes de cada proyecto.</p><p className="mt-4 rounded-lg border border-border bg-surface-container-low px-4 py-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">Información técnica y documentación aplicable: pendiente de validación.</p></div>
        </div>
      </section>)}
      <section aria-labelledby="support-title" className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Soporte para proyectos</p><h2 id="support-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Información técnica en revisión</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">Los servicios técnicos y la documentación disponibles se confirmarán antes de publicarse.</p></div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">{[
            { title: "Memorias de cálculo", text: "Disponibilidad y alcance pendientes de validación." },
            { title: "Metrados y especificaciones", text: "Metodología y datos técnicos pendientes de confirmación." },
            { title: "Ensayos y documentación", text: "Certificados y documentos oficiales pendientes de aprobación." },
          ].map((item) => <article key={item.title} className="rounded-xl border border-border bg-surface-elevated p-5 sm:p-6"><span aria-hidden="true" className="material-symbols-outlined text-[24px] text-primary">engineering</span><h3 className="mt-3 font-headline-card text-headline-card font-semibold text-on-surface">{item.title}</h3><p className="mt-2 min-h-16 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.text} La disponibilidad y el alcance se revisarán para cada solicitud.</p><p className="mt-4 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">Estado: pendiente de validación</p></article>)}</div>
        </div>
      </section>
      <section aria-labelledby="solutions-cta-title" className="bg-primary-container text-on-primary">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-brand-on">Siguiente paso</p><h2 id="solutions-cta-title" className="mt-2 font-headline-section text-headline-section font-semibold text-brand-on">Comparte los datos de tu proyecto</h2><p className="mt-2 font-body-compact text-body-compact leading-relaxed text-brand-on/80">El formulario permite indicar familia, medidas, cantidad y destino para solicitar información.</p></div>
          <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated px-6 font-button-text text-button-text font-semibold text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Solicitar cotización</Link>
        </div>
      </section>
    </main>
  );
}
