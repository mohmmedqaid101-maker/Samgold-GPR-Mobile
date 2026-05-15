import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, FileText, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { printReportAsPDF } from "@/lib/pdf";
import { analyzeGeoData } from "@/lib/ai.server";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

interface Report {
  id: string;
  title: string;
  report_type: string;
  summary: string | null;
  content: string | null;
  created_at: string;
}

function ReportsPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    report_type: "analysis",
    summary: "",
    content: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("id,title,report_type,summary,content,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(safeErrorMessage(error));
    setReports((data as Report[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const create = async () => {
    if (!form.title.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      title: form.title,
      report_type: form.report_type,
      summary: form.summary || null,
      content: form.content || null,
    });
    setSaving(false);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء التقرير" : "Report created");
    setForm({ title: "", report_type: "analysis", summary: "", content: "" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("common.confirm.delete"))) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    setReports((r) => r.filter((x) => x.id !== id));
  };

  const exportPdf = (r: Report) => {
    printReportAsPDF({
      title: r.title,
      lang,
      meta: {
        [lang === "ar" ? "النوع" : "Type"]: typeLabel(r.report_type),
        [lang === "ar" ? "تاريخ الإنشاء" : "Created"]: new Date(r.created_at).toLocaleString(lang),
      },
      summary: r.summary,
      content: r.content,
    });
  };

  const generateAiReport = async (r: Report) => {
    if (!user) return;
    setAiBusy(r.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("auth");
      const prompt =
        lang === "ar"
          ? `لخّص واستنتج توصيات احترافية للتقرير التالي بصيغة نقاط واضحة.`
          : `Summarize and produce professional recommendations for the following report as clear bullet points.`;
      const ctx = `${r.title}\n\n${r.summary ?? ""}\n\n${r.content ?? ""}`;
      const res = await analyzeGeoData({
        data: { prompt, context: ctx },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const newSummary = res.content.slice(0, 600);
      const { error } = await supabase
        .from("reports")
        .update({ summary: newSummary, content: `${r.content ?? ""}\n\n— AI —\n${res.content}` })
        .eq("id", r.id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم تحديث التقرير بـ AI" : "Report enriched by AI");
      load();
    } catch (e) {
      toast.error(safeErrorMessage(e, lang));
    } finally {
      setAiBusy(null);
    }
  };

  const typeLabel = (tp: string) =>
    tp === "field"
      ? t("reports.type.field")
      : tp === "ai"
        ? t("reports.type.ai")
        : t("reports.type.analysis");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("reports.title")}</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-background">
              <Plus className="h-4 w-4" /> {t("reports.new")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("reports.new")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("reports.field.title")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.field.type")}</Label>
                <Select
                  value={form.report_type}
                  onValueChange={(v) => setForm({ ...form, report_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analysis">{t("reports.type.analysis")}</SelectItem>
                    <SelectItem value="field">{t("reports.type.field")}</SelectItem>
                    <SelectItem value="ai">{t("reports.type.ai")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("reports.field.summary")}</Label>
                <Textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.field.content")}</Label>
                <Textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={create}
                disabled={saving || !form.title.trim()}
                className="gradient-gold text-background"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{r.title}</h3>
                    <Badge variant="secondary">{typeLabel(r.report_type)}</Badge>
                  </div>
                  {r.summary && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.summary}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => generateAiReport(r)}
                        disabled={aiBusy === r.id}
                        title={lang === "ar" ? "إثراء بـ AI" : "Enrich with AI"}
                      >
                        {aiBusy === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportPdf(r)}
                        title={lang === "ar" ? "تصدير PDF" : "Export PDF"}
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
