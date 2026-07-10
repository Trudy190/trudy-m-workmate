import { useEffect, useState } from "react";

export type EmailItem = {
  id: string;
  createdAt: number;
  purpose: string;
  audience: string;
  tone: string;
  length: string;
  subject: string;
  body: string;
};

export type PlanItem = {
  id: string;
  createdAt: number;
  scope: "day" | "week";
  goals: string;
  plan: string;
};

export type ChatItem = {
  id: string;
  createdAt: number;
  title: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

export type Settings = {
  tone: string;
  emailStyle: string;
  responseLength: "short" | "medium" | "detailed";
  workingHours: string;
  language: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
};

const KEYS = {
  emails: "trudym.emails",
  plans: "trudym.plans",
  chats: "trudym.chats",
  settings: "trudym.settings",
  stats: "trudym.session-stats",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  tone: "Professional",
  emailStyle: "Concise",
  responseLength: "medium",
  workingHours: "09:00 – 17:00",
  language: "English",
  theme: "light",
  notifications: true,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("trudym:storage", { detail: key }));
}

export function useLocalList<T extends { id: string }>(
  key: string,
): [T[], (item: T) => void, (id: string) => void, () => void] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    setItems(read<T[]>(key, []));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === key) setItems(read<T[]>(key, []));
    };
    window.addEventListener("trudym:storage", handler);
    return () => window.removeEventListener("trudym:storage", handler);
  }, [key]);

  const add = (item: T) => {
    const next = [item, ...read<T[]>(key, [])].slice(0, 200);
    write(key, next);
    setItems(next);
  };
  const remove = (id: string) => {
    const next = read<T[]>(key, []).filter((i) => i.id !== id);
    write(key, next);
    setItems(next);
  };
  const clear = () => {
    write(key, []);
    setItems([]);
  };
  return [items, add, remove, clear];
}

export function useEmails() {
  return useLocalList<EmailItem>(KEYS.emails);
}
export function usePlans() {
  return useLocalList<PlanItem>(KEYS.plans);
}
export function useChats() {
  return useLocalList<ChatItem>(KEYS.chats);
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void, () => void] {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setSettings(read<Settings>(KEYS.settings, DEFAULT_SETTINGS));
  }, []);
  const update = (patch: Partial<Settings>) => {
    const next = { ...read<Settings>(KEYS.settings, DEFAULT_SETTINGS), ...patch };
    write(KEYS.settings, next);
    setSettings(next);
  };
  const reset = () => {
    write(KEYS.settings, DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  };
  return [settings, update, reset];
}

export type SessionStats = {
  emailsGenerated: number;
  plansCreated: number;
  chatsCompleted: number;
};

export function useSessionStats(): [SessionStats, (patch: Partial<SessionStats>) => void] {
  const [stats, setStats] = useState<SessionStats>({
    emailsGenerated: 0,
    plansCreated: 0,
    chatsCompleted: 0,
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(KEYS.stats);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);
  const update = (patch: Partial<SessionStats>) => {
    setStats((s) => {
      const next = { ...s, ...patch };
      try {
        window.sessionStorage.setItem(KEYS.stats, JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  return [stats, update];
}

export function clearAllLocalData() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  window.sessionStorage.removeItem(KEYS.stats);
  window.dispatchEvent(new CustomEvent("trudym:storage", { detail: "*" }));
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
