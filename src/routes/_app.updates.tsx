import { createFileRoute } from "@tanstack/react-router";
import { History, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/updates")({
  component: Updates,
});

const releases = [
  { version: "V12.0", date: "2026-04-19", titleAr: "تحديث الواجهة الكاملة", titleEn: "Complete UI overhaul", notesAr: ["لوحة تحكم جديدة بالكامل", "نظام الاشتراكات Pro/Gold", "إدارة الأجهزة والصلاحيات"], notesEn: ["Brand new dashboard", "Pro/Gold subscription tiers", "Device & permissions management"] },
  { version: "V11.4", date: "2026-03-10", titleAr: "تحسينات الذكاء الاصطناعي", titleEn: "AI improvements", notesAr: ["دعم Gemini 2.5 Pro", "تحليل أسرع للأهداف"], notesEn: ["Gemini 2.5 Pro support", "Faster target analysis"] },
  { version: "V11.0", date: "2026-01-22", titleAr: "الخرائط ثلاثية الأبعاد", titleEn: "3D maps", notesAr: ["عرض سينمائي للأهداف", "طبقات جيولوجية تفاعلية"], notesEn: ["Cinematic target view", "Interactive geological layers"] },
];

function Updates() {
  const { lang } = useI18n();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <History className="h-6 w-6" /> {lang === "ar" ? "التحديثات" : "Updates"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "سجل إصدارات SAMGOLD GPR" : "SAMGOLD GPR release log"}
        </p>
      </div>

      <div className="space-y-4">
        {releases.map((r, i) => (
          <div key={r.version} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-lg bg-primary/10 text-primary font-tech font-bold px-3 py-1 text-sm">
                {r.version}
              </span>
              {i === 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {lang === "ar" ? "أحدث إصدار" : "Latest"}
                </span>
              )}
              <span className="text-xs text-muted-foreground ms-auto">{r.date}</span>
            </div>
            <h3 className="font-semibold mb-2">{lang === "ar" ? r.titleAr : r.titleEn}</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc ms-5">
              {(lang === "ar" ? r.notesAr : r.notesEn).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
