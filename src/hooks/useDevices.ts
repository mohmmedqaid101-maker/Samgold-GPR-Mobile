import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/integrations/supabase/types";

export type Device = Database["public"]["Tables"]["devices"]["Row"];
export type DeviceInsert = Database["public"]["Tables"]["devices"]["Insert"];

export function useDevices() {
  const { user } = useAuth();
  const [items, setItems] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("devices")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`devices:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "devices", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const add = useCallback(
    async (input: Omit<DeviceInsert, "user_id">) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("devices")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    [user]
  );

  const update = useCallback(async (id: string, patch: Partial<Device>) => {
    const { error } = await supabase.from("devices").update(patch).eq("id", id);
    if (error) throw error;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) throw error;
  }, []);

  return { items, loading, add, update, remove, refresh: load };
}
