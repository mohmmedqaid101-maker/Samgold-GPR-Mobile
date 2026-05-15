import { Diamond } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { lang } = useI18n();
  const dim = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="flex items-center gap-2">
      <div className={`${dim} rounded-lg gradient-gold flex items-center justify-center shadow-gold`}>
        <Diamond className="h-1/2 w-1/2 text-background" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className={`font-tech font-black tracking-wider ${text}`}>SAMGOLD</div>
        <div className="text-[10px] text-muted-foreground tracking-[0.2em]">
          {lang === "ar" ? "جي بي آر" : "GPR"}
        </div>
      </div>
    </div>
  );
}
