import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/map/layers")({
  component: LayersPage,
});

const SAMPLE_LAYERS = [
  { name: "Topsoil", from: 0, to: 0.5, color: "oklch(0.6 0.15 60)" },
  { name: "Sandy Loam", from: 0.5, to: 2.0, color: "oklch(0.55 0.12 50)" },
  { name: "Clay", from: 2.0, to: 4.5, color: "oklch(0.45 0.08 30)" },
  { name: "Bedrock", from: 4.5, to: 10, color: "oklch(0.35 0.04 250)" },
];

function LayersPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("map.layers.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("map.layers.desc")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6">
        <div className="space-y-2">
          {SAMPLE_LAYERS.map((l) => {
            const height = (l.to - l.from) * 30;
            return (
              <div key={l.name} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium">{l.name}</div>
                <div
                  className="flex-1 rounded-md flex items-center justify-between px-3 text-xs font-mono text-background"
                  style={{ background: l.color, height: `${Math.max(height, 32)}px` }}
                >
                  <span>{l.from} m</span>
                  <span>{l.to} m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
