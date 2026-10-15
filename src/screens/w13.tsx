"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Pair } from "@/app/_legal/copy";
import { useCopy } from "@/app/_legal/use-copy";

type DocumentFamily = "valvulas" | "tuberias" | "marcos";
type DocumentCategory = "catalogos" | "fichas" | "manuales" | "planos";

const COPY: Pair<{
  breadcrumbLabel: string;
  home: string;
  resources: string;
  eyebrow: string;
  title: string;
  lead: string;
  searchLabel: string;
  searchPlaceholder: string;
  reset: string;
  filtersLabel: string;
  categoryGroup: string;
  familyGroup: string;
  documentsLabel: string;
  count: (n: number) => string;
  pending: string;
  emptyTitle: string;
  emptyText: string;
  assistEyebrow: string;
  assistTitle: string;
  assistText: string;
  assistCta: string;
  categories: Record<"todas" | "catalogos" | "fichas" | "manuales" | "planos", string>;
  families: Record<"todas" | "valvulas" | "tuberias" | "marcos", string>;
  documents: Record<string, { title: string; description: string }>;
}> = {
  es: {
    breadcrumbLabel: "Migas de pan",
    home: "Inicio",
    resources: "Recursos",
    eyebrow: "Información documental",
    title: "Recursos técnicos y documentación",
    lead: "Los archivos oficiales, las fichas y sus datos de revisión se publicarán cuando la documentación de FUNDIGSAC esté aprobada.",
    searchLabel: "Buscar en recursos técnicos",
    searchPlaceholder: "Buscar un documento",
    reset: "Restablecer filtros",
    filtersLabel: "Filtros de recursos",
    categoryGroup: "Filtrar por tipo de documento",
    familyGroup: "Filtrar por familia de producto",
    documentsLabel: "Documentos técnicos",
    count: (n) => `${n} documentos en preparación.`,
    pending: "Documento pendiente de aprobación · Sin descarga disponible",
    emptyTitle: "No encontramos documentos",
    emptyText: "Cambia el término o los filtros para revisar otras categorías.",
    assistEyebrow: "Asistencia documental",
    assistTitle: "¿Buscas un recurso específico?",
    assistText: "Comparte el documento y la familia que necesitas consultar. Su disponibilidad se confirmará mediante el formulario.",
    assistCta: "Solicitar información",
    categories: { todas: "Todos los documentos", catalogos: "Catálogos generales", fichas: "Fichas técnicas", manuales: "Manuales", planos: "Planos" },
    families: { todas: "Todas", valvulas: "Válvulas", tuberias: "Tuberías", marcos: "Marcos y tapas" },
    documents: {
      catalogo: { title: "Catálogo general de productos", description: "Contenido y edición oficial pendientes de revisión documental." },
      manual: { title: "Manual de instalación y manipulación", description: "Instrucciones, referencias y documentos de respaldo pendientes de aprobación." },
      planos: { title: "Planos técnicos de productos", description: "Archivos y formatos técnicos pendientes de publicación." },
      fichas: { title: "Fichas técnicas de válvulas", description: "Modelos, dimensiones y valores técnicos pendientes de validación." },
      conduccion: { title: "Información de conducción hidráulica", description: "Material editorial y referencias aplicables pendientes de aprobación." },
      inspeccion: { title: "Documentos de inspección y ensayo", description: "Protocolos y registros vigentes pendientes de confirmación." },
    },
  },
  en: {
    breadcrumbLabel: "Breadcrumb",
    home: "Home",
    resources: "Resources",
    eyebrow: "Document information",
    title: "Technical resources and documentation",
    lead: "Official files, data sheets and their review details will be published once FUNDIGSAC documentation is approved.",
    searchLabel: "Search technical resources",
    searchPlaceholder: "Search a document",
    reset: "Reset filters",
    filtersLabel: "Resource filters",
    categoryGroup: "Filter by document type",
    familyGroup: "Filter by product family",
    documentsLabel: "Technical documents",
    count: (n) => `${n} documents in preparation.`,
    pending: "Document pending approval · No download available",
    emptyTitle: "No documents found",
    emptyText: "Change the search term or filters to review other categories.",
    assistEyebrow: "Document assistance",
    assistTitle: "Looking for a specific resource?",
    assistText: "Tell us the document and product family you need. Availability will be confirmed through the form.",
    assistCta: "Request information",
    categories: { todas: "All documents", catalogos: "General catalogs", fichas: "Technical data sheets", manuales: "Manuals", planos: "Drawings" },
    families: { todas: "All", valvulas: "Valves", tuberias: "Pipes", marcos: "Frames and covers" },
    documents: {
      catalogo: { title: "General product catalog", description: "Official content and edition pending documentary review." },
      manual: { title: "Installation and handling manual", description: "Instructions, references and supporting documents pending approval." },
      planos: { title: "Technical product drawings", description: "Technical files and formats pending publication." },
      fichas: { title: "Valve technical data sheets", description: "Models, dimensions and technical values pending validation." },
      conduccion: { title: "Hydraulic conveyance information", description: "Editorial material and applicable references pending approval." },
      inspeccion: { title: "Inspection and test documents", description: "Current protocols and records pending confirmation." },
    },
  },
};

const documents: { key: string; category: DocumentCategory; family: DocumentFamily }[] = [
  { key: "catalogo", category: "catalogos", family: "valvulas" },
  { key: "manual", category: "manuales", family: "tuberias" },
  { key: "planos", category: "planos", family: "marcos" },
  { key: "fichas", category: "fichas", family: "valvulas" },
  { key: "conduccion", category: "manuales", family: "tuberias" },
  { key: "inspeccion", category: "fichas", family: "marcos" },
];

const CATEGORY_IDS = ["todas", "catalogos", "fichas", "manuales", "planos"] as const;
const FAMILY_IDS = ["todas", "valvulas", "tuberias", "marcos"] as const;

export function ScreenW13() {
  const t = useCopy(COPY);
  const [category, setCategory] = useState<string>("todas");
  const [family, setFamily] = useState<string>("todas");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => documents.filter((item) => {
    const title = t.documents[item.key].title;
    return (category === "todas" || item.category === category) &&
      (family === "todas" || item.family === family) &&
      title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }), [category, family, query, t]);

  function resetFilters() {
    setCategory("todas");
    setFamily("todas");
    setQuery("");
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <section aria-labelledby="resources-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-4 py-9 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav aria-label={t.breadcrumbLabel} className="mb-8 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1"><li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">{t.home}</Link></li><li aria-hidden="true" className="text-outline-variant">/</li><li aria-current="page" className="font-semibold text-on-surface">{t.resources}</li></ol>
          </nav>
          <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">{t.eyebrow}</p>
          <h1 id="resources-title" className="mt-3 max-w-4xl font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">{t.title}</h1>
          <p className="mt-5 max-w-3xl font-body-default text-body-default leading-relaxed text-text-secondary">{t.lead}</p>
        </div>
      </section>

      <section aria-label={t.filtersLabel} className="bg-surface py-8">
        <div className="mx-auto max-w-[1200px] space-y-5 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="sr-only" htmlFor="resource-search">{t.searchLabel}</label>
            <input id="resource-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className="min-h-11 w-full rounded-lg border border-border bg-surface-elevated px-4 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:max-w-sm" />
            <button type="button" onClick={resetFilters} className="min-h-11 self-start rounded-md px-3 font-ui-label text-ui-label font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">{t.reset}</button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.categoryGroup}>
            {CATEGORY_IDS.map((id) => <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)} className={`min-h-10 rounded-md border px-4 font-ui-label text-ui-label font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${category === id ? "border-primary bg-primary text-on-primary" : "border-border bg-surface-elevated text-text-secondary hover:border-primary hover:text-primary"}`}>{t.categories[id]}</button>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.familyGroup}>
            {FAMILY_IDS.map((id) => <button key={id} type="button" aria-pressed={family === id} onClick={() => setFamily(id)} className={`min-h-9 rounded-md px-3 font-ui-label text-ui-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${family === id ? "bg-surface-container-high text-primary" : "text-text-secondary hover:bg-surface-container-low"}`}>{t.families[id]}</button>)}
          </div>
        </div>
      </section>

      <section aria-label={t.documentsLabel} className="bg-background py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <p className="sr-only" aria-live="polite" role="status">{t.count(visible.length)}</p>
          {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <article key={item.key} className="flex min-h-52 flex-col rounded-xl border border-border bg-surface-elevated p-5">
            <div className="flex items-start gap-4"><span aria-hidden="true" className="material-symbols-outlined text-[24px] text-primary">description</span><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-text-muted">{t.categories[item.category]}</p><h2 className="mt-2 font-headline-card text-headline-card font-semibold text-on-surface">{t.documents[item.key].title}</h2></div></div>
            <p className="mt-4 flex-1 font-body-compact text-body-compact leading-relaxed text-text-secondary">{t.documents[item.key].description}</p>
            <p className="mt-4 border-t border-border pt-3 font-ui-label text-ui-label font-semibold text-text-muted">{t.pending}</p>
          </article>)}</div> : <div className="rounded-xl border border-border bg-surface p-8 text-center sm:py-12" role="status"><h2 className="font-headline-card text-headline-card font-semibold text-on-surface">{t.emptyTitle}</h2><p className="mt-2 font-body-compact text-body-compact text-text-secondary">{t.emptyText}</p><button type="button" onClick={resetFilters} className="mt-4 min-h-10 rounded-md px-4 font-button-text text-button-text font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">{t.reset}</button></div>}
        </div>
      </section>

      <section className="bg-surface-container py-14">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-3xl"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">{t.assistEyebrow}</p><h2 className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">{t.assistTitle}</h2><p className="mt-3 font-body-default text-body-default leading-relaxed text-text-secondary">{t.assistText}</p></div>
          <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-6 font-button-text text-button-text font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t.assistCta}</Link>
        </div>
      </section>
    </main>
  );
}
