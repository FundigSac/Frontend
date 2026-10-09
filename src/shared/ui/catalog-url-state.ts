"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseState, stateToParams, type CatalogState } from "@/modules/catalog/search";

/**
 * Estado de catálogo/búsqueda sincronizado con la URL (compartible). Se inicializa con el estado que el servidor
 * ya leyó de `searchParams` (render inicial idéntico en SSR e hidratación) y escribe con `history.replaceState`
 * (integrado con el router de Next) para no provocar viajes al servidor en cada tecla.
 */
export function useCatalogUrlState(initial: CatalogState, extra?: (s: CatalogState) => URLSearchParams) {
  const [state, setState] = useState<CatalogState>(initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const params = stateToParams(state);
    if (extra) for (const [k, v] of extra(state)) params.set(k, v);
    const qs = params.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, "", url);
  }, [state, extra]);

  useEffect(() => {
    const onPop = () => setState(parseState(new URLSearchParams(window.location.search)));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const update = useCallback((patch: Partial<CatalogState> | ((s: CatalogState) => Partial<CatalogState>), keepPage = false) => {
    setState((s) => {
      const p = typeof patch === "function" ? patch(s) : patch;
      return { ...s, ...p, page: keepPage ? (p.page ?? s.page) : (p.page ?? 1) };
    });
  }, []);

  return [state, update] as const;
}
