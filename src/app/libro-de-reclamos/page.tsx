import { permanentRedirect } from "next/navigation";

/** El libro de reclamaciones vive en /reclamaciones. */
export default function LegacyComplaintsRoute() {
  permanentRedirect("/reclamaciones");
}
