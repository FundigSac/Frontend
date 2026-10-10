"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Rotate3d, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, Layers, Maximize2, Settings, ShieldCheck, X } from "lucide-react";
import styles from "./w06-ficha.module.css";

const BASE = "/media/valvula-ficha/";
const PDF_HREF = "/docs/ficha-tecnica-valvula-compuerta-bridada.pdf";
const PDF_PAGES = [1, 2, 3].map((n) => ({ src: `${BASE}ficha-p${n}.webp`, alt: `Ficha técnica FT-HI-100 Rev. 13, página ${n} de 3` }));

const SIZES = ["DN40", "DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN500", "DN600"];

// Datos de la ficha técnica FT-HI-100 Rev. 13 (mm), valores de referencia. L: DIN 3202 F4 (serie 14) / F5 (serie 15).
const DN_LIST = ["DN40", "DN50", "DN65", "DN80", "DN100", "DN125", "DN150", "DN200", "DN250", "DN300", "DN350", "DN400", "DN500", "DN600"];
const L_F4 = [140, 150, 170, 180, 190, 200, 210, 230, 250, 270, 290, 310, 350, 390];
const L_F5 = [240, 250, 270, 280, 300, 325, 350, 400, 450, 500, null, 600, 700, 800];
const H_ = [220, 230, 265, 290, 335, 380, 415, 510, 600, 690, 790, 855, 1020, 1180];
const OD = [180, 180, 200, 200, 250, 250, 300, 300, 500, 500, 600, 600, 600, 600];
const FLANGE = {
  PN10: {
    A: [150, 165, 185, 200, 220, 250, 285, 340, 400, 455, 505, 565, 670, 780],
    B: ["110", "125", "135/145", "160", "180", "210", "240", "295", "350", "400", "460", "515", "620", "725"],
    C: [84, 99, 118, 132, 156, 184, 211, 266, 319, 370, 429, 480, 582, 682],
    E: [16, 16, 16, 16, 16, 16, 16, 17, 19, 20.5, 20.5, 20.5, 22.5, 25],
    n: [4, 4, 4, 8, 8, 8, 8, 8, 12, 12, 16, 16, 20, 20],
    b: [19, 19, 19, 19, 19, 19, 23, 23, 23, 23, 23, 28, 28, 31],
  },
  PN16: {
    A: [150, 165, 185, 200, 220, 250, 285, 340, 400, 455, 520, 580, 715, 840],
    B: ["110", "125", "135/145", "160", "180", "210", "240", "295", "355", "410", "470", "525", "650", "770"],
    C: [84, 99, 118, 132, 156, 184, 211, 266, 319, 370, 429, 480, 609, 720],
    E: [16, 16, 16, 16, 16, 16, 16, 17, 19, 20.5, 22.5, 24, 27.5, 31],
    n: [4, 4, 4, 4, 8, 8, 8, 12, 12, 12, 16, 16, 20, 20],
    b: [19, 19, 19, 19, 19, 19, 23, 25, 28, 28, 28, 31, 34, 37],
  },
} as const;

const Viewer3D = dynamic(() => import("@/components/product-3d-viewer"), {
  ssr: false,
  loading: () => <div className={styles.loading3d} role="status">Cargando modelo 3D…</div>,
});

const REAL = "/media/valvula-hd/";
const THUMBS = [
  { dir: REAL, src: "v-01.webp", alt: "Válvula de compuerta bridada, vista frontal" },
  { dir: REAL, src: "v-02.webp", alt: "Válvula de compuerta bridada DN100 PN16, vista frontal con volante y marcado en el cuerpo" },
  { dir: REAL, src: "v-03.webp", alt: "Vista superior del volante azul con indicación CLOSE y OPEN" },
  { dir: REAL, src: "v-04.webp", alt: "Válvula de compuerta bridada, vista en perspectiva con etiqueta DN100 en la brida" },
  { dir: REAL, src: "v-05.webp", alt: "Válvula de compuerta bridada, vista frontal de la brida con etiqueta DN100" },
];

const RELATED = [
  { src: "mariposa-cut.webp", title: "Válvula mariposa", text: "Diseño compacto y de bajo torque para grandes diámetros.", href: "/productos/valvulas/valvula-mariposa" },
  { src: "check-cut.webp", title: "Válvula check", text: "Evita el retorno de flujo en sistemas de conducción.", href: "/productos/valvulas" },
  { src: "aire-cut.webp", title: "Válvula de aire", text: "Elimina y admite aire en redes de agua, mejorando la eficiencia.", href: "/productos/valvulas" },
  { src: "reductora-cut.webp", title: "Válvula reductora de presión", text: "Controla y estabiliza la presión en la red de distribución.", href: "/productos/valvulas" },
];

const SPECS = [
  ["Marca", "H-ITALY"],
  ["Tipo", "Compuerta de cierre elástico, extremos bridados"],
  ["Cuerpo y tapa", "GJS-500-7 (GGG-50), hierro dúctil"],
  ["Cuña", "Núcleo GJS-500-7 con recubrimiento EPDM"],
  ["Vástago", "Inox. 1.4021 (2Cr13 / SS420)"],
  ["Tuerca del vástago", "Latón"],
  ["Sellos", "EPDM · NBR · PTFE"],
  ["Tornillería", "Inoxidable A2 / SS304"],
  ["Revestimiento", "Epoxi azul RAL 5005, mín. 250 micras"],
  ["Diseño", "ISO 7259 · AWWA C509 / C515"],
  ["Brida", "ISO 7005-2 · EN 1092-2, doble perforación PN10/PN16"],
  ["Longitud entre caras", "ISO 5752 series 14 y 15 · DIN3202 F4 / F5"],
  ["Prueba", "EN 1171 y EN 1074"],
  ["Norma de producto", "EN 1074-2"],
  ["Presión máxima de trabajo", "16 bar"],
  ["Temperatura máxima", "110 °C"],
  ["Medio", "Agua"],
  ["Rango dimensional", "DN40 a DN600"],
];

export function W06Ficha() {
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

  const stepDoc = useCallback((d: number) => setDocPage((i) => (i + d + PDF_PAGES.length) % PDF_PAGES.length), []);

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
          <span aria-current="page">Válvula de compuerta bridada</span>
        </nav>

        <section className={styles.top} aria-labelledby="ficha-title">
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {spin ? <Viewer3D src="/models/valvula-compuerta.glb" poster={REAL + "v-03.webp"} alt="Modelo 3D de la válvula de compuerta bridada" className={styles.viewer} onFail={() => setSpin(false)} /> : photo("(min-width: 1024px) 640px, 100vw", true)}
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
            <span className={styles.tag}>Válvulas</span>
            <h1 id="ficha-title">Válvula de compuerta bridada</h1>
            <p className={styles.lead}>Válvula de compuerta de cierre elástico con extremos bridados, F4 serie 14 / F5 serie 15, según EN1074-2. Paso completo sin obstrucciones cuando está abierta: menor resistencia al flujo y menos pérdidas de presión.</p>

            <dl className={styles.facts}>
              <div><dt>Presión máx.</dt><dd>16 bar</dd></div>
              <div><dt>Temp. máx.</dt><dd>110 °C</dd></div>
              <div><dt>Medio</dt><dd>Agua</dd></div>
              <div><dt>Norma</dt><dd>EN1074-2</dd></div>
            </dl>

            <fieldset className={styles.sizes}>
              <legend><span>Diámetro nominal (DN)</span><small>DN40 – DN600</small></legend>
              <div className={styles.sizeGrid}>
                {SIZES.map((s) => (
                  <button key={s} type="button" aria-pressed={size === s} className={size === s ? styles.sizeActive : styles.size} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </fieldset>

            <div className={styles.ctas}>
              <Link href="/cotizar" className={styles.primary}>Solicitar cotización <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href={PDF_HREF} download className={styles.secondary}><Download size={16} aria-hidden="true" /> Descargar ficha técnica</a>
            </div>

            <ul className={styles.badges}>
              <li><ShieldCheck size={18} aria-hidden="true" /><span>Cierre elástico</span></li>
              <li><Settings size={18} aria-hidden="true" /><span>PN10 / PN16</span></li>
              <li><Layers size={18} aria-hidden="true" /><span>Epoxi 250 µm</span></li>
            </ul>
          </div>
        </section>

        <section className={styles.panel} aria-label="Descripción y documentación">
          <div className={styles.col}>
            <h2>Descripción</h2>
            <p className={styles.descLead}>Accionamiento sencillo y paso completo: una compuerta que sube y baja perpendicular al flujo.</p>
            <p>Las válvulas de compuerta se destacan por su accionamiento sencillo, compuesto principalmente por una compuerta o cuchilla que se eleva y baja perpendicularmente al flujo del fluido. La eficiencia de este diseño reside en su capacidad para proporcionar un paso completo y sin obstrucciones cuando está completamente abierta, minimizando la resistencia al flujo y reduciendo las pérdidas de presión.</p>
            <ul className={styles.features}>
              <li><span className={styles.fIcon}><ShieldCheck size={20} aria-hidden="true" /></span><span><strong>Mantenimiento bajo presión</strong>Con la válvula completamente abierta; 3 juntas tóricas protegen el husillo de las impurezas del agua.</span></li>
              <li><span className={styles.fIcon}><Settings size={20} aria-hidden="true" /></span><span><strong>Bajo par de cierre</strong>La rosca del vástago se forma por compresión de rodillos, con bordes redondeados.</span></li>
              <li><span className={styles.fIcon}><Layers size={20} aria-hidden="true" /></span><span><strong>Epoxi azul RAL 5005, mín. 250 micras</strong>Revestimientos y gomas aptos para agua potable.</span></li>
            </ul>
          </div>
          <div className={styles.col} id="documentacion">
            <h2>Documentación</h2>
            <div className={styles.doc}>
              <button type="button" className={styles.docCover} onClick={() => { setDocPage(0); setDocOpen(true); }} aria-label="Previsualizar la ficha técnica" title="Previsualizar la ficha técnica">
                <Image src={PDF_PAGES[0].src} alt={PDF_PAGES[0].alt} fill sizes="(min-width: 1024px) 360px, 90vw" />
                <span className={styles.docPreviewHint}><Eye size={16} aria-hidden="true" /> Previsualizar</span>
              </button>
              <p className={styles.docTitle}>Ficha técnica FT-HI-100 · Rev. 13</p>
              <p className={styles.docMeta}>PDF · 5.4 MB · 3 páginas</p>
              <a href={PDF_HREF} download className={styles.docButton}><Download size={16} aria-hidden="true" /> Descargar ficha técnica</a>
            </div>
          </div>
        </section>

        <section className={styles.panel} aria-label="Especificaciones y dimensiones">
          <div className={styles.col}>
            <h2>Especificaciones técnicas</h2>
            <table className={styles.table}>
              <tbody>
                {SPECS.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
              </tbody>
            </table>
            <p className={styles.muted}>Valores de referencia de la ficha FT-HI-100 Rev. 13; verificar con H-ITALY según la variante.</p>
          </div>
          <div className={styles.col}>
            <h2>Dimensiones</h2>
            <p className={styles.muted}>Medidas en milímetros (mm). Longitud entre caras L según DIN3202.</p>
            <div className={styles.tableWrap}>
              <table className={styles.dims}>
                <thead><tr><th scope="col">DN</th><th scope="col">L (F4)</th><th scope="col">L (F5)</th><th scope="col">H</th><th scope="col">ØD</th></tr></thead>
                <tbody>
                  {DN_LIST.map((dn, i) => (
                    <tr key={dn} className={dn === size ? styles.rowOn : undefined} onClick={() => setSize(dn)}>
                      <th scope="row">{dn}</th><td>{L_F4[i]}</td><td>{L_F5[i] ?? "—"}</td><td>{H_[i]}</td><td>{OD[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={styles.panel1} aria-label="Bridas del diámetro seleccionado">
          <div className={styles.flangeHead}>
            <h2>Bridas · {size}</h2>
            <p>Conexión según EN1092-2, doble perforación PN10 / PN16. Medidas en mm. Selecciona otro diámetro arriba para actualizar.</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.flange}>
              <thead><tr><th scope="col">PN</th><th scope="col">ØA</th><th scope="col">ØB</th><th scope="col">ØC</th><th scope="col">E</th><th scope="col">n × Øb</th></tr></thead>
              <tbody>
                {(["PN10", "PN16"] as const).map((pn) => {
                  const i = DN_LIST.indexOf(size), F = FLANGE[pn];
                  return <tr key={pn}><th scope="row"><span className={styles.pn}>{pn}</span></th><td>{F.A[i]}</td><td>{F.B[i]}</td><td>{F.C[i]}</td><td>{F.E[i]}</td><td>{F.n[i]} × {F.b[i]}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
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
            {spin ? <Viewer3D src="/models/valvula-compuerta.glb" poster={REAL + "v-03.webp"} alt="Modelo 3D de la válvula de compuerta bridada" className={styles.viewer} onFail={() => setSpin(false)} /> : photo("100vw")}
          </div>
          <button type="button" className={styles.lbNext} aria-label="Imagen siguiente" onClick={(e) => { e.stopPropagation(); step(1); }}><ChevronRight size={26} aria-hidden="true" /></button>
          <div className={styles.lbBar} onClick={(e) => e.stopPropagation()}>
            {THUMBS.map((t, i) => (
              <button key={t.src} type="button" className={i === active ? styles.lbDotActive : styles.lbDot} onClick={() => pick(i)} aria-label={`Ver ${t.alt}`} />
            ))}
          </div>
        </div>
      )}

      {docOpen && (
        <div className={styles.docModal} role="dialog" aria-modal="true" aria-label="Previsualización de la ficha técnica" onClick={() => setDocOpen(false)}>
          <div className={styles.docPanel} onClick={(e) => e.stopPropagation()}>
            <header className={styles.docBar}>
              <div className={styles.docBarTitle}>
                <strong>Ficha técnica FT-HI-100 · Rev. 13</strong>
                <span aria-live="polite">Página {docPage + 1} de {PDF_PAGES.length}</span>
              </div>
              <a href={PDF_HREF} target="_blank" rel="noopener noreferrer" className={styles.docBarBtn}><ExternalLink size={15} aria-hidden="true" /><span>Abrir PDF</span></a>
              <a href={PDF_HREF} download className={styles.docBarBtn}><Download size={15} aria-hidden="true" /><span>Descargar</span></a>
              <button type="button" className={styles.docBarClose} aria-label="Cerrar previsualización" onClick={() => setDocOpen(false)}><X size={20} aria-hidden="true" /></button>
            </header>
            <div className={styles.docBody}>
              <button type="button" className={styles.docNavPrev} aria-label="Página anterior" onClick={() => stepDoc(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
              <div className={styles.docScroll} key={docPage}>
                <Image src={PDF_PAGES[docPage].src} alt={PDF_PAGES[docPage].alt} width={1500} height={2121} sizes="(min-width: 1024px) 860px, 100vw" priority className={styles.docPage} />
              </div>
              <button type="button" className={styles.docNavNext} aria-label="Página siguiente" onClick={() => stepDoc(1)}><ChevronRight size={22} aria-hidden="true" /></button>
            </div>
            <div className={styles.docDots}>
              {PDF_PAGES.map((pg, i) => (
                <button key={pg.src} type="button" className={i === docPage ? styles.docDotOn : styles.docDot} onClick={() => setDocPage(i)} aria-label={`Ir a la página ${i + 1}`} aria-current={i === docPage} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
