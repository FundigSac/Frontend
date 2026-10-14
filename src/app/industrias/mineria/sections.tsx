"use client";

import { Mountain, ShieldCheck, Settings } from "lucide-react";
import { SectorPage, type SectorMedia } from "../_sector/sector-page";
import { useMining } from "./copy";

const MEDIA: SectorMedia = {
  id: "mi",
  hero: "/media/mineria/hero-tajo.webp",
  featured: "/media/mineria/destacada.webp",
  features: [Mountain, ShieldCheck, Settings],
  apps: [
    { href: "/productos/tuberias", image: "/media/mineria/pulpas.webp" },
    { href: "/productos/valvulas", image: "/media/mineria/procesos.webp" },
  ],
  line: [
    { href: "/productos/valvulas", image: "/media/mineria/valvulas.webp" },
    { href: "/productos?q=acople", image: "/media/mineria/acoples.webp" },
    { href: "/productos/tuberias", image: "/media/mineria/tuberias.webp" },
    { href: "/productos?q=brida", image: "/media/mineria/bridas.webp" },
  ],
  docs: { image: "/media/mineria/catalogo.webp", width: 1371, height: 792, cutout: false },
  cta: "/media/mineria/cierre.webp",
};

export function MiningSections() {
  return <SectorPage t={useMining()} media={MEDIA} />;
}
