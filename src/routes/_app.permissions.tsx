import { createFileRoute } from "@tanstack/react-router";
import { Lock, Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRoles } from "@/hooks/useRoles";

export const Route = createFileRoute("/_app/permissions")({
  component: Permissions,
});

function Permissions() {
  const { lang } = useI18n();
  const { isAdmin, isModerator } = useRoles();

  const perms = [
    { ar: "الوصول إلى لوحة التحكم", en: "Dashboard access", granted: true },
    { ar: "تشغيل الماسح الذكي", en: "Smart scanner", granted: true },
    { ar: "تحليل الذكاء الاصطناعي", en: "AI analysis", granted: true },
    { ar: "إنشاء تقارير", en: "Create reports", granted: true },
    { ar: "إدارة المستخدمين", en: "Manage users", granted: isAdmin },
    { ar: "إدارة الاشتراكات", en: "Manage subscriptions", granted: isAdmin },
    { ar: "تعديل إعدادات النظام", en: "System settings", granted: isAdmin || isModerator },
    { ar: "الوصول إلى API", en: "API access", granted: isAdmin },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <Lock className="h-6 w-6" /> {lang === "ar" ? "الصلاحيات" : "Permissions"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "الصلاحيات الممنوحة لحسابك حالياً" : "Permissions currently granted to your account"}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2">
        {perms.map((p) => (
          <div key={p.en} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/20">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                p.granted ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"
              }`}
            >
              {p.granted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <span className="text-sm flex-1">{lang === "ar" ? p.ar : p.en}</span>
            <span className={`text-xs font-tech ${p.granted ? "text-emerald-400" : "text-muted-foreground"}`}>
              {p.granted
                ? lang === "ar" ? "ممنوحة" : "GRANTED"
                : lang === "ar" ? "مرفوضة" : "DENIED"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
