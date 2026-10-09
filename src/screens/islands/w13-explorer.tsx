"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const families = [
  { key: "valvulas", name: "Válvulas", href: "/productos/valvulas", image: "/images/stitch/21934d3fa9.jpg", alt: "Válvula industrial; imagen referencial." },
  { key: "tuberias", name: "Tuberías", href: "/productos/tuberias", image: "/images/stitch/60efb938f5.jpg", alt: "Tuberías industriales; imagen referencial." },
  { key: "marcos", name: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/images/stitch/b2bccfdcb3.jpg", alt: "Marco y tapa; imagen referencial." },
] as const;

export function W13Explorer() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("todas");
  const visible = useMemo(() => families.filter((family) =>
    (active === "todas" || family.key === active) && family.name.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"))), [active, query]);

  return (
    <section aria-labelledby="resource-families-title" className="bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Explorar catálogo</p>
            <h2 id="resource-families-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Familias de productos</h2>
          </div>
          <label className="w-full max-w-md">
            <span className="sr-only">Buscar una familia de productos</span>
            <input className="min-h-12 w-full rounded-lg border border-border bg-surface-elevated px-4 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar válvulas, tuberías o marcos" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar familias de productos">
          {[{ key: "todas", label: "Todas" }, { key: "valvulas", label: "Válvulas" }, { key: "tuberias", label: "Tuberías" }, { key: "marcos", label: "Marcos y tapas" }].map((filter) => (
            <button key={filter.key} type="button" aria-pressed={active === filter.key} onClick={() => setActive(filter.key)} className={`min-h-10 rounded-md border px-4 font-ui-label text-ui-label font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active === filter.key ? "border-primary bg-primary text-on-primary" : "border-border bg-surface-elevated text-text-secondary hover:border-primary hover:text-primary"}`}>
              {filter.label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">{visible.length ? `${visible.length} familias disponibles` : "No hay familias que coincidan con la búsqueda"}</p>
        {visible.length ? <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visible.map((family) => <li key={family.key}>
            <Link href={family.href} className="group block h-full overflow-hidden rounded-xl border border-border bg-surface-elevated transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none">
              <figure className="relative m-0 aspect-[4/3] overflow-hidden bg-surface">
                <Image src={family.image} alt={family.alt} width={1408} height={768} sizes="(min-width: 1024px) 370px, (min-width: 640px) 45vw, 100vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
                <figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1.5 font-ui-label text-ui-label text-text-secondary">Imagen referencial</figcaption>
              </figure>
              <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4">
                <div><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{family.name}</h3><p className="mt-1 font-body-compact text-body-compact text-text-muted">Información técnica pendiente de validación</p></div>
                <span aria-hidden="true" className="text-xl text-primary transition-transform group-hover:translate-x-1 motion-reduce:transform-none">→</span>
              </div>
            </Link>
          </li>)}
        </ul> : <div className="mt-6 rounded-xl border border-border bg-surface px-6 py-10 text-center" role="status"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">No encontramos esa familia</h3><p className="mt-2 font-body-compact text-body-compact text-text-secondary">Prueba con válvulas, tuberías o marcos y tapas.</p><button type="button" onClick={() => { setQuery(""); setActive("todas"); }} className="mt-4 min-h-10 rounded-md px-4 font-button-text text-button-text font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Limpiar filtros</button></div>}
        <p className="mt-5 max-w-3xl font-body-compact text-body-compact leading-relaxed text-text-secondary">Las fichas y documentos técnicos se publicarán cuando estén revisados y aprobados.</p>
      </div>
    </section>
  );
}

const pendingDocuments = [
  { title: "Catálogos de productos", category: "catalogos" },
  { title: "Fichas técnicas", category: "fichas" },
  { title: "Manuales de instalación", category: "manuales" },
  { title: "Planos y detalles", category: "planos" },
  { title: "Certificados de lote", category: "fichas" },
  { title: "Protocolos de ensayo", category: "fichas" },
] as const;

export function W13DocumentCategories() {
  const [category, setCategory] = useState("todas");
  const categories = [
    { key: "todas", label: "Todos los tipos" },
    { key: "catalogos", label: "Catálogos" },
    { key: "fichas", label: "Fichas y certificados" },
    { key: "manuales", label: "Manuales" },
    { key: "planos", label: "Planos" },
  ];
  const visible = pendingDocuments.filter((item) => category === "todas" || item.category === category);

  return (
    <section aria-labelledby="document-types-title" className="bg-surface-container-low">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Centro documental</p><h2 id="document-types-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Tipos de documentos en preparación</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">No hay archivos técnicos aprobados para descarga por el momento. Cada categoría se habilitará cuando exista documentación oficial vigente.</p></div>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar categorías de documentos pendientes">
          {categories.map((item) => <button key={item.key} type="button" aria-pressed={category === item.key} onClick={() => setCategory(item.key)} className={`min-h-10 rounded-md border px-4 font-ui-label text-ui-label font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${category === item.key ? "border-primary bg-primary text-on-primary" : "border-border bg-surface-elevated text-text-secondary hover:border-primary hover:text-primary"}`}>{item.label}</button>)}
        </div>
        <p className="sr-only" aria-live="polite" role="status">{visible.length} categorías de documentos pendientes.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">{visible.map((item) => <article key={item.title} className="flex min-h-36 items-start gap-4 rounded-xl border border-border bg-surface-elevated p-5"><span aria-hidden="true" className="material-symbols-outlined text-[23px] text-primary">description</span><div><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{item.title}</h3><p className="mt-2 font-body-compact text-body-compact leading-relaxed text-text-secondary">Esta categoría forma parte de la estructura documental prevista. Los archivos, referencias y condiciones de uso se incorporarán después de la revisión correspondiente.</p><p className="mt-3 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">Pendiente de aprobación editorial</p></div></article>)}</div>
      </div>
    </section>
  );
}
