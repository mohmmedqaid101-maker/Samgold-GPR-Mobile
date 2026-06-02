import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Subscribe FIRST to avoid missing events
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "SIGNED_IN" && s?.user) {
        const key = `session-alert:${s.user.id}:${s.access_token.slice(-12)}`;
        if (typeof window !== "undefined" && !window.localStorage.getItem(key)) {
          window.localStorage.setItem(key, "1");
          // fire-and-forget; respects the user's session_alerts_enabled flag
          (async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("session_alerts_enabled")
              .eq("user_id", s.user.id)
              .maybeSingle();
            if (profile?.session_alerts_enabled) {
              await supabase.from("notifications").insert({
                user_id: s.user.id,
                title_ar: "تسجيل دخول جديد",
                title_en: "New sign-in",
                body_ar: `تم تسجيل الدخول من ${navigator.userAgent.slice(0, 80)}`,
                body_en: `Sign-in from ${navigator.userAgent.slice(0, 80)}`,
                notification_type: "info",
              });
            }
          })().catch(() => {});
        }
      }
    });

    // 2) Then load existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, loading, signOut }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
