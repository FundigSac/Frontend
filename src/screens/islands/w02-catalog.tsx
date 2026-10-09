"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type FamilyId = "valvulas" | "tuberias" | "marcos-y-tapas";
type FamilyFilter = "todas" | FamilyId;
type SortMode = "visual" | "familia";

type ReferenceCard = {
  id: string;
  family: FamilyId;
  index: string;
  image: string;
  alt: string;
};

const FAMILIES: Record<FamilyId, { label: string; href: string; searchTerms: string }> = {
  valvulas: {
    label: "Válvulas",
    href: "/productos/valvulas",
    searchTerms: "válvulas valvula valve corte control",
  },
  tuberias: {
    label: "Tuberías",
    href: "/productos/tuberias",
    searchTerms: "tuberías tuberia tubo tubos cañería conduccion",
  },
  "marcos-y-tapas": {
    label: "Marcos y tapas",
    href: "/productos/marcos-y-tapas",
    searchTerms: "marcos marco tapas tapa buzón buzones rejillas",
  },
};

/* Stitch W02 supplies eight category-reference images. They do not identify
 * sellable SKUs until FUNDIGSAC approves the D-02 catalog and product photos. */
const REFERENCE_CARDS: readonly ReferenceCard[] = [
  { id: "valvula-01", family: "valvulas", index: "01", image: "/images/stitch/682437c77e.jpg", alt: "Imagen referencial de una válvula industrial." },
  { id: "valvula-02", family: "valvulas", index: "02", image: "/images/stitch/8f2df4ffc2.jpg", alt: "Imagen referencial de una válvula industrial." },
  { id: "valvula-03", family: "valvulas", index: "03", image: "/images/stitch/c28c3c28eb.jpg", alt: "Imagen referencial de una válvula industrial." },
  { id: "valvula-04", family: "valvulas", index: "04", image: "/images/stitch/f15c5a8711.jpg", alt: "Imagen referencial de una válvula industrial." },
  { id: "tuberia-01", family: "tuberias", index: "01", image: "/images/stitch/c49bbc0276.jpg", alt: "Imagen referencial de tubería industrial." },
  { id: "tuberia-02", family: "tuberias", index: "02", image: "/images/stitch/8a067ff5f6.jpg", alt: "Imagen referencial de tubería industrial." },
  { id: "marco-tapa-01", family: "marcos-y-tapas", index: "01", image: "/images/stitch/d7313151e5.jpg", alt: "Imagen referencial de un marco y tapa." },
  { id: "marco-tapa-02", family: "marcos-y-tapas", index: "02", image: "/images/stitch/039f77948c.jpg", alt: "Imagen referencial de un marco y tapa." },
];

const FAMILY_FIELDS: Record<FamilyId, readonly (readonly [string, string])[]> = {
  valvulas: [
    ["Diámetro nominal", "Por confirmar"],
    ["Presión nominal", "Por confirmar"],
    ["Tipo de accionamiento", "Por confirmar"],
    ["Ficha técnica", "Pendiente"],
  ],
  tuberias: [
    ["Diámetro nominal", "Por confirmar"],
    ["Clase de presión", "Por confirmar"],
    ["Tipo de unión", "Por confirmar"],
    ["Ficha técnica", "Pendiente"],
  ],
  "marcos-y-tapas": [
    ["Clase de carga", "Por confirmar"],
    ["Dimensiones", "Por confirmar"],
    ["Tipo de cierre", "Por confirmar"],
    ["Ficha técnica", "Pendiente"],
  ],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE").trim();
}

function readFamily(value: string | null): FamilyFilter {
  return value && value in FAMILIES ? value as FamilyId : "todas";
}

function updateAddress(query: string, family: FamilyFilter) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (family !== "todas") params.set("familia", family);
  const search = params.toString();
  const next = window.location.pathname + (search ? "?" + search : "") + window.location.hash;
  window.history.replaceState(window.history.state, "", next);
}

function ReferenceImageCard({ card, priority }: { card: ReferenceCard; priority: boolean }) {
  const family = FAMILIES[card.family];

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface-container-lowest">
      <Link
        href={family.href}
        aria-label={"Explorar la familia " + family.label}
        className="group relative block aspect-[4/3] overflow-hidden bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
      >
        <Image
          src={card.image}
          alt={card.alt}
          width={1408}
          height={768}
          sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <span className="absolute bottom-3 left-3 rounded border border-border bg-surface-container-lowest px-2.5 py-1 font-ui-label text-ui-label text-on-surface shadow-sm">
          Imagen referencial
        </span>
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-container-lowest/95 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.1em] text-text-muted">
            Información oficial pendiente
          </p>
          <span className="font-ui-label text-ui-label tabular-nums text-text-muted">Referencia {card.index}</span>
        </div>
        <h3 className="mt-1 font-headline-card text-headline-card font-semibold leading-snug text-on-surface">
          {family.label} · referencia visual {card.index}
        </h3>
        <p className="mt-2 font-body-compact text-body-compact leading-relaxed text-text-secondary">
          La imagen orienta sobre la familia; no identifica un código o modelo comercial.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 font-ui-label text-ui-label text-on-surface-variant">
          {FAMILY_FIELDS[card.family].map(([label, status]) => (
            <div key={label} className="flex min-h-[58px] flex-col justify-between gap-1 rounded bg-surface p-2.5">
              <dt className="text-text-muted">{label}</dt>
              <dd className="font-semibold text-on-surface">{status}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <Link
            href={family.href}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded bg-surface-container px-2.5 font-button-text text-button-text text-primary transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
          >
            Ver familia
          </Link>
          <Link
            href="/cotizar"
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded bg-primary px-2.5 font-button-text text-button-text text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
          >
            Cotizar
          </Link>
        </div>
      </div>
    </article>
  );
}

export function W02Catalog({
  initialQuery = "",
  initialFamily = "todas",
}: {
  initialQuery?: string;
  initialFamily?: FamilyFilter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState<FamilyFilter>(initialFamily);
  const [sort, setSort] = useState<SortMode>("visual");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    updateAddress(query, family);
  }, [query, family]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setFamily(readFamily(params.get("familia")));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const visibleCards = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const filtered = REFERENCE_CARDS.filter((card) => {
      if (family !== "todas" && card.family !== family) return false;
      if (!terms.length) return true;
      const indexed = normalize(FAMILIES[card.family].label + " " + FAMILIES[card.family].searchTerms + " hierro ductil");
      return terms.every((term) => indexed.includes(term));
    });
    if (sort === "familia") {
      return [...filtered].sort((a, b) => FAMILIES[a.family].label.localeCompare(FAMILIES[b.family].label, "es"));
    }
    return filtered;
  }, [family, query, sort]);

  const familyCount = (id: FamilyId) => REFERENCE_CARDS.filter((card) => card.family === id).length;
  const countLabel = visibleCards.length === 1 ? "imagen referencial" : "imágenes referenciales";

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("resultados-catalogo")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  function clearFilters() {
    setQuery("");
    setFamily("todas");
    setSort("visual");
  }

  return (
    <main className="min-h-screen w-full bg-background pt-[76px] text-on-surface">
      <section aria-labelledby="catalog-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          <nav aria-label="Migas de pan" className="mb-5 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li aria-current="page" className="font-semibold text-on-surface">Catálogo</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">Catálogo general · información en validación</p>
            <h1 id="catalog-title" className="mt-2 font-headline-hero text-[clamp(2.375rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-on-surface">
              Productos de hierro dúctil
            </h1>
            <p className="mt-3 max-w-2xl font-body-compact text-body-compact leading-relaxed text-text-secondary sm:mt-4 sm:font-body-default sm:text-body-default">
              Explora válvulas, tuberías, marcos y tapas. Las imágenes son referenciales; códigos, variantes y fichas se publicarán cuando FUNDIGSAC valide el catálogo oficial.
            </p>
          </div>

          <form role="search" className="mt-6 rounded-lg border border-border bg-surface-container-lowest p-2.5 sm:mt-7 sm:p-3" onSubmit={submitSearch}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-text-muted" aria-hidden="true">search</span>
                <span className="sr-only">Buscar por familia de producto</span>
                <input
                  className="min-h-11 w-full rounded border border-border bg-surface px-11 pr-4 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  type="search"
                  name="q"
                  autoComplete="off"
                  placeholder="Buscar válvulas, tuberías, marcos o tapas…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <a
                href="#filtros-catalogo"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-surface-container px-4 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                onClick={(event) => {
                  event.preventDefault();
                  setFiltersOpen(true);
                  window.requestAnimationFrame(() => {
                    document.getElementById("filtros-catalogo")?.scrollIntoView({
                      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                      block: "center",
                    });
                  });
                }}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">tune</span>
                Filtros
              </a>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded bg-primary px-5 font-button-text text-button-text text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                type="submit"
              >
                Buscar
              </button>
            </div>
          </form>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[["Especificaciones", "Pendientes de validación"], ["Variantes de producto", "Pendientes de validación"], ["Documentación", "Pendiente de aprobación"]].map(([label, status]) => (
              <div key={label} className="flex min-h-[72px] items-center gap-3 rounded-lg border border-border bg-surface-container-lowest p-3.5 shadow-sm sm:p-4">
                <span aria-hidden="true" className="material-symbols-outlined grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container text-[19px] text-primary">info</span>
                <div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.08em] text-text-muted">{label}</p><p className="mt-1 font-button-text text-button-text font-semibold text-on-surface">{status}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Catálogo de familias" className="bg-background">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-12">
          <aside id="filtros-catalogo" tabIndex={-1} className="h-fit scroll-mt-24 rounded-lg border border-border bg-surface-container-lowest p-4 outline-none sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <h2 className="flex items-center gap-2 font-ui-label text-ui-label font-bold uppercase tracking-[.1em] text-on-surface">
                <span className="material-symbols-outlined text-[19px] text-primary" aria-hidden="true">filter_list</span>
                Filtrar catálogo
              </h2>
              <button
                type="button"
                aria-expanded={filtersOpen}
                aria-controls="w02-filter-controls"
                onClick={() => setFiltersOpen((open) => !open)}
                className="min-h-9 rounded px-2 font-ui-label text-ui-label text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
              >
                {filtersOpen ? "Ocultar" : "Mostrar"}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!query && family === "todas" && sort === "visual"}
                className="min-h-9 rounded px-2 font-ui-label text-ui-label text-text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none"
              >
                Limpiar
              </button>
            </div>

            <div id="w02-filter-controls" className={filtersOpen ? "mt-4" : "mt-4 hidden lg:block"}>
              <label htmlFor="w02-family" className="mb-2 block font-ui-label text-ui-label text-on-surface-variant">
                Familia de producto
              </label>
              <select
                id="w02-family"
                className="min-h-11 w-full rounded border border-border bg-surface px-3 font-body-compact text-body-compact text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                value={family}
                onChange={(event) => setFamily(event.target.value as FamilyFilter)}
              >
                <option value="todas">Todas las familias</option>
                {(Object.keys(FAMILIES) as FamilyId[]).map((id) => (
                  <option key={id} value={id}>{FAMILIES[id].label}</option>
                ))}
              </select>
              <ul className="mt-3 space-y-1.5">
                {(Object.keys(FAMILIES) as FamilyId[]).map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      aria-label={FAMILIES[id].label + ", " + familyCount(id) + " imágenes referenciales"}
                      aria-pressed={family === id}
                      onClick={() => setFamily(family === id ? "todas" : id)}
                      className="flex min-h-10 w-full items-center justify-between gap-3 rounded px-2.5 text-left font-body-compact text-body-compact text-on-surface transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span aria-hidden="true" className={"grid h-4 w-4 shrink-0 place-items-center rounded-sm border " + (family === id ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface-container-lowest")}>
                          {family === id ? <span className="material-symbols-outlined text-[13px]">check</span> : null}
                        </span>
                        <span>{FAMILIES[id].label}</span>
                      </span>
                      <span className="font-ui-label text-ui-label tabular-nums text-text-muted">{familyCount(id)} img.</span>
                    </button>
                  </li>
                ))}
              </ul>

              <fieldset disabled className="mt-5 space-y-4 border-t border-border pt-4 opacity-80">
                <legend className="mb-2 font-ui-label text-ui-label font-semibold text-on-surface-variant">Filtros técnicos · Pendientes</legend>
                {[["Diámetro nominal", "Rangos por confirmar"], ["Presión nominal", "Valores por confirmar"], ["Tipo de unión", "Opciones por confirmar"], ["Normas técnicas", "Documentos pendientes"]].map(([label, status]) => (
                  <div key={label}>
                    <label className="mb-1.5 block font-ui-label text-ui-label text-text-muted">{label}</label>
                    <button type="button" className="flex min-h-10 w-full items-center justify-between rounded border border-border bg-surface px-3 text-left font-body-compact text-body-compact text-text-muted"><span>{status}</span><span aria-hidden="true" className="material-symbols-outlined text-[18px]">expand_more</span></button>
                  </div>
                ))}
                <p className="rounded bg-surface-container-low p-3 font-ui-label text-ui-label leading-relaxed text-text-muted">Los filtros se habilitarán cuando se aprueben los datos de catálogo.</p>
              </fieldset>

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="font-ui-label text-ui-label font-semibold text-on-surface-variant">Estado de la información</h3>
              <dl className="mt-2 divide-y divide-border">
                {[
                  ["Códigos y variantes", "Por validar"],
                  ["Fichas técnicas", "Pendientes"],
                  ["Catálogo PDF", "No publicado"],
                ].map(([label, status]) => (
                  <div key={label} className="flex min-h-10 items-center justify-between gap-3 py-2">
                    <dt className="font-body-compact text-body-compact text-text-secondary">{label}</dt>
                    <dd className="font-ui-label text-ui-label text-text-muted">{status}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 border-l-2 border-primary pl-3 font-ui-label text-ui-label leading-relaxed text-text-muted">
                Los filtros técnicos se habilitarán cuando los datos oficiales estén aprobados.
              </p>
            </div>
            </div>
          </aside>

          <div className="min-w-0">
            <section id="resultados-catalogo" aria-label="Imágenes de referencia por familia" className="scroll-mt-24">
              <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-body-compact text-body-compact font-semibold text-on-surface" role="status" aria-live="polite" aria-atomic="true">
                    {visibleCards.length ? visibleCards.length + " " + countLabel : "Sin resultados"}
                  </p>
                  <span aria-hidden="true" className="hidden h-1.5 w-1.5 rounded-full bg-outline sm:block" />
                  <p className="font-ui-label text-ui-label text-text-muted">
                    Secuencia de imágenes de Stitch · 3 familias
                  </p>
                </div>
                <label className="flex min-h-10 items-center gap-2">
                  <span className="shrink-0 font-ui-label text-ui-label text-text-muted">Orden:</span>
                  <select
                    className="min-h-10 rounded border border-border bg-surface-container-lowest px-3 font-body-compact text-body-compact text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortMode)}
                  >
                    <option value="visual">Orden visual</option>
                    <option value="familia">Familia A–Z</option>
                  </select>
                </label>
              </div>

              {visibleCards.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
                  {visibleCards.map((card, index) => (
                    <ReferenceImageCard key={card.id} card={card} priority={index < 2} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-border bg-surface-container-lowest px-5 py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-text-muted" aria-hidden="true">search_off</span>
                  <h3 className="mt-3 font-headline-card text-headline-card font-semibold text-on-surface">No encontramos esa familia</h3>
                  <p className="mt-2 max-w-md font-body-compact text-body-compact leading-relaxed text-text-secondary">
                    Busca válvulas, tuberías, marcos o tapas; también puedes limpiar los filtros.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 inline-flex min-h-11 items-center rounded bg-primary px-5 font-button-text text-button-text text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
              <nav aria-label="Paginación del catálogo" className="mt-7 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-ui-label text-ui-label text-text-muted">La secuencia mostrada reúne las imágenes disponibles en esta vista.</p>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button type="button" disabled aria-label="Página anterior no disponible" className="grid min-h-10 min-w-10 place-items-center rounded border border-border bg-surface-container-lowest text-text-muted disabled:cursor-default disabled:opacity-60"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                  <span aria-current="page" className="grid min-h-10 min-w-10 place-items-center rounded bg-primary px-3 font-ui-label text-ui-label font-semibold text-on-primary">1</span>
                  <button type="button" disabled aria-label="Página siguiente no disponible" className="grid min-h-10 min-w-10 place-items-center rounded border border-border bg-surface-container-lowest text-text-muted disabled:cursor-default disabled:opacity-60"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                </div>
              </nav>
            </section>

            <p className="mt-5 border-l-2 border-primary pl-3 font-body-compact text-body-compact leading-relaxed text-text-secondary">
              Las imágenes provienen del export de diseño Stitch. No acreditan que cada referencia corresponda a un producto comercial FUNDIGSAC.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="documents-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface-container-lowest p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:gap-8 lg:p-9">
            <div className="flex min-w-0 gap-4">
              <span className="material-symbols-outlined grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary text-[28px] text-on-primary" aria-hidden="true">menu_book</span>
              <div className="min-w-0">
                <p className="inline-flex rounded bg-surface-container px-2.5 py-1 font-ui-label text-ui-label font-semibold uppercase tracking-[.1em] text-primary">Documentación pendiente de validación</p>
                <h2 id="documents-title" className="mt-1 font-headline-card text-headline-card font-semibold text-on-surface">Catálogos y fichas vigentes</h2>
                <p className="mt-1 max-w-2xl font-body-compact text-body-compact leading-relaxed text-text-secondary">
                  No hay archivos oficiales autorizados en esta versión local. Consulta con FUNDIGSAC antes de especificar una variante.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 font-ui-label text-ui-label text-on-surface-variant">
                  {["Versión por confirmar", "Ficha vigente pendiente", "Datos D-02 en revisión"].map((item) => (
                    <li key={item} className="rounded bg-surface px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href="/contacto"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded bg-primary px-5 font-button-text text-button-text text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
            >
              Consultar documentación
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="engineering-title" className="bg-primary">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-7 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.12em] text-on-primary-container">Consulta de catálogo</p>
            <h2 id="engineering-title" className="mt-1 font-headline-card text-headline-card font-semibold text-on-primary">
              ¿Necesitas identificar una referencia?
            </h2>
            <p className="mt-2 font-body-compact text-body-compact leading-relaxed text-on-primary">
              Envía tu requerimiento; los datos técnicos se confirman con el catálogo oficial vigente.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded border border-on-primary/40 bg-surface-container-lowest px-5 font-button-text text-button-text text-primary transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary motion-reduce:transition-none"
          >
            Enviar consulta a FUNDIGSAC
            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
