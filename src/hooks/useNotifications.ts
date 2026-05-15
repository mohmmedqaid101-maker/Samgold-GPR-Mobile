import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/integrations/supabase/types";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") return [payload.new as Notification, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((n) => (n.id === (payload.new as Notification).id ? (payload.new as Notification) : n));
            if (payload.eventType === "DELETE")
              return prev.filter((n) => n.id !== (payload.old as Notification).id);
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, loading, unreadCount, markAllRead, markRead, remove, refresh: load };
}
