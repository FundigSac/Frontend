"use client";

import { useSyncExternalStore } from "react";

export type Lang = "es" | "en";
export type Theme = "light" | "dark";

const KEYS = { lang: "fundigsac-lang", theme: "fundigsac-theme" } as const;
const listeners = new Set<() => void>();

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function apply() {
  const root = document.documentElement;
  root.dataset.lpTheme = read(KEYS.theme, ["light", "dark"], "light");
  root.lang = read(KEYS.lang, ["es", "en"], "es") === "en" ? "en" : "es-PE";
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) apply();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function write(key: string, value: Lang | Theme) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: la preferencia vale solo para esta visita */
  }
  document.documentElement.dataset.lpTheme = key === KEYS.theme ? value : document.documentElement.dataset.lpTheme;
  if (key === KEYS.lang) document.documentElement.lang = value === "en" ? "en" : "es-PE";
  listeners.forEach((l) => l());
}

export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, () => read<Lang>(KEYS.lang, ["es", "en"], "es"), () => "es" as Lang);
  return [lang, (l) => write(KEYS.lang, l)];
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, () => read<Theme>(KEYS.theme, ["light", "dark"], "light"), () => "light" as Theme);
  return [theme, (t) => write(KEYS.theme, t)];
}

export const COPY = {
  es: {
    nav: { home: "Inicio", products: "Productos", sectors: "Sectores", about: "Nosotros", resources: "Recursos", contact: "Contacto" },
    products: ["Catálogo general", "Válvulas", "Marcos y tapas", "Grifos", "Acoples", "Tuberías"],
    sectors: ["Saneamiento", "Agricultura", "Minería"],
    resources: ["Fichas técnicas", "Documentación", "Catálogo digital", "Campañas y sobrestock"],
    quote: "Solicitar cotización",
    search: "Buscar",
    searchPlaceholder: "Buscar productos, fichas…",
    searchLabel: "Buscar en el sitio",
    searchClose: "Cerrar búsqueda",
    language: "Idioma",
    account: { label: "Cuenta", login: "Iniciar sesión", signup: "Crear cuenta", logout: "Cerrar sesión", hint: "Accede a tu cuenta de FUNDIGSAC" },
    cart: "Mi cotización",
    theme: { toDark: "Activar modo oscuro", toLight: "Activar modo claro" },
    menuOpen: "Abrir menú",
    menuClose: "Cerrar menú",
    a11y: { home: "FUNDIGSAC, inicio", mainNav: "Navegación principal", mobileNav: "Navegación móvil", skip: "Saltar al contenido" },
    hero: {
      eyebrow: ["Válvulas, tapas y tuberías", "de hierro dúctil"],
      title: "Hierro dúctil para redes de agua que no pueden fallar.",
      lead: "Válvulas, tapas, acoples y tuberías para saneamiento, riego y minería.",
      explore: "Explorar productos",
      solutions: "Ver soluciones",
      variants: [
        { label: "Sin timón", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil sin timón, con dado de maniobra" },
        { label: "Con timón", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil con timón de maniobra" },
      ],
      carousel: "carrusel",
      slide: "diapositiva",
      slideLabel: (i: number, n: number, label: string) => `${i} de ${n}: válvula compuerta ${label.toLowerCase()}`,
      controls: "Controles del carrusel",
      prev: "Variante anterior",
      next: "Variante siguiente",
      pause: "Pausar carrusel",
      play: "Reproducir carrusel",
    },
  },
  en: {
    nav: { home: "Home", products: "Products", sectors: "Industries", about: "About us", resources: "Resources", contact: "Contact" },
    products: ["Full catalog", "Valves", "Frames & covers", "Hydrants", "Couplings", "Pipes"],
    sectors: ["Sanitation", "Agriculture", "Mining"],
    resources: ["Data sheets", "Documentation", "Digital catalog", "Campaigns & overstock"],
    quote: "Request a quote",
    search: "Search",
    searchPlaceholder: "Search products, data sheets…",
    searchLabel: "Search the site",
    searchClose: "Close search",
    language: "Language",
    account: { label: "Account", login: "Log in", signup: "Sign up", logout: "Log out", hint: "Access your FUNDIGSAC account" },
    cart: "My quote",
    theme: { toDark: "Switch to dark mode", toLight: "Switch to light mode" },
    menuOpen: "Open menu",
    menuClose: "Close menu",
    a11y: { home: "FUNDIGSAC, home", mainNav: "Main navigation", mobileNav: "Mobile navigation", skip: "Skip to content" },
    hero: {
      eyebrow: ["Valves, covers and pipes", "in ductile iron"],
      title: "Ductile iron for water networks that can't fail.",
      lead: "Valves, covers, couplings and pipes for sanitation, irrigation and mining.",
      explore: "Explore products",
      solutions: "View solutions",
      variants: [
        { label: "Without handwheel", alt: "FUNDIGSAC ductile iron gate valve without handwheel, with operating nut" },
        { label: "With handwheel", alt: "FUNDIGSAC ductile iron gate valve with operating handwheel" },
      ],
      carousel: "carousel",
      slide: "slide",
      slideLabel: (i: number, n: number, label: string) => `${i} of ${n}: gate valve ${label.toLowerCase()}`,
      controls: "Carousel controls",
      prev: "Previous variant",
      next: "Next variant",
      pause: "Pause carousel",
      play: "Play carousel",
    },
  },
} as const;

/** Cantidad total de productos en la cotización (localStorage "fundigsac-quote"). */
function readQuoteCount(): number {
  try {
    const items = JSON.parse(window.localStorage.getItem("fundigsac-quote") || "[]") as { quantity?: number }[];
    return items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
  } catch {
    return 0;
  }
}

function subscribeQuote(onChange: () => void) {
  window.addEventListener("quote-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("quote-updated", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useQuoteCount(): number {
  return useSyncExternalStore(subscribeQuote, readQuoteCount, () => 0);
}
