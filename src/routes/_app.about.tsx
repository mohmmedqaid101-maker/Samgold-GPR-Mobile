import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Map, Shield, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/about")({
  head: () => ({
    meta: [
      { title: "About — SAMGOLD GPR" },
      { name: "description", content: "About SAMGOLD GPR — AI-powered geophysical analysis platform." },
      { property: "og:title", content: "About — SAMGOLD GPR" },
      { property: "og:description", content: "About SAMGOLD GPR — AI-powered geophysical analysis platform." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const features = [
    {
      icon: Brain,
      title: ar ? "ذكاء اصطناعي متقدم" : "Advanced AI",
      description: ar
        ? "تحليل الأنماط الجيولوجية واستخراج الشذوذات تلقائياً"
        : "Analyze geological patterns and extract anomalies automatically",
    },
    {
      icon: Map,
      title: ar ? "خرائط ثلاثية الأبعاد" : "3D Mapping",
      description: ar
        ? "عرض التضاريس والأهداف فوق صور الأقمار الصناعية"
        : "Visualize terrain and targets over satellite imagery",
    },
    {
      icon: Shield,
      title: ar ? "الأمان" : "Security",
      description: ar ? "تشفير وحماية بيانات على مستوى المؤسسات" : "Enterprise-grade encryption and data protection",
    },
    {
      icon: Zap,
      title: ar ? "الأداء" : "Performance",
      description: ar ? "معالجة سريعة وتحليل في الوقت الفعلي" : "Fast processing and real-time analysis",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient-gold">{ar ? "حول التطبيق" : "About"}</h1>
        <p className="text-xl text-muted-foreground">SAMGOLD GPR</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ar ? "معلومات التطبيق" : "Application Information"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "الاسم" : "Name"}</p>
            <p className="text-lg font-semibold">SAMGOLD GPR</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "الإصدار" : "Version"}</p>
            <p className="text-lg font-semibold">1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "الوصف" : "Description"}</p>
            <p className="text-base">
              {ar
                ? "منصة تحليل جيوفيزيائي مدعومة بالذكاء الاصطناعي للكشف عن المعادن والتجاويف والهياكل الأثرية."
                : "AI-powered geophysical analysis platform for detecting minerals, voids, and archaeological structures."}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "حقوق النشر" : "Copyright"}</p>
            <p className="text-base">© 2026 SAMGOLD</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-6">{ar ? "المزايا" : "Features"}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg h-fit">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        © 2026 SAMGOLD GPR Platform. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </p>
    </div>
  );
}
