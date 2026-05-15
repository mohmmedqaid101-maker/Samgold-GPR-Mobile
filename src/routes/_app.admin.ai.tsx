import { createFileRoute } from "@tanstack/react-router";
import { Cpu } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/admin/ai")({
  component: AdminAI,
});

function AdminAI() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        {t("admin.ai.title")}
      </h2>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 text-sm text-muted-foreground">
        AI model configuration and usage analytics will appear here.
      </div>
    </div>
  );
}
