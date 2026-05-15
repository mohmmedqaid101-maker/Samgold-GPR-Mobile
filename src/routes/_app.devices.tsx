import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HardDrive, Wifi, WifiOff, Plus, Battery, Trash2, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { useDevices, type Device } from "@/hooks/useDevices";
import { logActivity } from "@/hooks/useActivityLog";
import { useAuth } from "@/lib/auth";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_app/devices")({
  component: Devices,
});

function Devices() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { items, loading, add, remove } = useDevices();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState("SAMGOLD X-500");
  const [serial, setSerial] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSubmitting(true);
    try {
      await add({
        name: name.trim(),
        model: model.trim() || "SAMGOLD X-500",
        serial_number: serial.trim() || null,
        status: "online",
        battery_level: 100,
      });
      await logActivity(
        user.id,
        `تمت إضافة الجهاز ${name}`,
        `Device ${name} added`,
        "device"
      );
      toast.success(lang === "ar" ? "تمت إضافة الجهاز" : "Device added");
      setName("");
      setSerial("");
      setOpen(false);
    } catch (err) {
      toast.error(safeErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (d: Device) => {
    try {
      await remove(d.id);
      if (user) {
        await logActivity(
          user.id,
          `تم حذف الجهاز ${d.name}`,
          `Device ${d.name} removed`,
          "device"
        );
      }
      toast.success(lang === "ar" ? "تم حذف الجهاز" : "Device removed");
    } catch (err) {
      toast.error(safeErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
            <HardDrive className="h-6 w-6" /> {lang === "ar" ? "الأجهزة" : "Devices"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة أجهزة المسح المتصلة (محمية بـ RLS)" : "Manage connected scanner devices (RLS-protected)"}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-gold text-background">
          <Plus className="h-4 w-4" /> {lang === "ar" ? "إضافة جهاز" : "Add device"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-12 text-center">
          <HardDrive className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد أجهزة بعد. أضف جهازك الأول." : "No devices yet. Add your first one."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  {d.status === "online" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <Wifi className="h-3.5 w-3.5" /> {lang === "ar" ? "متصل" : "Online"}
                    </span>
                  ) : d.status === "maintenance" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                      <Wrench className="h-3.5 w-3.5" /> {lang === "ar" ? "صيانة" : "Maintenance"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <WifiOff className="h-3.5 w-3.5" /> {lang === "ar" ? "غير متصل" : "Offline"}
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(d)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.model}</div>
                {d.serial_number && (
                  <div className="text-[10px] font-tech text-muted-foreground/70 mt-0.5">
                    SN: {d.serial_number}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Battery className="h-4 w-4 text-primary" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-gold" style={{ width: `${d.battery_level}%` }} />
                </div>
                <span className="font-tech text-muted-foreground">{d.battery_level}%</span>
              </div>
              <div className="text-[10px] font-tech text-muted-foreground/70">
                {lang === "ar" ? "آخر اتصال: " : "Last seen: "}
                {new Date(d.last_seen_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{lang === "ar" ? "إضافة جهاز جديد" : "Add new device"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">{lang === "ar" ? "اسم الجهاز" : "Device name"}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
              </div>
              <div>
                <Label htmlFor="model">{lang === "ar" ? "الموديل" : "Model"}</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} maxLength={80} />
              </div>
              <div>
                <Label htmlFor="serial">{lang === "ar" ? "الرقم التسلسلي" : "Serial number"}</Label>
                <Input id="serial" value={serial} onChange={(e) => setSerial(e.target.value)} maxLength={80} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={submitting} className="gradient-gold text-background">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === "ar" ? "إضافة" : "Add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
