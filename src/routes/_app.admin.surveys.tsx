import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin/surveys")({
  component: AdminSurveys,
});

interface SurveyRow {
  id: string;
  title: string;
  status: string;
  location: string | null;
  created_at: string;
}

function AdminSurveys() {
  const { t } = useI18n();
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("surveys")
        .select("id,title,status,location,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setRows((data ?? []) as SurveyRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("admin.surveys.title")}</h2>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-start px-4 py-2">Title</th>
                <th className="text-start px-4 py-2">Status</th>
                <th className="text-start px-4 py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-6 text-muted-foreground">{t("common.empty")}</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">{r.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
