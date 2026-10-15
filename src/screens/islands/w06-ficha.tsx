"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Rotate3d, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, FileText, Hexagon, Layers, Maximize2, Settings, ShieldCheck, X } from "lucide-react";
import styles from "./w06-ficha.module.css";
import { DATASHEETS, type Feature } from "./w06-ficha-data";
import { requestDocumentHref } from "@/modules/resources/documents";

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
  { src: "mariposa-cut.webp", title: "Válvula mariposa", text: "Diseño compacto y de bajo torque para grandes diámetros.", href: "/productos/valvulas/valvula-mariposa" },
  { src: "check-cut.webp", title: "Válvula check", text: "Evita el retorno de flujo en sistemas de conducción.", href: "/productos/valvulas" },
  { src: "aire-cut.webp", title: "Válvula de aire", text: "Elimina y admite aire en redes de agua, mejorando la eficiencia.", href: "/productos/valvulas" },
  { src: "reductora-cut.webp", title: "Válvula reductora de presión", text: "Controla y estabiliza la presión en la red de distribución.", href: "/productos/valvulas" },
];

const FEATURE_ICON = { shield: ShieldCheck, settings: Settings, layers: Layers, nut: Hexagon } satisfies Record<Feature["icon"], unknown>;

/** Variantes de la ficha: la válvula FUNDIGSAC sin garantía indicada, o con garantía extendida; sin valor es la ficha base (H-ITALY). */
export type Variant = "fundigsac" | "extendida";

/** Textos y datos técnicos por variante, definidos a nivel de módulo: la base (H-ITALY), FUNDIGSAC con volante o FUNDIGSAC con garantía extendida. */
const variantCopy = (variant?: Variant) => {
  if (!variant) return { warrantyLabel: null, productName: "Válvula de compuerta bridada", thumbs: BASE_THUMBS, sheet: DATASHEETS.base };
  if (variant === "fundigsac") return { warrantyLabel: null, productName: "Válvula de compuerta bridada FUNDIGSAC", thumbs: FUNDIGSAC_THUMBS, sheet: DATASHEETS.fundigsac };
  return { warrantyLabel: "Garantía extendida", productName: "Válvula de compuerta bridada FUNDIGSAC", thumbs: EXTENDED_THUMBS, sheet: DATASHEETS.extendida };
};
const COPY = { base: variantCopy(), fundigsac: variantCopy("fundigsac"), extendida: variantCopy("extendida") } as const;

export function W06Ficha(props: { variant?: Variant }) {
  const { warrantyLabel, productName, thumbs: THUMBS, sheet } = COPY[props.variant ?? "base"];
  const { doc } = sheet;
  const docPages = doc?.pages ?? [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [docPage, setDocPage] = useState(0);
  const [spin, setSpin] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [size, setSize] = useState("DN50");
  const total = THUMBS.length;
  const current = THUMBS[active];

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
      alt={current.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={broken[current.src]}
      onError={() => setBroken((s) => ({ ...s, [current.src]: true }))}
    />
  );

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <nav aria-label="Migas de pan" className={styles.crumbs}>
          <Link href="/">Inicio</Link><span aria-hidden="true">/</span>
          <Link href="/productos">Productos</Link><span aria-hidden="true">/</span>
          <Link href="/productos/valvulas">Válvulas</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{productName}</span>
        </nav>

        <section className={styles.top} aria-labelledby="ficha-title">
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {spin ? <Viewer3D src={sheet.model3d.src} poster={THUMBS[2].dir + THUMBS[2].src} alt={sheet.model3d.alt} className={styles.viewer} onFail={() => setSpin(false)} /> : photo("(min-width: 1024px) 640px, 100vw", true)}
              <button type="button" className={spin ? styles.view3dOn : styles.view3d} aria-label={spin ? "Volver a las fotos" : "Ver en 3D"} aria-pressed={spin} title={spin ? "Volver a las fotos" : "Ver en 3D"} onClick={() => setSpin((v) => !v)}><Rotate3d size={18} aria-hidden="true" /><span>{spin ? "Fotos" : "Ver en 3D"}</span></button>
              <button type="button" className={styles.zoom} aria-label="Ampliar" title="Ampliar" onClick={() => setLightbox(true)}><Maximize2 size={16} aria-hidden="true" /></button>
            </div>
            <div className={styles.thumbs} role="list">
              {THUMBS.map((t, i) => (
                <button key={t.src} type="button" role="listitem" className={i === active ? styles.thumbActive : styles.thumb} onClick={() => pick(i)} aria-label={`Ver ${t.alt}`} aria-current={i === active}>
                  <Image src={t.dir + t.src} alt="" fill sizes="120px" />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <span className={styles.tag}>{warrantyLabel ? `Válvulas · ${warrantyLabel}` : "Válvulas"}</span>
            <h1 id="ficha-title">{productName}</h1>
            <p className={styles.lead}>{sheet.lead}</p>

            {warrantyLabel && <p className={styles.warranty}><ShieldCheck size={20} aria-hidden="true" /><span><strong>{warrantyLabel}</strong> respaldada por FUNDIGSAC</span></p>}

            <dl className={styles.facts}>
              {sheet.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>

            <fieldset className={styles.sizes}>
              <legend><span>Diámetro nominal (DN)</span><small>{sheet.sizeRange}</small></legend>
              <div className={styles.sizeGrid}>
                {sheet.sizes.map((s) => (
                  <button key={s} type="button" aria-pressed={size === s} className={size === s ? styles.sizeActive : styles.size} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </fieldset>

            <div className={styles.ctas}>
              <Link href="/cotizar" className={styles.primary}>Solicitar cotización <ArrowRight size={16} aria-hidden="true" /></Link>
              {doc ? <a href={doc.href} download className={styles.secondary}><Download size={16} aria-hidden="true" /> Descargar ficha técnica</a> : <Link href={requestDocumentHref(`Ficha técnica · ${productName}`)} className={styles.secondary}><FileText size={16} aria-hidden="true" /> Solicitar ficha técnica</Link>}
            </div>

            <ul className={styles.badges}>
              {warrantyLabel && <li><ShieldCheck size={18} aria-hidden="true" /><span>{warrantyLabel}</span></li>}
              {sheet.badges.map((b, i) => { const Icon = [ShieldCheck, Settings, Layers][i % 3]; return <li key={b}><Icon size={18} aria-hidden="true" /><span>{b}</span></li>; })}
            </ul>
          </div>
        </section>

        <section className={styles.panel} aria-label="Descripción y documentación">
          <div className={styles.col}>
            <h2>Descripción</h2>
            <p className={styles.descLead}>Accionamiento sencillo y paso completo: una compuerta que sube y baja perpendicular al flujo.</p>
            <p>{sheet.description ?? "Las válvulas de compuerta se destacan por su accionamiento sencillo, compuesto principalmente por una compuerta o cuchilla que se eleva y baja perpendicularmente al flujo del fluido. La eficiencia de este diseño reside en su capacidad para proporcionar un paso completo y sin obstrucciones cuando está completamente abierta, minimizando la resistencia al flujo y reduciendo las pérdidas de presión."}</p>
            <ul className={styles.features}>
              {sheet.features.map((f) => { const Icon = FEATURE_ICON[f.icon]; return <li key={f.title}><span className={styles.fIcon}><Icon size={20} aria-hidden="true" /></span><span><strong>{f.title}</strong>{f.text}</span></li>; })}
            </ul>
          </div>
          <div className={styles.col} id="documentacion">
            <h2>Documentación</h2>
            {doc ? (
              <div className={styles.doc}>
                <button type="button" className={styles.docCover} onClick={() => { setDocPage(0); setDocOpen(true); }} aria-label="Previsualizar la ficha técnica" title="Previsualizar la ficha técnica">
                  <Image src={doc.pages[0].src} alt={doc.pages[0].alt} fill sizes="(min-width: 1024px) 360px, 90vw" />
                  <span className={styles.docPreviewHint}><Eye size={16} aria-hidden="true" /> Previsualizar</span>
                </button>
                <p className={styles.docTitle}>{doc.title}</p>
                <p className={styles.docMeta}>{doc.meta}</p>
                <a href={doc.href} download className={styles.docButton}><Download size={16} aria-hidden="true" /> Descargar ficha técnica</a>
              </div>
            ) : (
              <div className={styles.doc}>
                <div className={styles.docRequest}>
                  <FileText size={34} aria-hidden="true" />
                  <p>La ficha técnica de esta válvula se entrega bajo solicitud, junto con la cotización.</p>
                </div>
                <p className={styles.docTitle}>Ficha técnica · {productName}</p>
                <p className={styles.docMeta}>PDF · bajo solicitud</p>
                <Link href={requestDocumentHref(`Ficha técnica · ${productName}`)} className={styles.docButton}><FileText size={16} aria-hidden="true" /> Solicitar ficha técnica</Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.panel} aria-label="Especificaciones y dimensiones">
          <div className={styles.col}>
            <h2>Especificaciones técnicas</h2>
            <table className={styles.table}>
              <tbody>
                {sheet.specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
              </tbody>
            </table>
            <p className={styles.muted}>{sheet.specsNote}</p>
          </div>
          <div className={styles.col}>
            <h2>Dimensiones</h2>
            <p className={styles.muted}>{sheet.dims.note}</p>
            <div className={styles.tableWrap}>
              <table className={styles.dims}>
                <thead><tr>{sheet.dims.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
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
        </section>

        <section className={styles.panel1} aria-label="Bridas del diámetro seleccionado">
          <div className={styles.flangeHead}>
            <h2>{sheet.flange.title} · {size}</h2>
            <p>{sheet.flange.note}</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.flange}>
              <thead><tr>{sheet.flange.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {sheet.flange.rows(size).map(({ pn, cells }) => (
                  <tr key={pn}><th scope="row"><span className={styles.pn}>{pn}</span></th>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {sheet.stem && (
            <>
              <div className={styles.flangeHead}>
                <h2>{sheet.stem.title} · {size}</h2>
                <p>{sheet.stem.note}</p>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.flange}>
                  <thead><tr>{sheet.stem.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {sheet.stem.rows(size).map(({ pn, cells }) => (
                      <tr key={pn}>{cells.map((c, i) => <td key={i}>{c ?? "-"}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className={styles.related} aria-labelledby="related-title">
          <div className={styles.relatedHead}>
            <h2 id="related-title">Productos relacionados</h2>
            <Link href="/productos" className={styles.allLink}>Ver todos los productos <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className={styles.relatedGrid}>
            {RELATED.map((r) => (
              <article key={r.title} className={styles.relCard}>
                <div className={styles.relImage}><Image src={BASE + r.src} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" /></div>
                <div className={styles.relBody}>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <Link href={r.href} className={styles.relLink}>Ver ficha <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {lightbox && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Galería ampliada" onClick={() => setLightbox(false)}>
          <button type="button" className={styles.lbClose} aria-label="Cerrar" onClick={() => setLightbox(false)}><X size={22} aria-hidden="true" /></button>
          <button type="button" className={styles.lbPrev} aria-label="Imagen anterior" onClick={(e) => { e.stopPropagation(); step(-1); }}><ChevronLeft size={26} aria-hidden="true" /></button>
          <div className={styles.lbStage} onClick={(e) => e.stopPropagation()}>
            {spin ? <Viewer3D src={sheet.model3d.src} poster={THUMBS[2].dir + THUMBS[2].src} alt={sheet.model3d.alt} className={styles.viewer} onFail={() => setSpin(false)} /> : photo("100vw")}
          </div>
          <button type="button" className={styles.lbNext} aria-label="Imagen siguiente" onClick={(e) => { e.stopPropagation(); step(1); }}><ChevronRight size={26} aria-hidden="true" /></button>
          <div className={styles.lbBar} onClick={(e) => e.stopPropagation()}>
            {THUMBS.map((t, i) => (
              <button key={t.src} type="button" className={i === active ? styles.lbDotActive : styles.lbDot} onClick={() => pick(i)} aria-label={`Ver ${t.alt}`} />
            ))}
          </div>
        </div>
      )}

      {docOpen && doc && (
        <div className={styles.docModal} role="dialog" aria-modal="true" aria-label="Previsualización de la ficha técnica" onClick={() => setDocOpen(false)}>
          <div className={styles.docPanel} onClick={(e) => e.stopPropagation()}>
            <header className={styles.docBar}>
              <div className={styles.docBarTitle}>
                <strong>{doc?.title}</strong>
                <span aria-live="polite">Página {docPage + 1} de {docCount}</span>
              </div>
              <a href={doc?.href} target="_blank" rel="noopener noreferrer" className={styles.docBarBtn}><ExternalLink size={15} aria-hidden="true" /><span>Abrir PDF</span></a>
              <a href={doc?.href} download className={styles.docBarBtn}><Download size={15} aria-hidden="true" /><span>Descargar</span></a>
              <button type="button" className={styles.docBarClose} aria-label="Cerrar previsualización" onClick={() => setDocOpen(false)}><X size={20} aria-hidden="true" /></button>
            </header>
            <div className={styles.docBody}>
              <button type="button" className={styles.docNavPrev} aria-label="Página anterior" onClick={() => stepDoc(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
              <div className={styles.docScroll} key={docPage}>
                <Image src={docPages[docPage].src} alt={docPages[docPage].alt} width={1500} height={2121} sizes="(min-width: 1024px) 860px, 100vw" priority className={styles.docPage} />
              </div>
              <button type="button" className={styles.docNavNext} aria-label="Página siguiente" onClick={() => stepDoc(1)}><ChevronRight size={22} aria-hidden="true" /></button>
            </div>
            <div className={styles.docDots}>
              {docPages.map((pg, i) => (
                <button key={pg.src} type="button" className={i === docPage ? styles.docDotOn : styles.docDot} onClick={() => setDocPage(i)} aria-label={`Ir a la página ${i + 1}`} aria-current={i === docPage} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
