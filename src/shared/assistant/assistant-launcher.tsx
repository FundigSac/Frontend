"use client";

import { X } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/shared/layout/landing-prefs";
import { ASSISTANT_COPY, ASSISTANT_EVENT } from "./assistant-copy";
import { AssistantMascot } from "./assistant-mascot";
import type { Settled } from "./use-assistant-chat";
import "./assistant.css";

// El panel (y su lógica de chat) se descarga solo cuando la persona se acerca al botón o lo abre.
const loadPanel = () => import("./assistant-panel");
const AssistantPanel = lazy(loadPanel);

const TEASER_KEY = "fundigsac-assistant-teaser";
const TEASER_DELAY = 9000;
const TEASER_VISIBLE = 14000;

export function AssistantLauncher() {
  const [lang] = useLang();
  const t = ASSISTANT_COPY[lang];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [unread, setUnread] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const clearPrompt = useCallback(() => setPrompt(null), []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Si la respuesta termina con el chat cerrado, el botón lo avisa y la mascota celebra.
  const onSettled = useCallback((result: Settled) => {
    if (!openRef.current && result === "done") setUnread(true);
  }, []);

  const hideTeaser = useCallback(() => {
    setTeaser(false);
    try {
      window.sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* sin almacenamiento: el aviso puede volver a aparecer */
    }
  }, []);

  const show = useCallback(
    (question?: string) => {
      hideTeaser();
      setUnread(false);
      setMounted(true);
      setOpen(true);
      if (question) setPrompt(question);
    },
    [hideTeaser],
  );

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }));
  }, []);

  // Un aviso discreto por sesión, solo en pantallas amplias y si la persona aún no abrió el chat.
  useEffect(() => {
    if (mounted) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen || window.matchMedia("(max-width: 640px)").matches) return;
    const id = window.setTimeout(() => setTeaser(true), TEASER_DELAY);
    return () => window.clearTimeout(id);
  }, [mounted]);

  // El aviso se retira solo para no tapar el contenido.
  useEffect(() => {
    if (!teaser) return;
    const id = window.setTimeout(hideTeaser, TEASER_VISIBLE);
    return () => window.clearTimeout(id);
  }, [teaser, hideTeaser]);

  useEffect(() => {
    const onOpen = (e: Event) => show((e as CustomEvent<{ prompt?: string }>).detail?.prompt);
    window.addEventListener(ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_EVENT, onOpen);
  }, [show]);

  const preload = () => void loadPanel();

  return (
    <div className="ai">
      {teaser && !open && (
        <div className="ai-teaser">
          <button type="button" className="ai-teaser__text" onClick={() => show()}>
            <AssistantMascot size={34} />
            {t.teaser}
          </button>
          <button type="button" className="ai-teaser__close" onClick={hideTeaser} aria-label={t.teaserDismiss} title={t.teaserDismiss}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="ai-launch"
        aria-label={open ? t.close : unread ? `${t.open} · ${t.unread}` : t.open}
        title={open ? t.close : unread ? t.unread : t.open}
        aria-expanded={open}
        aria-controls={mounted ? "ai-panel" : undefined}
        data-open={open ? "true" : "false"}
        onPointerEnter={preload}
        onPointerDown={preload}
        onFocus={preload}
        onClick={() => (open ? close() : show())}
      >
        <span className="ai-launch__glyph ai-launch__glyph--mark" aria-hidden="true">
          <AssistantMascot size={66} mood={unread ? "happy" : "idle"} />
        </span>
        {unread && !open && <span className="ai-launch__dot" aria-hidden="true">1</span>}
        <span className="ai-launch__glyph ai-launch__glyph--close" aria-hidden="true">
          <X size={26} strokeWidth={2.2} />
        </span>
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <AssistantPanel open={open} onClose={close} prompt={prompt} onPromptUsed={clearPrompt} onSettled={onSettled} />
        </Suspense>
      )}
    </div>
  );
}
