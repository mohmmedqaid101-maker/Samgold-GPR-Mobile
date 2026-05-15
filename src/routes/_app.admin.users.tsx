import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Loader2, UserPlus, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_app/admin/users")({
  component: AdminUsers,
});

interface UserRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  language: string;
  subscription_tier: string;
  role: string;
  created_at: string;
}

type AppRole = "admin" | "moderator" | "user";

function AdminUsers() {
  const { t } = useI18n();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users", { search, max_rows: 100 });
    if (error) toast.error(safeErrorMessage(error));
    setRows((data ?? []) as UserRow[]);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async () => {
    if (!userId.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
    setSubmitting(false);
    if (error) return toast.error(safeErrorMessage(error));
    toast.success(t("admin.added"));
    setUserId("");
    load();
  };

  const removeRole = async (uid: string, r: string) => {
    const role = r.split(",")[0] as AppRole;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
    if (error) toast.error(safeErrorMessage(error));
    else load();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("admin.users.desc")}</p>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> {t("admin.assign")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <Label htmlFor="uid">{t("admin.userId")}</Label>
            <Input id="uid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" />
          </div>
          <div>
            <Label htmlFor="role">{t("admin.role")}</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm w-full"
            >
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={assign} disabled={submitting} className="gradient-gold text-background">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save")}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.users.search")}
          className="ps-10"
        />
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-start px-4 py-2">{t("admin.users.name")}</th>
                <th className="text-start px-4 py-2">{t("admin.role")}</th>
                <th className="text-start px-4 py-2">{t("admin.users.tier")}</th>
                <th className="text-start px-4 py-2">{t("admin.users.joined")}</th>
                <th className="text-end px-4 py-2">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">{t("common.empty")}</td></tr>
              ) : rows.map((r) => (
                <tr key={r.user_id} className="border-t border-border/40">
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.display_name || "—"}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r.user_id}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.role.includes("admin") ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">{r.subscription_tier}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-end">
                    <Button size="sm" variant="ghost" onClick={() => removeRole(r.user_id, r.role)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
