import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useRoles();
  const { t } = useI18n();
  const location = useLocation();

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
      </div>
    );
  }

  const tabs: { to: "/admin" | "/admin/users" | "/admin/surveys" | "/admin/ai"; label: string; exact?: boolean }[] = [
    { to: "/admin", label: t("nav.admin.dashboard"), exact: true },
    { to: "/admin/users", label: t("nav.admin.users") },
    { to: "/admin/surveys", label: t("nav.admin.surveys") },
    { to: "/admin/ai", label: t("nav.admin.ai") },
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
