import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radar, Crosshair, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ surveys: 0, targets: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, tg, u] = await Promise.all([
        supabase.from("surveys").select("id", { count: "exact", head: true }),
        supabase.from("targets").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
      ]);
      setStats({
        surveys: s.count ?? 0,
        targets: tg.count ?? 0,
        users: u.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: t("admin.stats.total"), value: stats.surveys, Icon: Radar },
    { label: t("admin.stats.targets"), value: stats.targets, Icon: Crosshair },
    { label: t("admin.stats.users"), value: stats.users, Icon: Users },
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{t("admin.dashboard.desc")}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-tech font-bold text-gradient-gold">
              {loading ? <Loader2 className="h-7 w-7 animate-spin text-primary" /> : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
