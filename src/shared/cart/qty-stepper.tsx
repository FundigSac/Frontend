"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { MAX_QTY } from "@/modules/cart/cart-store";
import "./qty-stepper.css";

type Props = {
  value: number;
  onChange: (quantity: number) => void;
  /** Nombre del grupo y del campo, p. ej. "Cantidad: Válvula check swing". */
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  className?: string;
};

/**
 * Selector de cantidad accesible (X7-3), controlado: botones − / + con el nombre del producto en su etiqueta, mínimo 1
 * y máximo MAX_QTY. Mientras se escribe se permite el campo vacío; al salir del campo, un valor vacío o menor que 1
 * vuelve a 1. Lo usan el carrito (cantidad de cada línea) y las fichas (cantidad antes de agregar).
 */
export function QuantityStepper({ value, onChange, label, decreaseLabel, increaseLabel, className }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));
  const commit = (raw: string) => {
    setDraft(null);
    onChange(clamp(Number(raw)));
  };
  return (
    <div className={`ct-qty${className ? ` ${className}` : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= 1} aria-label={decreaseLabel}>
        <Minus aria-hidden="true" size={14} strokeWidth={2.4} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY}
        step={1}
        value={draft ?? value}
        aria-label={label}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || Number(raw) < 1) setDraft(raw);
          else commit(raw);
        }}
        onBlur={(e) => draft !== null && commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && draft !== null && commit(e.currentTarget.value)}
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= MAX_QTY} aria-label={increaseLabel}>
        <Plus aria-hidden="true" size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}
