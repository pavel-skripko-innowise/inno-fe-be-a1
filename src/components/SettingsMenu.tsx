import { useState } from "react";
import { Bookmark, Moon, Settings2, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { localeLabel } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { updateSettings, useSettings, type Theme } from "@/lib/settings";
import { clearScrollPositions } from "@/lib/scroll-position";

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

export function SettingsMenu() {
  const { theme, locale, rememberPosition } = useSettings();
  const { locales, t } = useI18n();
  const [cleared, setCleared] = useState(false);
  const themeLabel = { light: t.light, dark: t.dark };

  return (
    <Popover onOpenChange={() => setCleared(false)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t.settings}
          className="fixed right-5 bottom-5 z-50 grid size-11 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-card)] transition hover:rotate-45 hover:text-foreground"
        >
          <Settings2 className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72 space-y-5">
        <p className="text-sm font-semibold">{t.settings}</p>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t.language}</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={locale === code}
                onClick={() => updateSettings({ locale: code })}
                className={`rounded-md py-1.5 text-sm transition ${
                  locale === code
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {localeLabel(code)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t.theme}</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {THEMES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateSettings({ theme: value })}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm transition ${
                  theme === value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {themeLabel[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start justify-between gap-3">
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Bookmark className="size-4" /> {t.rememberPosition}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t.rememberPositionHint}
              </span>
            </span>
            <Switch
              checked={rememberPosition}
              onCheckedChange={(v) => updateSettings({ rememberPosition: v })}
            />
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            disabled={cleared}
            onClick={() => (clearScrollPositions(), setCleared(true))}
          >
            {cleared ? t.positionsCleared : t.resetPositions}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
