"use client";

import {
  ArrowRight,
  ArrowUp,
  Check,
  CheckCheck,
  ClipboardList,
  Copy,
  FileDown,
  FileText,
  Gauge,
  Maximize2,
  MessageCircle,
  Minimize2,
  Headset,
  Info,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { site } from "@/lib/site-info";
import { useLang } from "@/shared/layout/landing-prefs";
import { ASSISTANT_COPY, suggestionsFor, whatsappHref } from "./assistant-copy";
import { ACCEPT, docLinks, isGeneratedName, whatsappMention, prepareAttachment, type AttachError, type AttachmentInfo, type PendingAttachment } from "./assistant-attach";
import { AssistantMarkdown } from "./assistant-markdown";
import { AssistantMascot, type MascotMood } from "./assistant-mascot";
import { MAX_INPUT, parseReply, useAssistantChat, type ChatMessage, type Settled } from "./use-assistant-chat";
import "./assistant-panel.css";

type Copy = (typeof ASSISTANT_COPY)[keyof typeof ASSISTANT_COPY];

const ICONS = { gauge: Gauge, file: FileText, shield: ShieldCheck, quote: ClipboardList, chat: MessageCircle, phone: Phone } as const;

const isPhone = () => window.matchMedia("(max-width: 640px)").matches;

function AttachmentChip({ info, photoLabel, onRemove, removeLabel }: { info: AttachmentInfo; photoLabel: string; onRemove?: () => void; removeLabel?: string }) {
  const name = info.kind === "image" && isGeneratedName(info.name) ? photoLabel : info.name;
  return (
    <span className={`ai-attach${onRemove ? " is-pending" : ""}`}>
      {info.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ai-attach__thumb" src={info.thumb} alt="" width={36} height={36} />
      ) : (
        <span className="ai-attach__icon" aria-hidden="true">
          <FileText size={18} />
        </span>
      )}
      <span className="ai-attach__name">{name}</span>
      {onRemove && (
        <button type="button" className="ai-attach__remove" onClick={onRemove} aria-label={removeLabel} title={removeLabel}>
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

const timeFmt = (lang: "es" | "en", at?: number) => (at ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-PE", { hour: "numeric", minute: "2-digit" }).format(at) : "");

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
      <span className="ai-tool__text">{done ? t.copied : t.copy}</span>
    </button>
  );
}

function BotMessage({
  message,
  question,
  isLast,
  busy,
  t,
  lang,
  onRetry,
  onReset,
  onRate,
  onAsk,
  onNavigate,
}: {
  message: ChatMessage;
  question?: string;
  isLast: boolean;
  busy: boolean;
  t: Copy;
  lang: "es" | "en";
  onRetry: () => void;
  onReset: () => void;
  onRate: (value: "up" | "down") => void;
  onAsk: (text: string) => void;
  onNavigate: () => void;
}) {
  const streaming = message.status === "streaming";
  const notice = message.notice;
  const canRetry = notice && notice !== "not_configured" && notice !== "refusal" && notice !== "too_long";
  const { body, suggestions } = parseReply(message.content);
  const done = message.status === "done" && body.length > 0;
  const docs = done ? docLinks(body, message.docs) : [];
  return (
    <div className="ai-msg ai-msg--bot">
      <span className="ai-msg__avatar" aria-hidden="true">
        <AssistantMascot size={32} animated={streaming} mood={streaming ? (body ? "talking" : "thinking") : "idle"} />
      </span>
      <div className="ai-msg__body">
        {(body || streaming) && (
          <div className={`ai-bubble${streaming ? " is-streaming" : ""}`}>
            {body ? <AssistantMarkdown text={body} onNavigate={onNavigate} /> : <Thinking labels={t.thinking} />}
            {message.stopped && <p className="ai-bubble__note">{t.stopped}</p>}
          </div>
        )}
        {docs.length > 0 && (
          <div className="ai-files">
            {docs.map((doc) => (
              <a key={doc.href} className="ai-file" href={doc.href} target="_blank" rel="noopener noreferrer">
                {doc.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ai-file__preview" src={doc.preview} alt="" width={64} height={84} loading="lazy" />
                ) : (
                  <span className="ai-file__icon" aria-hidden="true">
                    <FileText size={20} />
                  </span>
                )}
                <span className="ai-file__text">
                  <strong>{doc.title}</strong>
                  <small>{t.fileKind}</small>
                </span>
                <span className="ai-file__cta">
                  <FileDown size={15} aria-hidden="true" />
                  {t.fileCard}
                </span>
              </a>
            ))}
          </div>
        )}
        {done && whatsappMention(body) && (
          <a className="ai-wa" href={whatsappHref(lang, question)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} aria-hidden="true" />
            <span>{site.phone}</span>
          </a>
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
        {done && message.at && <time className="ai-time" dateTime={new Date(message.at).toISOString()}>{timeFmt(lang, message.at)}</time>}
        {done && (
          <div className="ai-tools">
            <CopyButton text={body} t={t} />
            <button
              type="button"
              className={`ai-tool ai-tool--icon${message.feedback === "up" ? " is-on" : ""}`}
              aria-label={t.helpful}
              title={t.helpful}
              aria-pressed={message.feedback === "up"}
              onClick={() => onRate("up")}
            >
              <ThumbsUp size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`ai-tool ai-tool--icon${message.feedback === "down" ? " is-on is-down" : ""}`}
              aria-label={t.notHelpful}
              title={t.notHelpful}
              aria-pressed={message.feedback === "down"}
              onClick={() => onRate("down")}
            >
              <ThumbsDown size={15} aria-hidden="true" />
            </button>
            {message.mode === "guide" && (
              <span className="ai-tag" title={t.guideHint}>
                <Sparkles size={12} aria-hidden="true" />
                {t.guide}
              </span>
            )}
          </div>
        )}
        {done && message.feedback === "up" && (
          <p className="ai-feedback" role="status">
            {t.thanks}
          </p>
        )}
        {done && message.feedback === "down" && (
          <div className="ai-feedback ai-feedback--down" role="status">
            <span>{t.sorry}</span>
            <a className="ai-btn ai-btn--wa" href={whatsappHref(lang, question)} target="_blank" rel="noopener noreferrer">
              {t.whatsapp}
            </a>
          </div>
        )}
        {done && isLast && !busy && suggestions.length > 0 && (
          <div className="ai-follow" role="group" aria-label={t.followUps}>
            {suggestions.map((s) => (
              <button key={s} type="button" className="ai-chip ai-chip--follow" onClick={() => onAsk(s)}>
                {s}
              </button>
            ))}
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
  onSettled,
}: {
  open: boolean;
  onClose: () => void;
  prompt: string | null;
  onPromptUsed: () => void;
  onSettled?: (result: Settled) => void;
}) {
  const [lang] = useLang();
  const t = ASSISTANT_COPY[lang];
  const pathname = usePathname() || "/";
  const [reaction, setReaction] = useState<MascotMood | null>(null);
  const reactionTimer = useRef<number | undefined>(undefined);

  /** Reacción breve de la mascota (saludo, alegría, pena) que luego vuelve al estado normal. */
  const react = useCallback((mood: MascotMood, ms: number) => {
    window.clearTimeout(reactionTimer.current);
    setReaction(mood);
    reactionTimer.current = window.setTimeout(() => setReaction(null), ms);
  }, []);

  const handleSettled = useCallback(
    (result: Settled) => {
      react(result === "done" ? "happy" : "sad", result === "done" ? 2200 : 2800);
      onSettled?.(result);
    },
    [react, onSettled],
  );

  const { messages, busy, send, stop, retry, rate, reset } = useAssistantChat(lang, pathname, handleSettled);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [attachError, setAttachError] = useState<AttachError | null>(null);
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const stick = useRef(true);

  useEffect(() => () => window.clearTimeout(reactionTimer.current), []);

  // Con más de un renglón la barra pasa a dos filas (texto arriba, "+" y enviar abajo) para que los botones no queden
  // pegados a la esquina del texto. Solo vuelve a una fila al vaciarse, así no parpadea al cambiar el ancho.
  const [multiline, setMultiline] = useState(false);
  const resize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    setMultiline((was) => (!el.value ? false : was || el.scrollHeight > 46 || /\n/.test(el.value)));
  }, []);
  // También al vaciarse el campo (envío o borrado), que no pasa por onChange.
  useEffect(() => {
    resize();
  }, [input, resize]);

  const attach = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setAttachError(null);
    setPreparing(true);
    const result = await prepareAttachment(file);
    setPreparing(false);
    if (result.ok) setAttachment(result.attachment);
    else setAttachError(result.error);
  }, []);

  const submit = useCallback(
    (text: string) => {
      const question = text.trim() || (attachment ? t.attachDefault : "");
      if (!question || busy || preparing) return;
      stick.current = true;
      void send(question, undefined, attachment ?? undefined);
      setInput("");
      setAttachment(null);
      setAttachError(null);
      window.requestAnimationFrame(resize);
    },
    [busy, preparing, attachment, send, resize, t.attachDefault],
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

  // Al abrir: saludo de la mascota y foco (campo de texto con puntero fino; en táctil, el panel, sin abrir el teclado).
  // Escape cierra el chat esté donde esté el foco.
  useEffect(() => {
    if (!open) return;
    const greet = window.setTimeout(() => react("greet", 1900), 0);
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    else panelRef.current?.focus({ preventScroll: true });
    const root = document.documentElement;
    root.classList.add("ai-open");
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(greet);
      root.classList.remove("ai-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, react]);

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

  const onRate = (m: ChatMessage, value: "up" | "down") => {
    if (m.feedback !== value) react(value === "up" ? "happy" : "sad", value === "up" ? 2000 : 2400);
    rate(m.id, value);
  };

  const last = messages[messages.length - 1];
  const live = busy && last?.role === "assistant" && last.status === "streaming";
  const liveMood: "thinking" | "talking" | null = live ? (parseReply(last.content).body ? "talking" : "thinking") : null;
  const mood: MascotMood = liveMood ?? reaction ?? "idle";
  const status = liveMood ? t.status[liveMood] : t.status.idle;
  const lastQuestion = [...messages].reverse().find((m) => m.role === "user")?.content;
  const remaining = MAX_INPUT - input.length;

  return (
    <section
      id="ai-panel"
      className="ai-panel"
      role="dialog"
      aria-label={t.dialog}
      data-state={open ? "open" : "closed"}
      data-expanded={expanded ? "true" : "false"}
      inert={!open}
      tabIndex={-1}
      ref={panelRef}
    >
      <header className="ai-head">
        <div className="ai-head__id">
          <span className="ai-avatar" aria-hidden="true">
            <AssistantMascot size={46} animated={open} mood={mood} />
          </span>
          <div>
            <h2 id={titleId}>{t.title}</h2>
            <p>
              <span className={`ai-live${liveMood ? " is-busy" : ""}`} aria-hidden="true" />
              <span className="ai-head__status">{status}</span>
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

      <div className="ai-body" ref={bodyRef} onScroll={onScroll} role="log" aria-live="polite" aria-busy={busy} aria-labelledby={titleId}>
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome__hero">
              <h3>{t.welcomeTitle}</h3>
              <p>{t.welcomeLead}</p>
            </div>
            <p className="ai-label">{t.capabilities}</p>
            <div className="ai-cards">
              {t.cards.map((card) => {
                const Icon = ICONS[card.icon];
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
                  <div className="ai-bubble">
                    {m.attachment && <AttachmentChip info={m.attachment} photoLabel={t.attachPhoto} />}
                    {m.content}
                  </div>
                  {m.at && (
                    <span className="ai-time ai-time--user">
                      <time dateTime={new Date(m.at).toISOString()}>{timeFmt(lang, m.at)}</time>
                      <CheckCheck size={15} aria-hidden="true" />
                    </span>
                  )}
                </div>
              ) : (
                <BotMessage
                  key={m.id}
                  message={m}
                  question={messages[index - 1]?.role === "user" ? messages[index - 1].content : lastQuestion}
                  isLast={index === messages.length - 1}
                  busy={busy}
                  t={t}
                  lang={lang}
                  onRetry={() => retry(m.id)}
                  onReset={reset}
                  onRate={(value) => onRate(m, value)}
                  onAsk={submit}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        )}
      </div>

      <form className="ai-compose" onSubmit={onSubmit}>
        {messages.length > 0 && (
          <nav className="ai-quick" aria-label={t.options}>
            {t.quick.map((item) => {
              const Icon = ICONS[item.icon];
              const content = (
                <>
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </>
              );
              if (item.kind === "prompt")
                return (
                  <button key={item.label} type="button" className="ai-quick__item" disabled={busy} onClick={() => submit(item.prompt)}>
                    {content}
                  </button>
                );
              if (item.kind === "link")
                return (
                  <Link key={item.label} className="ai-quick__item" href={item.href} onClick={onNavigate}>
                    {content}
                  </Link>
                );
              if (item.kind === "whatsapp")
                return (
                  <a key={item.label} className="ai-quick__item ai-quick__item--wa" href={whatsappHref(lang, lastQuestion)} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                );
              return (
                <a key={item.label} className="ai-quick__item" href={item.href}>
                  {content}
                </a>
              );
            })}
          </nav>
        )}
        {(attachment || attachError || preparing) && (
          <div className="ai-attach-bar" aria-live="polite">
            {attachment && <AttachmentChip info={{ kind: attachment.kind, name: attachment.name, thumb: attachment.kind === "image" ? attachment.thumb : undefined }} photoLabel={t.attachPhoto} onRemove={() => setAttachment(null)} removeLabel={t.attachRemove} />}
            {preparing && <span className="ai-attach__status">…</span>}
            {attachError && <p className="ai-attach__error" role="alert">{t.attachErrors[attachError]}</p>}
          </div>
        )}
        <div className="ai-field" data-multiline={multiline ? "true" : "false"}>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            hidden
            tabIndex={-1}
            onChange={(e) => {
              void attach(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button type="button" className="ai-attach-btn" onClick={() => fileRef.current?.click()} disabled={busy || preparing} aria-label={t.attach} title={t.attach}>
            <Plus size={22} aria-hidden="true" />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={MAX_INPUT}
            placeholder={attachment ? t.attachPlaceholder : t.placeholder}
            aria-label={t.inputLabel}
            enterKeyHint="send"
            onChange={(e) => {
              setInput(e.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
            onPaste={(e) => {
              const file = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"));
              if (file) {
                e.preventDefault();
                void attach(file);
              }
            }}
          />
          {busy ? (
            <button type="button" className="ai-send ai-send--stop" onClick={stop} aria-label={t.stop} title={t.stop}>
              <Square size={14} fill="currentColor" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" className="ai-send" disabled={(!input.trim() && !attachment) || preparing} aria-label={t.send} title={t.send}>
              <ArrowUp size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
          )}
        </div>
        {remaining < 200 && <p className="ai-count" aria-live="polite">{t.charsLeft(remaining)}</p>}
        <p className="ai-foot">
          <span className="ai-foot__note">
            <Info size={15} aria-hidden="true" />
            {t.footer}
          </span>
          <a href={whatsappHref(lang, lastQuestion)} target="_blank" rel="noopener noreferrer">
            <Headset size={16} aria-hidden="true" />
            {t.footerHuman}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </p>
      </form>
    </section>
  );
}
