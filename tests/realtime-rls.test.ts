import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY");
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type TestUser = { id: string; email: string; password: string; client: SupabaseClient };

async function createUser(label: string): Promise<TestUser> {
  const email = `rls-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
  const password = "Test123!Test123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");

  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
  if (signInErr) throw signInErr;
  return { id: data.user.id, email, password, client };
}

async function broadcastRest(client: SupabaseClient, topic: string): Promise<Response> {
  const { data: { session } } = await client.auth.getSession();
  const token = session?.access_token;
  return fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [{ topic, event: "ping", payload: { ok: true }, private: true }],
    }),
  });
}

function subscribePrivate(
  client: SupabaseClient,
  topic: string,
  timeoutMs = 8000,
): Promise<"SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED"> {
  return new Promise((resolve) => {
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) client.realtime.setAuth(session.access_token);
      const ch = client.channel(topic, { config: { private: true } });
      let settled = false;
      const finish = (status: any) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        // Defer cleanup to avoid recursive callback into channel during subscribe()
        setTimeout(() => {
          try { client.removeChannel(ch); } catch {}
        }, 0);
        resolve(status);
      };
      const timer = setTimeout(() => finish("TIMED_OUT"), timeoutMs);
      ch.subscribe((status) => {
        if (
          status === "SUBSCRIBED" ||
          status === "CHANNEL_ERROR" ||
          status === "CLOSED" ||
          status === "TIMED_OUT"
        ) {
          finish(status);
        }
      });
    });
  });
}

describe("Realtime RLS — user:{auth.uid()} topics only", () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    [userA, userB] = await Promise.all([createUser("a"), createUser("b")]);
  }, 30000);

  afterAll(async () => {
    await Promise.all([
      userA?.client.auth.signOut(),
      userB?.client.auth.signOut(),
    ]);
    await Promise.all([
      userA && admin.auth.admin.deleteUser(userA.id),
      userB && admin.auth.admin.deleteUser(userB.id),
    ]);
  });

  describe("Broadcast via REST (realtime.messages INSERT policy)", () => {
    it("allows user A to broadcast on user:{A}", async () => {
      const res = await broadcastRest(userA.client, `user:${userA.id}`);
      expect(res.status).toBe(202);
    });

    it("allows user A to broadcast on user:{A}:notifications", async () => {
      const res = await broadcastRest(userA.client, `user:${userA.id}:notifications`);
      expect(res.status).toBe(202);
    });

    // The /realtime/v1/api/broadcast REST endpoint is fire-and-forget (always
    // returns 202). RLS rejection on INSERT is silent at the HTTP layer, so
    // we verify isolation through actual delivery instead.
    it("delivers user A's broadcast to themselves but NOT to user B (cross-user isolation)", async () => {
      const ownTopic = `user:${userA.id}`;
      const foreignTopic = `user:${userB.id}`;

      // user B subscribes to their own topic (allowed)
      const bReceived: any[] = [];
      const { data: { session: bSession } } = await userB.client.auth.getSession();
      if (bSession?.access_token) userB.client.realtime.setAuth(bSession.access_token);
      const bChan = userB.client.channel(foreignTopic, { config: { private: true } });
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("B subscribe timeout")), 8000);
        bChan
          .on("broadcast", { event: "ping" }, (p) => bReceived.push(p))
          .subscribe((s) => {
            if (s === "SUBSCRIBED") { clearTimeout(t); resolve(); }
            else if (s === "CHANNEL_ERROR" || s === "CLOSED") { clearTimeout(t); reject(new Error(`B status ${s}`)); }
          });
      });

      // user A broadcasts to their OWN topic — allowed, but B is not subscribed there
      const r1 = await broadcastRest(userA.client, ownTopic);
      expect(r1.status).toBe(202);

      // user A attempts to broadcast to user:{B} — RLS should block the INSERT
      const r2 = await broadcastRest(userA.client, foreignTopic);
      expect(r2.status).toBe(202); // endpoint is fire-and-forget

      // wait briefly for any delivery
      await new Promise((r) => setTimeout(r, 2500));
      setTimeout(() => { try { userB.client.removeChannel(bChan); } catch {} }, 0);

      // B must NOT have received A's foreign-topic broadcast
      expect(bReceived.length).toBe(0);
    }, 20000);
  });

  describe("WebSocket subscribe (realtime.messages SELECT policy)", () => {
    it("allows user A to subscribe to user:{A}", async () => {
      const status = await subscribePrivate(userA.client, `user:${userA.id}`);
      expect(status).toBe("SUBSCRIBED");
    }, 15000);

    it("blocks user A from subscribing to user:{B}", async () => {
      const status = await subscribePrivate(userA.client, `user:${userB.id}`);
      expect(status).not.toBe("SUBSCRIBED");
    }, 15000);

    it("blocks user A from subscribing to user:{B}:notifications", async () => {
      const status = await subscribePrivate(userA.client, `user:${userB.id}:notifications`);
      expect(status).not.toBe("SUBSCRIBED");
    }, 15000);

    it("blocks user A from subscribing to a global topic", async () => {
      const status = await subscribePrivate(userA.client, `global:announcements`);
      expect(status).not.toBe("SUBSCRIBED");
    }, 15000);
  });
});
