"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Download, Filter, Mail, MessageCircleMore, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { documentHref } from "@/modules/resources/documents";
import styles from "./w04-tuberias.module.css";

type GroupId = "junta" | "mecanica" | "accesorios";
type Group = "todas" | GroupId;
type SortMode = "destacados" | "az" | "za";

const GROUPS: readonly { id: GroupId; label: string; image: string }[] = [
  { id: "junta", label: "Unión junta", image: "/media/tuberias-page/union-junta.webp" },
  { id: "mecanica", label: "Unión mecánica", image: "/media/tuberias-page/union-mecanica.webp" },
  { id: "accesorios", label: "Accesorios", image: "/media/tuberias-page/bridas.webp" },
];

const VALVES: readonly { id: string; group: GroupId; name: string; description: string; image: string; href: string }[] = [
  { id: "hdpe", group: "junta", name: "Tubería HDPE", description: "Solución resistente y duradera para redes de agua, con gran flexibilidad y bajo mantenimiento.", image: "/media/tuberias-page/hdpe.webp", href: "/productos/tuberias/tuberia-tyton" },
  { id: "revestimiento", group: "mecanica", name: "Tubería con revestimiento", description: "Mayor protección contra la corrosión y mayor vida útil en redes de conducción de agua.", image: "/media/tuberias-page/revestimiento.webp", href: "/contacto" },
  { id: "bridas", group: "accesorios", name: "Tubería con bridas", description: "Ideal para conexiones seguras en sistemas de alta presión, con montaje rápido y confiable.", image: "/media/tuberias-page/bridas.webp", href: "/contacto" },
  { id: "union-junta", group: "junta", name: "Tubería con unión junta", description: "Instalación rápida y confiable para redes de agua y alcantarillado, con sellado hermético.", image: "/media/tuberias-page/union-junta.webp", href: "/contacto" },
  { id: "union-mecanica", group: "mecanica", name: "Tubería con unión mecánica", description: "Alta flexibilidad y seguridad en proyectos de gran escala, con uniones fáciles de acoplar.", image: "/media/tuberias-page/union-mecanica.webp", href: "/contacto" },
  { id: "mortero", group: "junta", name: "Tubería con revestimiento de mortero de cemento", description: "Excelente desempeño en redes de saneamiento, con protección interna duradera.", image: "/media/tuberias-page/mortero.webp", href: "/contacto" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function W04Tuberias() {
  const [group, setGroup] = useState<Group>("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("destacados");

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const list = VALVES.filter((valve) => {
      if (group !== "todas" && valve.group !== group) return false;
      const haystack = normalize(valve.name + " " + valve.description);
      return terms.every((term) => haystack.includes(term));
    });
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "za") return [...list].sort((a, b) => b.name.localeCompare(a.name, "es"));
    return list;
  }, [group, query, sort]);

  const count = (id: GroupId) => VALVES.filter((valve) => valve.group === id).length;
  const catalogDocument = documentHref("Catálogo general de productos FUNDIGSAC");

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="tuberias-title">
        <div className={styles.heroInner}>
          <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <Link href="/">Inicio</Link><span aria-hidden="true">›</span><Link href="/productos">Productos</Link><span aria-hidden="true">›</span><span aria-current="page">Tuberías</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Productos</p>
            <h1 id="tuberias-title">Tuberías<br />de hierro dúctil</h1>
            <p className={styles.heroDescription}>Soluciones confiables para redes de agua, alcantarillado y proyectos de infraestructura urbana.</p>
          </div>
          <div className={styles.qualityStamp}><span>Calidad</span><span>Resistencia</span><span>Confianza</span></div>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label="Catálogo de tuberías">
        <div className={styles.contentWidth}>
          <div className={styles.tabs} role="tablist" aria-label="Tipos de tubería">
            <button type="button" role="tab" aria-selected={group === "todas"} className={group === "todas" ? styles.tabActive : styles.tab} onClick={() => setGroup("todas")}>
              <span className={styles.tabThumb}><Image src="/media/tuberias-page/hdpe.webp" alt="" width={56} height={56} /></span>
              <span className={styles.tabText}><strong>Todas</strong><small>los productos</small></span>
            </button>
            {GROUPS.map((entry) => {
              const total = count(entry.id);
              return (
                <button key={entry.id} type="button" role="tab" aria-selected={group === entry.id} className={group === entry.id ? styles.tabActive : styles.tab} onClick={() => setGroup(group === entry.id ? "todas" : entry.id)}>
                  <span className={styles.tabThumb}><Image src={entry.image} alt="" width={56} height={56} /></span>
                  <span className={styles.tabText}><strong>{entry.label}</strong><small>{total} {total === 1 ? "producto" : "productos"}</small></span>
                </button>
              );
            })}
          </div>

          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="sr-only">Buscar tubería por nombre, diámetro o referencia</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tubería por nombre, diámetro o referencia…" autoComplete="off" />
            </label>
            <label className={styles.select}>
              <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Filtrar</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={group} onChange={(event) => setGroup(event.target.value as Group)} aria-label="Filtrar por tipo de tubería">
                <option value="todas">Todos los productos</option>
                {GROUPS.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
            <label className={styles.select}>
              <ArrowUpDown size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Ordenar por</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Ordenar tuberías">
                <option value="destacados">Destacados</option>
                <option value="az">Nombre (A–Z)</option>
                <option value="za">Nombre (Z–A)</option>
              </select>
            </label>
          </div>

          <div className={styles.sectionHeading}>
            <h2>Explora nuestras tuberías</h2>
            <p aria-live="polite">{visible.length} {visible.length === 1 ? "producto" : "productos"}</p>
          </div>

          {visible.length ? (
            <div className={styles.grid}>
              {visible.map((valve) => (
                <article key={valve.id} className={styles.card}>
                  <Link href={valve.href} className={styles.cardImage} aria-label={"Ver ficha de " + valve.name}>
                    <Image src={valve.image} alt={valve.name} fill sizes="(min-width: 1100px) 28vw, (min-width: 640px) 44vw, 92vw" />
                  </Link>
                  <div className={styles.cardBody}>
                    <h3>{valve.name}</h3>
                    <p>{valve.description}</p>
                    <Link href={valve.href} className={styles.cardButton}>Ver ficha <ArrowRight size={15} aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              <h3>No encontramos tuberías con esos datos</h3>
              <p>Prueba con otra búsqueda o muestra todos los productos.</p>
              <button type="button" className={styles.darkButton} onClick={() => { setQuery(""); setGroup("todas"); }}>Ver todos los productos <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.adviceSection} aria-labelledby="advice-title">
        <div className={styles.adviceBackdrop} aria-hidden="true">
          <Image src="/media/tuberias-page/asesoria.webp" alt="" fill sizes="45vw" />
        </div>
        <div className={styles.contentWidth + " " + styles.adviceInner}>
          <span className={styles.adviceIcon} aria-hidden="true"><MessageCircleMore size={46} strokeWidth={1.6} /></span>
          <div className={styles.adviceCopy}>
            <h2 id="advice-title">¿Necesitas ayuda para elegir la tubería ideal?</h2>
            <p>Nuestro equipo técnico puede asesorarte según los requerimientos de tu proyecto.</p>
          </div>
          <Link href="/contacto" className={styles.darkButton}>Solicitar asesoría <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="tuberias-resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>Recursos técnicos</p>
            <h2 id="tuberias-resources-title">Catálogos y documentación</h2>
            <p>Descarga nuestros catálogos, fichas técnicas y documentación para conocer más sobre nuestras tuberías y sus aplicaciones.</p>
            <Link href="/recursos" className={styles.darkButton}>Ver todos los recursos <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.book}>
            <Image src="/media/tuberias-page/libro.webp" alt="Catálogo general de productos FUNDIGSAC" fill sizes="(min-width: 1100px) 420px, 70vw" />
          </div>
          <article className={styles.downloadCard}>
            <h3>Catálogo general<br />de productos</h3>
            <p>Información técnica completa para tu proyecto.</p>
            <Link href={catalogDocument.href} className={styles.downloadButton}>
              {catalogDocument.download ? <Download size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
              {catalogDocument.download ? "Descargar PDF (12 MB)" : "Solicitar catálogo PDF"}
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
