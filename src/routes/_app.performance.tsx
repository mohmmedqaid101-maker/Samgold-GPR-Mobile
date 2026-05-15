import { createFileRoute } from "@tanstack/react-router";
import { Zap, Cpu, Database, Wifi, Activity } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/performance")({
  component: Performance,
});

function Performance() {
  const { lang } = useI18n();
  const metrics = [
    { Icon: Cpu, labelAr: "استخدام المعالج", labelEn: "CPU usage", value: 34, unit: "%", color: "text-primary" },
    { Icon: Database, labelAr: "استخدام التخزين", labelEn: "Storage used", value: 28, unit: "%", color: "text-accent" },
    { Icon: Wifi, labelAr: "زمن الاستجابة", labelEn: "Network latency", value: 47, unit: "ms", color: "text-emerald-400" },
    { Icon: Activity, labelAr: "العمليات النشطة", labelEn: "Active operations", value: 3, unit: "", color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <Zap className="h-6 w-6" /> {lang === "ar" ? "الأداء" : "Performance"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "مراقبة الأداء في الوقت الحقيقي" : "Real-time performance monitoring"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((m) => (
          <div key={m.labelEn} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {lang === "ar" ? m.labelAr : m.labelEn}
              </span>
              <m.Icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <div className={`text-3xl font-tech font-bold ${m.color}`}>
              {m.value}
              <span className="text-base text-muted-foreground ms-1">{m.unit}</span>
            </div>
            {m.unit === "%" && (
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-gold" style={{ width: `${m.value}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
