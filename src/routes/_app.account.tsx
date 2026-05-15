import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/account")({
  component: Account,
});

function Account() {
  const { user, signOut } = useAuth();
  const { t, lang } = useI18n();
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-gradient-gold">{t("nav.account")}</h1>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 space-y-3">
        <div>
          <div className="text-xs text-muted-foreground">{t("auth.email")}</div>
          <div className="font-mono text-sm">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{lang === "ar" ? "المعرّف" : "User ID"}</div>
          <div className="font-mono text-xs break-all text-muted-foreground">{user?.id}</div>
        </div>
        <Button variant="destructive" onClick={() => signOut()}>
          {t("nav.signout")}
        </Button>
      </div>
    </div>
  );
}
