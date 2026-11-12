import { createContext, useContext, type ReactNode } from "react";
import { messagesFor } from "./i18n";

const LocaleContext = createContext<{ locale: string; locales: string[] }>({
  locale: "ru",
  locales: ["ru", "en"],
});

export function LocaleProvider({
  locale,
  locales,
  children,
}: {
  locale: string;
  locales: string[];
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={{ locale, locales }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useI18n() {
  const { locale, locales } = useLocale();
  return { locale, locales, t: messagesFor(locale) };
}
