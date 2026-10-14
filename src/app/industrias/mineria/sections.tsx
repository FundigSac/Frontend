"use client";

import { MapPinned, ShieldCheck, Settings } from "lucide-react";
import { SectorPage, type SectorMedia } from "../_sector/sector-page";
import { useMining } from "./copy";
import { MINING_IMAGES } from "./media-responsive";

const MEDIA: SectorMedia = {
  id: "mi",
  hero: "/media/mineria/hero-planta.webp",
  featured: "/media/mineria/valvula-planta.webp",
  featuredSizes: "(max-width: 900px) 100vw, 53vw",
  preparedImages: MINING_IMAGES,
  features: [MapPinned, ShieldCheck, Settings],
  apps: [
    { href: "/productos/tuberias", image: "/media/mineria/agua-proceso.webp" },
    { href: "/productos/valvulas", image: "/media/mineria/recirculacion.webp" },
  ],
  line: [
    { href: "/productos/valvulas", image: "/media/mineria/valvula-mina.webp" },
    { href: "/productos/tuberias", image: "/media/mineria/tuberias-hdpe.webp" },
    { href: "/productos?q=acople", image: "/media/mineria/acople-bridado.webp" },
    { href: "/productos?q=ventosa", image: "/media/mineria/valvula-proceso.webp" },
  ],
  docs: { image: "/media/mineria/catalogo-mineria.webp", width: 1448, height: 1086, cutout: false },
  cta: "/media/mineria/planta-atardecer.webp",
};

export function MiningSections() {
  return <SectorPage t={useMining()} media={MEDIA} />;
}
