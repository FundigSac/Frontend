import Image from "next/image";
import Link from "next/link";

export function ScreenW12() {
  return (
    <main className="min-h-screen w-full bg-background pt-[76px]">
      <section aria-labelledby="about-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-6 py-10 sm:py-14 lg:py-16">
          <nav aria-label="Migas de pan" className="mb-7 font-ui-label text-ui-label text-text-muted">
            <ol className="flex items-center gap-2">
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li aria-current="page" className="font-semibold text-on-surface">Nosotros</li>
            </ol>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
            <div className="max-w-xl">
              <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">
                FUNDIGSAC
              </p>
              <h1 id="about-title" className="mt-3 font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">
                Información corporativa de FUNDIGSAC
              </h1>
              <p className="mt-5 max-w-lg font-body-default text-body-default leading-relaxed text-text-secondary">
                La historia, las instalaciones, los procesos y las capacidades de la empresa se publicarán cuando su contenido institucional esté aprobado.
              </p>
              <div className="mt-6 inline-flex max-w-lg items-start gap-3 rounded-lg border border-border bg-surface-container-lowest px-4 py-3.5">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[18px] text-primary">info</span>
                <p className="font-body-compact text-body-compact leading-relaxed text-text-secondary">
                  Contenido corporativo pendiente de validación.
                </p>
              </div>
              <Link
                href="/cotizar"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-button-text text-button-text text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
              >
                Solicitar cotización
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            <figure className="relative m-0 aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-container-lowest shadow-sm">
              <Image src="/images/stitch/620ac21cbe.jpg" alt="Escena de almacén industrial utilizada como imagen referencial; no representa las instalaciones de FUNDIGSAC." width={1408} height={768} sizes="(min-width: 1024px) 600px, 100vw" preload className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-inverse-surface/80 px-4 py-3 text-brand-on sm:px-5"><span className="block font-body-compact text-body-compact font-semibold">Instalaciones y capacidad operativa</span><span className="mt-1 block font-ui-label text-ui-label text-brand-on/80">Información institucional pendiente de validación</span><span className="sr-only">Imagen referencial.</span></figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section aria-labelledby="operation-pillars-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-6 py-10 sm:py-14 lg:px-8 lg:py-16">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Información por validar</p><h2 id="operation-pillars-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Ejes de información técnica y comercial</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">Los datos de operación, asistencia y ensayos se publicarán cuando estén respaldados y aprobados.</p></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              { name: "Suministro de productos", image: "/images/stitch/620ac21cbe.jpg", alt: "Almacenamiento industrial, imagen referencial; no representa instalaciones de FUNDIGSAC." },
              { name: "Asistencia de proyecto", image: "/images/stitch/683a6c7846.jpg", alt: "Revisión técnica industrial, imagen referencial; no representa personal de FUNDIGSAC." },
              { name: "Ensayos y homologación", image: "/images/stitch/4af35b56cc.jpg", alt: "Equipo de inspección industrial, imagen referencial; no acredita ensayos de FUNDIGSAC." },
            ].map((item) => <article key={item.name} className="overflow-hidden rounded-xl border border-border bg-surface-elevated"><div className="relative aspect-[16/9] overflow-hidden bg-surface"><Image src={item.image} alt={item.alt} width={1408} height={768} sizes="(min-width: 1024px) 360px, 90vw" className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">Imagen referencial</span></div><div className="p-5"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{item.name}</h3><p className="mt-2 font-body-compact text-body-compact text-text-muted">Contenido pendiente de validación</p></div></article>)}
          </div>
        </div>
      </section>
      <section aria-labelledby="quality-review-title" className="bg-surface-container-lowest">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-16">
          <figure className="relative m-0 aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface"><Image src="/images/stitch/683a6c7846.jpg" alt="Inspección técnica industrial, imagen referencial que no representa personal ni procesos de FUNDIGSAC." width={1408} height={768} sizes="(min-width: 1024px) 500px, 100vw" className="h-full w-full object-cover"/><figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-3 py-2 font-ui-label text-ui-label text-text-secondary">Imagen referencial</figcaption></figure>
          <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Calidad y control</p><h2 id="quality-review-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Información técnica pendiente de revisión</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">Los materiales, métodos de ensayo y criterios de control se incorporarán con documentación verificada.</p><dl className="mt-6 grid gap-3 sm:grid-cols-2">{["Materiales", "Normas técnicas", "Ensayos", "Trazabilidad"].map((label) => <div key={label} className="rounded-lg border border-border bg-surface px-4 py-3"><dt className="font-body-compact text-body-compact font-semibold text-on-surface">{label}</dt><dd className="mt-1 font-ui-label text-ui-label text-text-muted">Pendiente de validación</dd></div>)}</dl></div>
        </div>
      </section>
      <section aria-labelledby="coverage-title" className="bg-background">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-16">
          <div className="lg:col-span-2"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Alcance del servicio</p><h2 id="coverage-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Presencia y capacidad logística en revisión</h2><p className="mt-3 max-w-3xl font-body-default text-body-default leading-relaxed text-text-secondary">La información de cobertura, disponibilidad y modalidades de entrega se confirmará con FUNDIGSAC antes de su publicación.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{[
            { title: "Flota y plataformas", text: "Tipos de unidades, capacidades y condiciones de operación pendientes de validación." },
            { title: "Disponibilidad de productos", text: "Inventario, familias disponibles y plazos de atención pendientes de confirmación." },
            { title: "Cobertura y despacho", text: "Destinos, condiciones de entrega y coordinación logística pendientes de revisión." },
          ].map((item) => <article key={item.title} className="min-h-40 rounded-xl border border-border bg-surface-elevated p-5"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{item.title}</h3><p className="mt-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.text}</p><p className="mt-4 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">Pendiente de validación</p></article>)}</div></div>
        </div>
      </section>
      <section className="bg-primary-container text-brand-on"><div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14 lg:px-8"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em]">Consulta comercial</p><h2 className="mt-2 font-headline-section text-headline-section font-semibold">Comparte tu requerimiento</h2><p className="mt-2 font-body-compact text-body-compact text-brand-on/80">La información de producto y las condiciones se revisan para cada solicitud.</p></div><Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated px-6 font-button-text text-button-text font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Solicitar cotización</Link></div></section>
    </main>
  );
}
