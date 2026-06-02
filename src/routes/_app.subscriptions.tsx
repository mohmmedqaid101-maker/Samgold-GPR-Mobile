import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, CreditCard, Crown, Sparkles, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/subscriptions")({
  component: Subscriptions,
});

function Subscriptions() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [current, setCurrent] = useState<"free" | "pro" | "gold">("free");

  // Payments not yet integrated — flip to true after enabling Stripe/Paddle.
  const PAYMENTS_ENABLED = false;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan,status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data?.plan === "pro" || data?.plan === "gold" || data?.plan === "free") {
        setCurrent(data.plan as "free" | "pro" | "gold");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const subscribe = async (id: "free" | "pro" | "gold") => {
    if (!user) {
      toast.error(lang === "ar" ? "يجب تسجيل الدخول أولاً" : "Sign in first");
      return;
    }

    // Free plan can be activated directly (no payment required).
    if (id === "free") {
      setCurrent("free");
      toast.success(lang === "ar" ? "أنت على الباقة المجانية" : "You are on the Free plan");
      return;
    }

    // Paid plans require a real payment provider.
    if (!PAYMENTS_ENABLED) {
      toast.error(
        lang === "ar"
          ? "وسائل الدفع غير متاحة حالياً"
          : "Payment methods are currently unavailable"
      );
      return;
    }

    // When payments are enabled, this would redirect to the checkout session.
    toast.info(lang === "ar" ? "جارٍ تحويلك إلى الدفع..." : "Redirecting to checkout...");
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
        {!PAYMENTS_ENABLED && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">
            <Lock className="h-3.5 w-3.5" />
            {lang === "ar"
              ? "وسائل الدفع غير متاحة حالياً — قريباً"
              : "Payment methods are currently unavailable — coming soon"}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = current === p.id;
          const isPaid = p.id !== "free";
          const disabled = isCurrent || (isPaid && !PAYMENTS_ENABLED);
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
                disabled={disabled}
                onClick={() => subscribe(p.id)}
              >
                {isCurrent
                  ? lang === "ar" ? "الباقة الحالية" : "Current plan"
                  : isPaid && !PAYMENTS_ENABLED
                  ? lang === "ar" ? "غير متاح حالياً" : "Unavailable"
                  : lang === "ar" ? "اشترك الآن" : "Subscribe"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
