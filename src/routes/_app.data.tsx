import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Database, FileText, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_app/data")({
  component: DataPage,
});

interface Survey {
  id: string;
  title: string;
  location: string | null;
  status: string;
  created_at: string;
}

function DataPage() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const [rows, setRows] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("surveys")
      .select("id,title,location,status,created_at")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Survey[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف هذه البيانات؟" : "Delete this record?")) return;
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (error) toast.error(safeErrorMessage(error));
    else {
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <Database className="h-6 w-6" /> {lang === "ar" ? "البيانات" : "Data"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "جميع المسوحات المخزنة في حسابك" : "All surveys stored in your account"}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {lang === "ar" ? "لا توجد بيانات بعد." : "No data yet."}{" "}
            <Link to="/scanner/receive" className="text-primary hover:underline">
              {lang === "ar" ? "ارفع أول ملف" : "Upload your first file"}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-muted/20">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.location ?? "—"} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-muted/40">{r.status}</span>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
