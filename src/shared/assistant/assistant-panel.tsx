"use client";

import { ArrowUp, Check, ClipboardList, Copy, FileText, Gauge, Maximize2, Minimize2, RotateCcw, ShieldCheck, Square, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLang } from "@/shared/layout/landing-prefs";
import { ASSISTANT_COPY, suggestionsFor, whatsappHref } from "./assistant-copy";
import { AssistantMark } from "./assistant-icon";
import { AssistantMarkdown } from "./assistant-markdown";
import { MAX_INPUT, useAssistantChat, type ChatMessage } from "./use-assistant-chat";

type Copy = (typeof ASSISTANT_COPY)[keyof typeof ASSISTANT_COPY];

const CARD_ICONS = { gauge: Gauge, file: FileText, shield: ShieldCheck, quote: ClipboardList } as const;

const isPhone = () => window.matchMedia("(max-width: 640px)").matches;

function Thinking({ labels }: { labels: readonly string[] }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, labels.length - 1)), 2200);
    return () => window.clearInterval(id);
  }, [labels]);
  return (
    <span className="ai-thinking">
      <span className="ai-thinking__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="ai-thinking__label">{labels[step]}</span>
    </span>
  );
}

function CopyButton({ text, t }: { text: string; t: Copy }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="ai-tool"
      aria-label={done ? t.copied : t.copy}
      title={done ? t.copied : t.copy}
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        });
      }}
    >
      {done ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span>{done ? t.copied : t.copy}</span>
    </button>
  );
}

function BotMessage({
  message,
  question,
  t,
  lang,
  onRetry,
  onReset,
  onNavigate,
}: {
  message: ChatMessage;
  question?: string;
  t: Copy;
  lang: "es" | "en";
  onRetry: () => void;
  onReset: () => void;
  onNavigate: () => void;
}) {
  const streaming = message.status === "streaming";
  const notice = message.notice;
  const canRetry = notice && notice !== "not_configured" && notice !== "refusal" && notice !== "too_long";
  return (
    <div className="ai-msg ai-msg--bot">
      <span className="ai-msg__avatar" aria-hidden="true">
        <AssistantMark size={17} />
      </span>
      <div className="ai-msg__body">
        {(message.content || streaming) && (
          <div className={`ai-bubble${streaming ? " is-streaming" : ""}`}>
            {message.content ? <AssistantMarkdown text={message.content} onNavigate={onNavigate} /> : <Thinking labels={t.thinking} />}
            {message.stopped && <p className="ai-bubble__note">{t.stopped}</p>}
          </div>
        )}
        {notice && (
          <div className="ai-notice" role="alert">
            <p>{t.notices[notice]}</p>
            <div className="ai-notice__actions">
              {canRetry && (
                <button type="button" className="ai-btn ai-btn--ghost" onClick={onRetry}>
                  <RotateCcw size={14} aria-hidden="true" />
                  {t.retry}
                </button>
              )}
              {notice === "too_long" && (
                <button type="button" className="ai-btn ai-btn--ghost" onClick={onReset}>
                  <RotateCcw size={14} aria-hidden="true" />
                  {t.newChat}
                </button>
              )}
              <a className="ai-btn ai-btn--wa" href={whatsappHref(lang, question)} target="_blank" rel="noopener noreferrer">
                {t.whatsapp}
              </a>
              <Link className="ai-btn ai-btn--quote" href="/cotizar" onClick={onNavigate}>
                {t.quote}
              </Link>
            </div>
          </div>
        )}
        {message.status === "done" && message.content && (
          <div className="ai-tools">
            <CopyButton text={message.content} t={t} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssistantPanel({
  open,
  onClose,
  prompt,
  onPromptUsed,
}: {
  open: boolean;
  onClose: () => void;
  prompt: string | null;
  onPromptUsed: () => void;
}) {
  const [lang] = useLang();
  const t = ASSISTANT_COPY[lang];
  const pathname = usePathname() || "/";
  const { messages, busy, send, stop, retry, reset } = useAssistantChat(lang, pathname);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const stick = useRef(true);

  const resize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const submit = useCallback(
    (text: string) => {
      if (!text.trim() || busy) return;
      stick.current = true;
      void send(text);
      setInput("");
      window.requestAnimationFrame(resize);
    },
    [busy, send, resize],
  );

  // Pregunta enviada desde otro botón del sitio (openAssistant).
  useEffect(() => {
    if (!open || !prompt || busy) return;
    const id = window.setTimeout(() => {
      onPromptUsed();
      submit(prompt);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, prompt, busy, onPromptUsed, submit]);

  // Foco al abrir: el campo de texto con puntero fino; en táctil, el propio panel (sin abrir el teclado).
  // Escape cierra el chat esté donde esté el foco.
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    else panelRef.current?.focus({ preventScroll: true });
    const root = document.documentElement;
    root.classList.add("ai-open");
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("ai-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Mantiene la vista al final mientras llega la respuesta, salvo que la persona haya subido a leer.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (!messages.length) el.scrollTop = 0;
    else if (stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const onScroll = () => {
    const el = bodyRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(input);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const onNavigate = useCallback(() => {
    if (isPhone()) onClose();
  }, [onClose]);

  const lastQuestion = [...messages].reverse().find((m) => m.role === "user")?.content;
  const remaining = MAX_INPUT - input.length;

  return (
    <section
      id="ai-panel"
      className="ai-panel"
      role="dialog"
      aria-labelledby={titleId}
      data-state={open ? "open" : "closed"}
      data-expanded={expanded ? "true" : "false"}
      inert={!open}
      tabIndex={-1}
      ref={panelRef}
    >
      <header className="ai-head">
        <div className="ai-head__id">
          <span className="ai-avatar" aria-hidden="true">
            <AssistantMark size={24} />
          </span>
          <div>
            <h2 id={titleId}>{t.title}</h2>
            <p>
              <span className="ai-live" aria-hidden="true" />
              {t.status}
            </p>
          </div>
        </div>
        <div className="ai-head__actions">
          {messages.length > 0 && (
            <button type="button" className="ai-icon-btn" onClick={reset} aria-label={t.reset} title={t.reset}>
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="ai-icon-btn ai-icon-btn--expand"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? t.shrink : t.expand}
            title={expanded ? t.shrink : t.expand}
            aria-pressed={expanded}
          >
            {expanded ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
          </button>
          <button type="button" className="ai-icon-btn" onClick={onClose} aria-label={t.close} title={t.close}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="ai-body" ref={bodyRef} onScroll={onScroll} role="log" aria-live="polite" aria-busy={busy} aria-label={t.title}>
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome__hero">
              <span className="ai-orb" aria-hidden="true">
                <AssistantMark size={30} />
              </span>
              <h3>{t.welcomeTitle}</h3>
              <p>{t.welcomeLead}</p>
            </div>
            <p className="ai-label">{t.capabilities}</p>
            <div className="ai-cards">
              {t.cards.map((card) => {
                const Icon = CARD_ICONS[card.icon];
                return (
                  <button key={card.title} type="button" className="ai-card" onClick={() => submit(card.prompt)}>
                    <span className="ai-card__icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <strong>{card.title}</strong>
                    <span>{card.text}</span>
                  </button>
                );
              })}
            </div>
            <p className="ai-label">{t.suggestions}</p>
            <div className="ai-chips">
              {suggestionsFor(pathname, lang).map((s) => (
                <button key={s} type="button" className="ai-chip" onClick={() => submit(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ai-msgs">
            {messages.map((m, index) =>
              m.role === "user" ? (
                <div key={m.id} className="ai-msg ai-msg--user">
                  <span className="ai-sr">{t.you}: </span>
                  <div className="ai-bubble">{m.content}</div>
                </div>
              ) : (
                <BotMessage
                  key={m.id}
                  message={m}
                  question={messages[index - 1]?.role === "user" ? messages[index - 1].content : lastQuestion}
                  t={t}
                  lang={lang}
                  onRetry={() => retry(m.id)}
                  onReset={reset}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        )}
      </div>

      <form className="ai-compose" onSubmit={onSubmit}>
        <div className="ai-field">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={MAX_INPUT}
            placeholder={t.placeholder}
            aria-label={t.inputLabel}
            enterKeyHint="send"
            onChange={(e) => {
              setInput(e.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
          />
          {busy ? (
            <button type="button" className="ai-send ai-send--stop" onClick={stop} aria-label={t.stop} title={t.stop}>
              <Square size={14} fill="currentColor" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" className="ai-send" disabled={!input.trim()} aria-label={t.send} title={t.send}>
              <ArrowUp size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
          )}
        </div>
        {remaining < 200 && <p className="ai-count" aria-live="polite">{t.charsLeft(remaining)}</p>}
        <p className="ai-foot">
          {t.footer}{" "}
          <a href={whatsappHref(lang, lastQuestion)} target="_blank" rel="noopener noreferrer">
            {t.footerHuman}
          </a>
        </p>
      </form>
    </section>
  );
}
