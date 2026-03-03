# النشر على Vercel — مرقب AI

## الطريقة 1: من الموقع (الأسهل)

1. ادخل إلى **[vercel.com](https://vercel.com)** وسجّل الدخول (أو إنشاء حساب بـ GitHub).
2. اضغط **Add New…** → **Project**.
3. اختر **Import Git Repository** وربط المستودع (GitHub/GitLab/Bitbucket)، أو اختر **Import** وارفع مجلد المشروع.
4. تأكد أن:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (الجذر)
5. في **Environment Variables** أضف:
   - `NEXT_PUBLIC_SUPABASE_URL` = رابط مشروعك من Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = المفتاح العام (anon key) من Supabase
6. اضغط **Deploy**. بعد دقائق ستحصل على رابط مثل:  
   **`https://murqib-ai-xxxx.vercel.app`**

---

## الطريقة 2: من الطرفية (Vercel CLI)

1. تثبيت Vercel CLI وتسجيل الدخول (مرة واحدة):
   ```bash
   npm i -g vercel
   vercel login
   ```
   (يفتح المتصفح لتسجيل الدخول.)

2. من داخل مجلد المشروع:
   ```bash
   cd c:\Users\DELL\Downloads\murqib-ai
   vercel
   ```
   اتبع الأسئلة (أو اضغط Enter للمقترحات). في النهاية يظهر لك رابط المعاينة.

3. لنشر نسخة إنتاج:
   ```bash
   vercel --prod
   ```
   الرابط النهائي سيكون مثل: **`https://murqib-ai.vercel.app`** (أو حسب اسم المشروع).

4. إضافة متغيرات البيئة من الطرفية:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   ثم أعد النشر: `vercel --prod`.

---

## بعد النشر

- **الصفحة الرئيسية:** `https://your-project.vercel.app/` → إعادة توجيه حسب تسجيل الدخول (أدمن / مؤسس) أو إلى `/landing.html`.
- **تسجيل الدخول (ديمو):**  
  `https://your-project.vercel.app/login.html`  
  ثم استخدم: `admin@murqib.ai` / `admin123` أو `founder@startup.sa` / `founder123`.
- تأكد أن مشروع Supabase يسمح بالطلبات من نطاق Vercel (مثلاً `*.vercel.app`) في إعدادات المصادقة إذا استخدمت Supabase Auth.
