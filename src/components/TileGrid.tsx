import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface Tile {
  label: string;
  Icon: LucideIcon;
  to: string;
  badge?: string;
}

export function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5">
      {tiles.map(({ label, Icon, to, badge }) => (
        <Link
          key={to + label}
          to={to}
          className="group relative rounded-3xl bg-card/95 hover:bg-card transition-all p-6 sm:p-7 min-h-[160px] flex flex-col items-center justify-center text-center border border-border/40 hover:border-primary/50 hover:shadow-gold"
        >
          {badge && (
            <span className="absolute top-3 end-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 font-tech">
              {badge}
            </span>
          )}
          <div className="h-14 w-14 rounded-2xl bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
            <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
          </div>
          <div className="text-[15px] font-semibold text-foreground">{label}</div>
        </Link>
      ))}
    </div>
  );
}
