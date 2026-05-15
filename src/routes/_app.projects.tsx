import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, Plus, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
});

interface Project {
  id: string;
  title: string;
  location: string | null;
  status: string;
  created_at: string;
}

function Projects() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("surveys")
        .select("id,title,location,status,created_at")
        .order("created_at", { ascending: false });
      setItems((data ?? []) as Project[]);
      setLoading(false);
    })();
  }, [user]);

  const statusColor = (s: string) =>
    s === "active" ? "bg-emerald-500/10 text-emerald-400" :
    s === "done" ? "bg-accent/10 text-accent" :
    "bg-muted/40 text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
            <FolderKanban className="h-6 w-6" /> {lang === "ar" ? "المشاريع" : "Projects"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "كل مشاريع المسح الجيوفيزيائي" : "All geophysical survey projects"}
          </p>
        </div>
        <Button asChild className="gradient-gold text-background">
          <Link to="/scanner">
            <Plus className="h-4 w-4" /> {lang === "ar" ? "مشروع جديد" : "New project"}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد مشاريع بعد." : "No projects yet."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold truncate flex-1">{p.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-tech ${statusColor(p.status)}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              {p.location && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {p.location}
                </div>
              )}
              <div className="text-[10px] font-tech text-muted-foreground/70 mt-2">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
