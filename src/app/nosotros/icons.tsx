import type { SVGProps } from "react";

/** Íconos de trazo del boceto (24×24, trazo 1.75, esquinas redondeadas). Heredan `currentColor`. */
function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

/** Diamante con facetas (Experiencia). */
export const GemIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M6.2 3.5h11.6L22 9.6 12 21 2 9.6z" />
    <path d="M2 9.6h20M9 3.5l-2 6.1L12 21l5-11.4-2-6.1M9 3.5l3 6.1 3-6.1" />
  </Svg>
);

/** Equipo: una persona al frente y dos detrás (Equipo especializado, Valores). */
export const TeamIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M6.2 20.5v-1.4a4.6 4.6 0 0 1 4.6-4.6h2.4a4.6 4.6 0 0 1 4.6 4.6v1.4" />
    <circle cx="4.6" cy="10" r="2.1" />
    <path d="M1.5 19v-.7a3.4 3.4 0 0 1 3.1-3.4" />
    <circle cx="19.4" cy="10" r="2.1" />
    <path d="M22.5 19v-.7a3.4 3.4 0 0 0-3.1-3.4" />
  </Svg>
);

/** Engranaje (Soluciones confiables). */
export const GearIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M10.4 2.8h3.2l.5 2.4 1.7.7 2.1-1.3 2.3 2.3-1.3 2.1.7 1.7 2.4.5v3.2l-2.4.5-.7 1.7 1.3 2.1-2.3 2.3-2.1-1.3-1.7.7-.5 2.4h-3.2l-.5-2.4-1.7-.7-2.1 1.3-2.3-2.3 1.3-2.1-.7-1.7-2.4-.5v-3.2l2.4-.5.7-1.7-1.3-2.1 2.3-2.3 2.1 1.3 1.7-.7z" />
  </Svg>
);

/** Hoja con nervio (Compromiso en el Perú). */
export const LeafIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M20.5 3.5c-9 .3-15 3.8-15 11 0 2.1.8 3.9 2.2 5 7.6-.2 12.8-5.6 12.8-16z" />
    <path d="M3.5 20.5C7 14.5 11 11 16 8.5" />
  </Svg>
);

/** Diana con flecha (Misión). */
export const TargetArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M20.4 12.6A8.5 8.5 0 1 1 11.4 3.6" />
    <path d="M16.6 13a4.8 4.8 0 1 1-5.6-5.6" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <path d="M12 12 21 3M16.5 3.2V7.5h4.3" />
  </Svg>
);

/** Barras ascendentes sobre una base (Visión). */
export const BarsUpIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <rect x="3.5" y="12.5" width="4.4" height="8" rx="1" />
    <rect x="9.8" y="7.5" width="4.4" height="13" rx="1" />
    <rect x="16.1" y="2.8" width="4.4" height="17.7" rx="1" />
    <path d="M2 21.5h20" />
  </Svg>
);
