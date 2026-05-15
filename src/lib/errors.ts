// Map raw backend/DB errors to safe, generic user-facing strings.
// Internal details (Postgres error.message, gateway bodies) must NOT reach the UI.
export function safeErrorMessage(err: unknown, lang: "ar" | "en" = "en"): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";

  if (raw.includes("RATE_LIMIT")) {
    return lang === "ar" ? "تجاوزت الحد. حاول لاحقًا." : "Rate limit reached. Please try again later.";
  }
  if (raw.includes("CREDITS_EXHAUSTED")) {
    return lang === "ar" ? "نفدت الأرصدة." : "Credits exhausted.";
  }
  if (raw === "AI_ERROR") {
    return lang === "ar" ? "تعذّر إجراء التحليل. حاول مجددًا." : "Analysis failed. Please try again.";
  }
  // Log the real reason for developers, never show it to the user.
  if (raw) console.error("[safeErrorMessage]", raw);
  return lang === "ar" ? "حدث خطأ. حاول مجددًا." : "Something went wrong. Please try again.";
}
