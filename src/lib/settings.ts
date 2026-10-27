import { useSyncExternalStore } from "react";

/** User preferences stored in the browser (localStorage). */
export type Theme = "light" | "dark";
export interface Settings {
  theme: Theme;
  rememberPosition: boolean;
}

const KEY = "app-settings";
const DEFAULTS: Settings = { theme: "light", rememberPosition: true };
const listeners = new Set<() => void>();
let cache: Settings | null = null;

function read(): Settings {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    cache = DEFAULTS;
  }
  return cache!;
}

export function updateSettings(patch: Partial<Settings>) {
  cache = { ...read(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(cache));
  document.documentElement.classList.toggle("dark", cache.theme === "dark");
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    () => DEFAULTS,
  );
}

/** Inline script for <head>: applies the theme before first paint (no flash). */
export const themeInitScript = `try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}");if(s.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
