import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CreditCard, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/subscriptions")({
  component: Subscriptions,
});

function Subscriptions() {
  const { lang } = useI18n();
  const [current, setCurrent] = useState<"free" | "pro" | "gold">("free");

  const plans = [
    {
      id: "free" as const,
      name: lang === "ar" ? "مجاني" : "Free",
      price: lang === "ar" ? "0 ر.س" : "$0",
      Icon: Sparkles,
      features: lang === "ar"
        ? ["لوحة المعلومات", "3 مسوحات شهرياً", "تقارير أساسية"]
        : ["Dashboard access", "3 surveys / month", "Basic reports"],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: lang === "ar" ? "99 ر.س / شهر" : "$29 / mo",
      Icon: Zap,
      highlight: true,
      features: lang === "ar"
        ? ["مسح غير محدود", "تحليل بالذكاء الاصطناعي", "خرائط ثلاثية الأبعاد", "دعم سريع"]
        : ["Unlimited scans", "AI analysis", "3D maps", "Priority support"],
    },
    {
      id: "gold" as const,
      name: "Gold",
      price: lang === "ar" ? "299 ر.س / شهر" : "$99 / mo",
      Icon: Crown,
      features: lang === "ar"
        ? ["كل مزايا Pro", "API مخصص", "تخزين 1TB", "مدير حساب مخصص", "تكامل مع الأجهزة"]
        : ["Everything in Pro", "Custom API", "1 TB storage", "Dedicated manager", "Device integrations"],
    },
  ];

  const subscribe = (id: "free" | "pro" | "gold") => {
    setCurrent(id);
    toast.success(lang === "ar" ? `تم تفعيل باقة ${id.toUpperCase()}` : `${id.toUpperCase()} plan activated`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <CreditCard className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-3xl font-bold text-gradient-gold">
          {lang === "ar" ? "الاشتراكات" : "Subscriptions"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {lang === "ar"
            ? "اختر الباقة المناسبة لاحتياجات المسح الجيوفيزيائي"
            : "Pick the plan that fits your geophysical survey needs"}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = current === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-3xl border p-6 backdrop-blur transition-all ${
                p.highlight
                  ? "border-primary bg-card shadow-gold scale-[1.02]"
                  : "border-border/60 bg-card/40"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <p.Icon className="h-6 w-6 text-primary" />
                </div>
                {p.highlight && (
                  <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 font-tech">
                    {lang === "ar" ? "الأكثر شيوعاً" : "POPULAR"}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="text-2xl font-tech font-bold mt-1 text-gradient-gold">{p.price}</div>
              <ul className="space-y-2 mt-5 mb-6 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${p.highlight ? "gradient-gold text-background" : ""}`}
                variant={p.highlight ? "default" : "outline"}
                disabled={isCurrent}
                onClick={() => subscribe(p.id)}
              >
                {isCurrent
                  ? lang === "ar" ? "الباقة الحالية" : "Current plan"
                  : lang === "ar" ? "اشترك الآن" : "Subscribe"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
