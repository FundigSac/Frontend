import { permanentRedirect } from "next/navigation";

/** El libro de reclamaciones vive en /reclamaciones (formulario real con folio). */
export default function LegacyComplaintsRoute() {
  permanentRedirect("/reclamaciones");
}
