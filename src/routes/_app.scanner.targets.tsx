import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/scanner/targets")({
  component: TargetsPage,
});

interface Target {
  id: string;
  name: string;
  target_type: string;
  depth_meters: number | null;
  confidence: number | null;
  frequency_hz: number | null;
}

function TargetsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("targets")
        .select("id,name,target_type,depth_meters,confidence,frequency_hz")
        .order("detected_at", { ascending: false })
        .limit(100);
      setItems((data ?? []) as Target[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Crosshair className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gradient-gold">{t("targets.title")}</h1>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-8 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4 hover:border-primary/60 transition-colors"
            >
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{it.target_type}</div>
              <div className="mt-3 space-y-1 text-xs font-mono">
                <div>{t("targets.field.depth")}: {it.depth_meters ?? "—"}</div>
                <div>{t("targets.field.confidence")}: {it.confidence ?? "—"}</div>
                <div>{t("targets.field.frequency")}: {it.frequency_hz ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
