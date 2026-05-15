import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LangToggle({ className }: { className?: string }) {
  const { toggle, t } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className={className}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span className="font-tech text-xs">{t("common.lang")}</span>
    </Button>
  );
}
