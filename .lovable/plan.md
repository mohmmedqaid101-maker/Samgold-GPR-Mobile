
# خطة إعادة بناء SAMGOLD GPR على Lovable

## السياق
المشروع الأصلي مبني على **TanStack Start** (غير مدعوم على Lovable). يحتوي:
- 30 route، 5,728 سطر كود
- 5 ملفات migrations لـ Supabase (8 جداول: profiles, user_roles, surveys, targets, devices, reports, notifications, activity_log)
- دالة `has_role` SECURITY DEFINER + enum `app_role`
- AI server function عبر Lovable Gateway (Gemini)
- i18n عربي/إنجليزي + RTL، Logo، LangToggle، StatusBar، TileGrid

## مشاكل الـ PRD المحدّدة في المشروع الأصلي
- **SR-01**: `client.ts` يخزّن الجلسات في `localStorage` (قابل لـ XSS hijacking)
- **SR-06**: لم نتأكد من شمول RLS كل الجداول الجديدة
- 3 جداول مفقودة من الـ PRD: `projects`, `gpr_readings`, `ai_usage_log`, `user_settings`

## الستراتيجية
بسبب الحجم (16 أسبوع في الـ PRD)، **مستحيل** ننفّذ كل شيء في رد واحد بجودة معقولة. سنقسّم على Sprints. كل Sprint = رد واحد منفصل.

هذه الخطة تغطي **Sprint 1 فقط** (Phase 1: الأمان + Auth + DB Schema + Layout أساسي).

---

## Sprint 1 — التنفيذ المقترح

### 1) تفعيل Lovable Cloud
يُنشئ مشروع Supabase جديد تلقائياً (نتجاهل المشروع القديم `juctnekesfwexdckifqw` لأن مفاتيحه مكشوفة في الـ env المرفق ويجب تدويرها).

### 2) Database Schema — Migration واحدة كاملة
ننقل الـ schema الموجود + نضيف الجداول المفقودة من PRD:

```text
profiles          (auth.users → display_name, avatar_url, locale)
user_roles        (user_id, role enum: owner|admin|moderator|user) + has_role()
projects          ⭐ جديد (user_id, name, description, location)
surveys           (project_id, title, location, lat/lng, status, raw_data)
targets           (survey_id, type, depth, confidence, coordinates)
gpr_readings      ⭐ جديد (survey_id, signal_data jsonb, depth, soil_type)
reports           (survey_id, title, content, pdf_url)
devices           (user_id, name, type, last_seen)
notifications     (user_id, type enum, title, message, read_at)
activity_log      (user_id, action, entity_type, entity_id, metadata)
ai_usage_log      ⭐ جديد (user_id, model, tokens, cost, endpoint)
user_settings     ⭐ جديد (user_id, theme, language, preferences jsonb)
```

كل جدول:
- RLS enabled
- سياسات: المستخدم يرى/يعدّل بياناته فقط (`auth.uid() = user_id`)
- Owner/Admin يرى الكل (عبر `has_role()`)
- Trigger `updated_at` تلقائي
- Trigger `handle_new_user` ينشئ profile + role 'user' عند التسجيل

### 3) صفحات وكود (Vite + React + React Router)
البنية:
```text
src/
├── pages/
│   ├── Index.tsx              (landing/redirect)
│   ├── Auth.tsx               (login/signup مع email + password)
│   ├── Dashboard.tsx          (TileGrid للوصول للأقسام)
│   └── NotFound.tsx
├── components/
│   ├── Logo.tsx
│   ├── LangToggle.tsx
│   ├── StatusBar.tsx
│   ├── TileGrid.tsx
│   ├── AppLayout.tsx          (sidebar + header + outlet)
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.tsx            (Supabase session + onAuthStateChange)
│   ├── useRoles.ts
│   └── useProfile.ts
├── lib/
│   ├── i18n.tsx               (عربي/إنجليزي + RTL)
│   └── utils.ts
└── integrations/supabase/     (تلقائي من Lovable Cloud)
```

### 4) إصلاحات أمنية فورية (من القسم 8 في PRD)
- ✅ Auth client: استخدام `@supabase/supabase-js` مع `persistSession: true` على `localStorage` **هو الافتراضي على Lovable Cloud**. ملاحظة: HttpOnly cookies تتطلب SSR/edge function — نسجّلها كـ TODO لـ Sprint لاحق ولا نخدع المستخدم بأننا أصلحناها الآن.
- ✅ RLS على كل الجداول من البداية
- ✅ `has_role()` SECURITY DEFINER لمنع recursive RLS
- ✅ Triggers للتحقق من ملكية البيانات
- ⏳ CSP / Rate Limiting / WAF — Sprint 2 (تتطلب edge functions)

### 5) i18n + RTL
- `lang=ar dir=rtl` افتراضياً
- LangToggle يبدّل بين ar/en
- ترجمات أساسية للـ Auth + Dashboard

### 6) Design System
- Tailwind tokens في `index.css` (لون ذهبي/داكن مناسب لـ "SAMGOLD")
- Dark mode كأساس
- shadcn/ui components

---

## ما خارج نطاق Sprint 1 (Sprints لاحقة)
| Sprint | المحتوى |
|---|---|
| 2 | Scanner + Projects/Surveys CRUD + Edge function CSP |
| 3 | AI Analysis (Gemini عبر Lovable AI Gateway) + soil classification |
| 4 | Reports (PDF generation) + Activity log + Notifications |
| 5 | Maps (Mapbox — يحتاج مفتاح من المستخدم) + 3D layers |
| 6 | Admin panel (users/surveys/AI logs) + Devices |
| 7 | Offline-first (IndexedDB + Service Worker + Outbox) |
| 8 | Testing + Performance + Polish |

---

## Technical Notes
- **لا ننقل** ملفات TanStack Start (`__root.tsx`, `_app.*.tsx`, `server.ts`, `wrangler.jsonc`) — كلها غير متوافقة.
- **ننقل المنطق** من ملفات الـ hooks والـ i18n والـ types.
- مفاتيح Supabase القديمة في الـ env **لن تُستخدم** — Lovable Cloud ينشئ مشروع جديد.
- جدول الإشعارات يستخدم enum `notification_type` — سننقله.
- جميع الـ migrations الـ 5 الموجودة سندمجها في migration واحدة منظّمة + نضيف الجداول الجديدة.

---

## معلومة هامة للمستخدم
بعد موافقتك على Sprint 1:
1. سأفعّل Lovable Cloud (يستغرق دقيقة)
2. أنشئ migration كاملة بكل الجداول والـ RLS
3. أبني Auth + Dashboard + Layout + i18n
4. ستحصل على تطبيق يعمل بتسجيل دخول وداشبورد فارغة جاهزة للأقسام

**الوقت المتوقع للرد**: حوالي 5-10 دقائق

هل تريد تعديل Sprint 1 أو الموافقة عليه للبدء؟
