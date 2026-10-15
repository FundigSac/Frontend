import { useId } from "react";

/**
 * Mascota del asistente: robot-globo con audífonos y el logo de FUNDIGSAC en el auricular.
 * Vectorial para animar cada parte por CSS (assistant.css, prefijo `.m-`): la cabeza flota, los ojos
 * pasan de "sonrisa" a abiertos, parpadean y miran a los lados, las ondas de señal laten, la ola se mece
 * y un brillo cruza el visor. `mood` cambia la reacción: saluda al abrir, piensa, "habla" mientras escribe,
 * celebra al terminar y se apena si algo falla.
 */
export type MascotMood = "idle" | "greet" | "thinking" | "talking" | "happy" | "sad";

const STAR = "M0-4.2C.5-1.3 1.3-.5 4.2 0 1.3.5.5 1.3 0 4.2-.5 1.3-1.3.5-4.2 0-1.3-.5-.5-1.3 0-4.2Z";
export function AssistantMascot({
  size = 64,
  animated = true,
  mood = "idle",
  className,
}: {
  size?: number;
  animated?: boolean;
  mood?: MascotMood;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = (name: string) => `${id}-${name}`;
  const url = (name: string) => `url(#${ref(name)})`;
  const classes = ["m", animated && "is-animated", animated && mood !== "idle" && `is-${mood}`, className].filter(Boolean).join(" ");

  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" width={size} height={size} className={classes} focusable="false">
      <defs>
        <radialGradient id={ref("bg")} cx="36%" cy="26%" r="82%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.66" stopColor="#f0f6fe" />
          <stop offset="1" stopColor="#d9eafb" />
        </radialGradient>
        <linearGradient id={ref("wave")} x1="0" y1="1" x2="1" y2="0.15">
          <stop offset="0" stopColor="#103d93" />
          <stop offset="0.5" stopColor="#1b5fc1" />
          <stop offset="1" stopColor="#36a3e8" />
        </linearGradient>
        <linearGradient id={ref("blue")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a88ea" />
          <stop offset="1" stopColor="#164aa6" />
        </linearGradient>
        <radialGradient id={ref("head")} cx="38%" cy="22%" r="86%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#f7faff" />
          <stop offset="1" stopColor="#d6e5f7" />
        </radialGradient>
        <linearGradient id={ref("visor")} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#284f8b" />
          <stop offset="0.55" stopColor="#183a6b" />
          <stop offset="1" stopColor="#0e2750" />
        </linearGradient>
        <radialGradient id={ref("glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#2f73d4" stopOpacity="0.34" />
          <stop offset="1" stopColor="#2f73d4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ref("shine")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={ref("drop")} x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2.4" floodColor="#1d5bb8" floodOpacity="0.3" />
        </filter>
        <clipPath id={ref("circle")}>
          <circle cx="60" cy="60" r="53.6" />
        </clipPath>
        <clipPath id={ref("visorClip")}>
          <rect x="29.5" y="40" width="52" height="26.5" rx="12.5" />
        </clipPath>
      </defs>

      {/* Fondo: anillo celeste, disco claro y ola azul */}
      <circle cx="60" cy="60" r="56.6" fill="#cde3fb" />
      <circle cx="60" cy="60" r="53.6" fill={url("bg")} />
      <g clipPath={url("circle")}>
        <g className="m-wave">
          <path d="M-12 99C14 99 38 96 60 89 84 81 102 64 114 34L140 26V140H-12Z" fill={url("wave")} />
          <path d="M-12 124C24 118 58 108 82 98 98 91 110 83 132 71" fill="none" stroke="#7fc8f3" strokeOpacity="0.6" strokeWidth="7" />
          <path d="M-12 118C24 112 58 102 82 92 98 85 110 77 132 65" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" />
        </g>
      </g>

      {/* Ondas de señal */}
      <g className="m-signal" fill="none" stroke="#1f5fc8" strokeWidth="4.2" strokeLinecap="round">
        <path className="m-signal__a" d="M30.6 23.4l3.6 7.9" />
        <path className="m-signal__b" d="M19.6 31.4l7.2 5" />
        <path className="m-signal__c" d="M16 44.8l8.6-2.5" />
      </g>

      <g className="m-bot">
        <ellipse cx="56" cy="86" rx="33" ry="7.5" fill={url("glow")} />
        {/* Auricular izquierdo (detrás de la cabeza) */}
        <rect x="19.4" y="47.6" width="10.4" height="19.6" rx="4.6" fill={url("blue")} />
        {/* Cabeza en forma de globo de conversación */}
        <path
          d="M42.5 28.8H70C81.5 28.8 88.6 37 88.6 48.5V62C88.6 73.2 81.2 81.2 69.5 81.2H63C59.6 84.4 55.6 87.4 51.8 89.4 52.8 86.4 52.6 83.6 50.6 81.2H42.5C31.2 81.2 23.8 73.2 23.8 62V48.5C23.8 37 31.2 28.8 42.5 28.8Z"
          fill={url("head")}
          stroke="#cfe0f5"
          strokeWidth="0.7"
          filter={url("drop")}
        />
        {/* Diadema */}
        <path d="M39.5 31.4C57 22.6 84.6 22.4 94.4 45.6" fill="none" stroke={url("blue")} strokeWidth="5.2" strokeLinecap="round" />
        {/* Visor con brillo */}
        <rect x="29.5" y="40" width="52" height="26.5" rx="12.5" fill={url("visor")} />
        <g clipPath={url("visorClip")}>
          <g className="m-shine">
            <rect x="16" y="32" width="12" height="42" fill={url("shine")} transform="rotate(18 22 53)" />
          </g>
        </g>
        {/* Ojos: sonrisa (cerrados) y abiertos */}
        <g className="m-happy" fill="none" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round">
          <path d="M37.3 59.4A5.3 5.3 0 0 1 47.9 59.4" />
          <path d="M58.7 59.4A5.3 5.3 0 0 1 69.3 59.4" />
        </g>
        <g className="m-open">
          <ellipse cx="42.6" cy="55.6" rx="4.7" ry="5.7" fill="#ffffff" />
          <ellipse cx="64" cy="55.6" rx="4.7" ry="5.7" fill="#ffffff" />
          <g className="m-pupils">
            <circle cx="43.1" cy="56.2" r="2.5" fill="#0e2750" />
            <circle cx="64.5" cy="56.2" r="2.5" fill="#0e2750" />
            <circle cx="44.1" cy="55" r="0.95" fill="#ffffff" />
            <circle cx="65.5" cy="55" r="0.95" fill="#ffffff" />
          </g>
        </g>
        {/* Auricular derecho con el logo de FUNDIGSAC */}
        <ellipse cx="92.8" cy="59.2" rx="10.8" ry="14.8" fill={url("blue")} />
        <ellipse cx="94.4" cy="59.2" rx="9" ry="13.1" fill="#ffffff" />
        <image href="/brand/fundigsac-icon.svg" x="85.8" y="50.6" width="17.4" height="17.4" />
        {/* Gota de pena (solo en "sad") */}
        <g transform="translate(80.5 35.5)">
          <path className="m-drop" d="M0-3.4C1.7-.9 2.5.6 2.5 1.7A2.5 2.5 0 0 1-2.5 1.7C-2.5.6-1.7-.9 0-3.4Z" fill="#8fd2ff" />
        </g>
        {/* Micrófono */}
        <path d="M86.6 71.6C83.6 76 79 77.6 74 76.6" fill="none" stroke={url("blue")} strokeWidth="2.7" strokeLinecap="round" />
        <rect x="64.6" y="73.4" width="11.6" height="5.8" rx="2.9" fill="#1a4ea8" transform="rotate(-12 70.4 76.3)" />
      </g>

      {/* Destellos de alegría (solo en "happy") */}
      <g className="m-sparkles" fill="#ffb347">
        <g transform="translate(20 24)">
          <path className="m-star m-star--a" d={STAR} />
        </g>
        <g transform="translate(101 24)">
          <path className="m-star m-star--b" d={STAR} fill="#5ab4ff" />
        </g>
        <g transform="translate(14 74)">
          <path className="m-star m-star--c" d={STAR} />
        </g>
      </g>
    </svg>
  );
}
