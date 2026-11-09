/** Libro abierto con lomo y tres líneas por página. Se lee de 20 a 150 px, sobre blanco y sobre petróleo. */
export function LibroReclamacionesIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M24 12.5C20 9 13.5 8 5 8.5v29.8c8.5-.5 15 .5 19 4 4-3.5 10.5-4.5 19-4V8.5c-8.5-.5-15 .5-19 4Z" />
      <path d="M24 12.5v29.8" />
      <path d="M11 16.2c3.2 0 5.8.5 8 1.6" />
      <path d="M11 23c3.2 0 5.8.5 8 1.6" />
      <path d="M11 29.8c3.2 0 5.8.5 8 1.6" />
      <path d="M37 16.2c-3.2 0-5.8.5-8 1.6" />
      <path d="M37 23c-3.2 0-5.8.5-8 1.6" />
      <path d="M37 29.8c-3.2 0-5.8.5-8 1.6" />
    </svg>
  );
}
