"use client";

import { Check, ChevronDown, MessageCircleMore, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { addToCart, openCart } from "@/modules/cart/cart-store";
import { VARIANT_HEADERS, cartVariant, variantKey, variantTable } from "@/modules/catalog/variant-table";
import { QuantityStepper } from "@/shared/cart/qty-stepper";
import { prefersReducedMotion } from "@/shared/ui/products-keys";
import own from "./sheet-order.module.css";
import styles from "./valve-sheet.module.css";

type Lang = "es" | "en";

/** Con más medidas que esto, los chips ocupan media pantalla: se usa la lista desplegable. */
export const CHIP_LIMIT = 18;

const UI = {
  es: {
    size: "Medida",
    sizeHint: "Elige la medida",
    pressure: "Presión nominal",
    quantity: "Cantidad",
    decrease: "Restar una unidad",
    increase: "Sumar una unidad",
    add: "Agregar a cotización",
    added: "Agregado a tu cotización",
    whatsapp: "Cotizar por WhatsApp",
    tableTitle: "Medidas disponibles",
    tableLead: "Estas son las medidas publicadas de esta serie. Elige una en la tabla para llevarla al bloque de pedido y agregarla a tu cotización.",
    caption: (name: string, n: number) => `${name}: ${n} medidas publicadas`,
    scrollHint: "La tabla tiene más columnas: deslízala hacia los lados para verlas.",
    pick: "Elegir",
    noData: "Sin dato",
  },
  en: {
    size: "Size",
    sizeHint: "Choose the size",
    pressure: "Nominal pressure",
    quantity: "Quantity",
    decrease: "Remove one unit",
    increase: "Add one unit",
    add: "Add to quote",
    added: "Added to your quote",
    whatsapp: "Quote on WhatsApp",
    tableTitle: "Available sizes",
    tableLead: "These are the published sizes of this series. Pick one in the table to bring it to the order block and add it to your quote.",
    caption: (name: string, n: number) => `${name}: ${n} published sizes`,
    scrollHint: "The table has more columns: swipe sideways to see them.",
    pick: "Choose",
    noData: "No data",
  },
} as const;

/**
 * Medida elegida en una ficha, compartible por dirección (X5-4): ?medida=dn150-6 abre la ficha con esa medida marcada.
 * Se lee al montar (la página es estática) y al volver atrás; elegir otra medida reemplaza la dirección sin recargar.
 */
export function useVariantParam(keyLabels: readonly string[]) {
  const keys = useMemo(() => keyLabels.map(variantKey), [keyLabels]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const read = () => {
      const wanted = new URLSearchParams(window.location.search).get("medida");
      const found = wanted ? keys.indexOf(wanted) : -1;
      if (found >= 0) setIndex(found);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [keys]);
  const select = useCallback(
    (next: number) => {
      setIndex(next);
      if (!keys[next]) return;
      const params = new URLSearchParams(window.location.search);
      params.set("medida", keys[next]);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
    },
    [keys],
  );
  return [index, select, keys] as const;
}

type OrderProps = {
  lang: Lang;
  product: { slug: string; nameEs: string; name: string; image: string; href: string };
  variants: { es: readonly string[]; shown: readonly string[] };
  pressure?: string;
  selected: number;
  onSelect: (index: number) => void;
  whatsappHref: string;
  /** Texto tras agregar, si la ficha lo concuerda distinto ("Agregada" para una válvula). */
  addedLabel?: string;
};

/**
 * Bloque de pedido de una ficha (B10-2): chips de medida (DN), la presión publicada como chip fijo, cantidad y el botón
 * naranja "Agregar a cotización". Sin medidas publicadas solo quedan la cantidad y los botones.
 */
export function SheetOrder({ lang, product, variants, pressure, selected, onSelect, whatsappHref, addedLabel }: OrderProps) {
  const t = UI[lang];
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const groupName = useId();
  const shown = variants.shown;

  const add = () => {
    addToCart({ slug: product.slug, name: product.nameEs, variant: cartVariant(variants.es[selected], pressure), image: product.image, href: product.href, quantity });
    openCart();
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className={own.order} id="pedido">
      {shown.length > 0 && shown.length <= CHIP_LIMIT && (
        <fieldset className={own.sizes}>
          <legend>{t.size}</legend>
          <div className={own.chips}>
            {shown.map((label, i) => (
              <label key={label} className={own.chip}>
                <input type="radio" name={groupName} value={i} checked={selected === i} onChange={() => onSelect(i)} data-size-chip />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {shown.length > CHIP_LIMIT && (
        <label className={own.field}>
          <span>{t.size}</span>
          <span className={own.selectBox}>
            <select value={selected} onChange={(event) => onSelect(Number(event.target.value))} aria-label={t.sizeHint} data-size-select>
              {shown.map((label, i) => <option key={label} value={i}>{label}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </label>
      )}
      <div className={own.row}>
        {pressure && (
          <div className={own.pressure}>
            <span className={own.rowLabel}>{t.pressure}</span>
            <span className={own.fixedChip}>{pressure}</span>
          </div>
        )}
        <div className={own.quantity}>
          <span className={own.rowLabel} aria-hidden="true">{t.quantity}</span>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            label={`${t.quantity}: ${product.name}`}
            decreaseLabel={`${t.decrease}: ${product.name}`}
            increaseLabel={`${t.increase}: ${product.name}`}
            className={own.stepper}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={add} aria-live="polite">
          {added ? <Check size={18} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
          {added ? (addedLabel ?? t.added) : t.add}
        </button>
        <a className={styles.secondary} href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <MessageCircleMore size={18} aria-hidden="true" />
          {t.whatsapp}
        </a>
      </div>
    </div>
  );
}

type TableProps = {
  lang: Lang;
  name: string;
  variants: { es: readonly string[]; shown: readonly string[] };
  selected: number;
  onSelect: (index: number) => void;
};

/**
 * Tabla de medidas de la serie (X1-4) con enlaces a cada medida (X5-4). Solo aparece con dos o más medidas. La primera
 * columna queda fija al deslizar y, si la tabla no cabe, se avisa y el recuadro se puede recorrer con el teclado.
 */
export function VariantTable({ lang, name, variants, selected, onSelect }: TableProps) {
  const t = UI[lang];
  const table = useMemo(() => variantTable(variants.shown, variants.es), [variants]);
  const scroller = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const captionId = useId();
  const hintId = useId();

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [table]);

  if (!table) return null;
  const [head, ...rest] = table.columns;
  const headers = VARIANT_HEADERS[lang];

  const pick = (index: number) => {
    onSelect(index);
    const order = document.getElementById("pedido");
    order?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    const chip = order?.querySelectorAll<HTMLElement>("[data-size-chip], [data-size-select]");
    (chip && (chip[index] ?? chip[0]))?.focus({ preventScroll: true });
  };

  return (
    <section className={styles.block} aria-labelledby="ficha-medidas" data-reveal>
      <h2 id="ficha-medidas">{t.tableTitle}</h2>
      <p className={own.lead}>{t.tableLead}</p>
      {overflow && <p id={hintId} className={own.hint}>{t.scrollHint}</p>}
      <div
        ref={scroller}
        className={own.scroller}
        role="region"
        aria-labelledby={captionId}
        aria-describedby={overflow ? hintId : undefined}
        tabIndex={overflow ? 0 : undefined}
      >
        <table className={own.table}>
          <caption id={captionId}>{t.caption(name, table.rows.length)}</caption>
          <thead>
            <tr>
              {table.columns.map((c) => <th key={c} scope="col">{headers[c]}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={row.key} className={i === selected ? own.current : undefined}>
                <th scope="row">
                  <a
                    href={`?medida=${row.key}`}
                    aria-current={i === selected ? "true" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      pick(i);
                    }}
                  >
                    <span className="sr-only">{t.pick} </span>
                    {row.cells[head] ?? row.label}
                  </a>
                </th>
                {rest.map((c) => (
                  <td key={c}>{row.cells[c] ?? <><span aria-hidden="true">—</span><span className="sr-only">{t.noData}</span></>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
