"use client";

import { useState } from "react";

const FIELD = "w-full h-10 px-3 rounded bg-surface-container-low border border-border text-[13px]";
const LABEL = "font-ui-label text-[11px] text-text-secondary block mb-1";

/**
 * Configuración de accionamiento: las opciones del actuador eléctrico sólo se muestran (y se envían)
 * cuando se elige "Actuador eléctrico"; con reductor manual los campos quedan deshabilitados y no viajan en el formulario.
 */
export function W07Actuation() {
  const [electric, setElectric] = useState(false);
  return (
    <div className="p-4 rounded-xl bg-surface space-y-3 border border-border">
      <span className="font-ui-label text-ui-label text-on-surface font-bold uppercase tracking-wide block" id="accionamiento-label">
        Configuración de Accionamiento para Obra:
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="accionamiento-label">
        <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated border border-border cursor-pointer hover:border-primary transition-all">
          <input checked={!electric} onChange={() => setElectric(false)} className="mt-1 text-primary focus:ring-primary" name="accionamiento" type="radio" value="manual" />
          <div>
            <span className="font-body-compact text-[14px] font-semibold text-on-surface block">Solo Reductor Manual Desmultiplicado IP68</span>{" "}
            <span className="font-ui-label text-[12px] text-text-secondary block">Incluye volante de maniobra en hierro dúctil, topes de carrera e indicador visual.</span>
          </div>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated border border-border cursor-pointer hover:border-primary transition-all">
          <input checked={electric} onChange={() => setElectric(true)} className="mt-1 text-primary focus:ring-primary" name="accionamiento" type="radio" value="electrico" aria-controls="electric-options-panel" />
          <div>
            <span className="font-body-compact text-[14px] font-semibold text-on-surface block">Actuador Eléctrico Trifásico 380V / 440V</span>{" "}
            <span className="font-ui-label text-[12px] text-text-secondary block">Compatible con SCADA, protocolos Modbus/Profibus e indicación electrónica de torque.</span>
          </div>
        </label>
      </div>
      {/* Opciones extra si es actuador eléctrico */}
      <div className={`${electric ? "grid" : "hidden"} grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border`} id="electric-options-panel">
        <div>
          <label className={LABEL} htmlFor="marcaDeActuadorPreferida">
            Marca de Actuador Preferida:
          </label>{" "}
          <select className={FIELD} id="marcaDeActuadorPreferida" name="marcaDeActuadorPreferida" disabled={!electric} defaultValue="auma">
            <option value="auma">AUMA SAR / SA Series</option>
            <option value="rotork">ROTORK IQ3 Series</option>
            <option value="abierto">Cualquiera homologada según presupuesto</option>
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="voltajeDeAlimentacion">
            Voltaje de Alimentación:
          </label>{" "}
          <select className={FIELD} id="voltajeDeAlimentacion" name="voltajeDeAlimentacion" disabled={!electric} defaultValue="380">
            <option value="380">380V Trifásico 60Hz</option>
            <option value="440">440V Trifásico 60Hz</option>
            <option value="220">220V Trifásico 60Hz</option>
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="tipoDeServicio">
            Tipo de Servicio:
          </label>{" "}
          <select className={FIELD} id="tipoDeServicio" name="tipoDeServicio" disabled={!electric} defaultValue="onoff">
            <option value="onoff">Todo / Nada (Aislamiento On-Off)</option>
            <option value="modulante">Modulante Proporcional 4-20 mA</option>
          </select>
        </div>
      </div>
    </div>
  );
}
