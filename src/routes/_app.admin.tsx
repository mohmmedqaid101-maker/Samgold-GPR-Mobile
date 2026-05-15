import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_app/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useRoles();
  const { t } = useI18n();
  const location = useLocation();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (loading || isAdmin) return;
    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      setAdminExists((count ?? 0) > 0);
    })();
  }, [loading, isAdmin]);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) return toast.error(safeErrorMessage(error));
    if (data === true) {
      toast.success(t("admin.claim.ok"));
      window.location.reload();
    } else {
      toast.error(t("admin.claim.taken"));
      setAdminExists(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">{t("admin.denied")}</h2>
        {adminExists === false && (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 space-y-3 text-start">
            <h3 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {t("admin.claim.title")}
            </h3>
            <p className="text-sm text-muted-foreground">{t("admin.claim.desc")}</p>
            <Button onClick={claim} disabled={claiming} className="gradient-gold text-background w-full">
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.claim.btn")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const tabs: { to: "/admin" | "/admin/users" | "/admin/surveys" | "/admin/ai" | "/admin/activity"; label: string; exact?: boolean }[] = [
    { to: "/admin", label: t("nav.admin.dashboard"), exact: true },
    { to: "/admin/users", label: t("nav.admin.users") },
    { to: "/admin/surveys", label: t("nav.admin.surveys") },
    { to: "/admin/ai", label: t("nav.admin.ai") },
    { to: "/admin/activity", label: t("nav.admin.activity") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gradient-gold">{t("admin.title")}</h1>
      <div className="flex gap-2 border-b border-border/60 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
