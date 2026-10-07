import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { csvCell } from "./utils/crawl-shared";

type Page = {
  url: string; pathname: string; status: number | null; title: string; metaDescription: string;
  canonical: string; robots: string; headings: { h1: string[]; h2: string[]; h3: string[] };
  pageType: string; mainText: string; images: { url?: string; src: string; alt: string; complete: boolean; naturalWidth: number }[];
  htmlLang?: string; platformIndicators?: string[]; error?: string;
};

const root = process.cwd();
const report = JSON.parse(await readFile(path.join(root, "reports/crawl/pages.json"), "utf8")) as { generatedAt: string; pages: Page[] };
const pages = report.pages;
const inspected = pages.filter((page) => page.status !== null && !page.error);
const csv = [
  ["url", "status", "title", "title_length", "meta_description", "meta_description_length", "canonical", "robots", "h1", "page_type"].map(csvCell).join(","),
  ...pages.map((page) => [page.url, page.status, page.title, page.title.length, page.metaDescription, page.metaDescription.length, page.canonical, page.robots, page.headings.h1.join(" | "), page.pageType].map(csvCell).join(",")),
].join("\n");
await writeFile(path.join(root, "reports/seo/current-seo.csv"), csv, "utf8");

const typeCounts = Object.fromEntries([...new Set(inspected.map((page) => page.pageType))].sort().map((type) => [type, inspected.filter((page) => page.pageType === type).length]));
const broken = pages.filter((page) => page.status !== null && page.status >= 400);
const failedRequests = pages.filter((page) => page.status === null || page.error);
const noTitle = inspected.filter((page) => !page.title.trim());
const noDescription = inspected.filter((page) => !page.metaDescription.trim());
const noH1 = inspected.filter((page) => !page.headings.h1.length);
const multiH1 = inspected.filter((page) => page.headings.h1.length > 1);
const missingAlt = inspected.flatMap((page) => page.images.filter((image) => !image.alt.trim()).map((image) => ({ page: page.url, src: image.url ?? image.src })));
const failedImages = inspected.flatMap((page) => page.images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => ({ page: page.url, src: image.url ?? image.src })));
const langGroups = Object.groupBy(inspected, (page) => page.htmlLang || "(sin lang)");
const duplicateGroups = (key: (page: Page) => string) => {
  const grouped = new Map<string, Page[]>();
  for (const page of inspected) {
    const value = key(page).trim().toLowerCase();
    if (value) grouped.set(value, [...(grouped.get(value) ?? []), page]);
  }
  return [...grouped.values()].filter((group) => group.length > 1).map((group) => group.map((page) => page.url));
};
const duplicatedTitles = duplicateGroups((page) => page.title);
const duplicatedCanonicals = duplicateGroups((page) => page.canonical);
const products = inspected.filter((page) => page.pageType === "product");
const categories = inspected.filter((page) => page.pageType === "category");
const visibleContent = inspected.filter((page) => ["home", "page", "post", "legal"].includes(page.pageType));
const indicators = [...new Set(inspected.flatMap((page) => page.platformIndicators ?? []))].sort();
const checks = ["/", "/shop/", "/nosotros/", "/contactanos/", "/libro-de-reclamos/", "/product-category/valvulas-hierro-ductil/"];
const checkResults = checks.map((route) => ({ route, found: inspected.some((page) => page.pathname.replace(/\/$/, "") === route.replace(/\/$/, "")), attempted: pages.some((page) => page.pathname.replace(/\/$/, "") === route.replace(/\/$/, "")) }));
const topTitles = (items: Page[]) => items.map((page) => `${page.title || "(sin título)"} — ${page.url}`);

const lines = [
  "# Auditoría objetiva del sitio actual",
  "",
  `Crawl generado: ${report.generatedAt}. URLs intentadas: ${pages.length}; páginas con respuesta y contenido analizado: ${inspected.length}; intentos fallidos: ${failedRequests.length}.`,
  "",
  "## Páginas por tipo",
  ...(Object.entries(typeCounts).length ? Object.entries(typeCounts).map(([type, count]) => `- ${type}: ${count}`) : ["- No se pudo clasificar ninguna página porque el HTML no respondió."]),
  "",
  "## Categorías detectadas",
  ...(categories.length ? topTitles(categories).map((line) => `- ${line}`) : [inspected.length ? "- Ninguna página quedó clasificada como categoría." : "- Sin evidencia: no hubo páginas inspeccionables."]),
  "",
  "## Productos detectados",
  ...(products.length ? topTitles(products).map((line) => `- ${line}`) : [inspected.length ? "- Ninguna página quedó clasificada como producto." : "- Sin evidencia: no hubo páginas inspeccionables."]),
  "",
  "## Contenido empresarial y otras páginas",
  ...(visibleContent.length ? topTitles(visibleContent).map((line) => `- ${line}`) : [inspected.length ? "- No se detectaron páginas de contenido empresarial entre las páginas inspeccionadas." : "- Sin evidencia: no hubo páginas inspeccionables."]),
  "",
  "## Evidencia de WordPress y plugins",
  ...(indicators.length ? indicators.map((indicator) => `- ${indicator}`) : inspected.length ? ["- No se detectaron indicadores técnicos en las páginas inspeccionadas."] : ["- No se pudo determinar: no se obtuvo DOM de ninguna página."]),
  "",
  "## Idiomas declarados",
  ...(inspected.length ? Object.entries(langGroups).map(([lang, group]) => `- ${lang}: ${(group ?? []).length} página(s)`) : ["- No determinado: no hubo páginas inspeccionables."]),
  "",
  "## Problemas observados",
  "Las métricas de metadata e imágenes de abajo corresponden solo a páginas cuyo HTML se pudo analizar.",
  `- Páginas HTTP 4xx/5xx: ${broken.length}${broken.length ? ` — ${broken.map((page) => `${page.status} ${page.url}`).join("; ")}` : ""}`,
  `- Páginas que no se pudieron inspeccionar: ${failedRequests.length}${failedRequests.length ? ` — ${failedRequests.map((page) => `${page.url}: ${page.error ?? "sin respuesta"}`).join("; ")}` : ""}`,
  `- Sin title: ${noTitle.length}; sin meta description: ${noDescription.length}; sin H1: ${noH1.length}; con varios H1: ${multiH1.length}.`,
  `- Títulos repetidos: ${duplicatedTitles.length} grupo(s). Canonicals repetidos: ${duplicatedCanonicals.length} grupo(s).`,
  `- Imágenes sin alt: ${missingAlt.length}; imágenes que el navegador reportó fallidas: ${failedImages.length}.`,
  "",
  "### Grupos de títulos repetidos",
  ...(duplicatedTitles.length ? duplicatedTitles.map((group) => `- ${group.join(" | ")}`) : ["- Ninguno detectado."]),
  "",
  "### Imágenes fallidas",
  ...(failedImages.length ? failedImages.map((image) => `- ${image.page}: ${image.src}`) : ["- Ninguna reportada por el navegador durante el crawl."]),
  "",
  "## URLs de validación solicitadas",
  ...checkResults.map((item) => `- ${item.found ? "Encontrada" : item.attempted ? "Intentada pero sin contenido recibido" : "No encontrada en las páginas inspeccionadas"}: ${item.route}`),
  "",
  "## Redirecciones a preservar",
  "La lista de URLs descubiertas está en `reports/crawl/urls.csv`. Cada URL pública encontrada debe evaluarse para conservarla mediante una ruta equivalente o redirect en la migración. No se propone ningún redirect para URLs que el crawl no haya observado.",
  "",
  "## Enlaces internos rotos",
  "Los anchors internos descubiertos y su status (si la URL fue recorrida) están en `reports/crawl/links.json`. Un targetStatus nulo indica que no se obtuvo status dentro del límite del crawl; no prueba que el enlace esté roto.",
  "",
  "## Método y límites",
  "El crawler abre enlaces internos públicos en modo lectura. No envía formularios ni acciona botones. El recuento refleja únicamente páginas alcanzables desde la portada dentro del límite configurado; URLs no enlazadas no se consideran descubrimientos.",
];
await writeFile(path.join(root, "docs/CURRENT_SITE_AUDIT.md"), lines.join("\n"), "utf8");
console.log(`SEO audit written: ${inspected.length} analyzed pages; ${products.length} products; ${categories.length} categories.`);
