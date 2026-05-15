import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Map, ShieldCheck, Radar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LangToggle } from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-40 bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LangToggle />
            {user ? (
              <Button asChild className="gradient-gold text-background hover:opacity-90">
                <Link to="/dashboard">{t("nav.dashboard")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">{t("landing.cta.signin")}</Link>
                </Button>
                <Button asChild className="gradient-gold text-background hover:opacity-90">
                  <Link to="/auth">{t("landing.cta.start")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 start-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 end-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-tech tracking-wider text-primary mb-8">
            <Radar className="h-3.5 w-3.5" />
            SAMGOLD GPR · V12.0
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-gradient-gold">{t("landing.hero.title")}</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            {t("landing.hero.sub")}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="gradient-gold text-background hover:opacity-90 shadow-gold">
              <Link to={user ? "/dashboard" : "/auth"}>
                {t("landing.cta.start")}
                <Arrow className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground font-tech tracking-wider">
              {t("brand.tagline")}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { Icon: Brain, t: "landing.feat.ai.t", d: "landing.feat.ai.d" },
            { Icon: Map, t: "landing.feat.map.t", d: "landing.feat.map.d" },
            { Icon: ShieldCheck, t: "landing.feat.sec.t", d: "landing.feat.sec.d" },
          ].map(({ Icon, t: tk, d }) => (
            <div
              key={tk}
              className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 hover:border-primary/40 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center mb-4 shadow-gold">
                <Icon className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-lg font-semibold">{t(tk)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(d)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-muted-foreground font-tech tracking-wider">
          © {new Date().getFullYear()} SAMGOLD GPR · {t("brand.tagline")}
        </div>
      </footer>
    </div>
  );
}
