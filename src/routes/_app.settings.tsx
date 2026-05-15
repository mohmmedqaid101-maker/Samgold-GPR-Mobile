import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

const STORAGE_KEY = "samgold.gpr.settings";

interface GprSettings {
  frequency: number;
  depth: number;
  velocity: number;
  gain: number;
}

const DEFAULTS: GprSettings = { frequency: 400, depth: 10, velocity: 0.1, gain: 30 };

function SettingsPage() {
  const { t } = useI18n();
  const [s, setS] = useState<GprSettings>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    toast.success(t("settings.saved"));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.desc")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 space-y-4">
        {(
          [
            ["frequency", t("settings.frequency"), 1, 5000],
            ["depth", t("settings.depth"), 0.5, 100],
            ["velocity", t("settings.velocity"), 0.01, 0.3],
            ["gain", t("settings.gain"), 0, 100],
          ] as const
        ).map(([key, label, min, max]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type="number"
              step="any"
              min={min}
              max={max}
              value={s[key]}
              onChange={(e) => setS({ ...s, [key]: Number(e.target.value) })}
            />
          </div>
        ))}
        <Button onClick={save} className="gradient-gold text-background w-full">
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
