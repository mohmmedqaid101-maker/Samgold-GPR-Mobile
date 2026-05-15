import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, Target as TargetIcon } from "lucide-react";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/frequency")({
  component: FrequencyPage,
});

interface Target {
  id: string;
  name: string;
  target_type: string;
  depth_meters: number | null;
  confidence: number | null;
  frequency_hz: number | null;
  signal_strength: number | null;
  detected_at: string;
}

function FrequencyPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target_type: "metal",
    depth_meters: "",
    confidence: "",
    frequency_hz: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("targets")
      .select("id,name,target_type,depth_meters,confidence,frequency_hz,signal_strength,detected_at")
      .order("detected_at", { ascending: false });
    if (error) toast.error(safeErrorMessage(error));
    setTargets((data as Target[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const create = async () => {
    if (!form.name.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("targets").insert({
      user_id: user.id,
      name: form.name,
      target_type: form.target_type,
      depth_meters: form.depth_meters ? Number(form.depth_meters) : null,
      confidence: form.confidence ? Number(form.confidence) / 100 : null,
      frequency_hz: form.frequency_hz ? Number(form.frequency_hz) : null,
    });
    setSaving(false);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    toast.success(lang === "ar" ? "تمت إضافة الهدف" : "Target added");
    setForm({ name: "", target_type: "metal", depth_meters: "", confidence: "", frequency_hz: "" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("common.confirm.delete"))) return;
    const { error } = await supabase.from("targets").delete().eq("id", id);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    setTargets((s) => s.filter((x) => x.id !== id));
  };

  const typeLabel = (tp: string) =>
    tp === "metal"
      ? t("targets.type.metal")
      : tp === "void"
        ? t("targets.type.void")
        : tp === "structure"
          ? t("targets.type.structure")
          : t("targets.type.unknown");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("targets.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("nav.frequency")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-background">
              <Plus className="h-4 w-4" /> {t("targets.new")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("targets.new")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("targets.field.name")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("targets.field.type")}</Label>
                <Select
                  value={form.target_type}
                  onValueChange={(v) => setForm({ ...form, target_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metal">{t("targets.type.metal")}</SelectItem>
                    <SelectItem value="void">{t("targets.type.void")}</SelectItem>
                    <SelectItem value="structure">{t("targets.type.structure")}</SelectItem>
                    <SelectItem value="unknown">{t("targets.type.unknown")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>{t("targets.field.depth")}</Label>
                  <Input
                    type="number"
                    value={form.depth_meters}
                    onChange={(e) => setForm({ ...form, depth_meters: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("targets.field.confidence")}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.confidence}
                    onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("targets.field.frequency")}</Label>
                  <Input
                    type="number"
                    value={form.frequency_hz}
                    onChange={(e) => setForm({ ...form, frequency_hz: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={create}
                disabled={saving || !form.name.trim()}
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
      ) : targets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {targets.map((tg) => {
            const conf = Math.round((tg.confidence ?? 0) * 100);
            return (
              <div
                key={tg.id}
                className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TargetIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{tg.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {typeLabel(tg.target_type)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(tg.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("targets.field.depth")}</span>
                    <span className="font-tech text-foreground">
                      {tg.depth_meters ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("targets.field.frequency")}</span>
                    <span className="font-tech text-foreground">
                      {tg.frequency_hz ?? "—"}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>{t("targets.field.confidence")}</span>
                      <span className="font-tech text-foreground">{conf}%</span>
                    </div>
                    <Progress value={conf} className="h-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
