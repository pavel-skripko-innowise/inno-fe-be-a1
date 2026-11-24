import { useId, useState } from "react";
import { Bookmark, Moon, Settings2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { localeLabel } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { updateSettings, useSettings, type Theme } from "@/lib/settings";
import { clearScrollPositions } from "@/lib/scroll-position";

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

const segmented = "grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1";
const segment =
  "h-8 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm";

export function SettingsMenu() {
  const { theme, locale, rememberPosition } = useSettings();
  const { locales, t } = useI18n();
  const [cleared, setCleared] = useState(false);
  const id = useId();
  const themeLabel = { light: t.light, dark: t.dark };

  return (
    <Popover onOpenChange={() => setCleared(false)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t.settings}
          className="fixed right-5 bottom-5 z-50 size-11 rounded-full bg-card text-muted-foreground shadow-card transition hover:rotate-45 hover:bg-card hover:text-foreground [&_svg]:size-5"
        >
          <Settings2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72 space-y-5">
        <p className="text-sm font-semibold">{t.settings}</p>

        <div className="space-y-2">
          <p id={`${id}-language`} className="text-xs text-muted-foreground">
            {t.language}
          </p>
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={(value) => value && updateSettings({ locale: value })}
            aria-labelledby={`${id}-language`}
            className={segmented}
          >
            {locales.map((code) => (
              <ToggleGroupItem key={code} value={code} className={segment}>
                {localeLabel(code)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <p id={`${id}-theme`} className="text-xs text-muted-foreground">
            {t.theme}
          </p>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => value && updateSettings({ theme: value as Theme })}
            aria-labelledby={`${id}-theme`}
            className={segmented}
          >
            {THEMES.map(({ value, icon: Icon }) => (
              <ToggleGroupItem key={value} value={value} className={segment}>
                <Icon /> {themeLabel[value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <Label htmlFor={`${id}-remember`} className="leading-snug">
              <span className="flex items-center gap-1.5">
                <Bookmark className="size-4" /> {t.rememberPosition}
              </span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {t.rememberPositionHint}
              </span>
            </Label>
            <Switch
              id={`${id}-remember`}
              checked={rememberPosition}
              onCheckedChange={(v) => updateSettings({ rememberPosition: v })}
            />
          </div>
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
