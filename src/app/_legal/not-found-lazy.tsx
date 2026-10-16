"use client";

import dynamic from "next/dynamic";

/**
 * La 404 de la raíz se empaqueta con el layout raíz: importarla de forma estática cargaba legal.css (~60 KB) en
 * todas las páginas del sitio. Con la carga diferida solo la descarga la propia 404 (sigue renderizándose en el servidor).
 */
export const NotFoundView = dynamic(() => import("./not-found-view").then((m) => m.NotFoundView));
