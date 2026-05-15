import { createFileRoute } from "@tanstack/react-router";
import { History, Activity as ActivityIcon, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useActivityLog, type Activity } from "@/hooks/useActivityLog";

export const Route = createFileRoute("/_app/activity")({
  component: ActivityLog,
});

const colorMap: Record<Activity["category"], string> = {
  scan: "text-primary bg-primary/10 border-primary/30",
  auth: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  system: "text-accent bg-accent/10 border-accent/30",
  ai: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  payment: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  device: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};

function ActivityLog() {
  const { lang } = useI18n();
  const { items, loading } = useActivityLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <History className="h-6 w-6" /> {lang === "ar" ? "سجل النشاط" : "Activity Log"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "سجل كامل لجميع العمليات (لحظي)" : "Complete log of all operations (realtime)"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-12 text-center">
          <History className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد أنشطة بعد" : "No activity yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur divide-y divide-border/40">
          {items.map((e) => (
            <div key={e.id} className="p-4 flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${colorMap[e.category]}`}>
                <ActivityIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {lang === "ar" ? e.description_ar : e.description_en}
                </div>
                <div className="text-[10px] font-tech text-muted-foreground mt-1">
                  {new Date(e.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
