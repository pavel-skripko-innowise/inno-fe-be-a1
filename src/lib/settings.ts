import { useSyncExternalStore } from "react";

/** User preferences stored in the browser (localStorage). */
export type Theme = "light" | "dark";
export interface Settings {
  theme: Theme;
  /** Two-letter content language, matching the folder inside each course (`backend/A/1/ru`). */
  locale: string;
  rememberPosition: boolean;
}

const KEY = "app-settings";
const DEFAULTS: Settings = { theme: "light", locale: "ru", rememberPosition: true };
const listeners = new Set<() => void>();
let cache: Settings | null = null;

function normalize(value: Partial<Settings> | null): Settings {
  const theme = value?.theme === "dark" || value?.theme === "light" ? value.theme : DEFAULTS.theme;
  const locale =
    typeof value?.locale === "string" && /^[a-z]{2}$/.test(value.locale)
      ? value.locale
      : DEFAULTS.locale;
  const rememberPosition =
    typeof value?.rememberPosition === "boolean"
      ? value.rememberPosition
      : DEFAULTS.rememberPosition;
  return { theme, locale, rememberPosition };
}

function read(): Settings {
  if (cache) return cache;
  try {
    cache = normalize(JSON.parse(localStorage.getItem(KEY) ?? "{}"));
  } catch {
    cache = DEFAULTS;
  }
  return cache!;
}

export function writeLocaleCookie(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `locale=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function updateSettings(patch: Partial<Settings>) {
  cache = normalize({ ...read(), ...patch });
  localStorage.setItem(KEY, JSON.stringify(cache));
  document.documentElement.classList.toggle("dark", cache.theme === "dark");
  document.documentElement.lang = cache.locale;
  writeLocaleCookie(cache.locale);
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
export const themeInitScript = `try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}");if(s.theme==="dark")document.documentElement.classList.add("dark");if(typeof s.locale==="string"&&/^[a-z]{2}$/.test(s.locale))document.documentElement.lang=s.locale}catch(e){}`;
