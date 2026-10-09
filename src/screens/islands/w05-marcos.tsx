"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Download, Filter, Mail, MessageCircleMore, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { documentHref } from "@/modules/resources/documents";
import styles from "./w05-marcos.module.css";

type GroupId = "circulares" | "marcos" | "rejillas" | "pesado" | "peatonal";
type Group = "todas" | GroupId;
type SortMode = "destacados" | "az" | "za";

const GROUPS: readonly { id: GroupId; label: string; image: string }[] = [
  { id: "circulares", label: "Tapas circulares", image: "/media/marcos-page/tapa-circular.webp" },
  { id: "marcos", label: "Marcos", image: "/media/marcos-page/marco-rectangular.webp" },
  { id: "rejillas", label: "Rejillas", image: "/media/marcos-page/rejilla.webp" },
  { id: "pesado", label: "Tráfico pesado", image: "/media/marcos-page/marco-d400.webp" },
  { id: "peatonal", label: "Peatonal", image: "/media/marcos-page/tapa-registro.webp" },
];

const VALVES: readonly { id: string; group: GroupId; name: string; description: string; image: string; href: string }[] = [
  { id: "tapa-circular", group: "circulares", name: "Tapa circular dúctil", description: "Alta resistencia para tráfico vehicular y uso urbano, con superficie antideslizante.", image: "/media/marcos-page/tapa-circular.webp", href: "/productos/marcos-y-tapas/marco-tapa-d400" },
  { id: "marco-d400", group: "pesado", name: "Marco y tapa clase D400", description: "Conjunto completo para zonas de alto tráfico, fabricado según la norma EN 124.", image: "/media/marcos-page/marco-d400.webp", href: "/contacto" },
  { id: "rejilla", group: "rejillas", name: "Rejilla pluvial", description: "Solución para la captación y drenaje de aguas de lluvia en calzadas y veredas.", image: "/media/marcos-page/rejilla.webp", href: "/contacto" },
  { id: "tapa-valvula", group: "circulares", name: "Tapa para válvula", description: "Diseño compacto y resistente para cámaras de válvulas, con acceso fácil de operar.", image: "/media/marcos-page/tapa-valvula.webp", href: "/contacto" },
  { id: "marco-rectangular", group: "marcos", name: "Marco rectangular", description: "Marcos de hierro dúctil para diferentes aplicaciones y dimensiones de cámaras.", image: "/media/marcos-page/marco-rectangular.webp", href: "/contacto" },
  { id: "tapa-registro", group: "peatonal", name: "Tapa de registro", description: "Para cámaras de inspección en redes de agua y alcantarillado de tránsito liviano.", image: "/media/marcos-page/tapa-registro.webp", href: "/contacto" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function W05Marcos() {
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
      <section className={styles.hero} aria-labelledby="marcos-title">
        <div className={styles.heroInner}>
          <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <Link href="/">Inicio</Link><span aria-hidden="true">›</span><Link href="/productos">Productos</Link><span aria-hidden="true">›</span><span aria-current="page">Marcos y tapas</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Productos</p>
            <h1 id="marcos-title">Marcos y tapas</h1>
            <p className={styles.heroDescription}>Componentes de hierro dúctil diseñados para redes de agua, alcantarillado e infraestructura urbana. Máxima resistencia y durabilidad para un servicio confiable.</p>
          </div>
          <div className={styles.qualityStamp}><span>Calidad</span><span>Resistencia</span><span>Confianza</span></div>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label="Catálogo de marcos y tapas">
        <div className={styles.contentWidth}>
          <div className={styles.tabs} role="tablist" aria-label="Tipos de marcos y tapas">
            <button type="button" role="tab" aria-selected={group === "todas"} className={group === "todas" ? styles.tabActive : styles.tab} onClick={() => setGroup("todas")}>
              <span className={styles.tabThumb}><Image src="/media/marcos-page/tapa-circular.webp" alt="" width={56} height={56} /></span>
              <span className={styles.tabText}><strong>Todas</strong><small>6 productos</small></span>
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
              <span className="sr-only">Buscar tapa o marco por nombre o referencia</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tapa o marco por nombre o referencia…" autoComplete="off" />
            </label>
            <label className={styles.select}>
              <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Filtrar</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={group} onChange={(event) => setGroup(event.target.value as Group)} aria-label="Filtrar por tipo de producto">
                <option value="todas">Todos los productos</option>
                {GROUPS.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
            <label className={styles.select}>
              <ArrowUpDown size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Ordenar por</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Ordenar productos">
                <option value="destacados">Destacados</option>
                <option value="az">Nombre (A–Z)</option>
                <option value="za">Nombre (Z–A)</option>
              </select>
            </label>
          </div>

          <div className={styles.sectionHeading}>
            <h2>Explora nuestros marcos y tapas</h2>
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
              <h3>No encontramos productos con esos datos</h3>
              <p>Prueba con otra búsqueda o muestra todos los productos.</p>
              <button type="button" className={styles.darkButton} onClick={() => { setQuery(""); setGroup("todas"); }}>Ver todos los productos <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.adviceSection} aria-labelledby="advice-title">
        <div className={styles.adviceBackdrop} aria-hidden="true">
          <Image src="/media/marcos-page/hero.webp" alt="" fill sizes="45vw" />
        </div>
        <div className={styles.contentWidth + " " + styles.adviceInner}>
          <span className={styles.adviceIcon} aria-hidden="true"><MessageCircleMore size={46} strokeWidth={1.6} /></span>
          <div className={styles.adviceCopy}>
            <h2 id="advice-title">¿No sabes qué tapa necesitas?</h2>
            <p>Nuestro equipo técnico puede asesorarte en la selección del producto ideal para tu proyecto.</p>
          </div>
          <Link href="/contacto" className={styles.darkButton}>Solicitar asesoría <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="marcos-resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>Recursos técnicos</p>
            <h2 id="marcos-resources-title">Catálogos y documentación</h2>
            <p>Descarga nuestros catálogos, fichas técnicas y documentación para conocer más sobre nuestros marcos y tapas y sus aplicaciones.</p>
            <Link href="/recursos" className={styles.darkButton}>Ver todos los recursos <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.book}>
            <Image src="/media/marcos-page/libro.webp" alt="Catálogo general de productos FUNDIGSAC" fill sizes="(min-width: 1100px) 420px, 70vw" />
          </div>
          <article className={styles.downloadCard}>
            <h3>Catálogo general<br />de productos</h3>
            <p>Descubre nuestra línea completa de soluciones para redes de agua, alcantarillado e infraestructura urbana.</p>
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
