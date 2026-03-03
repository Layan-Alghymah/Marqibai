# رفع مشروع Murqib-AI على GitHub

## الخطوة 1: إنشاء مستودع جديد على GitHub

1. ادخل إلى **[github.com](https://github.com)** وسجّل الدخول.
2. اضغط **+** (أعلى اليمين) → **New repository**.
3. سمِّ المستودع مثلاً: **Murqib-ai** أو **murqib-ai**.
4. اختر **Public**.
5. **لا** تختر "Add a README" أو ".gitignore" (المشروع عنده بالفعل).
6. اضغط **Create repository**.

---

## الخطوة 2: ربط المشروع ورفعه من الطرفية

افتح **PowerShell** أو **Command Prompt** و نفّذ الأوامر التالية بالترتيب (غيّر `YOUR-USERNAME` و `Murqib-ai` إذا غيّرت اسم المستودع):

```powershell
cd c:\Users\DELL\Downloads\murqib-ai

git remote add origin https://github.com/YOUR-USERNAME/Murqib-ai.git

git branch -M main

git push -u origin main
```

- **YOUR-USERNAME** = اسم حسابك في GitHub (مثال: `ahmed-sa`).
- إذا طلب منك GitHub اسم مستخدم وكلمة مرور، استخدم **Personal Access Token** بدل كلمة المرور:
  - من GitHub: **Settings** → **Developer settings** → **Personal access tokens** → إنشاء token جديد مع صلاحية `repo`.
  - استخدم الـ token مكان كلمة المرور عند تنفيذ `git push`.

---

## بعد الرفع

- رابط المستودع سيكون مثل: **https://github.com/YOUR-USERNAME/Murqib-ai**
- يمكنك ربط هذا المستودع بمشروع Vercel من **Import Git Repository** لتفعيل النشر التلقائي عند كل `git push`.
