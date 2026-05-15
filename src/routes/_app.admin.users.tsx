import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, UserPlus, Trash2 } from "lucide-react";
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

interface RoleRow {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
}

function AdminUsers() {
  const { t } = useI18n();
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<RoleRow["role"]>("user");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(safeErrorMessage(error));
    setRows((data ?? []) as RoleRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async () => {
    if (!userId.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
    setSubmitting(false);
    if (error) {
      toast.error(safeErrorMessage(error));
      return;
    }
    toast.success(t("admin.added"));
    setUserId("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
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
            <Input
              id="uid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>
          <div>
            <Label htmlFor="role">{t("admin.role")}</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleRow["role"])}
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

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-start px-4 py-2">User ID</th>
                <th className="text-start px-4 py-2">{t("admin.role")}</th>
                <th className="text-end px-4 py-2">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-muted-foreground">
                    {t("common.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="px-4 py-2 font-mono text-xs break-all">{r.user_id}</td>
                    <td className="px-4 py-2">{r.role}</td>
                    <td className="px-4 py-2 text-end">
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
