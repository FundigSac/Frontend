"use client";

import { useId, useState } from "react";
import { isValidRucChecksum, limaToday } from "@/modules/quote/products";

const MIN_QTY = 1;
const MAX_QTY = 500;

/** Selector de cantidad con botones − / + (mínimo 1, máximo 500) y entrada numérica editable. */
export function W17QuantityField() {
  const [qty, setQty] = useState("4");
  const clamp = (n: number) => Math.min(MAX_QTY, Math.max(MIN_QTY, n));
  const step = (delta: number) => setQty((current) => String(clamp((Number.parseInt(current, 10) || MIN_QTY) + delta)));
  const n = Number.parseInt(qty, 10);
  return (
    <div className="flex items-center rounded-lg bg-surface" role="group" aria-label="Cantidad solicitada">
      <button
        className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 disabled:hover:text-on-surface-variant"
        type="button"
        aria-label="Disminuir cantidad"
        aria-controls="input-qty"
        disabled={Number.isFinite(n) && n <= MIN_QTY}
        onClick={() => step(-1)}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          remove
        </span>
      </button>
      <input
        className="w-full text-center bg-transparent font-button-text text-button-text text-on-surface focus:outline-none"
        id="input-qty"
        max={MAX_QTY}
        min={MIN_QTY}
        required
        type="number"
        inputMode="numeric"
        name="input-qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onBlur={() => setQty((current) => (current === "" ? current : String(clamp(Number.parseInt(current, 10) || MIN_QTY))))}
      />
      <button
        className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 disabled:hover:text-on-surface-variant"
        type="button"
        aria-label="Aumentar cantidad"
        aria-controls="input-qty"
        disabled={Number.isFinite(n) && n >= MAX_QTY}
        onClick={() => step(1)}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          add
        </span>
      </button>
    </div>
  );
}

/** Campo RUC con botón "Validar": comprueba formato y dígito verificador (no consulta a la SUNAT). */
export function W17RucField() {
  const noteId = useId();
  const [ruc, setRuc] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; text: string }>(null);

  const validate = () => {
    const value = ruc.replace(/\s/g, "");
    if (!/^\d{11}$/.test(value)) setResult({ ok: false, text: "El RUC debe tener 11 dígitos." });
    else if (!isValidRucChecksum(value)) setResult({ ok: false, text: "Revise el RUC: el dígito verificador no coincide." });
    else setResult({ ok: true, text: "Formato de RUC correcto. La consulta en SUNAT se realiza al emitir la proforma." });
  };

  return (
    <>
      <div className="relative">
        <input
          className="w-full h-11 px-3.5 rounded-lg bg-surface font-body-compact text-body-compact text-on-surface placeholder:text-outline focus:ring-2 focus:ring-focus focus:outline-none"
          id="ruc"
          maxLength={11}
          name="ruc"
          pattern={"[0-9]{11}"}
          placeholder="20XXXXXXXXX"
          required
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-describedby={result ? noteId : undefined}
          value={ruc}
          onChange={(e) => {
            setRuc(e.target.value);
            setResult(null);
          }}
        />
        {" "}
        <button
          className="absolute right-2 top-2 px-2 py-1.5 rounded bg-surface-container hover:bg-surface-container-highest text-primary font-ui-label text-[11px] font-bold transition-colors"
          title="Validar formato del RUC"
          aria-label="Validar formato del RUC"
          type="button"
          onClick={validate}
        >
          Validar
        </button>
      </div>
      <p id={noteId} role="status" aria-live="polite" className={result ? `font-ui-label text-ui-label ${result.ok ? "text-success" : "text-danger"}` : "sr-only"}>
        {result?.text}
      </p>
    </>
  );
}

/** Fecha estimada de recepción: `min` = hoy (America/Lima), calculado en el cliente para no desfasar el HTML estático. */
export function W17DateField() {
  const [min] = useState(limaToday);
  return (
    <input
      className="w-full h-11 px-3.5 rounded-lg bg-surface font-body-compact text-body-compact text-on-surface focus:ring-2 focus:ring-focus focus:outline-none"
      id="delivery-date"
      required
      type="date"
      name="delivery-date"
      min={min}
    />
  );
}
