import { FloatingActions } from "@/app/_landing/floating-actions";

/** Catálogo completo: mismo WhatsApp flotante y botón de subir que el resto de páginas con la cabecera de inicio. */
export default function ProductosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <FloatingActions />
    </>
  );
}
