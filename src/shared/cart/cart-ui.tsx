"use client";

import { Check, Minus, Package, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { addToCart, MAX_QTY, setQuantity, type CartItem } from "@/modules/cart/cart-store";
import { FEATURED_PRODUCTS, productVisual } from "@/modules/cart/cart-products";
import type { CartCopy } from "./cart-copy";

/** Foto del producto sobre fondo claro; si no hay imagen, un ícono neutro. */
export function CartThumb({ item, size = 72 }: { item: Pick<CartItem, "slug" | "image" | "name">; size?: number }) {
  const src = item.image ?? productVisual(item.slug).image;
  return (
    <span className="ct-thumb" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" width={size * 2} height={size * 2} sizes={`${size}px`} /> : <Package aria-hidden="true" size={size * 0.42} strokeWidth={1.6} />}
    </span>
  );
}

export function QtyStepper({ item, t }: { item: CartItem; t: CartCopy }) {
  return (
    <div className="ct-qty" role="group" aria-label={`${t.quantity}: ${item.name}`}>
      <button type="button" onClick={() => setQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={t.decrease}>
        <Minus aria-hidden="true" size={14} strokeWidth={2.4} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY}
        value={item.quantity}
        aria-label={t.quantity}
        onChange={(e) => setQuantity(item, Number(e.target.value))}
      />
      <button type="button" onClick={() => setQuantity(item, item.quantity + 1)} disabled={item.quantity >= MAX_QTY} aria-label={t.increase}>
        <Plus aria-hidden="true" size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/** Tarjetas de productos sugeridos con botón para agregar (con medida por defecto, editable en el carrito). */
export function Suggestions({ t, lang, items, compact = false, hideInCart = false }: { t: CartCopy; lang: "es" | "en"; items: CartItem[]; compact?: boolean; hideInCart?: boolean }) {
  const [just, setJust] = useState<string | null>(null);
  return (
    <ul className={`ct-suggest${compact ? " is-compact" : ""}`}>
      {FEATURED_PRODUCTS.filter((p) => !hideInCart || !items.some((i) => i.slug === p.slug)).map((p) => {
        const inCart = items.some((i) => i.slug === p.slug);
        const flash = just === p.slug;
        return (
          <li key={p.slug}>
            <CartThumb item={{ slug: p.slug, image: p.image, name: p.name[lang] }} size={compact ? 56 : 84} />
            <div>
              <strong>{p.name[lang]}</strong>
              <span>{p.tag[lang]}</span>
            </div>
            <button
              type="button"
              className={`ct-add${flash || inCart ? " is-done" : ""}`}
              onClick={() => {
                addToCart({ slug: p.slug, name: p.name[lang], variant: "DN100 · PN16", image: p.image, href: p.href });
                setJust(p.slug);
                window.setTimeout(() => setJust((s) => (s === p.slug ? null : s)), 1600);
              }}
            >
              {flash || inCart ? <Check aria-hidden="true" size={15} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={15} strokeWidth={2.4} />}
              {flash ? t.added : inCart ? t.inCart : t.add}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
