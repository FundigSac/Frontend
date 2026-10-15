"use client";

import { useSyncExternalStore } from "react";

/**
 * Carrito de cotización: productos que la persona quiere cotizar, guardados en su equipo
 * (localStorage "fundigsac-quote", la misma clave que ya usa el contador de la cabecera).
 * No hay precios: se confirman al cotizar.
 */
export type CartItem = {
  slug: string;
  name: string;
  /** Medida o variante elegida (por ejemplo "DN150 · PN16"). */
  variant?: string;
  quantity: number;
  image?: string;
  href?: string;
  note?: string;
};

export const CART_KEY = "fundigsac-quote";
const EVENT = "quote-updated";
export const OPEN_CART_EVENT = "fundigsac:cart-open";
export const MAX_QTY = 999;

const keyOf = (i: Pick<CartItem, "slug" | "variant">) => `${i.slug}|${i.variant ?? ""}`;

let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: [] };

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CART_KEY);
  } catch {
    return cache.items;
  }
  if (raw === cache.raw) return cache.items;
  let items: CartItem[] = [];
  try {
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(data)) {
      items = data
        .filter((i): i is CartItem => !!i && typeof i === "object" && typeof i.slug === "string" && typeof i.name === "string")
        .map((i) => ({ ...i, quantity: Math.min(MAX_QTY, Math.max(1, Math.round(Number(i.quantity) || 1))) }));
    }
  } catch {
    items = [];
  }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]) {
  try {
    if (items.length) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    else window.localStorage.removeItem(CART_KEY);
  } catch {
    /* sin almacenamiento: el carrito vive solo en esta visita */
    cache = { raw: cache.raw, items };
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const EMPTY: CartItem[] = [];

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);

export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
  const items = [...read()];
  const found = items.findIndex((i) => keyOf(i) === keyOf(item));
  const qty = Math.max(1, item.quantity ?? 1);
  if (found >= 0) items[found] = { ...items[found], quantity: Math.min(MAX_QTY, items[found].quantity + qty) };
  else items.push({ ...item, quantity: Math.min(MAX_QTY, qty) });
  write(items);
}

export function setQuantity(item: Pick<CartItem, "slug" | "variant">, quantity: number) {
  const q = Math.min(MAX_QTY, Math.max(1, Math.round(quantity) || 1));
  write(read().map((i) => (keyOf(i) === keyOf(item) ? { ...i, quantity: q } : i)));
}

export function setNote(item: Pick<CartItem, "slug" | "variant">, note: string) {
  write(read().map((i) => (keyOf(i) === keyOf(item) ? { ...i, note: note.slice(0, 240) } : i)));
}

/** Cambia la medida de un producto; si ya existía esa medida, suma las cantidades. */
export function setVariant(item: Pick<CartItem, "slug" | "variant">, variant: string | undefined) {
  const items = read();
  const current = items.find((i) => keyOf(i) === keyOf(item));
  if (!current || current.variant === variant) return;
  const target = items.find((i) => keyOf(i) === keyOf({ slug: item.slug, variant }));
  const rest = items.filter((i) => keyOf(i) !== keyOf(item));
  write(
    target
      ? rest.map((i) => (i === target ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + current.quantity) } : i))
      : items.map((i) => (i === current ? { ...i, variant } : i)),
  );
}

export function removeFromCart(item: Pick<CartItem, "slug" | "variant">) {
  write(read().filter((i) => keyOf(i) !== keyOf(item)));
}

export function clearCart() {
  write([]);
}

/** Abre el panel del carrito desde cualquier botón del sitio. */
export function openCart() {
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
}

/** Texto de la lista para WhatsApp o correo. */
export function cartSummary(items: CartItem[], lang: "es" | "en"): string {
  const head = lang === "en" ? "Hello FUNDIGSAC, I'd like a quote for:" : "Hola FUNDIGSAC, quiero cotizar:";
  const lines = items.map((i) => `• ${i.quantity} × ${i.name}${i.variant ? ` (${i.variant})` : ""}${i.note ? ` · ${i.note}` : ""}`);
  return [head, ...lines].join("\n");
}
