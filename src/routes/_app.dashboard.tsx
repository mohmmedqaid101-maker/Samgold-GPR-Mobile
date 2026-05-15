import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Radar, Brain, FileText, Map as MapIcon, Crosshair, Compass,
  Settings as SettingsIcon, LayoutDashboard, CreditCard, Users, Cpu,
  Database, HardDrive, Bell, History, Zap, ShieldCheck, Lock,
  FolderKanban, Globe, ScanLine, Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { TileGrid, type Tile } from "@/components/TileGrid";
import { StatusBar } from "@/components/StatusBar";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

type TabKey = "mission" | "targets" | "field";

function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { isAdmin } = useRoles();
  const [tab, setTab] = useState<TabKey>("mission");
  const [counts, setCounts] = useState({ surveys: 0, targets: 0, reports: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, tg, r] = await Promise.all([
        supabase.from("surveys").select("id", { count: "exact", head: true }),
        supabase.from("targets").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ surveys: s.count ?? 0, targets: tg.count ?? 0, reports: r.count ?? 0 });
    })();
  }, [user]);

  const missionTiles: Tile[] = [
    { label: t("tile.security"), Icon: ShieldCheck, to: "/security" },
    { label: t("tile.globalmap"), Icon: Globe, to: "/map" },
    { label: t("tile.updates"), Icon: History, to: "/updates" },
    { label: t("tile.notifications"), Icon: Bell, to: "/notifications" },
    { label: t("tile.projects"), Icon: FolderKanban, to: "/projects" },
    { label: t("tile.permissions"), Icon: Lock, to: "/permissions" },
    { label: t("tile.activity"), Icon: History, to: "/activity" },
    { label: t("tile.performance"), Icon: Zap, to: "/performance" },
    { label: t("tile.data"), Icon: Database, to: "/data" },
    { label: t("tile.devices"), Icon: HardDrive, to: "/devices" },
  ];

  const targetTiles: Tile[] = [
    { label: t("tile.systemadmin"), Icon: SettingsIcon, to: "/settings" },
    { label: t("tile.controlpanel"), Icon: LayoutDashboard, to: "/dashboard" },
    { label: t("tile.subscriptions"), Icon: CreditCard, to: "/subscriptions" },
    { label: t("tile.users"), Icon: Users, to: isAdmin ? "/admin/users" : "/account" },
    { label: t("tile.ai"), Icon: Cpu, to: "/ai-analysis" },
    { label: t("tile.scans"), Icon: ScanLine, to: "/scanner/targets", badge: counts.targets ? String(counts.targets) : undefined },
    { label: t("tile.data"), Icon: Database, to: "/data" },
    { label: t("tile.devices"), Icon: HardDrive, to: "/devices" },
    { label: t("tile.security"), Icon: ShieldCheck, to: "/security" },
    { label: t("tile.permissions"), Icon: Lock, to: "/permissions" },
  ];

  const fieldTiles: Tile[] = [
    { label: t("nav.scanner"), Icon: Radar, to: "/scanner", badge: counts.surveys ? String(counts.surveys) : undefined },
    { label: t("nav.scanner.receive"), Icon: ScanLine, to: "/scanner/receive" },
    { label: t("nav.scanner.targets"), Icon: Crosshair, to: "/scanner/targets" },
    { label: t("nav.frequency"), Icon: Compass, to: "/frequency" },
    { label: t("nav.ai"), Icon: Brain, to: "/ai-analysis" },
    { label: t("nav.map.layers"), Icon: MapIcon, to: "/map/layers" },
    { label: t("nav.map.cinematic"), Icon: MapIcon, to: "/map/cinematic" },
    { label: t("nav.reports"), Icon: FileText, to: "/reports", badge: counts.reports ? String(counts.reports) : undefined },
  ];

  const tiles = tab === "mission" ? missionTiles : tab === "targets" ? targetTiles : fieldTiles;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "mission", label: lang === "ar" ? "خريطة المهمة" : "Mission Map" },
    { key: "targets", label: lang === "ar" ? "قائمة الأهداف" : "Targets List" },
    { key: "field", label: lang === "ar" ? "التحليل الميداني" : "Field Analysis" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            <span className="text-gradient-gold font-tech">GPR</span>{" "}
            <span className="font-tech">{lang === "ar" ? "سام جولد" : "SAMGOLD"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-tech tracking-wider">
            {lang === "ar" ? "نظام تحليل الخرائط المتقدم V12.0" : "Advanced Map Analysis System V12.0"}
          </p>
        </div>
        <Button asChild size="sm" className="gradient-gold text-background font-bold shrink-0">
          <Link to="/scanner/receive">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dash.quick.scan")}</span>
          </Link>
        </Button>
      </div>

      {/* Tab switcher (RTL: rightmost is "first") */}
      <div className="rounded-2xl bg-muted/30 border border-border/40 p-1.5 flex">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all ${
              tab === tb.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tile grid */}
      <TileGrid tiles={tiles} />

      <StatusBar />
    </div>
  );
}
