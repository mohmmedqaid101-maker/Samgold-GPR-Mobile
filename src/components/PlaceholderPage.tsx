import { Link } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PlaceholderPageProps {
  title: string;
  Icon: LucideIcon;
  backTo?: string;
  backLabel?: string;
}

export function PlaceholderPage({ title, Icon, backTo = "/dashboard", backLabel }: PlaceholderPageProps) {
  const { lang } = useI18n();
  const back = backLabel ?? (lang === "ar" ? "← الرجوع للوحة" : "← Back to Dashboard");
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link to={backTo} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          {back}
        </Link>
      </div>
      <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "هذا القسم قيد التطوير حالياً." : "This section is under active development."}
        </p>
      </div>
    </div>
  );
}
