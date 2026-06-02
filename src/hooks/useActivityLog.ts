import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/integrations/supabase/types";

export type Activity = Database["public"]["Tables"]["activity_log"]["Row"];

export function useActivityLog() {
  const { user } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`activity:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { items, loading, refresh: load };
}

export async function logActivity(
  userId: string,
  ar: string,
  en: string,
  category: Activity["category"] = "system",
  metadata?: Record<string, unknown>
) {
  // userId is implicit (server-side from auth.uid()) — kept in signature for compatibility
  void userId;
  await supabase.rpc("log_activity", {
    _description_ar: ar,
    _description_en: en,
    _category: category,
    _metadata: (metadata ?? null) as never,
  });
}
