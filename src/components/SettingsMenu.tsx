import { useState } from "react";
import { Bookmark, Moon, Settings2, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSettings, useSettings, type Theme } from "@/lib/settings";
import { clearScrollPositions } from "@/lib/scroll-position";

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
];

export function SettingsMenu() {
  const { theme, rememberPosition } = useSettings();
  const [cleared, setCleared] = useState(false);

  return (
    <Popover onOpenChange={() => setCleared(false)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Настройки"
          className="fixed right-5 bottom-5 z-50 grid size-11 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-card)] transition hover:rotate-45 hover:text-foreground"
        >
          <Settings2 className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72 space-y-5">
        <p className="text-sm font-semibold">Настройки</p>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Тема</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateSettings({ theme: value })}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm transition ${
                  theme === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start justify-between gap-3">
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Bookmark className="size-4" /> Сохранять положение
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Возвращает к месту, где вы остановились на странице
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
            {cleared ? "Сохранённые положения сброшены" : "Сбросить сохранённые положения"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
