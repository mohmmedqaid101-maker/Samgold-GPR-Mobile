import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

const dict: Dict = {
  "brand.tagline": {
    ar: "التكنولوجيا التي تخترق الأرض",
    en: "Technology that pierces the earth",
  },
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.scanner": { ar: "الماسح الذكي", en: "Smart Scanner" },
  "nav.frequency": { ar: "تحليل التردد", en: "Frequency Analysis" },
  "nav.ai": { ar: "تحليل الذكاء الاصطناعي", en: "AI Analysis" },
  "nav.map": { ar: "الخريطة ثلاثية الأبعاد", en: "3D Map" },
  "nav.reports": { ar: "التقارير", en: "Reports" },
  "nav.account": { ar: "الحساب", en: "Account" },
  "nav.signout": { ar: "تسجيل الخروج", en: "Sign out" },

  "landing.cta.start": { ar: "ابدأ الآن", en: "Get started" },
  "landing.cta.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "landing.hero.title": {
    ar: "منصة SAMGOLD GPR للتحليل الجيوفيزيائي",
    en: "SAMGOLD GPR — Geophysical Analysis Platform",
  },
  "landing.hero.sub": {
    ar: "اكتشف المعادن والتجاويف والهياكل الأثرية بدقة، مدعومًا بالذكاء الاصطناعي والخرائط ثلاثية الأبعاد.",
    en: "Detect minerals, voids, and archaeological structures with precision, powered by AI and 3D mapping.",
  },
  "landing.feat.ai.t": { ar: "ذكاء اصطناعي متقدم", en: "Advanced AI" },
  "landing.feat.ai.d": {
    ar: "تحليل الأنماط الجيولوجية واستخراج الشذوذات تلقائيًا.",
    en: "Analyze geological patterns and extract anomalies automatically.",
  },
  "landing.feat.map.t": { ar: "خرائط ثلاثية الأبعاد", en: "3D Mapping" },
  "landing.feat.map.d": {
    ar: "اعرض التضاريس والأهداف فوق صور الأقمار الصناعية.",
    en: "Visualize terrain and targets over satellite imagery.",
  },
  "landing.feat.sec.t": { ar: "أمان من الدرجة الأولى", en: "Top-tier Security" },
  "landing.feat.sec.d": {
    ar: "تشفير الملفات وعزل البيانات بين المستخدمين.",
    en: "File encryption and per-user data isolation.",
  },

  "auth.title.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.title.signup": { ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.submit.signin": { ar: "دخول", en: "Sign in" },
  "auth.submit.signup": { ar: "إنشاء", en: "Create account" },
  "auth.switch.tosignup": { ar: "ليس لديك حساب؟ سجّل الآن", en: "No account? Sign up" },
  "auth.switch.tosignin": { ar: "لديك حساب؟ ادخل", en: "Have an account? Sign in" },
  "auth.google": { ar: "المتابعة باستخدام Google", en: "Continue with Google" },
  "auth.or": { ar: "أو", en: "or" },
  "auth.success.signup": {
    ar: "تم إنشاء الحساب. تحقق من بريدك إن طُلب منك.",
    en: "Account created. Check your inbox if requested.",
  },

  "dash.welcome": { ar: "مرحبًا بعودتك", en: "Welcome back" },
  "dash.placeholder": {
    ar: "هذه شاشة تجريبية. سنضيف الإحصائيات والمسوحات لاحقًا.",
    en: "This is a placeholder. Stats and surveys will be added soon.",
  },

  "common.loading": { ar: "جارٍ التحميل…", en: "Loading…" },
  "common.lang": { ar: "EN", en: "ع" },
  "common.save": { ar: "حفظ", en: "Save" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.delete": { ar: "حذف", en: "Delete" },
  "common.create": { ar: "إنشاء", en: "Create" },
  "common.empty": { ar: "لا توجد بيانات بعد.", en: "No data yet." },
  "common.error": { ar: "حدث خطأ", en: "An error occurred" },
  "common.actions": { ar: "إجراءات", en: "Actions" },
  "common.confirm.delete": { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?" },

  "dash.stats.surveys": { ar: "المسوحات", en: "Surveys" },
  "dash.stats.targets": { ar: "الأهداف", en: "Targets" },
  "dash.stats.reports": { ar: "التقارير", en: "Reports" },
  "dash.recent.surveys": { ar: "أحدث المسوحات", en: "Recent Surveys" },
  "dash.quick.scan": { ar: "بدء مسح جديد", en: "Start new scan" },
  "dash.quick.report": { ar: "إنشاء تقرير", en: "Create report" },

  "scanner.title": { ar: "الماسح الذكي", en: "Smart Scanner" },
  "scanner.new": { ar: "مسح جديد", en: "New survey" },
  "scanner.field.title": { ar: "عنوان المسح", en: "Survey title" },
  "scanner.field.location": { ar: "الموقع", en: "Location" },
  "scanner.field.lat": { ar: "خط العرض", en: "Latitude" },
  "scanner.field.lng": { ar: "خط الطول", en: "Longitude" },
  "scanner.field.notes": { ar: "ملاحظات", en: "Notes" },
  "scanner.status.draft": { ar: "مسودة", en: "Draft" },
  "scanner.status.active": { ar: "نشط", en: "Active" },
  "scanner.status.done": { ar: "منتهي", en: "Completed" },
  "scanner.list": { ar: "قائمة المسوحات", en: "Survey list" },

  "targets.title": { ar: "الأهداف المكتشفة", en: "Detected Targets" },
  "targets.new": { ar: "هدف جديد", en: "New target" },
  "targets.field.name": { ar: "اسم الهدف", en: "Target name" },
  "targets.field.type": { ar: "النوع", en: "Type" },
  "targets.field.depth": { ar: "العمق (م)", en: "Depth (m)" },
  "targets.field.confidence": { ar: "الثقة %", en: "Confidence %" },
  "targets.field.frequency": { ar: "التردد (Hz)", en: "Frequency (Hz)" },
  "targets.type.metal": { ar: "معدن", en: "Metal" },
  "targets.type.void": { ar: "تجويف", en: "Void" },
  "targets.type.structure": { ar: "هيكل", en: "Structure" },
  "targets.type.unknown": { ar: "غير معروف", en: "Unknown" },

  "reports.title": { ar: "التقارير", en: "Reports" },
  "reports.new": { ar: "تقرير جديد", en: "New report" },
  "reports.field.title": { ar: "عنوان التقرير", en: "Report title" },
  "reports.field.type": { ar: "نوع التقرير", en: "Report type" },
  "reports.field.summary": { ar: "ملخص", en: "Summary" },
  "reports.field.content": { ar: "المحتوى", en: "Content" },
  "reports.type.analysis": { ar: "تحليل", en: "Analysis" },
  "reports.type.field": { ar: "ميداني", en: "Field" },
  "reports.type.ai": { ar: "ذكاء اصطناعي", en: "AI" },

  // Sidebar groups
  "nav.group.scanner": { ar: "الماسح الذكي", en: "Smart Scanner" },
  "nav.group.maps": { ar: "الخرائط", en: "Maps" },
  "nav.scanner.receive": { ar: "الاستقبال والمعالجة", en: "Receive & Process" },
  "nav.scanner.targets": { ar: "الأهداف", en: "Targets" },
  "nav.map.layers": { ar: "الطبقات الجيولوجية", en: "Geological Layers" },
  "nav.map.cinematic": { ar: "العرض السينمائي", en: "Cinematic View" },
  "nav.settings": { ar: "الإعدادات الفيزيائية", en: "Physical Settings" },
  "nav.about": { ar: "حول التطبيق", en: "About" },
  "nav.privacy": { ar: "سياسة الخصوصية", en: "Privacy" },
  "nav.support": { ar: "الدعم الفني", en: "Support" },
  "nav.admin": { ar: "لوحة تحكم المشرفين", en: "Admin Panel" },
  "nav.admin.dashboard": { ar: "لوحة القيادة", en: "Dashboard" },
  "nav.admin.users": { ar: "المستخدمين", en: "Users" },
  "nav.admin.surveys": { ar: "عمليات المسح", en: "Surveys" },
  "nav.admin.ai": { ar: "الذكاء الاصطناعي", en: "AI" },

  // Settings page
  "settings.title": { ar: "الإعدادات الفيزيائية", en: "Physical Settings" },
  "settings.desc": { ar: "اضبط معاملات GPR الافتراضية للماسح.", en: "Configure default GPR parameters for the scanner." },
  "settings.frequency": { ar: "التردد الافتراضي (MHz)", en: "Default Frequency (MHz)" },
  "settings.depth": { ar: "العمق الأقصى (م)", en: "Max Depth (m)" },
  "settings.velocity": { ar: "سرعة الموجة (م/ns)", en: "Wave Velocity (m/ns)" },
  "settings.gain": { ar: "الكسب (dB)", en: "Gain (dB)" },
  "settings.saved": { ar: "تم حفظ الإعدادات", en: "Settings saved" },

  // Map sub-pages
  "map.layers.title": { ar: "الطبقات الجيولوجية", en: "Geological Layers" },
  "map.layers.desc": { ar: "تصوّر الطبقات الجيولوجية لكل مسح.", en: "Visualize geological strata per survey." },
  "map.cinematic.title": { ar: "العرض السينمائي", en: "Cinematic View" },
  "map.cinematic.desc": { ar: "جولة ثلاثية الأبعاد سينمائية للأهداف المكتشفة.", en: "Cinematic 3D fly-through of detected targets." },
  "map.cinematic.play": { ar: "تشغيل العرض", en: "Play tour" },

  // Scanner sub-pages
  "scanner.receive.title": { ar: "الاستقبال والمعالجة", en: "Receive & Process" },
  "scanner.receive.desc": { ar: "ارفع ملفات GPR الخام للمعالجة وحفظها في السحابة.", en: "Upload raw GPR files for processing and cloud storage." },
  "scanner.receive.upload": { ar: "اختر ملف", en: "Choose file" },
  "scanner.receive.start": { ar: "ابدأ الرفع والمعالجة", en: "Start upload & process" },
  "scanner.receive.uploading": { ar: "جارٍ الرفع…", en: "Uploading…" },
  "scanner.receive.success": { ar: "تم رفع الملف بنجاح", en: "File uploaded successfully" },
  "scanner.receive.another": { ar: "رفع ملف آخر", en: "Upload another" },
  "scanner.receive.field.title": { ar: "عنوان المسح", en: "Survey title" },
  "scanner.receive.field.location": { ar: "الموقع", en: "Location" },
  "scanner.receive.err.type": { ar: "نوع الملف غير مدعوم", en: "Unsupported file type" },
  "scanner.receive.err.size": { ar: "الملف يتجاوز 50 ميجابايت", en: "File exceeds 50 MB" },
  "scanner.targets.title": { ar: "الأهداف المكتشفة", en: "Detected Targets" },

  // Admin
  "admin.title": { ar: "لوحة تحكم المشرفين", en: "Admin Panel" },
  "admin.dashboard.desc": { ar: "نظرة عامة على المنصة.", en: "Platform overview." },
  "admin.users.title": { ar: "المستخدمون", en: "Users" },
  "admin.users.desc": { ar: "إدارة الأدوار والصلاحيات.", en: "Manage roles and permissions." },
  "admin.surveys.title": { ar: "عمليات المسح", en: "Survey Operations" },
  "admin.ai.title": { ar: "الذكاء الاصطناعي", en: "AI Operations" },
  "admin.denied": { ar: "ليست لديك صلاحية الوصول إلى هذه الصفحة.", en: "You do not have permission to access this page." },
  "admin.assign": { ar: "إسناد دور", en: "Assign role" },
  "admin.userId": { ar: "معرّف المستخدم (UUID)", en: "User ID (UUID)" },
  "admin.role": { ar: "الدور", en: "Role" },
  "admin.added": { ar: "تم الإسناد", en: "Role assigned" },
  "admin.stats.total": { ar: "إجمالي المسوحات", en: "Total Surveys" },
  "admin.stats.users": { ar: "المستخدمون النشطون", en: "Active Users" },
  "admin.stats.targets": { ar: "الأهداف المكتشفة", en: "Detected Targets" },

  // Dashboard tiles
  "tile.security": { ar: "الأمان", en: "Security" },
  "tile.globalmap": { ar: "الخريطة العالمية", en: "Global Map" },
  "tile.updates": { ar: "التحديثات", en: "Updates" },
  "tile.notifications": { ar: "التنبيهات", en: "Notifications" },
  "tile.projects": { ar: "المشاريع", en: "Projects" },
  "tile.permissions": { ar: "الصلاحيات", en: "Permissions" },
  "tile.activity": { ar: "سجل النشاط", en: "Activity Log" },
  "tile.performance": { ar: "الأداء", en: "Performance" },
  "tile.data": { ar: "البيانات", en: "Data" },
  "tile.devices": { ar: "الأجهزة", en: "Devices" },
  "tile.systemadmin": { ar: "إدارة النظام", en: "System Admin" },
  "tile.controlpanel": { ar: "لوحة القيادة", en: "Control Panel" },
  "tile.subscriptions": { ar: "الاشتراكات", en: "Subscriptions" },
  "tile.users": { ar: "المستخدمين", en: "Users" },
  "tile.ai": { ar: "الذكاء الاصطناعي", en: "AI" },
  "tile.scans": { ar: "عمليات المسح", en: "Scans" },

  // Sidebar groups
  "nav.group.platform": { ar: "المنصة", en: "Platform" },
  "nav.group.system": { ar: "النظام", en: "System" },
};

interface I18nCtx {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: keyof typeof dict | string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "samgold.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => {
    const entry = (dict as Record<string, { ar: string; en: string }>)[key];
    if (!entry) return key;
    return entry[lang];
  };

  return (
    <Ctx.Provider
      value={{
        lang,
        dir: lang === "ar" ? "rtl" : "ltr",
        setLang,
        toggle: () => setLang(lang === "ar" ? "en" : "ar"),
        t,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
