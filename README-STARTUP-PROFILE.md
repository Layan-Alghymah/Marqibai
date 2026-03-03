# ملف المشروع وخطة التنفيذ — Startup Plan & Deliverables

## 1) Supabase — نموذج البيانات

نفّذ الـ migration في Supabase SQL Editor:

- الملف: `supabase/migrations/001_startup_plans_deliverables.sql`

يُنشئ الجداول:

- **startups**: `startup_name`, `startup_type` (tech | service | product | productive_family | other), `stage` (idea | mvp | growth), `description`, `created_at`, `updated_at`
- **startup_plans**: خطة واحدة لكل شركة (ملخص، نتائج متوقعة، معلم قادم، موعد، ملاحظات، مخاطر)
- **startup_deliverables**: تسليمات (عنوان، نوع، موعد، حالة، مقاييس اختيارية)
- **startup_members**: ربط مؤسس (user_id) بشركة (startup_id)
- **incubator_admins**: أدمن حاضنة (user_id + incubator_id)

مع تفعيل RLS: المؤسس يقرأ/يكتب شركته فقط؛ الأدمن يقرأ كل الشركات التابعة لحاضنته.

## 2) متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وضَع:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3) تشغيل المشروع

```bash
npm install
npm run dev
```

ضع ملفات الـ HTML في مجلد `public/` حتى تخدمها Next.js.

**نقطة الدخول الجذر `/`:**

- غير مسجّل الدخول → إعادة توجيه إلى `/landing.html`
- مسجّل كأدمن (موجود في `incubator_admins`) → إعادة توجيه إلى `/admin/dashboard`
- مسجّل كمؤسس (موجود في `startup_members`) → إعادة توجيه إلى `/founder/home`
- مسجّل دون دور → إعادة توجيه إلى `/landing.html`

**مسارات نظيفة (تعيد كتابة إلى HTML في public):**

- `/admin/dashboard` → `admin-dashboard.html`
- `/founder/home` → `founder-home.html`
- `/founder/weekly-update` → `founder-weekly-update.html`
- `/landing` → `landing.html`

روابط الملفات المباشرة تبقى تعمل، مثلاً: `/landing.html`, `/founder-home.html`, `/admin-dashboard.html`.

جميع استدعاءات الـ API تستخدم `credentials: 'include'`.

## 4) حسابات التجربة (الديمو)

لتسجيل الدخول في الواجهة دون ربط Supabase Auth، الصفحة `login.html` تقبل الحسابات التالية:

| الدور   | البريد الإلكتروني      | كلمة المرور  |
|--------|-------------------------|---------------|
| أدمن   | `admin@murqib.ai`       | `admin123`    |
| مؤسس   | `founder@startup.sa`    | `founder123`  |

- **أدمن**: بعد الدخول يُوجّه إلى لوحة الحاضنة (`admin-dashboard.html`).
- **مؤسس**: بعد الدخول يُوجّه إلى لوحة المؤسس (`founder-home.html`).

> عند تفعيل تسجيل الدخول عبر Supabase، أنشئ هذه المستخدمين في Supabase Auth واربطهم في جداول `incubator_admins` (للأدمن) و`startup_members` (للمؤسس) حسب الـ `user_id`.

## 5) واجهات الـ API

| الطريقة | المسار | الوصف |
|--------|--------|--------|
| GET | `/api/startup/profile` | ملف الشركة + الخطة + التسليمات (للمؤسس) |
| POST | `/api/startup/profile` | حفظ/تحديث بيانات الشركة والخطة |
| POST | `/api/startup/deliverables` | إضافة تسليم |
| PATCH | `/api/startup/deliverables/:id` | تحديث تسليم |
| DELETE | `/api/startup/deliverables/:id` | حذف تسليم |
| GET | `/api/admin/startups/:startup_id/profile` | ملف الشركة + الخطة + التسليمات (للأدمن، للقراءة) |
| GET | `/api/dashboard` | لوحة الأدمن (نفس العقد + `startup_name`, `startup_type`, `next_milestone_due_date`) |

## 6) الواجهات (HTML)

- **المؤسس**: صفحة جديدة `founder-startup-profile.html` — اسم/نوع/مرحلة الشركة، الخطة، إضافة وتعديل وحذف التسليمات مع الحالة والمقاييس. في `founder-home.html`: بطاقة "عرض في لوحتي" تعرض المعلم القادم وعدد التسليمات (مخطط / قيد التنفيذ / منجزة).
- **الأدمن**: في `admin-dashboard.html` عمود "موعد المعلم" وعرض الاسم من `startup_name` إن وُجد. في `admin-startup-details.html` قسم "ملف المشروع وخطة التنفيذ" يعرض الملخص والمعلم وجدول التسليمات (للقراءة فقط).

## 7) عدم التعديل على المحرك

لم يتم تغيير معادلة أو عتبات تقييم مرقب؛ البيانات الجديدة للعرض واستخدام مستقبلي في التقييم.
