import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, MapPin } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/scanner")({
  component: ScannerPage,
});

interface Survey {
  id: string;
  title: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  notes: string | null;
  survey_date: string;
}

function ScannerPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    latitude: "",
    longitude: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surveys")
      .select("id,title,location,latitude,longitude,status,notes,survey_date")
      .order("survey_date", { ascending: false });
    if (error) toast.error(safeErrorMessage(error));
    setSurveys((data as Survey[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const create = async () => {
    if (!form.title.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("surveys").insert({
      user_id: user.id,
      title: form.title,
      location: form.location || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      notes: form.notes || null,
      status: "active",
    });
    setSaving(false);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء المسح" : "Survey created");
    setForm({ title: "", location: "", latitude: "", longitude: "", notes: "" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("common.confirm.delete"))) return;
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    setSurveys((s) => s.filter((x) => x.id !== id));
  };

  const statusLabel = (s: string) =>
    s === "draft"
      ? t("scanner.status.draft")
      : s === "done"
        ? t("scanner.status.done")
        : t("scanner.status.active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("scanner.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("scanner.list")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-background">
              <Plus className="h-4 w-4" /> {t("scanner.new")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("scanner.new")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("scanner.field.title")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("scanner.field.location")}</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("scanner.field.lat")}</Label>
                  <Input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("scanner.field.lng")}</Label>
                  <Input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("scanner.field.notes")}</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
      ) : surveys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {surveys.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{s.title}</h3>
                  {s.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {s.location}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {statusLabel(s.status)}
                </Badge>
              </div>
              {s.notes && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{s.notes}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(s.survey_date).toLocaleDateString()}</span>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
