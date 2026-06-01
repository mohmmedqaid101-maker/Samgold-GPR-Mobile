import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_app/notifications")({
  component: Notifications,
});

function Notifications() {
  const { lang } = useI18n();
  const { items, loading, unreadCount, markAllRead, markRead, remove } = useNotifications();

  const colors: Record<string, string> = {
    info: "bg-accent/10 text-accent border-accent/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    error: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success(lang === "ar" ? "تم تعليم الكل كمقروء" : "All marked as read");
    } catch (e) {
      toast.error(safeErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
            <Bell className="h-6 w-6" /> {lang === "ar" ? "التنبيهات" : "Notifications"}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary text-background text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "آخر التنبيهات والأحداث (لحظي)" : "Latest alerts and events (realtime)"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <Check className="h-4 w-4" /> {lang === "ar" ? "تعليم الكل" : "Mark all read"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-12 text-center">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد تنبيهات بعد" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`rounded-2xl border p-4 backdrop-blur flex gap-3 cursor-pointer transition-all hover:border-primary/50 ${
                n.read ? "border-border/40 bg-card/30" : "border-primary/40 bg-card/60"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${colors[n.notification_type] ?? colors.info}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{lang === "ar" ? n.title_ar : n.title_en}</div>
                {(n.body_ar || n.body_en) && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {lang === "ar" ? n.body_ar : n.body_en}
                  </div>
                )}
                <div className="text-[10px] font-tech text-muted-foreground/70 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
