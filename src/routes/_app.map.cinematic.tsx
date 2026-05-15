import { createFileRoute } from "@tanstack/react-router";
import { Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export const Route = createFileRoute("/_app/map/cinematic")({
  component: CinematicPage,
});

function CinematicPage() {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Video className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("map.cinematic.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("map.cinematic.desc")}</p>
        </div>
      </div>

      <div className="relative aspect-video rounded-2xl border border-border/60 bg-gradient-to-br from-background via-card to-primary/5 overflow-hidden">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? "opacity-30" : "opacity-100"}`}
        >
          <Button
            size="lg"
            className="gradient-gold text-background"
            onClick={() => setPlaying((p) => !p)}
          >
            <Play className="h-5 w-5" /> {t("map.cinematic.play")}
          </Button>
        </div>
        {playing && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-primary/10 via-transparent to-primary/20" />
        )}
      </div>
    </div>
  );
}
