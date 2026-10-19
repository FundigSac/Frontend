"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bolt,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Maximize2,
  Rotate3d,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import styles from "./w06-ficha.module.css";
import { DATASHEETS, type Datasheet, type Feature } from "./w06-ficha-data";
import { FICHA_COPY } from "./w06-ficha-copy";
import { FICHA_EN } from "./w06-ficha-en";
import { ValvePlan, type Cotas } from "./w06-plano";
import { addToCart, openCart } from "@/modules/cart/cart-store";
import { featuredBySlug } from "@/modules/cart/cart-products";
import { requestDocumentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { useDialogFocus } from "@/shared/ui/use-dialog-focus";
import { useReveal } from "@/shared/ui/use-reveal";

const BASE = "/media/valvula-ficha/";
const Viewer3D = dynamic(() => import("@/components/product-3d-viewer"), {
  ssr: false,
  loading: () => <div className={styles.loading3d} role="status">Cargando modelo 3D…</div>,
});

const REAL = "/media/valvula-hd/";
const BASE_THUMBS = [
  { dir: REAL, src: "v-01.webp", alt: "Válvula de compuerta bridada, vista frontal" },
  { dir: REAL, src: "v-02.webp", alt: "Válvula de compuerta bridada DN100 PN16, vista frontal con volante y marcado en el cuerpo" },
  { dir: REAL, src: "v-03.webp", alt: "Vista superior del volante azul con indicación CLOSE y OPEN" },
  { dir: REAL, src: "v-04.webp", alt: "Válvula de compuerta bridada, vista en perspectiva con etiqueta DN100 en la brida" },
  { dir: REAL, src: "v-05.webp", alt: "Válvula de compuerta bridada, vista frontal de la brida con etiqueta DN100" },
];

/** Fotos reales de la válvula FUNDIGSAC (recortes WebP con transparencia, 1000×1250). */
const FG = "/media/valvula-fundigsac/";
const FUNDIGSAC_THUMBS = [
  { dir: FG, src: "f-07.webp", alt: "Válvula de compuerta bridada FUNDIGSAC, vista frontal con el logotipo en relieve en el cuerpo" },
  { dir: FG, src: "f-02.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN100 PN16, vista frontal con volante y marcado GGG50 en el cuerpo" },
  { dir: FG, src: "f-03.webp", alt: "Vista superior del volante azul de la válvula FUNDIGSAC con indicación CLOSE y OPEN" },
  { dir: FG, src: "f-04.webp", alt: "Válvula de compuerta bridada FUNDIGSAC, vista frontal elevada con etiqueta DN100 de 4 pulgadas en la brida" },
  { dir: FG, src: "f-06.webp", alt: "Válvula de compuerta bridada FUNDIGSAC, vista en perspectiva con la brida y la etiqueta DN100 de 4 pulgadas" },
];

/** Fotos reales de la válvula FUNDIGSAC con garantía extendida y cuadrante de maniobra (recortes WebP con transparencia, 1000×1250). */
const FQ = "/media/valvula-fundigsac-cuadrante/";
const EXTENDED_THUMBS = [
  { dir: FQ, src: "q-01.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN500, vista frontal con cuadrante de maniobra y logotipo en relieve en el cuerpo" },
  { dir: FQ, src: "q-02.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN100, vista en perspectiva con la brida y el cuadrante de maniobra" },
  { dir: FQ, src: "q-03.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN100 PN16/10, vista frontal con marcado GGG50 en el cuerpo" },
  { dir: FQ, src: "q-04.webp", alt: "Válvula de compuerta bridada FUNDIGSAC, vista elevada de la brida con el cuadrante de maniobra" },
  { dir: FQ, src: "q-05.webp", alt: "Vista superior de la válvula FUNDIGSAC DN50 PN16 con el sentido de apertura OPEN" },
];

const RELATED = [
  { src: "mariposa-cut.webp", es: ["Válvula mariposa", "Diseño compacto y de bajo torque para grandes diámetros."], en: ["Butterfly valve", "Compact, low-torque design for large diameters."], href: "/productos/valvulas/valvula-mariposa" },
  { src: "check-cut.webp", es: ["Válvula check", "Evita el retorno de flujo en sistemas de conducción."], en: ["Check valve", "Prevents backflow in conveyance systems."], href: "/productos/valvulas" },
  { src: "aire-cut.webp", es: ["Válvula de aire", "Elimina y admite aire en redes de agua, mejorando la eficiencia."], en: ["Air valve", "Releases and admits air in water networks for better efficiency."], href: "/productos/valvulas" },
  { src: "reductora-cut.webp", es: ["Válvula reductora de presión", "Controla y estabiliza la presión en la red de distribución."], en: ["Pressure reducing valve", "Controls and stabilizes pressure in distribution networks."], href: "/productos/valvulas" },
] as const;


const PRESSURES = ["PN10", "PN16"] as const;
const CART_SLUG = { base: "valvula-compuerta", fundigsac: "valvula-compuerta-fundigsac", extendida: "valvula-compuerta-fundigsac-garantia-extendida" } as const;

const FEATURE_ICONS: Record<Feature["icon"], typeof ShieldCheck> = { shield: ShieldCheck, settings: Settings2, layers: Layers, nut: Bolt };

/** Variantes de la ficha: la válvula FUNDIGSAC sin garantía indicada, o con garantía extendida; sin valor es la ficha base (H-ITALY). */
export type Variant = "fundigsac" | "extendida";

/** Textos y datos técnicos por variante, definidos a nivel de módulo: la base (H-ITALY), FUNDIGSAC con volante o FUNDIGSAC con garantía extendida. */
const variantCopy = (variant?: Variant) => {
  if (!variant) return { warrantyLabel: null, productName: "Válvula de compuerta bridada", thumbs: BASE_THUMBS, sheet: DATASHEETS.base };
  if (variant === "fundigsac") return { warrantyLabel: null, productName: "Válvula de compuerta bridada FUNDIGSAC", thumbs: FUNDIGSAC_THUMBS, sheet: DATASHEETS.fundigsac };
  return { warrantyLabel: "Garantía extendida", productName: "Válvula de compuerta bridada FUNDIGSAC", thumbs: EXTENDED_THUMBS, sheet: DATASHEETS.extendida };
};
const COPY = { base: variantCopy(), fundigsac: variantCopy("fundigsac"), extendida: variantCopy("extendida") } as const;

/** Reparte las especificaciones en tres grupos legibles, sin cambiar ni reordenar los valores de la ficha. */
const MATERIAL_KEY = /cuerpo|tapa|cuña|^compuerta$|vástago|tuerca|junta|anillo|perno|tornill|arandela|guardapolvo|volante|sellos|revestimiento|recubrimiento/i;
const STANDARD_KEY = /^dise|^brida|cara a cara|longitud entre caras|^prueba|presiones de prueba|norma de producto|conformidad|marcado/i;
function groupSpecs(specs: Datasheet["specs"]) {
  const materials: Datasheet["specs"] = [];
  const standards: Datasheet["specs"] = [];
  const general: Datasheet["specs"] = [];
  for (const row of specs) (MATERIAL_KEY.test(row[0]) ? materials : STANDARD_KEY.test(row[0]) ? standards : general).push(row);
  return { general, materials, standards };
}

/** Cotas del plano para un diámetro, tomadas de las tablas de la ficha. */
function cotasFor(sheet: Datasheet, dn: string): Cotas {
  const row = sheet.dims.rows.find((r) => r.dn === dn);
  const get = (label: string) => {
    const i = sheet.dims.head.indexOf(label);
    return i > 0 && row ? row.cells[i - 1] : null;
  };
  const flange = sheet.flange.rows(dn).map((r) => r.cells[0]).filter((v) => v !== null && v !== undefined).map(String);
  const outer = flange.length ? [...new Set(flange)].join(" / ") : get("D") === null ? null : String(get("D"));
  return { dn, L: get("L (F4)") ?? get("L"), H: get("H"), OD: get("ØD"), A: outer, aLabel: sheet.flange.head[1] ?? "D" };
}

export function W06Ficha(props: { variant?: Variant }) {
  const [lang] = useLang();
  const t = FICHA_COPY[lang];
  const variantKey = props.variant ?? "base";
  const base = COPY[variantKey];
  // En inglés se muestran los textos de w06-ficha-en.ts; la lógica (tablas, cotas, grupos) sigue usando los datos en español.
  const en = lang === "en" ? FICHA_EN[variantKey] : null;
  const { thumbs: THUMBS, sheet } = base;
  const warrantyLabel = en ? en.warrantyLabel ?? null : base.warrantyLabel;
  const productName = en?.productName ?? base.productName;
  const { doc } = sheet;
  const docPages = doc?.pages ?? [];
  const view = {
    lead: en?.lead ?? sheet.lead,
    description: en?.description ?? sheet.description,
    facts: en?.facts ?? sheet.facts,
    specsNote: en?.specsNote ?? sheet.specsNote,
    dimsNote: en?.dimsNote ?? sheet.dims.note,
    dimsHead: en?.dimsHead ?? sheet.dims.head,
    flangeTitle: en?.flangeTitle ?? sheet.flange.title,
    flangeNote: en?.flangeNote ?? sheet.flange.note,
    flangeHead: en?.flangeHead ?? sheet.flange.head,
    stem: sheet.stem ? { head: sheet.stem.head, rows: sheet.stem.rows, title: en?.stem?.title ?? sheet.stem.title, note: en?.stem?.note ?? sheet.stem.note } : undefined,
    features: sheet.features.map((f, i) => ({ ...f, ...(en?.features[i] ?? {}) })),
    badges: en?.badges ?? sheet.badges,
    docTitle: en?.docTitle ?? doc?.title ?? "",
    docMeta: en?.docMeta ?? doc?.meta ?? "",
    model3dAlt: en?.model3dAlt ?? sheet.model3d.alt,
  };
  const pageAlt = (i: number) => (en ? en.docPageAlt(i + 1, docPages.length) : docPages[i]?.alt ?? "");
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [docPage, setDocPage] = useState(0);
  const [spin, setSpin] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [size, setSize] = useState(sheet.sizes.includes("DN100") ? "DN100" : sheet.sizes[0]);
  const [pn, setPn] = useState<(typeof PRESSURES)[number]>("PN16");
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);
  const pageRef = useRef<HTMLElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  useDialogFocus(lightbox, lightboxRef);
  useDialogFocus(docOpen && !!doc, docRef);
  const total = THUMBS.length;
  const current = THUMBS[active];
  const brand = sheet.specs.find(([k]) => k === "Marca")?.[1];
  const series = sheet.specs.find(([k]) => k === "Serie")?.[1];

  useReveal(pageRef);
  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  /** Agrega la válvula con el DN y PN elegidos al carrito de cotización y abre el panel lateral. */
  const addCurrent = () => {
    const slug = CART_SLUG[props.variant ?? "base"];
    const featured = featuredBySlug(slug);
    addToCart({
      slug,
      name: featured?.name[lang] ?? productName,
      variant: `${size} · ${pn}`,
      image: featured?.image ?? THUMBS[0].dir + THUMBS[0].src,
      href: featured?.href ?? `/productos/valvulas/${slug}`,
    });
    openCart();
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  const pick = useCallback((i: number) => { setSpin(false); setActive(i); }, []);
  const step = useCallback((d: number) => { setSpin(false); setActive((i) => (i + d + total) % total); }, [total]);

  const docCount = docPages.length;
  const stepDoc = useCallback((d: number) => setDocPage((i) => (i + d + docCount) % docCount), [docCount]);

  useEffect(() => {
    if (!docOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDocOpen(false);
      if (e.key === "ArrowLeft") stepDoc(-1);
      if (e.key === "ArrowRight") stepDoc(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [docOpen, stepDoc]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightbox, step]);

  const photo = (sizes: string, priority = false) => (
    <Image
      key={current.src}
      src={current.dir + current.src}
      alt={en?.thumbAlts[active] ?? current.alt}
      fill
      sizes={sizes}
      // Foto LCP: en el HTML inicial y con prioridad alta (en Next 16 `priority` está obsoleto y no la sube).
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={broken[current.src]}
      onError={() => setBroken((s) => ({ ...s, [current.src]: true }))}
    />
  );

  // Qué contiene la ficha, tomado de los datos reales de esta válvula.
  const docIncludes = [t.docSpecs, `${t.docDims} ${sheet.sizeRange}`, `${view.flangeTitle} PN10 / PN16`, ...(view.stem ? [view.stem.title] : []), t.docMaterials].slice(0, 4);
  const specGroups = groupSpecs(sheet.specs);
  // Los grupos se calculan con las claves en español; cada fila se muestra con su versión en el idioma activo.
  const specRowOf = new Map(sheet.specs.map((row, i) => [row, en?.specs[i] ?? row] as const));
  const shown = (rows: Datasheet["specs"]) => rows.map((row) => specRowOf.get(row) ?? row);
  const specColumns = [
    [{ id: "general", title: t.groups.general, rows: shown(specGroups.general) }, { id: "standards", title: t.groups.standards, rows: shown(specGroups.standards) }],
    [{ id: "materials", title: t.groups.materials, rows: shown(specGroups.materials) }],
  ].map((col) => col.filter((g) => g.rows.length));
  const cotas = cotasFor(sheet, size);
  const dimRow = sheet.dims.rows.find((r) => r.dn === size);

  return (
    <main className={styles.page} ref={pageRef}>
      <div className={styles.wrap}>
        <nav aria-label={t.crumbs.label} className={styles.crumbs}>
          <Link href="/">{t.crumbs.home}</Link><ChevronRight size={14} aria-hidden="true" />
          <Link href="/productos">{t.crumbs.products}</Link><ChevronRight size={14} aria-hidden="true" />
          <Link href="/productos/valvulas">{t.crumbs.valves}</Link><ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{productName}</span>
        </nav>

        <section className={styles.top} aria-labelledby="ficha-title">
          <div className={styles.gallery}>
            <div className={styles.stage}>
              {spin ? (
                <Viewer3D src={sheet.model3d.src} poster={THUMBS[2].dir + THUMBS[2].src} alt={view.model3dAlt} className={styles.viewer} onFail={() => setSpin(false)} />
              ) : (
                photo("(min-width: 1100px) 600px, 92vw", true)
              )}
              {!spin && (
                <>
                  <button type="button" className={styles.stagePrev} aria-label={t.prev} onClick={() => step(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
                  <button type="button" className={styles.stageNext} aria-label={t.next} onClick={() => step(1)}><ChevronRight size={20} aria-hidden="true" /></button>
                  <span className={styles.stageCount} aria-hidden="true">{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                </>
              )}
              <button type="button" className={styles.zoom} aria-label={t.zoom} title={t.zoom} onClick={() => setLightbox(true)}><Maximize2 size={17} aria-hidden="true" /></button>
            </div>
            <div className={styles.thumbs}>
              <div className={styles.thumbList} role="group" aria-label={t.photos}>
                {THUMBS.map((p, i) => (
                  <button key={p.src} type="button" className={i === active && !spin ? styles.thumbActive : styles.thumb} onClick={() => pick(i)} aria-label={t.viewPhoto(en?.thumbAlts[i] ?? p.alt)} aria-pressed={i === active && !spin}>
                    <Image src={p.dir + p.src} alt="" fill sizes="(max-width: 760px) 64px, 76px" fetchPriority="low" />
                  </button>
                ))}
              </div>
              <button type="button" className={spin ? styles.thumb3dOn : styles.thumb3d} aria-pressed={spin} onClick={() => setSpin((v) => !v)}>
                <Rotate3d size={20} aria-hidden="true" /><span>{spin ? t.back3d : t.view3d}</span>
              </button>
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.tags}>
              {brand && <span className={styles.tagBrand}><span className={styles.tagLabel}>{t.brand}</span>{brand}{series ? ` · ${series}` : ""}</span>}
              <span className={styles.tag}>{sheet.sizeRange}</span>
            </div>
            <h1 id="ficha-title">{productName}</h1>
            <ul className={styles.badges}>{view.badges.map((b) => <li key={b}><Check size={15} strokeWidth={2.6} aria-hidden="true" />{b}</li>)}</ul>
            {warrantyLabel && (
              <p className={styles.warranty}><ShieldCheck size={18} aria-hidden="true" /><span><strong>{warrantyLabel}</strong> {t.warranty}</span></p>
            )}
            <p className={styles.lead}>{view.lead}</p>

            <ul className={styles.facts} aria-label={t.facts}>
              {view.facts.map(([k, v], i) => (
                <li key={k} style={{ ["--i" as string]: i }}><span className={styles.factLabel}>{k}</span><strong>{v}</strong></li>
              ))}
            </ul>

            {/* Pedido rápido: el DN es el mismo del plano y las tablas de dimensiones. */}
            <div className={styles.order} role="group" aria-label={t.order}>
              <div className={styles.orderFields}>
                <label className={styles.field}>
                  <span>{t.dnLabel}</span>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    {sheet.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </label>
                <div className={styles.field} role="group" aria-label={t.pnLabel}>
                  <span aria-hidden="true">{t.pnLabel}</span>
                  <div className={styles.segment}>
                    {PRESSURES.map((p) => (
                      <button key={p} type="button" aria-pressed={pn === p} className={pn === p ? styles.segmentOn : undefined} onClick={() => setPn(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.ctas}>
                <button type="button" className={styles.primary} onClick={addCurrent} data-added={added || undefined}>
                  {added ? <Check size={18} strokeWidth={2.6} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
                  {added ? t.added : t.addCart}
                </button>
                <Link href="/cotizar" className={styles.secondary}>{t.quote} <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.body}>
        <div className={styles.wrap}>
          <section id="descripcion" className={styles.desc} aria-label={t.description}>
            <div className={styles.descGrid}>
              <div className={styles.descMain} data-reveal>
                <h2>{t.description}</h2>
                <p className={styles.descLead}>{t.descLead}</p>
                <p className={styles.descText}>{view.description ?? t.descFallback}</p>
              </div>
              <figure className={styles.descPhoto} data-reveal style={{ ["--d" as string]: "120ms" }}>
                <Image src="/media/home-ref-infrastructure.webp" alt="" fill sizes="(min-width: 1024px) 860px, 100vw" />
                <figcaption>
                  <span className={styles.appsTitle}>{t.applications}</span>
                  <ul className={styles.apps}>{t.apps.map((label) => <li key={label}>{label}</li>)}</ul>
                </figcaption>
              </figure>
            </div>

            <h3 className={styles.srOnly}>{t.advantages}</h3>
            <ul className={styles.features} data-reveal>
              {view.features.map((f, i) => {
                const Icon = FEATURE_ICONS[f.icon];
                return (
                  <li key={f.title} style={{ ["--i" as string]: i }}>
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                    <strong>{f.title}</strong>
                    <span>{f.text}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section id="especificaciones" className={styles.specs} aria-label={t.specs}>
            <header className={styles.sectionHead} data-reveal>
              <h2>{t.specs}</h2>
              <p className={styles.muted}>{view.specsNote}</p>
            </header>
            <div className={styles.specGrid}>
              {specColumns.map((col, c) => (
                <div key={c} className={styles.specCol} data-reveal style={{ ["--d" as string]: `${c * 120}ms` }}>
                  {col.map((group) => (
                    <div key={group.id} className={styles.specGroup}>
                      <h3>{group.title}</h3>
                      <table className={styles.table}>
                        <tbody>
                          {group.rows.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section id="documentacion" className={styles.docStrip} aria-label={t.docs} data-reveal>
            <h2 className={styles.srOnly}>{t.docs}</h2>
            {doc ? (
              <div className={styles.docRow}>
                <div className={styles.docStack}>
                  {docPages[1] && <span className={`${styles.docLeaf} ${styles.docLeafA}`} aria-hidden="true"><Image src={docPages[1].src} alt="" fill sizes="120px" /></span>}
                  {docPages[2] && <span className={`${styles.docLeaf} ${styles.docLeafB}`} aria-hidden="true"><Image src={docPages[2].src} alt="" fill sizes="120px" /></span>}
                  <button type="button" className={styles.docCover} onClick={() => { setDocPage(0); setDocOpen(true); }} aria-label={t.previewLabel} title={t.previewLabel}>
                    <Image src={doc.pages[0].src} alt={pageAlt(0)} fill sizes="120px" />
                  </button>
                </div>
                <div className={styles.docInfo}>
                  <p className={styles.docTitle}>{view.docTitle}</p>
                  <p className={styles.docMeta}>{view.docMeta} · {docIncludes.join(" · ")}</p>
                </div>
                <div className={styles.docActions}>
                  <a href={doc.href} download className={styles.docButton}><Download size={16} aria-hidden="true" /> {t.download}</a>
                  <button type="button" className={styles.docGhost} onClick={() => { setDocPage(0); setDocOpen(true); }}>{t.docView}</button>
                </div>
              </div>
            ) : (
              <div className={styles.docRow}>
                <div className={styles.docRequest}><FileText size={28} aria-hidden="true" /></div>
                <div className={styles.docInfo}>
                  <p className={styles.docTitle}>{en ? "Datasheet" : "Ficha técnica"} · {productName}</p>
                  <p className={styles.docMeta}>{t.docOnRequest}</p>
                </div>
                <div className={styles.docActions}>
                  <Link href={requestDocumentHref(`Ficha técnica · ${base.productName}`)} className={styles.docButton}><FileText size={16} aria-hidden="true" /> {t.requestSheet}</Link>
                </div>
              </div>
            )}
          </section>

          <section id="dimensiones" className={styles.dimsSection} aria-label={t.tabs.dimensiones}>
            <header className={styles.sectionHead} data-reveal>
              <h2>{t.dims}</h2>
              <p className={styles.muted}>{view.dimsNote}</p>
            </header>

            <div className={styles.dimsTop}>
              <div className={styles.plan} data-reveal>
                <div className={styles.planHead}>
                  <span>{t.plan}</span>
                  <span className={styles.planRange}>{sheet.sizeRange}</span>
                </div>
                <div className={styles.planDraw}>
                  <ValvePlan cotas={cotas} label={t.plan} />
                </div>
                <fieldset className={styles.sizes}>
                  <legend>{t.dn}</legend>
                  <div className={styles.sizeGrid}>
                    {sheet.sizes.map((s) => (
                      <button key={s} type="button" aria-pressed={size === s} className={size === s ? styles.sizeActive : styles.size} onClick={() => setSize(s)}>{s}</button>
                    ))}
                  </div>
                  <p className={styles.planHint}>{t.planHint}</p>
                </fieldset>
              </div>

              <div className={styles.dimsRight}>
              <div className={styles.dimsAside} data-reveal style={{ ["--d" as string]: "120ms" }}>
                {dimRow && (
                  <section className={styles.measureCard} aria-label={`${t.measures} · ${size}`} key={`m-${size}`}>
                    <h3>{t.measures} · {size}</h3>
                    <dl className={styles.measure}>
                      {sheet.dims.head.slice(1).map((h, i) => (
                        <div key={h}><dt>{view.dimsHead[i + 1]}</dt><dd>{dimRow.cells[i] ?? "-"}{h === "Pulg." ? "\"" : ""}</dd></div>
                      ))}
                    </dl>
                  </section>
                )}
                <section className={styles.flangeCard} aria-label={`${view.flangeTitle} · ${size}`} key={`f-${size}`}>
                  <h3>{view.flangeTitle} · {size}</h3>
                  <p>{view.flangeNote}</p>
                  <div className={styles.tableWrap}>
                    <table className={styles.flange}>
                      <thead><tr>{view.flangeHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                      <tbody>
                        {sheet.flange.rows(size).map(({ pn, cells }) => (
                          <tr key={pn}><th scope="row"><span className={styles.pn}>{pn}</span></th>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {view.stem && (
                  <section className={styles.flangeCard} aria-label={`${view.stem.title} · ${size}`} key={`s-${size}`}>
                    <h3>{view.stem.title} · {size}</h3>
                    <p>{view.stem.note}</p>
                    <div className={styles.tableWrap}>
                      <table className={styles.flange}>
                        <thead><tr>{view.stem.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                        <tbody>
                          {view.stem.rows(size).map(({ pn, cells }) => (
                            <tr key={pn}>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>

            <div className={styles.dimsTable} data-reveal>
              <h3>{t.table}</h3>
              <div className={styles.tableWrap}>
                <table className={styles.dims}>
                  <thead><tr>{view.dimsHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {sheet.dims.rows.map(({ dn, cells }) => (
                      <tr key={dn} className={dn === size ? styles.rowOn : undefined} onClick={() => setSize(dn)}>
                        <th scope="row">{dn}</th>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </div>
            </div>
          </section>

        </div>
      </div>

          <div className={styles.wrap}>
        <section className={styles.related} aria-labelledby="related-title" data-reveal>
          <div className={styles.relatedHead}>
            <h2 id="related-title">{t.related}</h2>
            <Link href="/productos" className={styles.allLink}>{t.allProducts} <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className={styles.relatedGrid}>
            {RELATED.map((r, i) => {
              const [title, text] = r[lang];
              return (
                <Link key={r.src} href={r.href} className={styles.relCard} style={{ ["--i" as string]: i }} aria-label={`${t.seeSheet}: ${title}`}>
                  <span className={styles.relImage}><Image src={BASE + r.src} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" /></span>
                  <span className={styles.relBody}>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </span>
                  <span className={styles.relArrow} aria-hidden="true"><ArrowUpRight size={18} /></span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className={styles.cta} aria-labelledby="ficha-cta-title" data-reveal>
        <div className={styles.ctaInner}>
          <div className={styles.ctaCopy}>
            <h2 id="ficha-cta-title">{t.ctaTitle}</h2>
            <p className={styles.ctaText}>{t.ctaText}</p>
            <ul className={styles.ctaPoints}>
              {t.ctaPoints.map((point) => <li key={point}><Check size={16} strokeWidth={2.6} aria-hidden="true" />{point}</li>)}
            </ul>
          </div>
        </div>
        <div className={styles.ctaVisual}>
            <Image src="/media/valvulas-page/asesoria.webp" alt="" fill sizes="(min-width: 1024px) 840px, 100vw" />
          </div>
      </section>

      {lightbox && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={t.gallery} onClick={() => setLightbox(false)} ref={lightboxRef}>
          <button type="button" className={styles.lbClose} aria-label={t.close} onClick={() => setLightbox(false)}><X size={22} aria-hidden="true" /></button>
          <button type="button" className={styles.lbPrev} aria-label={t.prev} onClick={(e) => { e.stopPropagation(); step(-1); }}><ChevronLeft size={26} aria-hidden="true" /></button>
          <div className={styles.lbStage} onClick={(e) => e.stopPropagation()}>
            {spin ? <Viewer3D src={sheet.model3d.src} poster={THUMBS[2].dir + THUMBS[2].src} alt={view.model3dAlt} className={styles.viewer} onFail={() => setSpin(false)} /> : photo("100vw")}
          </div>
          <button type="button" className={styles.lbNext} aria-label={t.next} onClick={(e) => { e.stopPropagation(); step(1); }}><ChevronRight size={26} aria-hidden="true" /></button>
          <div className={styles.lbBar} onClick={(e) => e.stopPropagation()}>
            {THUMBS.map((p, i) => (
              <button key={p.src} type="button" className={i === active ? styles.lbDotActive : styles.lbDot} onClick={() => pick(i)} aria-label={t.viewPhoto(en?.thumbAlts[i] ?? p.alt)} aria-pressed={i === active} />
            ))}
          </div>
        </div>
      )}

      {docOpen && doc && (
        <div className={styles.docModal} role="dialog" aria-modal="true" aria-label={t.docDialog} onClick={() => setDocOpen(false)} ref={docRef}>
          <div className={styles.docPanel} onClick={(e) => e.stopPropagation()}>
            <header className={styles.docBar}>
              <div className={styles.docBarTitle}>
                <strong>{view.docTitle}</strong>
                <span aria-live="polite">{t.page(docPage + 1, docCount)}</span>
              </div>
              <a href={doc.href} target="_blank" rel="noopener noreferrer" className={styles.docBarBtn}><ExternalLink size={15} aria-hidden="true" /><span>{t.openPdf}</span></a>
              <a href={doc.href} download className={styles.docBarBtn}><Download size={15} aria-hidden="true" /><span>{t.downloadShort}</span></a>
              <button type="button" className={styles.docBarClose} aria-label={t.closePreview} onClick={() => setDocOpen(false)}><X size={20} aria-hidden="true" /></button>
            </header>
            <div className={styles.docBody}>
              <button type="button" className={styles.docNavPrev} aria-label={t.prevPage} onClick={() => stepDoc(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
              <div className={styles.docScroll} key={docPage}>
                <Image src={docPages[docPage].src} alt={pageAlt(docPage)} width={1500} height={2121} sizes="(min-width: 1024px) 860px, 100vw" priority className={styles.docPage} />
              </div>
              <button type="button" className={styles.docNavNext} aria-label={t.nextPage} onClick={() => stepDoc(1)}><ChevronRight size={22} aria-hidden="true" /></button>
            </div>
            <div className={styles.docDots}>
              {docPages.map((pg, i) => (
                <button key={pg.src} type="button" className={i === docPage ? styles.docDotOn : styles.docDot} onClick={() => setDocPage(i)} aria-label={t.goPage(i + 1)} aria-current={i === docPage} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
