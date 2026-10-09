import Image from "next/image";
import Link from "next/link";
import { W06Gallery } from "@/screens/islands/w06-gallery";
import { W06Tabs } from "@/screens/islands/w06-tabs";

const pending = ["Configuración", "Dimensiones", "Materiales", "Presión", "Conexión", "Documentación", "Ensayos", "Condiciones de trabajo"]
const related = [
  { image: "/images/stitch/651385f5f8.jpg", title: "Accesorios para tubería" },
  { image: "/images/stitch/759c3eb59a.jpg", title: "Adaptadores y uniones" },
  { image: "/images/stitch/50891dbe30.jpg", title: "Componentes de línea" },
];

export function ScreenW06() {
  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <nav aria-label="Ruta de navegación" className="mb-7 font-ui-label text-ui-label text-text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/">Inicio</Link></li><li aria-hidden="true">/</li>
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/productos">Productos</Link></li><li aria-hidden="true">/</li>
            <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus" href="/productos/valvulas">Válvulas</Link></li><li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-on-surface">Válvula de compuerta</li>
          </ol>
        </nav>

        <section aria-labelledby="product-title" className="grid items-start gap-8 pb-12 lg:grid-cols-12 lg:gap-8 lg:pb-16">
          <div className="space-y-3 lg:col-span-7">
            <W06Gallery />
            <p className="rounded-lg border border-border bg-surface-container-low px-4 py-3 font-ui-label text-ui-label text-text-secondary">Las vistas son referenciales; los datos de producto están pendientes de validación.</p>
          </div>
          <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-7 lg:col-span-5 lg:p-8">
            <div className="space-y-2">
              <p className="inline-flex rounded bg-surface-container px-2.5 py-1 font-ui-label text-ui-label font-semibold uppercase tracking-[.1em] text-primary">Ficha de producto · Información pendiente</p>
              <h1 id="product-title" className="font-headline-section text-headline-section font-bold leading-tight tracking-tight text-on-surface">Válvula de compuerta</h1>
              <p className="font-body-default text-body-default leading-relaxed text-text-secondary">Consulta esta familia para tu proyecto. El equipo confirmará las opciones y su información técnica.</p>
            </div>
            <dl className="divide-y divide-border rounded-lg bg-surface p-4">
              {pending.slice(0, 4).map((label) => <div key={label} className="flex min-h-11 items-center justify-between gap-3 py-2"><dt className="font-body-compact text-body-compact text-text-secondary">{label}</dt><dd className="m-0 font-ui-label text-ui-label font-medium text-text-muted">Pendiente de validación</dd></div>)}
            </dl>
            <Link href="/cotizar" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 font-button-text text-button-text font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none">Solicitar cotización</Link>
            <p className="font-ui-label text-ui-label text-text-muted">Indica el producto en el formulario para consultar esta referencia.</p>
          </div>
        </section>
      </div>

      <section aria-labelledby="technical-title" className="bg-surface-container-low py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">Información técnica</p><h2 id="technical-title" className="mt-1 font-headline-section text-headline-section font-bold tracking-tight">Datos del producto</h2></div>
            <span className="rounded bg-surface-container px-3 py-1.5 font-ui-label text-ui-label font-semibold text-text-muted">Pendiente de validación</span>
          </div>
          <W06Tabs panels={{
            specs: <PendingPanel rows={pending} />,
            conditions: <PendingPanel rows={["Aplicación", "Condiciones de trabajo", "Compatibilidad", "Mantenimiento", "Ciclo operativo", "Protección"]} />,
            standards: <PendingPanel rows={["Normas aplicables", "Certificaciones", "Ensayos", "Documentación técnica", "Declaraciones", "Trazabilidad"]} />,
          }} />
        </div>
      </section>

      <section aria-labelledby="dimensions-title" className="bg-surface py-12 sm:py-16"><div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">Dimensiones de referencia</p><h2 id="dimensions-title" className="mt-1 font-headline-section text-headline-section font-bold">Tabla dimensional y características mecánicas</h2></div><span className="rounded bg-surface-container px-3 py-1.5 font-ui-label text-ui-label text-text-muted">Unidades y valores pendientes</span></div><div className="overflow-x-auto rounded-xl border border-border bg-surface-container-lowest" role="region" aria-label="Tabla dimensional de válvula pendiente de validación" tabIndex={0}><table className="w-full min-w-[980px] border-collapse text-left font-ui-label text-ui-label"><thead className="bg-surface-container"><tr>{["Parámetro", "Referencia A", "Referencia B", "Referencia C", "Valor", "Unidad", "Documento", "Estado"].map((label) => <th key={label} scope="col" className="px-3 py-3 font-semibold text-on-surface">{label}</th>)}</tr></thead><tbody>{["Diámetro nominal", "Dimensión de conexión", "Altura total", "Altura de montaje", "Distancia entre bridas", "Peso del conjunto", "Materiales", "Presión de trabajo", "Revestimiento"].map((label) => <tr key={label} className="border-t border-border even:bg-surface-container-low"><th scope="row" className="px-3 py-3 font-medium text-on-surface">{label}</th>{Array.from({ length: 7 }, (_, index) => <td key={index} className="px-3 py-3 text-text-muted">{index === 5 ? "No publicado" : "Pendiente"}</td>)}</tr>)}</tbody></table></div><p className="mt-3 font-ui-label text-ui-label text-text-muted">La tabla conserva los campos de consulta; sus valores requieren una fuente técnica aprobada.</p></div></section>

                        <section aria-labelledby="related-title" className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">Catálogo</p><h2 id="related-title" className="mt-1 font-headline-section text-headline-section font-bold">Otras referencias</h2></div><Link href="/productos" className="font-button-text text-button-text font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus">Ver familias</Link></div>
          <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <article key={item.image} className="overflow-hidden rounded-xl border border-border bg-surface-container-lowest"><div className="relative aspect-[4/3] bg-surface-container"><Image src={item.image} alt="Imagen referencial de un accesorio industrial." width={1408} height={768} sizes="(min-width: 768px) 33vw, 100vw" className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded bg-surface-container-lowest/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">Imagen referencial</span></div><div className="p-4"><h3 className="font-headline-card text-headline-card font-semibold">{item.title}</h3><p className="mt-2 font-ui-label text-ui-label text-text-muted">Información del producto pendiente de validación.</p></div></article>)}</div>
        </div>
      </section>
      <section aria-labelledby="request-details-title" className="bg-surface-container-low py-12 sm:py-16"><div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8"><div className="mb-6"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">Consulta</p><h2 id="request-details-title" className="mt-1 font-headline-section text-headline-section font-bold">Requisitos del proyecto</h2><p className="mt-2 max-w-3xl font-body-default text-body-default text-text-secondary">Comparte los datos necesarios en la solicitud general; las especificaciones de esta ficha están pendientes.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{["Producto", "Configuración", "Cantidad", "Lugar de entrega", "Documentación", "Observaciones"].map((label) => <div key={label} className="min-h-[88px] rounded-xl border border-border bg-surface-container-lowest p-4"><p className="font-ui-label text-ui-label font-semibold text-on-surface">{label}</p><p className="mt-2 font-body-compact text-body-compact text-text-muted">Completa este dato en el formulario oficial.</p></div>)}</div><Link href="/cotizar" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 font-button-text text-button-text font-semibold text-on-primary hover:bg-primary-container">Abrir formulario de cotización</Link></div></section>
          </main>
  );
}

function PendingPanel({ rows }: { rows: string[] }) {
  return <div className="grid gap-3 rounded-xl border border-border bg-surface-container-lowest p-4 sm:grid-cols-2 sm:p-5">{rows.map((label) => <div key={label} className="flex min-h-16 items-center justify-between gap-3 rounded-lg bg-surface p-4"><span className="font-body-compact text-body-compact text-text-secondary">{label}</span><span className="text-right font-ui-label text-ui-label font-semibold text-text-muted">Pendiente de validación</span></div>)}</div>;
}
