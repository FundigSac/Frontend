import type { ReactNode } from "react";
import { AccessFrame } from "@/modules/access/access-frame";
import { backendEnabled } from "@/modules/backend/server";

/** Las pantallas de acceso comparten el panel: al navegar entre ellas solo cambia el formulario. */
export default function AccessLayout({ children }: { children: ReactNode }) {
  // Se resuelve en el servidor para que el primer pintado diga la verdad sobre el acceso con correo, sin saltos.
  return <AccessFrame accounts={backendEnabled()}>{children}</AccessFrame>;
}
