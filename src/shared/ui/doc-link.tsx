import Link from "next/link";
import { documentHref } from "@/modules/resources/documents";

/**
 * Enlace a un documento técnico. Si el archivo oficial existe se descarga; si no, lleva al
 * formulario de contacto con el documento precargado (no se simulan descargas).
 */
export function DocLink({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  const { href, download } = documentHref(title);
  if (download) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} title="Documento disponible bajo solicitud">
      {children}
    </Link>
  );
}
