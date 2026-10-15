"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/shared/layout/landing-prefs";
import type { Notice } from "./assistant-copy";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "done" | "error";
  notice?: Notice;
  stopped?: boolean;
  /** "ai" si respondió el modelo; "guide" si respondió la guía rápida con los datos del sitio. */
  mode?: "ai" | "guide";
  feedback?: "up" | "down";
};

export type Settled = "done" | "error";

const STORAGE_KEY = "fundigsac-assistant-v1";
const MAX_STORED = 40;
/** Límites del servidor (src/modules/assistant/limits.ts): se respetan aquí para no recibir rechazos. */
export const MAX_INPUT = 1500;
const SEND_MESSAGES = 16;
const SEND_CHARS = 30000;

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/**
 * Separa el texto visible de las preguntas sugeridas que el asistente agrega al final como [[a|b|c]].
 * Mientras llega el texto, un "[[" sin cerrar se oculta para que nunca se vea a medias.
 */
export function parseReply(content: string): { body: string; suggestions: string[] } {
  const start = content.lastIndexOf("[[");
  if (start < 0) return { body: content, suggestions: [] };
  const end = content.indexOf("]]", start);
  const body = content.slice(0, start).trimEnd();
  if (end < 0) return { body, suggestions: [] };
  const suggestions = content
    .slice(start + 2, end)
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length <= 90)
    .slice(0, 3);
  return { body, suggestions };
}

function load(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter((m): m is ChatMessage => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && typeof m.id === "string")
      .map((m) => (m.status === "streaming" ? { ...m, status: m.content ? "done" : "error", notice: m.content ? undefined : "network" } : m));
  } catch {
    return [];
  }
}

function save(messages: ChatMessage[]) {
  try {
    if (messages.length) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin almacenamiento: la conversación vive solo en esta pestaña */
  }
}

/** Historial que se envía: últimas respuestas completas (sin las sugerencias), dentro de los límites, empezando por el usuario. */
export function historyFor(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  const turns = messages
    .filter((m) => m.content.trim() && (m.role === "user" || m.status === "done"))
    .map((m) => ({ role: m.role, content: m.role === "assistant" ? parseReply(m.content).body : m.content }))
    .filter((m) => m.content.trim());
  const out: { role: "user" | "assistant"; content: string }[] = [];
  let chars = 0;
  for (let i = turns.length - 1; i >= 0 && out.length < SEND_MESSAGES; i--) {
    const content = turns[i].content.slice(0, turns[i].role === "user" ? MAX_INPUT : 8000);
    if (out.length && chars + content.length > SEND_CHARS) break;
    chars += content.length;
    out.unshift({ role: turns[i].role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

const NOTICE_BY_CODE: Record<string, Notice> = { not_configured: "not_configured", busy: "busy", network: "network" };

export function useAssistantChat(lang: Lang, page: string, onSettled?: (result: Settled) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>(load);
  const [busy, setBusy] = useState(false);
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const settledRef = useRef(onSettled);

  useEffect(() => {
    settledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    messagesRef.current = messages;
    if (!busy) save(messages);
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string, base: ChatMessage[] = messagesRef.current) => {
      const content = text.trim().slice(0, MAX_INPUT);
      if (!content || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      const user: ChatMessage = { id: uid(), role: "user", content, status: "done" };
      const botId = uid();
      const next = [...base, user, { id: botId, role: "assistant" as const, content: "", status: "streaming" as const }];
      messagesRef.current = next;
      setMessages(next);

      const patch = (fn: (m: ChatMessage) => ChatMessage) => setMessages((list) => list.map((m) => (m.id === botId ? fn(m) : m)));
      const controller = new AbortController();
      abortRef.current = controller;
      let result: Settled | null = null;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyFor([...base, user]), lang, page }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          const notice: Notice =
            res.status === 503 ? "not_configured" : res.status === 429 ? "rate_limited" : data.error === "conversation_too_long" ? "too_long" : "error";
          patch((m) => ({ ...m, status: "error", notice }));
          result = "error";
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finished = false;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let cut: number;
          while ((cut = buffer.indexOf("\n\n")) >= 0) {
            const frame = buffer.slice(0, cut);
            buffer = buffer.slice(cut + 2);
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let event: { type?: string; text?: string; code?: string; mode?: string };
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (event.type === "text" && event.text) {
              const piece = event.text;
              patch((m) => ({ ...m, content: m.content + piece }));
            } else if (event.type === "meta" && (event.mode === "ai" || event.mode === "guide")) {
              const mode = event.mode;
              patch((m) => ({ ...m, mode }));
            } else if (event.type === "done") {
              finished = true;
              result = "done";
              patch((m) => ({ ...m, status: "done" }));
            } else if (event.type === "refusal") {
              finished = true;
              result = "error";
              patch((m) => ({ ...m, status: "error", notice: "refusal" }));
            } else if (event.type === "error") {
              finished = true;
              result = "error";
              patch((m) => ({ ...m, status: "error", notice: NOTICE_BY_CODE[event.code ?? ""] ?? "error" }));
            }
          }
        }
        if (!finished) {
          result = "error";
          patch((m) => ({ ...m, status: "error", notice: "network" }));
        }
      } catch {
        if (controller.signal.aborted) {
          setMessages((list) =>
            list.flatMap((m) => (m.id !== botId ? [m] : m.content ? [{ ...m, status: "done" as const, stopped: true }] : [])),
          );
        } else {
          result = "error";
          patch((m) => ({ ...m, status: "error", notice: "network" }));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        busyRef.current = false;
        setBusy(false);
        if (result) settledRef.current?.(result);
      }
    },
    [lang, page],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  /** Repite la última pregunta de una respuesta fallida, quitando el intento anterior. */
  const retry = useCallback(
    (botId: string) => {
      const list = messagesRef.current;
      const index = list.findIndex((m) => m.id === botId);
      const question = index > 0 ? list[index - 1] : undefined;
      if (!question || question.role !== "user") return;
      void send(question.content, list.slice(0, index - 1));
    },
    [send],
  );

  /** 👍 / 👎 sobre una respuesta (se guarda en la sesión; un segundo clic lo quita). */
  const rate = useCallback((botId: string, value: "up" | "down") => {
    setMessages((list) => list.map((m) => (m.id === botId ? { ...m, feedback: m.feedback === value ? undefined : value } : m)));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    messagesRef.current = [];
    setMessages([]);
  }, []);

  return { messages, busy, send, stop, retry, rate, reset };
}
