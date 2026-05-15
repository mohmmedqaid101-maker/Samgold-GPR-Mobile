import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin/activity")({
  component: AdminActivity,
});

interface ActivityRow {
  id: string;
  user_id: string;
  category: string;
  description_en: string;
  description_ar: string;
  created_at: string;
}

function AdminActivity() {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_log")
        .select("id,user_id,category,description_en,description_ar,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data ?? []) as ActivityRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5 text-primary" /> {t("admin.activity.title")}
      </h2>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-muted-foreground">
          {t("admin.activity.empty")}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-start px-4 py-2">{t("admin.users.joined")}</th>
                <th className="text-start px-4 py-2">User</th>
                <th className="text-start px-4 py-2">Category</th>
                <th className="text-start px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{r.category}</span></td>
                  <td className="px-4 py-2">{lang === "ar" ? r.description_ar : r.description_en}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
