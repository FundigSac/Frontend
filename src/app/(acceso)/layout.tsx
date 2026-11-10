import type { ReactNode } from "react";
import { AccessFrame } from "@/modules/access/access-frame";

/** Las pantallas de acceso comparten la escena y el panel: al navegar entre ellas solo cambia el formulario. */
export default function AccessLayout({ children }: { children: ReactNode }) {
  return <AccessFrame>{children}</AccessFrame>;
}
