"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Download, Filter, Mail, MessageCircleMore, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { documentHref } from "@/modules/resources/documents";
import styles from "./w03-valvulas.module.css";

type GroupId = "compuerta" | "mariposa" | "reduccion" | "aire" | "control";
type Group = "todas" | GroupId;
type SortMode = "destacados" | "az" | "za";

const GROUPS: readonly { id: GroupId; label: string; image: string }[] = [
  { id: "compuerta", label: "Compuerta", image: "/media/valvulas-page/compuerta.webp" },
  { id: "mariposa", label: "Mariposa", image: "/media/valvulas-page/mariposa.webp" },
  { id: "reduccion", label: "Reducción", image: "/media/valvulas-page/valvula-reductora.webp" },
  { id: "aire", label: "Aire", image: "/media/valvulas-page/valvula-aire.webp" },
  { id: "control", label: "Control", image: "/media/valvulas-page/check-swing.webp" },
];

const VALVES: readonly { id: string; group: GroupId; name: string; description: string; image: string; href: string }[] = [
  { id: "compuerta", group: "compuerta", name: "Válvula de compuerta bridada", description: "Cierre elástico con extremos bridados, paso completo y baja pérdida de carga para redes de agua.", image: "/media/valvulas-page/compuerta.webp", href: "/productos/valvulas/valvula-compuerta" },
  { id: "mariposa", group: "mariposa", name: "Válvula mariposa", description: "Diseño compacto y de bajo torque para grandes diámetros, ideal para regular o cerrar el flujo.", image: "/media/valvulas-page/mariposa.webp", href: "/productos/valvulas/valvula-mariposa" },
  { id: "check-swing", group: "control", name: "Válvula check swing", description: "Evita el retorno de flujo en sistemas de conducción y protege bombas y tuberías de inversiones de caudal.", image: "/media/valvulas-page/check-swing.webp", href: "/contacto" },
  { id: "check-flex", group: "control", name: "Válvula check flex", description: "Solución confiable para redes de agua y alcantarillado, que impide el retorno del flujo y protege el sistema.", image: "/media/valvulas-page/check-flex.webp", href: "/contacto" },
  { id: "reductora", group: "reduccion", name: "Válvula reductora de presión", description: "Controla y estabiliza la presión en la red de distribución, protegiendo tuberías y equipos aguas abajo.", image: "/media/valvulas-page/valvula-reductora.webp", href: "/contacto" },
  { id: "aire", group: "aire", name: "Válvula de aire", description: "Elimina y admite aire en redes de agua, mejorando la eficiencia y evitando daños por bolsas de aire.", image: "/media/valvulas-page/valvula-aire.webp", href: "/contacto" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function W03Valvulas() {
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
      <section className={styles.hero} aria-labelledby="valvulas-title">
        <div className={styles.heroInner}>
          <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <Link href="/">Inicio</Link><span aria-hidden="true">›</span><Link href="/productos">Productos</Link><span aria-hidden="true">›</span><span aria-current="page">Válvulas</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Productos</p>
            <h1 id="valvulas-title">Válvulas</h1>
            <p className={styles.heroDescription}>Válvulas diseñadas para redes de agua, alcantarillado e infraestructura urbana.</p>
          </div>
          <div className={styles.qualityStamp}><span>Calidad</span><span>Resistencia</span><span>Confianza</span></div>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label="Catálogo de válvulas">
        <div className={styles.contentWidth}>
          <div className={styles.tabs} role="tablist" aria-label="Tipos de válvula">
            <button type="button" role="tab" aria-selected={group === "todas"} className={group === "todas" ? styles.tabActive : styles.tab} onClick={() => setGroup("todas")}>
              <span className={styles.tabThumb}><Image src="/media/valvulas-page/compuerta.webp" alt="" width={56} height={56} /></span>
              <span className={styles.tabText}><strong>Todas</strong><small>las válvulas</small></span>
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
              <span className="sr-only">Buscar válvula por nombre o referencia</span>
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar válvula por nombre o referencia…" autoComplete="off" />
            </label>
            <label className={styles.select}>
              <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Filtrar</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={group} onChange={(event) => setGroup(event.target.value as Group)} aria-label="Filtrar por tipo de válvula">
                <option value="todas">Todas las válvulas</option>
                {GROUPS.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
            <label className={styles.select}>
              <ArrowUpDown size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Ordenar por</span>
              <ChevronDown size={16} aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Ordenar válvulas">
                <option value="destacados">Destacados</option>
                <option value="az">Nombre (A–Z)</option>
                <option value="za">Nombre (Z–A)</option>
              </select>
            </label>
          </div>

          <div className={styles.sectionHeading}>
            <h2>Explora nuestras válvulas</h2>
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
              <h3>No encontramos válvulas con esos datos</h3>
              <p>Prueba con otra búsqueda o muestra todas las válvulas.</p>
              <button type="button" className={styles.darkButton} onClick={() => { setQuery(""); setGroup("todas"); }}>Ver todas las válvulas <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.adviceSection} aria-labelledby="advice-title">
        <div className={styles.adviceBackdrop} aria-hidden="true">
          <Image src="/media/valvulas-page/asesoria.webp" alt="" fill sizes="45vw" />
        </div>
        <div className={styles.contentWidth + " " + styles.adviceInner}>
          <span className={styles.adviceIcon} aria-hidden="true"><MessageCircleMore size={46} strokeWidth={1.6} /></span>
          <div className={styles.adviceCopy}>
            <h2 id="advice-title">¿No sabes qué válvula necesitas?</h2>
            <p>Nuestro equipo técnico puede asesorarte en la selección del producto ideal para tu proyecto.</p>
          </div>
          <Link href="/contacto" className={styles.darkButton}>Solicitar asesoría <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.resourcesSection} aria-labelledby="valvulas-resources-title">
        <div className={styles.resourcesBackdrop} aria-hidden="true" />
        <div className={styles.contentWidth + " " + styles.resourcesInner}>
          <div className={styles.resourcesCopy}>
            <p className={styles.eyebrow}>Recursos técnicos</p>
            <h2 id="valvulas-resources-title">Catálogos y documentación</h2>
            <p>Descarga nuestros catálogos, fichas técnicas y documentación para conocer más sobre nuestras válvulas y sus aplicaciones.</p>
            <Link href="/recursos" className={styles.darkButton}>Ver todos los recursos <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.book}>
            <Image src="/media/productos-page/catalogo-general-cover-cutout.png" alt="Catálogo general de productos FUNDIGSAC" fill sizes="(min-width: 1100px) 420px, 70vw" />
          </div>
          <article className={styles.downloadCard}>
            <h3>Catálogo general<br />de productos</h3>
            <p>Descubre nuestra línea completa de válvulas, con información técnica y aplicaciones.</p>
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
