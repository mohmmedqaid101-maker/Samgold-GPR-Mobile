import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin/ai")({
  component: AdminAI,
});

interface UsageRow {
  model: string;
  calls: number;
  tokens_in: number;
  tokens_out: number;
  credits: number;
}

function AdminAI() {
  const { t } = useI18n();
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("admin_ai_usage_summary", { days: 30 });
      setRows((data ?? []) as UsageRow[]);
      setLoading(false);
    })();
  }, []);

  const totals = rows.reduce(
    (a, r) => ({
      calls: a.calls + Number(r.calls),
      tokens_in: a.tokens_in + Number(r.tokens_in),
      tokens_out: a.tokens_out + Number(r.tokens_out),
      credits: a.credits + Number(r.credits),
    }),
    { calls: 0, tokens_in: 0, tokens_out: 0, credits: 0 },
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        {t("admin.ai.usage")}
      </h2>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: t("admin.ai.calls"), value: totals.calls },
              { label: t("admin.ai.tokens_in"), value: totals.tokens_in.toLocaleString() },
              { label: t("admin.ai.tokens_out"), value: totals.tokens_out.toLocaleString() },
              { label: t("admin.ai.credits"), value: totals.credits.toFixed(2) },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="mt-2 text-2xl font-tech font-bold text-gradient-gold">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-start px-4 py-2">{t("admin.ai.model")}</th>
                  <th className="text-end px-4 py-2">{t("admin.ai.calls")}</th>
                  <th className="text-end px-4 py-2">{t("admin.ai.tokens_in")}</th>
                  <th className="text-end px-4 py-2">{t("admin.ai.tokens_out")}</th>
                  <th className="text-end px-4 py-2">{t("admin.ai.credits")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">{t("common.empty")}</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.model} className="border-t border-border/40">
                    <td className="px-4 py-2 font-mono text-xs">{r.model}</td>
                    <td className="px-4 py-2 text-end">{Number(r.calls).toLocaleString()}</td>
                    <td className="px-4 py-2 text-end">{Number(r.tokens_in).toLocaleString()}</td>
                    <td className="px-4 py-2 text-end">{Number(r.tokens_out).toLocaleString()}</td>
                    <td className="px-4 py-2 text-end">{Number(r.credits).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
