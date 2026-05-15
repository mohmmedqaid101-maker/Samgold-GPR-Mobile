import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, KeyRound, Eye, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export const Route = createFileRoute("/_app/security")({
  component: Security,
});

function Security() {
  const { lang } = useI18n();
  const [twoFA, setTwoFA] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [sessions, setSessions] = useState(true);

  const items = [
    {
      Icon: KeyRound,
      titleAr: "المصادقة الثنائية",
      titleEn: "Two-factor authentication",
      descAr: "طبقة أمان إضافية عند تسجيل الدخول",
      descEn: "Extra security layer on sign-in",
      value: twoFA,
      set: setTwoFA,
    },
    {
      Icon: Smartphone,
      titleAr: "البصمة الحيوية",
      titleEn: "Biometric login",
      descAr: "استخدم بصمة الإصبع أو الوجه",
      descEn: "Use fingerprint or face unlock",
      value: biometric,
      set: setBiometric,
    },
    {
      Icon: Eye,
      titleAr: "تنبيهات الجلسات",
      titleEn: "Session alerts",
      descAr: "إشعار عند تسجيل دخول جديد",
      descEn: "Alert on new sign-in",
      value: sessions,
      set: setSessions,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> {lang === "ar" ? "الأمان" : "Security"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "إعدادات الأمان وحماية الحساب" : "Security settings and account protection"}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-3">
        <Lock className="h-5 w-5 text-emerald-400" />
        <div>
          <div className="font-semibold text-emerald-400 text-sm">
            {lang === "ar" ? "حسابك محمي" : "Your account is protected"}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "ar" ? "آخر فحص أمني: اليوم" : "Last security scan: today"}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.titleEn} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <it.Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{lang === "ar" ? it.titleAr : it.titleEn}</div>
              <div className="text-xs text-muted-foreground">{lang === "ar" ? it.descAr : it.descEn}</div>
            </div>
            <Switch checked={it.value} onCheckedChange={it.set} />
          </div>
        ))}
      </div>
    </div>
  );
}
