import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/support")({
  head: () => ({
    meta: [
      { title: "Support — SAMGOLD GPR" },
      { name: "description", content: "Contact SAMGOLD GPR support team." },
      { property: "og:title", content: "Support — SAMGOLD GPR" },
      { property: "og:description", content: "Contact SAMGOLD GPR support team." },
    ],
  }),
  component: SupportPage,
});

const SUPPORT_EMAIL = "sam898644@gmail.com";

function SupportPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(ar ? "يرجى تعبئة جميع الحقول" : "Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      // Open mail client as fallback delivery
      const body = `${ar ? "الاسم" : "Name"}: ${formData.name}\n${ar ? "البريد" : "Email"}: ${formData.email}\n\n${formData.message}`;
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
      toast.success(ar ? "تم تجهيز رسالتك" : "Your message is ready to send");
    } catch {
      toast.error(ar ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      formData.subject || "Support Request"
    )}&body=${encodeURIComponent(formData.message || "")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient-gold">{ar ? "الدعم" : "Support"}</h1>
        <p className="text-xl text-muted-foreground">
          {ar ? "نحن هنا للمساعدة. تواصل مع فريقنا." : "We're here to help. Contact our team."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{ar ? "إرسال رسالة" : "Send a message"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{ar ? "الاسم" : "Name"}</label>
                  <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{ar ? "البريد الإلكتروني" : "Email"}</label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{ar ? "الموضوع" : "Subject"}</label>
                  <Input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{ar ? "الرسالة" : "Message"}</label>
                  <Textarea name="message" value={formData.message} onChange={handleChange} rows={6} required />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (ar ? "جارٍ الإرسال..." : "Sending...") : ar ? "إرسال" : "Send"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleEmailClick} className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {ar ? "افتح البريد" : "Open mail"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ar ? "البريد الإلكتروني" : "Email"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {ar ? "يمكنك أيضاً مراسلتنا مباشرة:" : "You can also reach us directly:"}
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline font-semibold flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {SUPPORT_EMAIL}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ar ? "روابط سريعة" : "Quick Links"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/privacy" className="block text-primary hover:underline text-sm">
                {ar ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
              <Link to="/about" className="block text-primary hover:underline text-sm">
                {ar ? "حول التطبيق" : "About"}
              </Link>
              <Link to="/subscriptions" className="block text-primary hover:underline text-sm">
                {ar ? "الاشتراكات" : "Subscriptions"}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
