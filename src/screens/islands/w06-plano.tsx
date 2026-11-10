import { useId } from "react";
import type { Cell } from "./w06-ficha-data";

/** Cotas de un diámetro: L entre caras, H del eje al volante, ØD del volante y la brida exterior (ØA o D). */
export type Cotas = { dn: string; L: Cell; H: Cell; OD: Cell; A: string | null; aLabel: string };

const show = (v: Cell | string | null) => (v === null || v === undefined || v === "-" ? null : String(v));

/**
 * Plano de la válvula en alzado, como en la ficha técnica oficial: L abajo, H desde el eje hasta el volante,
 * ØD sobre el volante y la brida exterior a la derecha. Las cotas toman los valores del diámetro elegido;
 * las que la ficha no publica (por ejemplo H en la FUNDIGSAC de 1 año) no se dibujan.
 */
export function ValvePlan({ cotas, label }: { cotas: Cotas; label: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arrow = `url(#${id}-arrow)`;
  const L = show(cotas.L);
  const H = show(cotas.H);
  const OD = show(cotas.OD);
  const A = show(cotas.A);
  const summary = [L && `L ${L} mm`, H && `H ${H} mm`, OD && `ØD ${OD} mm`, A && `${cotas.aLabel} ${A} mm`].filter(Boolean).join(", ");

  return (
    <svg viewBox="0 0 440 392" role="img" aria-label={`${label} ${cotas.dn}: ${summary}`} className="w06-plan">
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.5 9 5 0 8.5Z" fill="currentColor" />
        </marker>
        <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgb(160 196 255 / 22%)" strokeWidth="1.4" />
        </pattern>
      </defs>

      {/* Ejes */}
      <g className="w06-plan__axis">
        <line x1="40" y1="262" x2="400" y2="262" />
        <line x1="220" y1="20" x2="220" y2="360" />
      </g>

      {/* Pieza */}
      <g className="w06-plan__part">
        {/* Bridas con resalte */}
        <rect pathLength={1} x="62" y="182" width="24" height="160" rx="2" />
        <rect pathLength={1} x="354" y="182" width="24" height="160" rx="2" />
        <rect pathLength={1} x="56" y="210" width="6" height="104" />
        <rect pathLength={1} x="378" y="210" width="6" height="104" />
        {/* Cuerpo con la cámara de la compuerta */}
        <path
          pathLength={1}
          d="M86 214H150C158 214 162 208 162 198V166C162 156 170 148 180 148H260C270 148 278 156 278 166V198C278 208 282 214 290 214H354V310H290C282 310 276 316 272 324 266 336 254 342 240 342H200C186 342 174 336 168 324 164 316 158 310 150 310H86Z"
          fill={`url(#${id}-hatch)`}
        />
        {/* Junta de la tapa con pernos */}
        <rect pathLength={1} x="166" y="136" width="108" height="12" rx="2" />
        <circle cx="176" cy="142" r="3" />
        <circle cx="264" cy="142" r="3" />
        {/* Tapa, prensaestopas, vástago y volante */}
        <path pathLength={1} d="M184 136 192 100H248L256 136Z" />
        <rect pathLength={1} x="200" y="86" width="40" height="14" rx="2" />
        <rect pathLength={1} x="214" y="44" width="12" height="42" />
        <rect pathLength={1} x="130" y="40" width="180" height="14" rx="7" />
        <rect pathLength={1} x="204" y="34" width="32" height="26" rx="5" />
        {/* Paso (líneas ocultas) */}
        <line className="w06-plan__hidden" x1="62" y1="226" x2="378" y2="226" />
        <line className="w06-plan__hidden" x1="62" y1="298" x2="378" y2="298" />
      </g>

      {/* Cotas */}
      <g className="w06-plan__dim">
        {L && (
          <g key={`L${L}`} className="w06-plan__cota">
            <line className="w06-plan__ext" x1="62" y1="346" x2="62" y2="378" />
            <line className="w06-plan__ext" x1="378" y1="346" x2="378" y2="378" />
            <line x1="64" y1="370" x2="376" y2="370" markerStart={arrow} markerEnd={arrow} />
            <text x="220" y="374" textAnchor="middle">L = {L}</text>
          </g>
        )}
        {H && (
          <g key={`H${H}`} className="w06-plan__cota">
            <line className="w06-plan__ext" x1="128" y1="40" x2="20" y2="40" />
            <line className="w06-plan__ext" x1="56" y1="262" x2="20" y2="262" />
            <line x1="30" y1="44" x2="30" y2="258" markerStart={arrow} markerEnd={arrow} />
            <text x="30" y="151" textAnchor="middle" transform="rotate(-90 30 151)" dy="4">H = {H}</text>
          </g>
        )}
        {OD && (
          <g key={`D${OD}`} className="w06-plan__cota">
            <line className="w06-plan__ext" x1="130" y1="36" x2="130" y2="8" />
            <line className="w06-plan__ext" x1="310" y1="36" x2="310" y2="8" />
            <line x1="132" y1="16" x2="308" y2="16" markerStart={arrow} markerEnd={arrow} />
            <text x="220" y="20" textAnchor="middle">ØD = {OD}</text>
          </g>
        )}
        {A && (
          <g key={`A${A}`} className="w06-plan__cota">
            <line className="w06-plan__ext" x1="382" y1="182" x2="424" y2="182" />
            <line className="w06-plan__ext" x1="382" y1="342" x2="424" y2="342" />
            <line x1="414" y1="186" x2="414" y2="338" markerStart={arrow} markerEnd={arrow} />
            <text x="414" y="262" textAnchor="middle" transform="rotate(-90 414 262)" dy="4">{cotas.aLabel} = {A}</text>
          </g>
        )}
        <text className="w06-plan__dn" x="220" y="266" textAnchor="middle">{cotas.dn}</text>
      </g>
    </svg>
  );
}
