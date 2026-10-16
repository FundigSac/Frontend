"use client";

import { useSyncExternalStore } from "react";

export type AuthUser = { name: string; email: string; picture?: string };
type AuthState = { status: "loading" | "ready"; user: AuthUser | null };

/**
 * Estado de la sesión en el navegador. La cookie es httpOnly, así que se consulta /api/auth/session una sola vez
 * (y se comparte entre cabecera y pantallas de acceso); las páginas siguen siendo estáticas.
 */
const SERVER_STATE: AuthState = { status: "loading", user: null };
let state: AuthState = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function set(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

async function load() {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as { user?: AuthUser | null };
    set({ status: "ready", user: data.user ?? null });
  } catch {
    set({ status: "ready", user: null });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void load();
  }
  return () => {
    listeners.delete(listener);
  };
}

export async function signOut(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    if (!res.ok) return false;
    set({ status: "ready", user: null });
    return true;
  } catch {
    return false;
  }
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
