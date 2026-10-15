"use client";

import { ClipboardList, FileText, Headset, History, KeyRound, Lock, Mail, Settings2, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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

/**
 * Fotografía de cada pantalla (planta, válvulas FUNDIGSAC instaladas), con su encuadre en escritorio y móvil,
 * un color de fondo y una miniatura desenfocada para que nunca se vea un bloque gris mientras carga.
 */
const SCENES: Record<AccessKind, { src: string; pos: string; posMobile: string; color: string; blur: string }> = {
  login: {
    src: "/media/home-ref-infrastructure.webp",
    pos: "20% 55%",
    posMobile: "38% 55%",
    color: "rgb(168 184 200)",
    blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAwCdASoUAAsAPu1mqk4ppaOiMAgBMB2JYwCdACHcaPuEOd1dB7MAAP7T5IazfzV3reapPGbnfNNdWaasa6u7qAQ82k5+dtSRGfSxloYAAA==",
  },
  register: {
    src: "/media/home-v3/hero-planta.webp",
    pos: "38% 62%",
    posMobile: "55% 60%",
    color: "rgb(40 136 232)",
    blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAwCdASoUAAsAPu1iqk2ppaQiMAgBMB2JaACdMoADOeEe59pSRpoAAPxngnM4pRbAeAoxhMWv393gHuJF4YzGJnMc2M4+bhe/9LH0nmAAAA==",
  },
  forgot: {
    src: "/media/hero-industrial.webp",
    pos: "30% 62%",
    posMobile: "52% 62%",
    color: "rgb(200 200 200)",
    blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACQAwCdASoUAAsAPu1kq04ppaQiMAgBMB2JQBOgAqQte46a0KCgAP7f9OXp2zpDzgWjKAIqrT8BgRK82/A4udV6k76DS75QLTz2GEAA",
  },
  reset: {
    src: "/media/home-v3/sector-saneamiento.webp",
    pos: "35% 55%",
    posMobile: "45% 55%",
    color: "rgb(88 168 248)",
    blur: "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBQCdASoUABkAPu1oqU4ppiOiMAgBMB2JaACdMoLT9A49rtQeY3zlISbxHhRImCzxAADdOp8OzE5cpnrn1DMwCY7fklQDUx/lfUIWTRTfKDlQTtNL3/Xm8m4ORsFRMjocP9hbjxawlo1zYtb8uo1QZEhUqfIBTAHwNCVB3DDhGIUEuzDh4F5pZau//QAA",
  },
};

const ORDER: AccessKind[] = ["login", "register", "forgot", "reset"];

export function kindFor(pathname: string): AccessKind {
  if (pathname.startsWith("/registro")) return "register";
  if (pathname.startsWith("/recuperar")) return "forgot";
  if (pathname.startsWith("/restablecer")) return "reset";
  return "login";
}

/** Escena persistente: al cambiar de pantalla solo cambia la foto (con fundido) y el texto; nada se recarga. */
function AccessScene({ kind }: { kind: AccessKind }) {
  const [lang] = useLang();
  const panel = ACCESS_COPY[lang].panels[kind];
  // Las demás fotos se descargan en segundo plano cuando el navegador está libre, para que el cambio sea inmediato.
  const [warm, setWarm] = useState<AccessKind[]>([]);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /2g/.test(connection?.effectiveType ?? "")) return;
    const run = () => setWarm(ORDER);
    const idle = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 2500 }) : window.setTimeout(run, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
  }, []);
  const layers = ORDER.filter((k) => k === kind || warm.includes(k));

  return (
    <section className="ac-visual" aria-label={panel.eyebrow}>
      <div className="ac-scenes" aria-hidden="true">
        {layers.map((k) => {
          const s = SCENES[k];
          return (
            <div
              key={k}
              className={`ac-scene${k === kind ? " is-active" : ""}`}
              style={{ position: "absolute", "--pos": s.pos, "--pos-m": s.posMobile, backgroundColor: s.color } as CSSProperties}
            >
              <Image
                src={s.src}
                alt=""
                fill
                priority={k === kind}
                fetchPriority={k === kind ? "high" : "low"}
                sizes="(max-width: 960px) 100vw, 62vw"
                placeholder="blur"
                blurDataURL={s.blur}
              />
            </div>
          );
        })}
      </div>
      <div className="ac-visual__copy" key={`copy-${kind}`}>
        <p className="ac-eyebrow">{panel.eyebrow}</p>
        <h1>
          {panel.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="ac-lead">{panel.lead}</p>
      </div>
      <ul className="ac-features" key={`features-${kind}`}>
        {panel.features.map((f, i) => {
          const Icon = ICONS[f.icon];
          return (
            <li key={f.title} style={{ animationDelay: `${60 + i * 60}ms` }}>
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
  );
}

/** Marco común de las pantallas de acceso: se monta una vez en el layout y solo cambia el formulario. */
export function AccessFrame({ children }: { children: ReactNode }) {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const kind = kindFor(usePathname() || "/login");

  return (
    <main className={`ac ac--${kind}`}>
      <AccessScene kind={kind} />
      <section className="ac-side">
        <span className="ac-preview" title={t.previewHint}>
          <Sparkles aria-hidden="true" size={12} />
          {t.preview}
        </span>
        <div className={`ac-card${kind === "register" ? " ac-card--wide" : ""}`} key={`card-${kind}`}>
          <Link href="/" className="ac-brand" aria-label="FUNDIGSAC, inicio">
            <Image src="/brand/fundigsac.svg" alt="FUNDIGSAC" width={708} height={159} priority />
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
