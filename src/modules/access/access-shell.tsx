"use client";

import { ClipboardList, FileText, Headset, History, KeyRound, Lock, Mail, Settings2, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLang } from "@/shared/layout/landing-prefs";
import { ACCESS_COPY, type AccessKind, type FeatureIcon } from "./access-copy";
import "./access.css";

const ICONS: Record<FeatureIcon, LucideIcon> = {
  file: FileText,
  settings: Settings2,
  users: Users,
  clipboard: ClipboardList,
  history: History,
  shield: ShieldCheck,
  mail: Mail,
  headset: Headset,
  key: KeyRound,
  lock: Lock,
};

const VALVE = {
  wheel: "/media/home-v2/compuerta-con-timon-v4.webp",
  cap: "/media/home-v2/compuerta-sin-timon-v4.webp",
} as const;

/**
 * Escena de cada pantalla: fotografía de planta o paisaje y, en primer plano, las válvulas FUNDIGSAC recortadas
 * (con volante o con cuadrante), compuestas por capas para una imagen nítida a cualquier resolución.
 */
const SCENE: Record<AccessKind, { bg: string; position: string; front: keyof typeof VALVE; back?: keyof typeof VALVE }> = {
  login: { bg: "/media/home-ref-hero.webp", position: "0% 55%", front: "wheel", back: "cap" },
  register: { bg: "/media/home-v3/hero-planta.webp", position: "30% 60%", front: "cap", back: "wheel" },
  forgot: { bg: "/media/home-v3/sector-saneamiento.webp", position: "20% 55%", front: "wheel" },
  reset: { bg: "/media/home-ref-hero.webp", position: "0% 50%", front: "cap" },
};

/** Plantilla de las pantallas de acceso: escena a la izquierda y formulario en un panel completo a la derecha. */
export function AccessShell({ kind, children, wide = false }: { kind: AccessKind; children: ReactNode; wide?: boolean }) {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const panel = t.panels[kind];
  const scene = SCENE[kind];

  return (
    <main className={`ac ac--${kind}`}>
      <section className="ac-visual" aria-label={panel.eyebrow}>
        <div className="ac-visual__media" aria-hidden="true">
          <Image src={scene.bg} alt="" fill priority sizes="(max-width: 960px) 100vw, 64vw" style={{ objectPosition: scene.position }} />
        </div>
        <div className="ac-valves" aria-hidden="true">
          {scene.back && (
            <span className="ac-valve ac-valve--back">
              <Image src={VALVE[scene.back]} alt="" width={578} height={1030} sizes="(max-width: 960px) 30vw, 16vw" />
            </span>
          )}
          <span className="ac-valve ac-valve--front">
            <Image src={VALVE[scene.front]} alt="" width={578} height={1030} priority sizes="(max-width: 960px) 46vw, 26vw" />
          </span>
        </div>
        <span className="ac-visual__band" aria-hidden="true" />
        <div className="ac-visual__copy">
          <p className="ac-eyebrow">{panel.eyebrow}</p>
          <h1>
            {panel.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="ac-lead">{panel.lead}</p>
        </div>
        <ul className="ac-features">
          {panel.features.map((f, i) => {
            const Icon = ICONS[f.icon];
            return (
              <li key={f.title} style={{ animationDelay: `${260 + i * 120}ms` }}>
                <span className="ac-features__icon" aria-hidden="true">
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ac-side">
        <span className="ac-preview" title={t.previewHint}>
          <Sparkles aria-hidden="true" size={12} />
          {t.preview}
        </span>
        <div className={`ac-card${wide ? " ac-card--wide" : ""}`}>
          <Link href="/" className="ac-brand" aria-label="FUNDIGSAC, inicio">
            <Image src="/brand/fundigsac.svg" alt="FUNDIGSAC" width={708} height={159} />
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}

export function SecureNote() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  return (
    <div className="ac-secure">
      <span aria-hidden="true">
        <ShieldCheck size={22} strokeWidth={1.8} />
      </span>
      <div>
        <strong>{t.secureTitle}</strong>
        <p>{t.secureText}</p>
      </div>
    </div>
  );
}
