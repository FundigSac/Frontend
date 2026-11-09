"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Maximize2,
  Rotate3d,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import styles from "./w06-ficha.module.css";
import { DATASHEETS, type Datasheet } from "./w06-ficha-data";
import { FICHA_COPY } from "./w06-ficha-copy";
import { FICHA_EN } from "./w06-ficha-en";
import { ValvePlan, type Cotas } from "./w06-plano";
import { addToCart, openCart } from "@/modules/cart/cart-store";
import { featuredBySlug } from "@/modules/cart/cart-products";
import { requestDocumentHref } from "@/modules/resources/documents";
import { useLang } from "@/shared/layout/landing-prefs";
import { useDialogFocus } from "@/shared/ui/use-dialog-focus";
import { SectorLinks } from "@/app/productos/_catalog/sector-links";

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
  { dir: FQ, src: "g-01.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN500, vista frontal con cuadrante de maniobra y logotipo en relieve en el cuerpo" },
  { dir: FQ, src: "g-02.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN100, vista en perspectiva con la brida y el cuadrante de maniobra" },
  { dir: FQ, src: "g-03.webp", alt: "Válvula de compuerta bridada FUNDIGSAC DN100 PN16/10, vista frontal con marcado GGG50 en el cuerpo" },
  { dir: FQ, src: "g-04.webp", alt: "Válvula de compuerta bridada FUNDIGSAC, vista elevada de la brida con el cuadrante de maniobra" },
  { dir: FQ, src: "q-05.webp", alt: "Vista superior de la válvula FUNDIGSAC DN50 PN16 con el sentido de apertura OPEN" },
];

const RELATED = [
  { src: "mariposa-cut.webp", es: ["Válvula mariposa wafer con timón", "Tipo wafer con operador de timón."], en: ["Wafer butterfly valve with handwheel", "Wafer type with handwheel operator."], href: "/productos/valvulas/valvula-mariposa-wafer-timon-vmtwt" },
  { src: "check-cut.webp", es: ["Válvula check swing", "Deja pasar el agua en un solo sentido y cierra sola cuando el flujo se invierte."], en: ["Swing check valve", "Lets water flow one way and closes by itself when the flow reverses."], href: "/productos/valvulas/valvula-check-swing" },
  { src: "aire-cut.webp", es: ["Válvula de aire de 3 funciones", "Ventosa de tres funciones."], en: ["3-function air valve", "Three-function air valve."], href: "/productos/valvulas/valvula-de-aire-3-funciones-premium-vdap" },
  { src: "reductora-cut.webp", es: ["Válvula reductora de presión", "Mantiene una presión estable aguas abajo."], en: ["Pressure-reducing valve", "Keeps downstream pressure steady."], href: "/productos/valvulas/valvula-reductora-de-presion" },
] as const;


const PRESSURES = ["PN10", "PN16"] as const;
const CART_SLUG = { base: "valvula-compuerta", fundigsac: "valvula-compuerta-fundigsac", extendida: "valvula-compuerta-fundigsac-garantia-extendida" } as const;

/** Parte un texto en párrafos de una o dos oraciones, para que la descripción no sea un solo bloque. */
function paragraphs(text: string): string[] {
  const sentences = text.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/);
  if (sentences.length < 2) return [text];
  const half = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, half).join(" "), sentences.slice(half).join(" ")];
}

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

/** Documento que se previsualiza en pantalla: la ficha técnica o uno de los flyers. */
type Preview = { title: string; href: string; pages: { src: string; alt: string; width: number; height: number }[] };

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
    highlights: en?.highlights ?? sheet.highlights,
    actuations: en?.actuations ?? sheet.actuations,
    flyers: (sheet.flyers ?? []).map((f, i) => ({ ...f, ...(en?.flyers?.[i] ?? {}) })),
    docTitle: en?.docTitle ?? doc?.title ?? "",
    docMeta: en?.docMeta ?? doc?.meta ?? "",
    model3dAlt: en?.model3dAlt ?? sheet.model3d.alt,
  };
  const pageAlt = (i: number) => (en ? en.docPageAlt(i + 1, docPages.length) : docPages[i]?.alt ?? "");
  const [active, setActive] = useState(0);
  // Foto anterior: queda debajo mientras la nueva aparece con opacidad (la primera carga no anima nada).
  const [previous, setPrevious] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [docPage, setDocPage] = useState(0);
  const [spin, setSpin] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [size, setSize] = useState(sheet.sizes.includes("DN100") ? "DN100" : sheet.sizes[0]);
  const [pn, setPn] = useState<(typeof PRESSURES)[number]>("PN16");
  // Índice del accionamiento elegido (los textos cambian con el idioma; el índice no).
  const [actuation, setActuation] = useState(0);
  const [added, setAdded] = useState(false);
  const [flash, setFlash] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  useDialogFocus(lightbox, lightboxRef);
  useDialogFocus(!!preview, docRef);
  const total = THUMBS.length;
  const current = THUMBS[active];
  const brand = sheet.specs.find(([k]) => k === "Marca")?.[1];
  const series = sheet.specs.find(([k]) => k === "Serie")?.[1];

  useEffect(() => () => { window.clearTimeout(addedTimer.current); window.clearTimeout(flashTimer.current); }, []);

  /** Agrega la válvula con el DN, PN y accionamiento elegidos al carrito de cotización y abre el panel lateral. */
  const addCurrent = () => {
    const slug = CART_SLUG[props.variant ?? "base"];
    const featured = featuredBySlug(slug);
    // El accionamiento se guarda en español: es lo que lee el equipo comercial en la solicitud.
    const act = sheet.actuations?.[actuation];
    addToCart({
      slug,
      name: featured?.name[lang] ?? productName,
      variant: [size, pn, act].filter(Boolean).join(" · "),
      image: featured?.image ?? THUMBS[0].dir + THUMBS[0].src,
      href: featured?.href ?? `/productos/valvulas/${slug}`,
    });
    openCart();
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  /** Desde un flyer: elige ese accionamiento en el pedido y lleva al pedido, que destella para confirmar el cambio. */
  const chooseActuation = (i: number) => {
    setActuation(i);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    orderRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    setFlash(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 1400);
  };

  // Sin useCallback: el compilador de React ya memoriza estas funciones.
  const pick = (i: number) => { setSpin(false); setPrevious(active); setActive(i); };
  const step = (d: number) => { setSpin(false); setPrevious(active); setActive((i) => (i + d + total) % total); };

  const docCount = preview?.pages.length ?? 0;
  const stepDoc = (d: number) => setDocPage((i) => (docCount ? (i + d + docCount) % docCount : 0));
  const openDoc = () => {
    if (!doc) return;
    setDocPage(0);
    setPreview({ title: view.docTitle, href: doc.href, pages: docPages.map((p, i) => ({ src: p.src, alt: pageAlt(i), width: 1500, height: 2121 })) });
  };
  const openFlyer = (f: (typeof view.flyers)[number]) => {
    setDocPage(0);
    setPreview({ title: `${t.flyers.kicker} · ${f.title}`, href: f.href, pages: [{ src: f.preview, alt: f.alt, width: 1250, height: 1616 }] });
  };

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      const move = (d: number) => setDocPage((i) => (docCount ? (i + d + docCount) % docCount : 0));
      if (e.key === "Escape") setPreview(null);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [preview, docCount]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      const move = (d: number) => { setSpin(false); setPrevious(null); setActive((i) => (i + d + total) % total); };
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightbox, total]);

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
      className={previous !== null ? styles.fadeIn : undefined}
    />
  );

  const specGroups = groupSpecs(sheet.specs);
  // Los grupos se calculan con las claves en español; cada fila se muestra con su versión en el idioma activo.
  const specRowOf = new Map(sheet.specs.map((row, i) => [row, en?.specs[i] ?? row] as const));
  const shown = (rows: Datasheet["specs"]) => rows.map((row) => specRowOf.get(row) ?? row);
  const specCards = [
    { id: "general", title: t.groups.general, rows: shown(specGroups.general) },
    { id: "standards", title: t.groups.standards, rows: shown(specGroups.standards) },
    { id: "materials", title: t.groups.materials, rows: shown(specGroups.materials) },
  ].filter((g) => g.rows.length);
  const cotas = cotasFor(sheet, size);
  const dimRow = sheet.dims.rows.find((r) => r.dn === size);
  // Un flyer por accionamiento: volante ↔ "Volante", dado ↔ "Dado" (índices de sheet.actuations).
  const actIndexOf = (id: string) => Math.max(0, (sheet.actuations ?? []).findIndex((a) => a.toLowerCase() === id));
  // Con flyers (fichas de 1 página por accionamiento), ellos son la documentación de la ficha: no se muestra la de 2 páginas
  // y "Descargar ficha técnica" baja el flyer del accionamiento elegido en el pedido.
  const flyerDocs = view.flyers.length > 0;
  const chosenFlyer = view.flyers.find((f) => actIndexOf(f.id) === actuation) ?? view.flyers[0];
  const topDoc = chosenFlyer ? chosenFlyer.href : doc?.href;

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <nav aria-label={t.crumbs.label} className={styles.crumbs}>
          <Link href="/">{t.crumbs.home}</Link><span aria-hidden="true">›</span>
          <Link href="/productos">{t.crumbs.products}</Link><span aria-hidden="true">›</span>
          <Link href="/productos/valvulas">{t.crumbs.valves}</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{productName}</span>
        </nav>

        <div className={styles.sheet}>
          <header className={styles.title}>
            {/* Marca, rango y presión en una línea de catálogo. */}
            <div className={styles.meta}>
              {brand && <span className={styles.metaBrand}><span className={styles.srOnly}>{t.brand}: </span>{brand}{series ? ` ${series}` : ""}</span>}
              <span>{sheet.sizeRange}</span>
              <span>PN10 / PN16</span>
            </div>
            <h1 id="ficha-title">{productName}</h1>
            {warrantyLabel && (
              <p className={styles.warranty}><ShieldCheck size={17} aria-hidden="true" /><span><strong>{warrantyLabel}</strong> {t.warranty}</span></p>
            )}
            <p className={styles.lead}>{view.lead}</p>
          </header>

          <div className={styles.gallery}>
            <div className={styles.stage} data-lcp>
              {spin ? (
                <Viewer3D src={sheet.model3d.src} poster={THUMBS[2].dir + THUMBS[2].src} alt={view.model3dAlt} className={styles.viewer} onFail={() => setSpin(false)} />
              ) : (
                <>
                  {photo("(min-width: 1024px) 50vw, (min-width: 481px) 88vw, 52vw", true)}
                  {/* La anterior va después en el DOM y debajo por z-index: la primera imagen sigue siendo la foto vigente. */}
                  {previous !== null && previous !== active && (
                    <Image key={`prev-${THUMBS[previous].src}`} src={THUMBS[previous].dir + THUMBS[previous].src} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 50vw, 88vw" />
                  )}
                </>
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
                    <Image src={p.dir + p.src} alt="" fill sizes="(max-width: 760px) 64px, 96px" fetchPriority="low" />
                  </button>
                ))}
              </div>
              <button type="button" className={spin ? styles.thumb3dOn : styles.thumb3d} aria-pressed={spin} aria-label={spin ? t.back3d : t.view3d} title={spin ? t.back3d : t.view3d} onClick={() => setSpin((v) => !v)}>
                <Rotate3d size={20} aria-hidden="true" /><span aria-hidden="true">3D</span>
              </button>
            </div>
          </div>

          <aside className={styles.panel} data-enter>
            {/* Pedido rápido: el DN es el mismo del plano y las tablas de dimensiones. */}
            <div className={styles.order} role="group" aria-label={t.order} ref={orderRef} data-flash={flash || undefined}>
              <label className={styles.field}>
                <span>{t.dnLabel}</span>
                <span className={styles.selectBox}>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    {sheet.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>
              <div className={styles.field} role="group" aria-label={t.pnLabel}>
                <span aria-hidden="true">{t.pnLabel}</span>
                <div className={styles.segment}>
                  {PRESSURES.map((p) => (
                    <button key={p} type="button" aria-pressed={pn === p} className={pn === p ? styles.segmentOn : undefined} onClick={() => setPn(p)}>{p}</button>
                  ))}
                </div>
              </div>
              {view.actuations && (
                <div className={styles.field} role="group" aria-label={t.actLabel}>
                  <span aria-hidden="true">{t.actLabel}</span>
                  <div className={styles.segment}>
                    {view.actuations.map((a, i) => (
                      <button key={a} type="button" aria-pressed={actuation === i} className={actuation === i ? styles.segmentOn : undefined} onClick={() => setActuation(i)}>{a}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.ctas}>
                <button type="button" className="lp-btn lp-btn--solid lp-btn--lg" onClick={addCurrent} data-added={added || undefined}>
                  {added ? <Check key="ok" size={18} strokeWidth={2.6} aria-hidden="true" className="mo-check" /> : <ShoppingCart key="cart" size={18} aria-hidden="true" />}
                  {added ? t.added : t.addCart}
                </button>
                {topDoc ? (
                  <a href={topDoc} download className="lp-btn lp-btn--outline lp-btn--lg"><FileText size={17} aria-hidden="true" /> {t.download}</a>
                ) : (
                  <Link href={requestDocumentHref(`Ficha técnica · ${base.productName}`)} className="lp-btn lp-btn--outline lp-btn--lg"><FileText size={17} aria-hidden="true" /> {t.requestSheet}</Link>
                )}
              </div>
              <Link href="/cotizar" className={styles.quoteLink}>{t.quote} <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </aside>

          <div className={styles.detail}>
            <ul className={styles.facts} aria-label={t.facts} data-reveal>
              {view.facts.map(([k, v]) => (
                <li key={k}>
                  <span className={styles.factLabel}>{k}</span>
                  <strong className="dato">{v}</strong>
                </li>
              ))}
            </ul>

            <section id="descripcion" aria-label={t.description} data-reveal>
              <h2 className={styles.detailTitle}>{t.description}</h2>
              <div className={styles.prose}>
                {paragraphs(view.description ?? t.descFallback).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
              </div>
              <ul className={styles.highlights} aria-label={t.highlights}>
                {view.highlights.map(([title, detail]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <h3 className={styles.srOnly}>{t.advantages}</h3>
              <ul className={styles.features}>
                {view.features.map((f) => (
                  <li key={f.title}>
                    <strong>{f.title}</strong>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.apps}><strong>{t.applications}:</strong> {t.apps.join(" · ")}</p>
            </section>

            <section id="especificaciones" aria-label={t.specs}>
              <header data-reveal>
                <h2 className={styles.detailTitle}>{t.specs}</h2>
                <p className={styles.note}>{view.specsNote} {t.specsPrevail}</p>
              </header>
              <div className={styles.specSheet} data-reveal="stagger">
                {specCards.map((group) => (
                  <section key={group.id} aria-label={group.title}>
                    <h3>{group.title}</h3>
                    {/* Roles explícitos: la tabla se maqueta como cuadrícula y sigue leyéndose como tabla. */}
                    <table className={styles.table} role="table" aria-label={group.title}>
                      <tbody role="rowgroup">
                        {group.rows.map(([k, v]) => <tr key={k} role="row"><th scope="row" role="rowheader">{k}</th><td role="cell">{v}</td></tr>)}
                      </tbody>
                    </table>
                  </section>
                ))}
              </div>
            </section>

            <section id="dimensiones" aria-label={t.tabs.dimensiones}>
              <header data-reveal>
                <h2 className={styles.detailTitle}>{t.dims}</h2>
                <p className={styles.note}>{view.dimsNote}</p>
              </header>

              <div className={styles.plan} data-reveal>
                <div className={styles.planHead}>
                  <span>{t.plan}</span>
                  <span className="dato">{sheet.sizeRange}</span>
                </div>
                <div className={styles.planDraw}>
                  {/* Al cambiar de diámetro el plano se monta de nuevo y aparece con opacidad. */}
                  <ValvePlan key={cotas.dn} cotas={cotas} label={t.plan} />
                </div>
                <fieldset className={styles.sizes}>
                  <legend>{t.dn}</legend>
                  <div className={styles.sizeGrid}>
                    {sheet.sizes.map((s) => (
                      <button key={s} type="button" aria-pressed={size === s} className={size === s ? styles.sizeActive : styles.size} onClick={() => setSize(s)}>{s}</button>
                    ))}
                  </div>
                  <p className={styles.note}>{t.planHint}</p>
                </fieldset>
              </div>

              <div className={styles.dimBlock} data-reveal>
                <h3>{t.table}</h3>
                <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={t.table}>
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

              <div className={styles.dimBlocks} data-reveal="stagger">
                {dimRow && (
                  <section className={styles.dimBlock} aria-label={`${t.measures} · ${size}`} key={`m-${size}`}>
                    <h3>{t.measures} · {size}</h3>
                    <dl className={styles.measure}>
                      {sheet.dims.head.slice(1).map((h, i) => (
                        <div key={h}><dt>{view.dimsHead[i + 1]}</dt><dd className="dato">{dimRow.cells[i] ?? "-"}{h === "Pulg." ? "\"" : ""}</dd></div>
                      ))}
                    </dl>
                  </section>
                )}
                <section className={styles.dimBlock} aria-label={`${view.flangeTitle} · ${size}`} key={`f-${size}`}>
                  <h3>{view.flangeTitle} · {size}</h3>
                  <p className={styles.note}>{view.flangeNote}</p>
                  <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={view.flangeTitle}>
                    <table className={styles.dims}>
                      <thead><tr>{view.flangeHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                      <tbody>
                        {sheet.flange.rows(size).map(({ pn: rowPn, cells }) => (
                          <tr key={rowPn}><th scope="row">{rowPn}</th>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {view.stem && (
                  <section className={styles.dimBlock} aria-label={`${view.stem.title} · ${size}`} key={`s-${size}`}>
                    <h3>{view.stem.title} · {size}</h3>
                    <p className={styles.note}>{view.stem.note}</p>
                    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={view.stem.title}>
                      <table className={styles.dims}>
                        <thead><tr>{view.stem.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                        <tbody>
                          {view.stem.rows(size).map(({ pn: rowPn, cells }) => (
                            <tr key={rowPn}>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>
            </section>

            {!flyerDocs && (
              <section id="documentacion" className={styles.docStrip} aria-label={t.docs} data-reveal>
                <h2 className={styles.detailTitle}>{t.docs}</h2>
                {doc ? (
                  <div className={styles.docRow}>
                    <button type="button" className={styles.docCover} onClick={openDoc} aria-label={t.previewLabel} title={t.previewLabel}>
                      <Image src={doc.pages[0].src} alt={pageAlt(0)} fill sizes="88px" />
                    </button>
                    <div className={styles.docInfo}>
                      <span className={styles.docTitle}>{view.docTitle}</span>
                      <span className={styles.docMeta}>{view.docMeta}</span>
                    </div>
                    <div className={styles.docActions}>
                      <a href={doc.href} download className="lp-btn lp-btn--outline"><Download size={16} aria-hidden="true" /> {t.download}</a>
                      <button type="button" className={styles.docGhost} onClick={openDoc}><Eye size={16} aria-hidden="true" /> {t.docView}</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.docRow}>
                    <div className={styles.docInfo}>
                      <span className={styles.docTitle}>{en ? "Datasheet" : "Ficha técnica"} · {productName}</span>
                      <span className={styles.docMeta}>{t.docOnRequest}</span>
                    </div>
                    <div className={styles.docActions}>
                      <Link href={requestDocumentHref(`Ficha técnica · ${base.productName}`)} className="lp-btn lp-btn--outline"><FileText size={16} aria-hidden="true" /> {t.requestSheet}</Link>
                    </div>
                  </div>
                )}
              </section>
            )}

            {flyerDocs && (
              <section id="documentacion" aria-labelledby="flyers-title">
                <header data-reveal>
                  <h2 id="flyers-title" className={styles.detailTitle}>{t.flyers.title}</h2>
                  <p className={styles.note}>{t.flyers.lead}</p>
                </header>
                <div className={styles.flyerGrid} data-reveal="stagger">
                  {view.flyers.map((f, i) => {
                    const act = actIndexOf(f.id);
                    const inUse = !!view.actuations && actuation === act;
                    return (
                      <article key={f.id} className={styles.flyerCard} data-active={inUse || undefined} aria-labelledby={`flyer-${f.id}`}>
                        <button type="button" className={styles.flyerPreview} onClick={() => openFlyer(f)} aria-label={t.flyers.viewLabel(f.title)}>
                          <Image src={f.preview} alt={f.alt} width={1250} height={1616} sizes="(min-width: 1100px) 220px, (min-width: 640px) 34vw, 50vw" />
                        </button>
                        <div className={styles.flyerBody}>
                          <span className={styles.note}>{t.flyers.option(i + 1)}</span>
                          <h3 id={`flyer-${f.id}`}>{f.title}</h3>
                          <span className={styles.note}>{f.subtitle}</span>
                          <ul className={styles.flyerPoints}>
                            {f.points.map((p) => <li key={p}>{p}</li>)}
                          </ul>
                          <span className={styles.note}>{f.meta}</span>
                          <div className={styles.flyerActions}>
                            <a href={f.href} download className="lp-btn lp-btn--outline" aria-label={t.flyers.downloadLabel(f.title)}><Download size={16} aria-hidden="true" /> {t.flyers.download}</a>
                            <button type="button" className={styles.docGhost} onClick={() => openFlyer(f)} aria-label={t.flyers.viewLabel(f.title)}><Eye size={16} aria-hidden="true" /> {t.flyers.view}</button>
                          </div>
                          {view.actuations && (
                            <button type="button" className={styles.flyerUse} aria-pressed={inUse} onClick={() => chooseActuation(act)}>
                              {inUse ? <Check size={15} strokeWidth={2.6} aria-hidden="true" /> : <ShoppingCart size={15} aria-hidden="true" />}
                              {inUse ? t.flyers.inUse : t.flyers.use}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <section className={styles.related} aria-labelledby="related-title">
          <div className={`cota ${styles.relatedHead}`} data-reveal>
            <h2 id="related-title">{t.related}</h2>
            <Link href="/productos" className={styles.quoteLink}>{t.allProducts} <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="celdas" data-reveal="stagger">
            {RELATED.map((r) => {
              const [title, text] = r[lang];
              return (
                <Link key={r.src} href={r.href} className="celda" aria-label={`${t.seeSheet}: ${title}`}>
                  <span className={`celda__media ${styles.relMedia}`}><Image src={BASE + r.src} alt={title} width={640} height={640} sizes="(min-width: 1261px) 25vw, (min-width: 860px) 33vw, 50vw" /></span>
                  <span className={`celda__nombre ${styles.relName}`}>{title}</span>
                  <span className="celda__nota">{text}</span>
                </Link>
              );
            })}
          </div>
          <SectorLinks slug={CART_SLUG[variantKey]} />
        </section>
      </div>

      <section className="banda-cierre on-dark" aria-labelledby="ficha-cta-title">
        <div className={styles.wrap}>
          <h2 id="ficha-cta-title" data-reveal>{t.ctaTitle}</h2>
          <Link href="/contacto" className="lp-btn lp-btn--solid">{t.ctaButton} <ArrowRight size={17} aria-hidden="true" /></Link>
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

      {preview && (
        <div className={styles.docModal} role="dialog" aria-modal="true" aria-label={preview.href === doc?.href ? t.docDialog : t.flyers.dialog} onClick={() => setPreview(null)} ref={docRef}>
          <div className={styles.docPanel} onClick={(e) => e.stopPropagation()}>
            <header className={styles.docBar}>
              <div className={styles.docBarTitle}>
                <strong>{preview.title}</strong>
                <span aria-live="polite">{t.page(docPage + 1, docCount)}</span>
              </div>
              <a href={preview.href} target="_blank" rel="noopener noreferrer" className={styles.docBarBtn}><ExternalLink size={15} aria-hidden="true" /><span>{t.openPdf}</span></a>
              <a href={preview.href} download className={styles.docBarBtn}><Download size={15} aria-hidden="true" /><span>{t.downloadShort}</span></a>
              <button type="button" className={styles.docBarClose} aria-label={t.closePreview} onClick={() => setPreview(null)}><X size={20} aria-hidden="true" /></button>
            </header>
            <div className={styles.docBody}>
              {docCount > 1 && <button type="button" className={styles.docNavPrev} aria-label={t.prevPage} onClick={() => stepDoc(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>}
              <div className={styles.docScroll} key={`${preview.href}-${docPage}`}>
                <Image src={preview.pages[docPage].src} alt={preview.pages[docPage].alt} width={preview.pages[docPage].width} height={preview.pages[docPage].height} sizes="(min-width: 1024px) 860px, 100vw" loading="eager" className={styles.docPage} />
              </div>
              {docCount > 1 && <button type="button" className={styles.docNavNext} aria-label={t.nextPage} onClick={() => stepDoc(1)}><ChevronRight size={22} aria-hidden="true" /></button>}
            </div>
            {docCount > 1 && (
              <div className={styles.docDots}>
                {preview.pages.map((pg, i) => (
                  <button key={pg.src} type="button" className={i === docPage ? styles.docDotOn : styles.docDot} onClick={() => setDocPage(i)} aria-label={t.goPage(i + 1)} aria-current={i === docPage} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
