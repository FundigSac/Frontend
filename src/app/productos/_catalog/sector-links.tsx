"use client";

import Link from "next/link";
import { useLang } from "@/shared/layout/landing-prefs";
import { sectorsOfSheet, type SheetSector } from "@/modules/catalog/sheet-sectors";
import styles from "./sector-links.module.css";

const LABEL: Record<SheetSector, { href: string; es: string; en: string }> = {
  saneamiento: { href: "/industrias/saneamiento", es: "Agua y saneamiento", en: "Water and sanitation" },
  agricultura: { href: "/industrias/agricultura", es: "Riego agrícola", en: "Agricultural irrigation" },
  mineria: { href: "/industrias/mineria", es: "Minería", en: "Mining" },
};

/** Enlaza la ficha con los sectores cuya página la presenta. Si ninguna la presenta, no se muestra nada. */
export function SectorLinks({ slug }: { slug: string }) {
  const [lang] = useLang();
  const sectors = sectorsOfSheet(slug);
  if (sectors.length === 0) return null;
  return (
    <p className={styles.line}>
      <span>{lang === "en" ? "Used in" : "Se usa en"}</span>
      {sectors.map((sector) => (
        <Link key={sector} href={LABEL[sector].href}>{LABEL[sector][lang]}</Link>
      ))}
    </p>
  );
}
