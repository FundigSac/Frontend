"use client";

import { ArrowRight, Check, ChevronRight, ClipboardCopy, FileText, Headset, Lock, Mail, MessageSquarePlus, ShoppingCart, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cartCount, cartSummary, clearCart, removeFromCart, setNote, setVariant, useCart, type CartItem } from "@/modules/cart/cart-store";
import { featuredBySlug, parseVariant, productVisual, variantLabel } from "@/modules/cart/cart-products";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { useLang } from "@/shared/layout/landing-prefs";
import { CART_COPY, type CartCopy } from "./cart-copy";
import { CartThumb, QtyStepper, Suggestions } from "./cart-ui";

const TRUST_ICONS = { file: FileText, headset: Headset, truck: Truck } as const;

function ItemRow({ item, t, lang }: { item: CartItem; t: CartCopy; lang: "es" | "en" }) {
  const product = featuredBySlug(item.slug);
  const href = item.href ?? productVisual(item.slug).href;
  const { dn, pn } = parseVariant(item.variant);
  const [noteOpen, setNoteOpen] = useState(Boolean(item.note));
  return (
    <li className="cp-item">
      <CartThumb item={item} size={104} />
      <div className="cp-item__main">
        <div className="cp-item__top">
          <div>
            {product && <span className="cp-item__tag">{product.tag[lang]}</span>}
            <h3>{href ? <Link href={href}>{item.name}</Link> : item.name}</h3>
          </div>
          <button type="button" className="cp-item__remove" onClick={() => removeFromCart(item)} aria-label={t.removeLabel(item.name)}>
            <Trash2 aria-hidden="true" size={16} />
            <span>{t.remove}</span>
          </button>
        </div>

        <div className="cp-item__controls">
          {product ? (
            <>
              <label className="cp-select">
                <span>{t.size}</span>
                <select value={dn ?? ""} onChange={(e) => setVariant(item, variantLabel(e.target.value || undefined, pn))}>
                  {!dn && <option value="">{t.choose}</option>}
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cp-select">
                <span>{t.pressure}</span>
                <select value={pn ?? ""} onChange={(e) => setVariant(item, variantLabel(dn, e.target.value || undefined))}>
                  {!pn && <option value="">{t.choose}</option>}
                  {product.pressures.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            item.variant && <span className="ct-chip">{item.variant}</span>
          )}
          <div className="cp-qty">
            <span>{t.quantity}</span>
            <QtyStepper item={item} t={t} />
          </div>
        </div>

        {noteOpen ? (
          <label className="cp-note">
            <span>{t.note}</span>
            <textarea rows={2} maxLength={240} defaultValue={item.note ?? ""} placeholder={t.notePlaceholder} onBlur={(e) => setNote(item, e.target.value.trim())} />
          </label>
        ) : (
          <button type="button" className="cp-note-toggle" onClick={() => setNoteOpen(true)}>
            <MessageSquarePlus aria-hidden="true" size={15} />
            {t.addNote}
          </button>
        )}
      </div>
    </li>
  );
}

export function CartPage() {
  const [lang] = useLang();
  const t = CART_COPY[lang];
  const items = useCart();
  const count = cartCount(items);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const list = cartSummary(items, lang);
  const whatsapp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(list)}`;
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(lang === "en" ? "Quote request" : "Solicitud de cotización")}&body=${encodeURIComponent(list)}`;

  return (
    <main className="cp" id="carrito">
      <section className="cp-hero">
        <div className="cp-shell">
          <nav className="cp-crumbs" aria-label="Breadcrumb">
            <Link href="/">{t.crumbs[0]}</Link>
            <ChevronRight aria-hidden="true" size={14} />
            <span aria-current="page">{t.crumbs[1]}</span>
          </nav>
          <div className="cp-hero__row">
            <div>
              <p className="cp-eyebrow">
                <ShoppingCart aria-hidden="true" size={15} />
                {count > 0 ? `${t.products(items.length)} · ${t.units(count)}` : t.subtitle}
              </p>
              <h1>{t.pageTitle}</h1>
              <p className="cp-lead">{t.pageLead}</p>
            </div>
            <ol className="cp-steps" aria-label={t.stepLabel}>
              {t.steps.map((step, i) => (
                <li key={step} className={i === 0 ? "is-current" : undefined} aria-current={i === 0 ? "step" : undefined}>
                  <span>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="cp-shell cp-grid">
        <section className="cp-items" aria-label={t.title}>
          {items.length === 0 ? (
            <div className="cp-empty">
              <span className="cd-empty__art" aria-hidden="true">
                <ShoppingCart size={36} strokeWidth={1.7} />
              </span>
              <h2>{t.emptyTitle}</h2>
              <p>{t.emptyPageText}</p>
              <Suggestions t={t} lang={lang} items={items} />
              <Link href="/productos" className="ct-btn ct-btn--ghost">
                {t.explore}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          ) : (
            <>
              <ul className="cp-list">
                {items.map((item) => (
                  <ItemRow key={`${item.slug}|${item.variant ?? ""}`} item={item} t={t} lang={lang} />
                ))}
              </ul>
              <div className="cp-list__foot">
                <Link href="/productos" className="ct-btn ct-btn--text">
                  <ArrowRight aria-hidden="true" size={16} className="cp-flip" />
                  {t.keepExploring}
                </Link>
                {confirm ? (
                  <span className="cp-confirm" role="alert">
                    {t.clearConfirm}
                    <button type="button" className="cp-confirm__yes" onClick={() => { clearCart(); setConfirm(false); }}>
                      {t.yes}
                    </button>
                    <button type="button" onClick={() => setConfirm(false)}>
                      {t.no}
                    </button>
                  </span>
                ) : (
                  <button type="button" className="ct-btn ct-btn--text cp-clear" onClick={() => setConfirm(true)}>
                    <Trash2 aria-hidden="true" size={15} />
                    {t.clear}
                  </button>
                )}
              </div>
            </>
          )}

          <ul className="cp-trust">
            {t.trust.map((b) => {
              const Icon = TRUST_ICONS[b.icon];
              return (
                <li key={b.title}>
                  <span aria-hidden="true">
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{b.title}</strong>
                    <small>{b.text}</small>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="cp-summary" aria-label={t.summary}>
          <div className="cp-summary__card">
            <h2>{t.summary}</h2>
            <dl>
              <div>
                <dt>{t.products(items.length)}</dt>
                <dd>{t.units(count)}</dd>
              </div>
              <div>
                <dt>{t.price}</dt>
                <dd className="cp-muted">{t.priceValue}</dd>
              </div>
              <div>
                <dt>{t.shipping}</dt>
                <dd>{t.shippingValue}</dd>
              </div>
              <div>
                <dt>{t.lead}</dt>
                <dd className="cp-muted">{t.leadValue}</dd>
              </div>
            </dl>
            <Link href="/cotizar" className={`ct-btn ct-btn--primary${items.length ? "" : " is-disabled"}`} aria-disabled={!items.length} tabIndex={items.length ? undefined : -1}>
              {t.requestQuote}
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <div className="cp-summary__alt">
              <a className={`ct-btn ct-btn--wa${items.length ? "" : " is-disabled"}`} href={items.length ? whatsapp : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!items.length}>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.2 8.2 0 1 1 6.94 3.83Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.75.59.25 1.05.4 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
                </svg>
                {t.sendWhatsapp}
              </a>
              <div className="cp-summary__row">
                <a className={`ct-btn ct-btn--ghost${items.length ? "" : " is-disabled"}`} href={items.length ? mail : undefined} aria-disabled={!items.length}>
                  <Mail aria-hidden="true" size={16} />
                  {t.sendEmail}
                </a>
                <button
                  type="button"
                  className="ct-btn ct-btn--ghost"
                  disabled={!items.length}
                  onClick={() => {
                    void navigator.clipboard?.writeText(list).then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1800);
                    });
                  }}
                >
                  {copied ? <Check aria-hidden="true" size={16} /> : <ClipboardCopy aria-hidden="true" size={16} />}
                  {copied ? t.copied : t.copyList}
                </button>
              </div>
            </div>
            <p className="cp-secure">
              <Lock aria-hidden="true" size={14} />
              {t.secure}
            </p>
          </div>
        </aside>
      </div>

      {items.length > 0 && (
        <section className="cp-shell cp-more">
          <h2>{t.alsoLike}</h2>
          <Suggestions t={t} lang={lang} items={items} />
        </section>
      )}
    </main>
  );
}
