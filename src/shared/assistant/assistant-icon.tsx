/**
 * Marca del asistente: globo de conversación con el volante de una válvula y un destello de IA.
 * El destello usa `currentColor` salvo que se pinte con `.ai-mark__spark` (naranja en el botón flotante).
 */
export function AssistantMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `ai-mark ${className}` : "ai-mark"}
    >
      <path d="M19 8.2A11 9.1 0 0 0 3 16.3c0 2.8 1.5 5.2 3.8 6.9l-.9 3.9 4.5-2.2c1.1.4 2.3.5 3.6.5A11 9.1 0 0 0 25 16.3a11 9.1 0 0 0-1.9-5.1" />
      <g strokeWidth="1.75">
        <circle cx="14" cy="16.3" r="4.3" />
        <path d="M14 15v-3M15.1 17l2.6 1.5M12.9 17l-2.6 1.5" />
      </g>
      <circle cx="14" cy="16.3" r="1.3" fill="currentColor" stroke="none" />
      <path
        className="ai-mark__spark"
        d="M25.4 1.9c.4 2.5 1.3 3.4 3.8 3.8-2.5.4-3.4 1.3-3.8 3.8-.4-2.5-1.3-3.4-3.8-3.8 2.5-.4 3.4-1.3 3.8-3.8Z"
        fill="currentColor"
        stroke="none"
      />
      <circle className="ai-mark__spark" cx="29.4" cy="11.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
