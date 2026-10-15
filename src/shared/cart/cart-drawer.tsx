"use client";

import { ArrowRight, ShoppingCart, Trash2, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cartCount, removeFromCart, useCart } from "@/modules/cart/cart-store";
import { FEATURED_PRODUCTS, productVisual } from "@/modules/cart/cart-products";
import { useLang } from "@/shared/layout/landing-prefs";
import { CART_COPY } from "./cart-copy";
import { CartThumb, QtyStepper, Suggestions } from "./cart-ui";

/** Panel lateral del carrito: se abre desde el ícono de la cabecera. */
export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lang] = useLang();
  const t = CART_COPY[lang];
  const items = useCart();
  const count = cartCount(items);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Un cuadro después de montar, para que la entrada se anime también la primera vez.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisible(open));
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    document.documentElement.classList.add("cd-lock");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Mantiene el foco dentro del panel mientras está abierto.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea, select");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("cd-lock");
      window.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <div className="cd" data-state={open && visible ? "open" : "closed"} inert={!open}>
      <button type="button" className="cd-scrim" aria-label={t.close} tabIndex={-1} onClick={onClose} />
      <div className="cd-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <header className="cd-head">
          <span className="cd-head__icon" aria-hidden="true">
            <ShoppingCart size={20} strokeWidth={2} />
          </span>
          <div>
            <h2 id={titleId}>
              {t.title}
              {count > 0 && <span className="cd-count">{count}</span>}
            </h2>
            <p>{t.subtitle}</p>
          </div>
          <button type="button" className="cd-close" onClick={onClose} aria-label={t.close} ref={closeRef}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="cd-body">
          {items.length === 0 ? (
            <div className="cd-empty">
              <span className="cd-empty__art" aria-hidden="true">
                <ShoppingCart size={34} strokeWidth={1.7} />
              </span>
              <h3>{t.emptyTitle}</h3>
              <p>{t.emptyText}</p>
              <p className="ct-label">{t.suggested}</p>
              <Suggestions t={t} lang={lang} items={items} compact />
              <Link href="/productos/valvulas" className="ct-btn ct-btn--ghost" onClick={onClose}>
                {t.explore}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          ) : (
            <ul className="cd-list">
              {items.map((item) => {
                const href = item.href ?? productVisual(item.slug).href;
                return (
                  <li key={`${item.slug}|${item.variant ?? ""}`} className="cd-item">
                    <CartThumb item={item} size={68} />
                    <div className="cd-item__info">
                      <strong>{item.name}</strong>
                      {item.variant && <span className="ct-chip">{item.variant}</span>}
                      <div className="cd-item__row">
                        <QtyStepper item={item} t={t} />
                        {href && (
                          <Link href={href} className="cd-item__link" onClick={onClose}>
                            {t.viewDatasheet}
                          </Link>
                        )}
                      </div>
                    </div>
                    <button type="button" className="cd-item__remove" onClick={() => removeFromCart(item)} aria-label={t.removeLabel(item.name)} title={t.remove}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {items.length > 0 && FEATURED_PRODUCTS.some((p) => !items.some((i) => i.slug === p.slug)) && (
            <div className="cd-more">
              <p className="ct-label">{t.complete}</p>
              <Suggestions t={t} lang={lang} items={items} compact hideInCart />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cd-foot">
            <dl className="cd-sum">
              <div>
                <dt>{t.products(items.length)}</dt>
                <dd>{t.units(count)}</dd>
              </div>
              <div>
                <dt>{t.price}</dt>
                <dd className="cd-sum__muted">{t.priceValue}</dd>
              </div>
            </dl>
            <p className="cd-ship">
              <Truck aria-hidden="true" size={16} />
              {t.shipping}: {t.shippingValue}
            </p>
            <Link href="/carrito" className="ct-btn ct-btn--primary" onClick={onClose}>
              {t.checkout}
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <button type="button" className="ct-btn ct-btn--text" onClick={onClose}>
              {t.keepExploring}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
