import Image from "next/image";
import Link from "next/link";
import { W14ShareButton } from "@/screens/islands/w14-share-button";

export function ScreenW14() {
  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <section className="border-b border-border bg-surface-container-low py-6">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <nav aria-label="Migas de pan" className="font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1"><li><Link className="hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/">Inicio</Link></li><li aria-hidden="true">/</li><li><Link className="hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/recursos">Recursos técnicos</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="font-semibold text-on-surface">Detalle del documento</li></ol>
          </nav>
        </div>
      </section>
      <section aria-labelledby="document-title" className="mx-auto grid max-w-[1200px] items-start gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-14 lg:px-8 lg:py-16">
        <figure className="relative m-0 overflow-hidden rounded-xl border border-border bg-surface-container-low p-4 sm:p-6">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface">
            <Image src="/images/stitch/dfcc89d238.jpg" alt="Composición de catálogo técnico industrial, imagen referencial; no representa un documento oficial." width={1376} height={768} sizes="(min-width: 1024px) 430px, 90vw" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-inverse-surface/80 p-5 text-brand-on"><span className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em]">Recursos técnicos</span><p className="mt-2 font-headline-card text-headline-card font-semibold">Documento pendiente de publicación</p></div>
          </div>
          <figcaption className="mt-3 font-ui-label text-ui-label text-text-muted">Imagen referencial. No es la portada de un documento oficial.</figcaption>
        </figure>
        <div className="pt-1">
          <p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Estado del recurso</p>
          <h1 id="document-title" className="mt-3 font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">Documento no publicado</h1>
          <p className="mt-5 max-w-[62ch] font-body-default text-body-default leading-relaxed text-text-secondary">El catálogo y sus datos editoriales están pendientes de revisión y aprobación. Esta página no ofrece una descarga hasta contar con un archivo oficial vigente.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {["Archivo oficial", "Edición y revisión", "Contenido técnico", "Fecha de publicación"].map((label) => <div key={label} className="rounded-lg border border-border bg-surface-elevated px-4 py-3"><span className="block font-ui-label text-ui-label text-text-muted">{label}</span><span className="mt-1 block font-body-compact text-body-compact font-semibold text-on-surface">Pendiente de validación</span></div>)}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/recursos" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-elevated px-5 font-button-text text-button-text font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Volver a Recursos</Link>
            <Link href="/cotizar" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 font-button-text text-button-text font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Pedir información</Link>
            <W14ShareButton />
          </div>
        </div>
      </section>
      <section aria-labelledby="contents-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
            <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Índice previsto</p><h2 id="contents-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Temas del catálogo por confirmar</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">La estructura editorial se definirá al aprobar la documentación oficial.</p></div>
            <ol className="grid list-none gap-3 p-0 sm:grid-cols-2">
              {[
                ["Familias de productos", "Alcance, denominaciones y agrupación del catálogo pendientes de aprobación."],
                ["Características y variantes", "Nombres, opciones y atributos se revisarán contra la información de producto validada."],
                ["Datos técnicos", "Valores, unidades y condiciones de servicio pendientes de revisión técnica."],
                ["Documentos y revisiones", "Ediciones, responsables de revisión y versiones oficiales por confirmar."],
                ["Uso e instalación", "Contenido de aplicación, manejo y montaje pendiente de aprobación."],
                ["Trazabilidad documental", "Referencias, procedencia y vigencia de cada documento por confirmar."],
              ].map(([topic, description], index) => <li key={topic} className="list-none"><details open className="group min-h-36 rounded-lg border border-border bg-surface-elevated px-4 py-5"><summary className="flex cursor-pointer list-none items-start gap-4 focus-visible:outline-2 focus-visible:outline-focus"><span aria-hidden="true" className="mt-0.5 font-ui-label text-ui-label font-semibold tabular-nums text-primary">0{index + 1}</span><span className="flex-1"><span className="block font-body-compact text-body-compact font-semibold text-on-surface">{topic}</span><span className="mt-2 block font-body-compact text-body-compact leading-relaxed text-text-secondary">{description}</span></span><span className="shrink-0 font-ui-label text-ui-label font-semibold text-primary">Detalles <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-180">⌄</span></span></summary><div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2"><p className="font-ui-label text-ui-label leading-relaxed text-text-muted">Sección editorial prevista. Texto final y referencias oficiales pendientes de validación.</p><p className="font-ui-label text-ui-label leading-relaxed text-text-muted">No se publican valores técnicos ni datos de edición hasta contar con aprobación documental.</p></div></details></li>)}
            </ol>
          </div>
        </div>
      </section>
      <section aria-labelledby="document-families-title" className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Explorar productos</p><h2 id="document-families-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Familias relacionadas</h2></div><p className="max-w-xl font-body-compact text-body-compact text-text-secondary">La documentación técnica de estas familias aún no está publicada.</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Válvulas", href: "/productos/valvulas", image: "/images/stitch/2b13bea06e.jpg", alt: "Válvula industrial, imagen referencial." },
              { title: "Tuberías", href: "/productos/tuberias", image: "/images/stitch/30886fb8af.jpg", alt: "Tuberías industriales, imagen referencial." },
              { title: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/images/stitch/1ab6f8d01e.jpg", alt: "Marco y tapa, imagen referencial." },
            ].map((family) => <Link key={family.href} href={family.href} className="group overflow-hidden rounded-xl border border-border bg-surface-elevated transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"><div className="relative aspect-[16/10] overflow-hidden bg-surface"><Image src={family.image} alt={family.alt} width={1408} height={768} sizes="(min-width: 1024px) 360px, 90vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"/><span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">Imagen referencial</span></div><div className="flex items-center justify-between px-4 py-4"><div><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{family.title}</h3><p className="mt-1 font-ui-label text-ui-label text-text-muted">Ver familia</p></div><span aria-hidden="true" className="text-primary">→</span></div></Link>)}
          </div>
        </div>
      </section>
      <section className="bg-primary-container text-brand-on">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em]">Consulta por producto</p><h2 className="mt-2 font-headline-section text-headline-section font-semibold">¿Buscas información para tu proyecto?</h2><p className="mt-2 font-body-compact text-body-compact leading-relaxed text-brand-on/80">Comparte la familia y los datos que necesitas confirmar mediante el formulario de cotización.</p></div>
          <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated px-6 font-button-text text-button-text font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Solicitar información</Link>
        </div>
      </section>
    </main>
  );
}
