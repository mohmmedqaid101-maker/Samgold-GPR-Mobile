import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SAMGOLD GPR" },
      { name: "description", content: "How SAMGOLD GPR collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — SAMGOLD GPR" },
      { property: "og:description", content: "How SAMGOLD GPR collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const sections = ar
    ? [
        {
          title: "البيانات التي نجمعها",
          description: "نجمع البيانات اللازمة لتقديم وتحسين الخدمة.",
          details: ["البريد الإلكتروني والاسم", "بيانات الاستخدام والتحليلات", "معلومات الجهاز", "بيانات المسوحات والتحليل"],
        },
        {
          title: "استخدام البيانات",
          description: "نستخدم بياناتك للأغراض التالية:",
          details: ["تقديم وتحسين الخدمة", "تحليل أنماط الاستخدام", "إرسال الإشعارات والتحديثات", "دعم استفسارات العملاء"],
        },
        {
          title: "أمان البيانات",
          description: "نتخذ إجراءات صارمة لحماية بياناتك.",
          details: ["تشفير HTTPS لكل الاتصالات", "تجزئة آمنة لكلمات المرور", "تدقيقات أمنية دورية", "عزل بيانات المستخدمين"],
        },
        {
          title: "أطراف ثالثة",
          description: "نستخدم خدمات موثوقة من أطراف ثالثة.",
          details: ["Google OAuth للمصادقة", "مزودو الاستضافة السحابية", "خدمات التحليلات", "خدمات إيصال البريد"],
        },
        {
          title: "حقوقك",
          description: "لديك حقوق كاملة على بياناتك.",
          details: ["حق الوصول إلى بياناتك", "حق حذف حسابك", "حق نقل البيانات", "حق إلغاء الاشتراك من المراسلات"],
        },
      ]
    : [
        {
          title: "Data Collection",
          description: "We collect data necessary to provide and improve the service.",
          details: ["Email address and name", "Usage data and analytics", "Device information", "Survey and analysis data"],
        },
        {
          title: "Data Usage",
          description: "We use your data for the following purposes:",
          details: ["Provide and improve the service", "Analyze usage patterns", "Send notifications and updates", "Support customer inquiries"],
        },
        {
          title: "Data Security",
          description: "We take strict measures to protect your data.",
          details: ["HTTPS encryption for all communications", "Secure password hashing", "Regular security audits", "Data isolation between users"],
        },
        {
          title: "Third Parties",
          description: "We use trusted third-party services.",
          details: ["Google OAuth for authentication", "Cloud hosting providers", "Analytics services", "Email delivery services"],
        },
        {
          title: "Your Rights",
          description: "You have full rights over your data.",
          details: ["Right to access your data", "Right to delete your account", "Right to data portability", "Right to opt-out of communications"],
        },
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient-gold">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <p className="text-xl text-muted-foreground">
          {ar ? "خصوصيتك تهمنا. اطّلع على كيفية حماية بياناتك." : "Your privacy matters. Learn how we protect your data."}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{section.description}</p>
              <ul className="space-y-2">
                {section.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{ar ? "أسئلة؟" : "Questions?"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {ar
              ? "إن كانت لديك أي أسئلة حول سياسة الخصوصية، تواصل معنا عبر:"
              : "If you have any questions about our privacy policy, contact us at:"}
          </p>
          <p className="text-lg font-semibold">sam898644@gmail.com</p>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {ar ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
      </p>
    </div>
  );
}
