"use client";

import { Check, ClipboardCopy, Mail, MessageSquarePlus, Minus, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { site } from "@/lib/site-info";
import { FEATURED_PRODUCTS, featuredBySlug, parseVariant, productVisual, variantLabel } from "@/modules/cart/cart-products";
import { addToCart, cartCount, cartSummary, clearCart, MAX_QTY, removeFromCart, setNote, setQuantity, setVariant, useCart, type CartItem } from "@/modules/cart/cart-store";
import { CART_COPY, type CartCopy } from "@/shared/cart/cart-copy";
import { SITE } from "@/shared/config/site";
import { useLang } from "@/shared/layout/landing-prefs";
import "@/modules/quote/hoja.css";
import "./carrito.css";

/** El carrito vive en este equipo: hasta hidratar no se sabe si hay productos, así que se reserva el espacio. */
const noopSubscribe = () => () => {};
const useHydrated = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function Thumb({ item, size }: { item: Pick<CartItem, "slug" | "image">; size: number }) {
  const src = item.image ?? productVisual(item.slug).image;
  return <span className="cq-thumb" style={{ width: size, height: size }}>{src ? <Image src={src} alt="" width={size * 2} height={size * 2} sizes={`${size}px`} /> : <Package aria-hidden="true" size={Math.round(size * 0.42)} strokeWidth={1.6} />}</span>;
}

function Stepper({ item, t }: { item: CartItem; t: CartCopy }) {
  return (
    <div className="cq-stepper" role="group" aria-label={`${t.quantity}: ${item.name}`}>
      <button type="button" onClick={() => setQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={t.decrease}>
        <Minus aria-hidden="true" size={16} />
      </button>
      <input type="number" inputMode="numeric" min={1} max={MAX_QTY} value={item.quantity} aria-label={t.quantity} onChange={(e) => setQuantity(item, Number(e.target.value))} />
      <button type="button" onClick={() => setQuantity(item, item.quantity + 1)} disabled={item.quantity >= MAX_QTY} aria-label={t.increase}>
        <Plus aria-hidden="true" size={16} />
      </button>
    </div>
  );
}

function ItemRow({ item, t, lang }: { item: CartItem; t: CartCopy; lang: "es" | "en" }) {
  const product = featuredBySlug(item.slug);
  const href = item.href ?? productVisual(item.slug).href;
  const { dn, pn } = parseVariant(item.variant);
  const [noteOpen, setNoteOpen] = useState(Boolean(item.note));
  const [leaving, setLeaving] = useState(false);

  // La fila se apaga con opacidad y después se retira; el alto no se anima.
  const remove = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => removeFromCart(item), 140);
  };

  return (
    <li className={`cq-item${leaving ? " is-leaving" : ""}`}>
      <Thumb item={item} size={96} />
      <div className="cq-item__main">
        <div className="cq-item__top">
          <div>
            <h3>{href ? <Link href={href}>{item.name}</Link> : item.name}</h3>
            {product && <span className="cq-item__tag">{product.tag[lang]}</span>}
          </div>
          <button type="button" className="cq-texto" onClick={remove} aria-label={t.removeLabel(item.name)}>
            <Trash2 aria-hidden="true" size={16} />
            <span>{t.remove}</span>
          </button>
        </div>

        <div className="cq-item__controles">
          {product ? (
            <>
              <label className="cq-campo">
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
              <label className="cq-campo">
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
            item.variant && <span className="cq-medida dato">{item.variant}</span>
          )}
          <div className="cq-campo cq-campo--qty">
            <span>{t.quantity}</span>
            <Stepper item={item} t={t} />
          </div>
        </div>

        {noteOpen ? (
          <label className="cq-campo cq-nota">
            <span>{t.note}</span>
            <textarea rows={2} maxLength={240} defaultValue={item.note ?? ""} placeholder={t.notePlaceholder} onBlur={(e) => setNote(item, e.target.value.trim())} />
          </label>
        ) : (
          <button type="button" className="cq-texto" onClick={() => setNoteOpen(true)}>
            <MessageSquarePlus aria-hidden="true" size={16} />
            <span>{t.addNote}</span>
          </button>
        )}
      </div>
    </li>
  );
}

function Suggestions({ t, lang, items }: { t: CartCopy; lang: "es" | "en"; items: CartItem[] }) {
  const [just, setJust] = useState<string | null>(null);
  return (
    <ul className="cq-sugeridos" data-results="">
      {FEATURED_PRODUCTS.map((p) => {
        const inCart = items.some((i) => i.slug === p.slug);
        const flash = just === p.slug;
        return (
          <li key={p.slug}>
            <Thumb item={{ slug: p.slug, image: p.image }} size={72} />
            <div className="cq-sugeridos__texto">
              <strong>{p.name[lang]}</strong>
              <span>{p.tag[lang]}</span>
            </div>
            <button
              type="button"
              className="lp-btn lp-btn--outline"
              onClick={() => {
                addToCart({ slug: p.slug, name: p.name[lang], variant: "DN100 · PN16", image: p.image, href: p.href });
                setJust(p.slug);
                window.setTimeout(() => setJust((s) => (s === p.slug ? null : s)), 1600);
              }}
            >
              {flash || inCart ? <Check className="mo-check" aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
              {flash ? t.added : inCart ? t.inCart : t.add}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CarritoView() {
  const [lang] = useLang();
  const t = CART_COPY[lang];
  const items = useCart();
  const hydrated = useHydrated();
  const count = cartCount(items);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const empty = items.length === 0;
  const list = cartSummary(items, lang);
  const whatsapp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(list)}`;
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(lang === "en" ? "Quote request" : "Solicitud de cotización")}&body=${encodeURIComponent(list)}`;

  return (
    <main className="hj" id="carrito">
      <div className="hj-shell">
        <nav aria-label="Breadcrumb" className="hj-migas">
          <ol>
            <li>
              <Link href="/">{t.crumbs[0]}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t.crumbs[1]}</li>
          </ol>
        </nav>

        <div className="hj-head">
          <h1>{t.pageTitle}</h1>
          <p className="hj-lead">{t.pageLead}</p>
        </div>

        <ol className="hj-pasos" aria-label={t.stepLabel} data-enter>
          {t.steps.map((step, i) => (
            <li key={step}>
              <span className="hj-paso" aria-current={i === 0 ? "step" : undefined}>
                <span className="hj-paso__n" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{step}</span>
              </span>
            </li>
          ))}
        </ol>

        {!hydrated ? (
          <div className="cq-reserva" aria-hidden="true" />
        ) : empty ? (
          <section className="cq-empty" aria-labelledby="carrito-vacio">
            <div className="cq-empty__texto">
              <div className="cota">
                <h2 id="carrito-vacio">{t.emptyTitle}</h2>
              </div>
              <p>{t.emptyPageText}</p>
              <Link href="/productos" className="lp-btn lp-btn--solid">
                {t.explore}
              </Link>
            </div>
            <div className="cq-empty__lista">
              <h3>{t.suggested}</h3>
              <Suggestions t={t} lang={lang} items={items} />
            </div>
          </section>
        ) : (
          <div className="hj-grid">
            <section className="cq-lista" aria-label={t.title}>
              <ul>
                {items.map((item) => (
                  <ItemRow key={`${item.slug}|${item.variant ?? ""}`} item={item} t={t} lang={lang} />
                ))}
              </ul>
              <div className="cq-lista__pie">
                <Link href="/productos" className="hj-enlace">
                  {t.keepExploring}
                </Link>
                {confirm ? (
                  <span className="cq-confirma" role="alert">
                    <span>{t.clearConfirm}</span>
                    <button
                      type="button"
                      className="lp-btn lp-btn--outline"
                      onClick={() => {
                        clearCart();
                        setConfirm(false);
                      }}
                    >
                      {t.yes}
                    </button>
                    <button type="button" className="lp-btn lp-btn--outline" onClick={() => setConfirm(false)}>
                      {t.no}
                    </button>
                  </span>
                ) : (
                  <button type="button" className="cq-texto" onClick={() => setConfirm(true)}>
                    <Trash2 aria-hidden="true" size={16} />
                    <span>{t.clear}</span>
                  </button>
                )}
              </div>
            </section>

            <aside className="hj-aside">
              <section className="hj-cajetin" aria-label={t.summary}>
                <h2 className="hj-cajetin__titulo on-dark">{t.summary}</h2>
                <dl>
                  <div>
                    <dt>{lang === "en" ? "Products" : "Productos"}</dt>
                    <dd className="dato">{items.length}</dd>
                  </div>
                  <div>
                    <dt>{lang === "en" ? "Units" : "Unidades"}</dt>
                    <dd className="dato">{count}</dd>
                  </div>
                  <div>
                    <dt>{t.price}</dt>
                    <dd>{t.priceValue}</dd>
                  </div>
                  <div>
                    <dt>{t.lead}</dt>
                    <dd>{t.leadValue}</dd>
                  </div>
                </dl>
                <div className="hj-cajetin__acciones">
                  <Link href="/cotizar" className="lp-btn lp-btn--solid hj-btn">
                    {t.requestQuote}
                  </Link>
                  <a className="lp-btn lp-btn--outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                    {t.sendWhatsapp}
                  </a>
                  <div className="cq-acciones">
                    <a className="lp-btn lp-btn--outline" href={mail}>
                      <Mail aria-hidden="true" size={16} />
                      {t.sendEmail}
                    </a>
                    <button
                      type="button"
                      className="lp-btn lp-btn--outline"
                      onClick={() => {
                        void navigator.clipboard?.writeText(list).then(() => {
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1800);
                        });
                      }}
                    >
                      {copied ? <Check className="mo-check" aria-hidden="true" size={16} /> : <ClipboardCopy aria-hidden="true" size={16} />}
                      {copied ? t.copied : t.copyList}
                    </button>
                  </div>
                </div>
                <div className="hj-cajetin__pie hj-nota">{t.secure}</div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
