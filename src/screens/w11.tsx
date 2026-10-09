import Image from "next/image";
import Link from "next/link";

export function ScreenW11() {
  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-24">
        <nav aria-label="Ruta de navegación" className="mb-7 text-[13px] text-text-secondary">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/soluciones">Soluciones</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-on-surface">Redes matrices</li>
          </ol>
        </nav>

        <section aria-labelledby="solution-title" className="grid items-center gap-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-14">
          <div className="max-w-xl lg:py-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-primary">Soluciones para infraestructura</p>
            <h1 id="solution-title" className="max-w-[14ch] text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-.035em] text-on-surface">
              Redes matrices de agua
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-text-secondary sm:text-[17px]">
              Explora las familias relacionadas con conducción y solicita la información técnica confirmada para tu requerimiento.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cotizar"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-center text-[15px] font-semibold text-on-primary shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-container hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transform-none"
              >
                Solicitar cotización
              </Link>
              <Link
                href="/productos/tuberias"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-elevated px-5 py-3 text-center text-sm font-semibold text-on-surface transition-colors duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Explorar tuberías
              </Link>
            </div>
          </div>

          <figure className="relative isolate m-0 aspect-[4/3] overflow-hidden rounded-[14px] border border-border bg-surface p-4 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f6f8f9_72%)]" />
            <Image
              src="/images/stitch/c49215905b.jpg"
              alt="Tubería instalada en una zanja, presentada como referencia visual"
              width={1408}
              height={768}
              sizes="(min-width: 1024px) 620px, (min-width: 640px) 90vw, 100vw"
              preload
              className="h-full w-full rounded-lg object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 text-xs font-medium text-text-secondary shadow-sm sm:bottom-5 sm:left-5">
              Imagen referencial
            </figcaption>
          </figure>
        </section>

        <aside aria-label="Estado de información" className="mt-12 rounded-lg border border-border bg-surface px-4 py-4 sm:mt-16 sm:px-5">
          <p className="text-sm leading-6 text-text-secondary">
            Los datos técnicos y la documentación de esta solución están pendientes de validación. La información por producto se confirmará antes de publicarse.
          </p>
        </aside>
        <section aria-labelledby="project-review-title" className="mt-12 bg-surface-container-low p-5 sm:mt-14 sm:p-8 lg:p-10">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Antes de definir componentes</p><h2 id="project-review-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Aspectos del proyecto por confirmar</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">Las condiciones dependen del requerimiento y deben revisarse con información técnica aprobada.</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Altas presiones y transitorios", body: "Las condiciones hidráulicas y los requisitos del proyecto deben revisarse antes de definir componentes o atribuir un desempeño." },
              { title: "Terreno y condiciones de instalación", body: "La topografía, el suelo y los requerimientos de montaje se evaluarán con antecedentes validados de cada obra." },
              { title: "Calidad sanitaria del agua", body: "Los materiales, revestimientos y documentos asociados están pendientes de confirmación para cada producto." },
            ].map((item) => <article key={item.title} className="min-h-52 rounded-lg border border-border bg-surface-elevated p-5"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{item.title}</h3><p className="mt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.body}</p><p className="mt-4 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">Datos y criterios: pendientes de validación</p></article>)}
          </div>
        </section>
        <section aria-labelledby="related-families" className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Componentes relacionados</p><h2 id="related-families" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Explora las familias disponibles</h2></div>
            <Link href="/productos" className="font-button-text text-button-text font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">Ver productos <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Válvulas", href: "/productos/valvulas", image: "/images/stitch/21934d3fa9.jpg", alt: "Válvula industrial, imagen referencial.", details: ["Modelos y variantes por confirmar", "Ficha técnica pendiente"] },
              { name: "Tuberías", href: "/productos/tuberias", image: "/images/stitch/60efb938f5.jpg", alt: "Tuberías industriales, imagen referencial.", details: ["Medidas y conexiones por confirmar", "Documentación pendiente"] },
              { name: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/images/stitch/b2bccfdcb3.jpg", alt: "Marco y tapa, imagen referencial.", details: ["Modelos y configuraciones por confirmar", "Ficha técnica pendiente"] },
              { name: "Válvula de aire y purga", href: "/productos/valvulas", image: "/images/stitch/a70182bfeb.jpg", alt: "Válvula industrial, imagen referencial.", details: ["Oferta y configuración por confirmar", "Documentación técnica pendiente"] },
            ].map((family) => <Link key={family.href} href={family.href} className="group overflow-hidden rounded-xl border border-border bg-surface-elevated transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <div className="relative aspect-[16/9] overflow-hidden bg-surface"><Image src={family.image} alt={family.alt} width={1408} height={768} sizes="(min-width: 1024px) 360px, 90vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none" /><span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">Imagen referencial</span></div>
              <div className="px-4 py-4"><div className="flex items-center justify-between gap-3"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{family.name}</h3><span aria-hidden="true" className="text-primary">→</span></div><ul className="mt-3 list-none space-y-1 border-t border-border pt-3 p-0">{family.details.map((detail) => <li key={detail} className="font-ui-label text-ui-label text-text-muted">{detail}</li>)}</ul></div>
            </Link>)}
          </div>
        </section>
        <section aria-labelledby="solution-documents-title" className="mt-12 rounded-xl border border-border bg-surface p-5 sm:mt-14 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Biblioteca técnica</p><h2 id="solution-documents-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Documentos en preparación</h2></div><Link href="/recursos" className="font-button-text text-button-text font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">Ver estado de Recursos <span aria-hidden="true">→</span></Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{["Fichas técnicas", "Manuales de instalación", "Planos y detalles"].map((doc) => <div key={doc} className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3"><span aria-hidden="true" className="material-symbols-outlined text-[22px] text-primary">description</span><div><h3 className="font-body-compact text-body-compact font-semibold text-on-surface">{doc}</h3><p className="mt-1 font-ui-label text-ui-label text-text-muted">Pendiente de aprobación</p></div></div>)}</div>
        </section>
        <section className="mt-12 flex flex-col gap-4 rounded-xl bg-primary px-5 py-6 text-brand-on sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em]">Cotización</p><h2 className="mt-1 font-headline-section text-headline-section font-semibold">Envía los datos de tu requerimiento</h2><p className="mt-2 max-w-2xl font-body-compact text-body-compact leading-relaxed text-brand-on/80">Medidas, cantidades y destino se solicitan en el formulario para revisar tu consulta.</p></div>
          <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated px-6 font-button-text text-button-text font-semibold text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Solicitar cotización</Link>
        </section>
      </div>
    </main>
  );
}
