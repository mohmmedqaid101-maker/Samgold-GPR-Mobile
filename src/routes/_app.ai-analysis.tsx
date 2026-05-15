import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Loader2, Send, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeGeoData } from "@/lib/ai.server";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/ai-analysis")({
  component: AiAnalysisPage,
});

function AiAnalysisPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const submit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(lang === "ar" ? "يجب تسجيل الدخول" : "You must be signed in");
      const res = await analyzeGeoData({
        data: { prompt, context },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setResult(res.content);
      // Log usage (best-effort, ignore errors)
      if (user) {
        await supabase.from("ai_usage_log").insert({
          user_id: user.id,
          model: "google/gemini-2.5-flash",
          endpoint: "analyzeGeoData",
          tokens_input: Math.ceil((prompt.length + context.length) / 4),
          tokens_output: Math.ceil(res.content.length / 4),
        });
      }
    } catch (e) {
      const { safeErrorMessage } = await import("@/lib/errors");
      toast.error(safeErrorMessage(e, lang));
    } finally {
      setLoading(false);
    }
  };

  const saveAsReport = async () => {
    if (!result || !user) return;
    setSavingReport(true);
    const title = prompt.slice(0, 80) || (lang === "ar" ? "تحليل AI" : "AI Analysis");
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      title,
      report_type: "ai",
      summary: result.slice(0, 300),
      content: `Q: ${prompt}\n\n${context ? `Context: ${context}\n\n` : ""}A: ${result}`,
    });
    setSavingReport(false);
    if (error) {
      toast.error(lang === "ar" ? "فشل الحفظ" : "Failed to save");
      return;
    }
    toast.success(lang === "ar" ? "تم الحفظ في التقارير" : "Saved to reports");
  };

  const examples =
    lang === "ar"
      ? [
          "حلّل قراءة 2.4 GHz بعمق 1.5م مع شذوذ قوي.",
          "ما الفرق بين إشارة معدن وإشارة تجويف في الـ GPR؟",
          "اقترح إعدادات مسح للبحث عن قطع ذهبية على عمق 50 سم.",
        ]
      : [
          "Analyze a 2.4 GHz reading at 1.5m depth with strong anomaly.",
          "Difference between a metal signature and void in GPR?",
          "Suggest scan settings to find gold artifacts at 50cm depth.",
        ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
          <Brain className="h-6 w-6 text-background" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("nav.ai")}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "مدعوم بـ Gemini عبر Lovable AI"
              : "Powered by Gemini via Lovable AI"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-3">
        <Textarea
          placeholder={
            lang === "ar"
              ? "اكتب سؤالك أو وصف القراءات..."
              : "Describe your readings or ask a question..."
          }
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Textarea
          placeholder={
            lang === "ar"
              ? "بيانات إضافية (اختياري): قراءات، إحداثيات، ترددات..."
              : "Optional context: readings, coordinates, frequencies..."
          }
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(ex)}
                className="text-xs px-2 py-1 rounded-full border border-border/60 hover:border-primary/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="h-3 w-3 inline mr-1" />
                {ex.slice(0, 40)}…
              </button>
            ))}
          </div>
          <Button
            onClick={submit}
            disabled={loading || !prompt.trim()}
            className="gradient-gold text-background"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {lang === "ar" ? "تحليل" : "Analyze"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-primary/30 bg-card/60 backdrop-blur p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              {lang === "ar" ? "نتيجة التحليل" : "Analysis result"}
            </div>
            <Button size="sm" variant="outline" onClick={saveAsReport} disabled={savingReport}>
              {savingReport ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {lang === "ar" ? "حفظ كتقرير" : "Save as report"}
            </Button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
