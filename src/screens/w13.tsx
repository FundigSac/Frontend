"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type DocumentFamily = "valvulas" | "tuberias" | "marcos";
type DocumentCategory = "catalogos" | "fichas" | "manuales" | "planos";

const documents: { title: string; description: string; category: DocumentCategory; family: DocumentFamily }[] = [
  { title: "Catálogo general de productos", description: "Contenido y edición oficial pendientes de revisión documental.", category: "catalogos", family: "valvulas" },
  { title: "Manual de instalación y manipulación", description: "Instrucciones, referencias y documentos de respaldo pendientes de aprobación.", category: "manuales", family: "tuberias" },
  { title: "Planos técnicos de productos", description: "Archivos y formatos técnicos pendientes de publicación.", category: "planos", family: "marcos" },
  { title: "Fichas técnicas de válvulas", description: "Modelos, dimensiones y valores técnicos pendientes de validación.", category: "fichas", family: "valvulas" },
  { title: "Información de conducción hidráulica", description: "Material editorial y referencias aplicables pendientes de aprobación.", category: "manuales", family: "tuberias" },
  { title: "Documentos de inspección y ensayo", description: "Protocolos y registros vigentes pendientes de confirmación.", category: "fichas", family: "marcos" },
];

const categoryFilters = [
  { id: "todas", label: "Todos los documentos" },
  { id: "catalogos", label: "Catálogos generales" },
  { id: "fichas", label: "Fichas técnicas" },
  { id: "manuales", label: "Manuales" },
  { id: "planos", label: "Planos" },
] as const;
const familyFilters = [
  { id: "todas", label: "Todas" },
  { id: "valvulas", label: "Válvulas" },
  { id: "tuberias", label: "Tuberías" },
  { id: "marcos", label: "Marcos y tapas" },
] as const;

export function ScreenW13() {
  const [category, setCategory] = useState<string>("todas");
  const [family, setFamily] = useState<string>("todas");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => documents.filter((item) =>
    (category === "todas" || item.category === category) &&
    (family === "todas" || item.family === family) &&
    item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  ), [category, family, query]);

  function resetFilters() {
    setCategory("todas");
    setFamily("todas");
    setQuery("");
  }

  return (
    <main className="min-h-screen bg-background pt-[76px] text-on-surface">
      <section aria-labelledby="resources-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-4 py-9 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav aria-label="Migas de pan" className="mb-8 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1"><li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">Inicio</Link></li><li aria-hidden="true" className="text-outline-variant">/</li><li aria-current="page" className="font-semibold text-on-surface">Recursos</li></ol>
          </nav>
          <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">Información documental</p>
          <h1 id="resources-title" className="mt-3 max-w-4xl font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">Recursos técnicos y documentación</h1>
          <p className="mt-5 max-w-3xl font-body-default text-body-default leading-relaxed text-text-secondary">Los archivos oficiales, las fichas y sus datos de revisión se publicarán cuando la documentación de FUNDIGSAC esté aprobada.</p>
        </div>
      </section>

      <section aria-label="Filtros de recursos" className="bg-surface py-8">
        <div className="mx-auto max-w-[1200px] space-y-5 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="sr-only" htmlFor="resource-search">Buscar en recursos técnicos</label>
            <input id="resource-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un documento" className="min-h-11 w-full rounded-lg border border-border bg-surface-elevated px-4 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:max-w-sm" />
            <button type="button" onClick={resetFilters} className="min-h-11 self-start rounded-md px-3 font-ui-label text-ui-label font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">Restablecer filtros</button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de documento">
            {categoryFilters.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`min-h-10 rounded-md border px-4 font-ui-label text-ui-label font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${category === item.id ? "border-primary bg-primary text-on-primary" : "border-border bg-surface-elevated text-text-secondary hover:border-primary hover:text-primary"}`}>{item.label}</button>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por familia de producto">
            {familyFilters.map((item) => <button key={item.id} type="button" aria-pressed={family === item.id} onClick={() => setFamily(item.id)} className={`min-h-9 rounded-md px-3 font-ui-label text-ui-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${family === item.id ? "bg-surface-container-high text-primary" : "text-text-secondary hover:bg-surface-container-low"}`}>{item.label}</button>)}
          </div>
        </div>
      </section>

      <section aria-label="Documentos técnicos" className="bg-background py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <p className="sr-only" aria-live="polite" role="status">{visible.length} documentos en preparación.</p>
          {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <article key={item.title} className="flex min-h-52 flex-col rounded-xl border border-border bg-surface-elevated p-5">
            <div className="flex items-start gap-4"><span aria-hidden="true" className="material-symbols-outlined text-[24px] text-primary">description</span><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-text-muted">{categoryFilters.find((filter) => filter.id === item.category)?.label}</p><h2 className="mt-2 font-headline-card text-headline-card font-semibold text-on-surface">{item.title}</h2></div></div>
            <p className="mt-4 flex-1 font-body-compact text-body-compact leading-relaxed text-text-secondary">{item.description}</p>
            <p className="mt-4 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">Documento pendiente de aprobación · Sin descarga disponible</p>
          </article>)}</div> : <div className="rounded-xl border border-border bg-surface p-8 text-center sm:py-12" role="status"><h2 className="font-headline-card text-headline-card font-semibold text-on-surface">No encontramos documentos</h2><p className="mt-2 font-body-compact text-body-compact text-text-secondary">Cambia el término o los filtros para revisar otras categorías.</p><button type="button" onClick={resetFilters} className="mt-4 min-h-10 rounded-md px-4 font-button-text text-button-text font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">Restablecer filtros</button></div>}
        </div>
      </section>

      <section className="bg-surface-container py-14">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Asistencia documental</p><h2 className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">¿Buscas un recurso específico?</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">Comparte el documento y la familia que necesitas consultar. Su disponibilidad se confirmará mediante el formulario.</p></div>
          <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-6 font-button-text text-button-text font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Solicitar información</Link>
        </div>
      </section>
    </main>
  );
}
