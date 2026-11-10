"use client";

import { Gauge, Network, ShieldCheck } from "lucide-react";
import { SectorPage, type SectorMedia } from "../_sector/sector-page";
import { useSanea } from "./copy";

const MEDIA: SectorMedia = {
  id: "sa",
  hero: "/media/saneamiento/hero.webp",
  featured: "/media/saneamiento/destacada.webp",
  features: [ShieldCheck, Network, Gauge],
  apps: [
    { href: "/productos/valvulas", image: "/media/saneamiento/agua-potable.webp" },
    { href: "/productos/marcos-y-tapas", image: "/media/saneamiento/alcantarillado.webp" },
  ],
  line: [
    { href: "/productos/marcos-y-tapas", image: "/media/saneamiento/marcos-tapas.webp" },
    { href: "/productos/tuberias", image: "/media/saneamiento/tuberias.webp", position: "50% 60%" },
    { href: "/productos?q=acople", image: "/media/saneamiento/acoples.webp" },
    { href: "/productos/valvulas", image: "/media/saneamiento/hero.webp", position: "76% 55%" },
  ],
  docs: { image: "/media/saneamiento/catalogo-recorte.webp", width: 1448, height: 1086, cutout: true },
  cta: "/media/saneamiento/cierre.webp",
};

export function SanitationSections() {
  return <SectorPage t={useSanea()} media={MEDIA} />;
}
