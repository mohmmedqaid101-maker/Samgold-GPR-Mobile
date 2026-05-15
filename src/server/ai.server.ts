import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const analyzeGeoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string; context?: string }) => {
    if (!input?.prompt || typeof input.prompt !== "string") {
      throw new Error("prompt is required");
    }
    if (input.prompt.length > 4000) throw new Error("prompt too long");
    return {
      prompt: input.prompt.slice(0, 4000),
      context: (input.context ?? "").slice(0, 4000),
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are SAMGOLD GPR, an expert geophysical analysis assistant specializing in Ground Penetrating Radar (GPR), metal detection, and subsurface anomaly interpretation. Provide concise, actionable insights. Reply in the same language as the user.`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    if (data.context) {
      messages.push({ role: "user", content: `Context data:\n${data.context}` });
    }
    messages.push({ role: "user", content: data.prompt });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("CREDITS_EXHAUSTED");
    if (!res.ok) {
      const txt = await res.text();
      // Log full upstream detail server-side only; never propagate to the client.
      console.error("[ai gateway error]", res.status, txt.slice(0, 500));
      throw new Error("AI_ERROR");
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
