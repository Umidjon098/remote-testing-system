# 🚀 TEZKOR SOZLASH - Cookie Muammosini Hal Qilish

## 1️⃣ Supabase Dashboard → Authentication → URL Configuration

Link: https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/auth/url-configuration

### Site URL

```
https://remote-testing-system.vercel.app
```

### Additional Redirect URLs

```
https://remote-testing-system.vercel.app/**
https://remote-testing-system.netlify.app/**
http://localhost:3000/**
http://127.0.0.1:3000/**
```

Screenshot qanday bo'lishi kerak:

```
┌─────────────────────────────────────────────┐
│ Site URL                                    │
│ https://remote-testing-system.vercel.app    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Redirect URLs                               │
│ https://remote-testing-system.vercel.app/** │
│ https://remote-testing-system.netlify.app/**│
│ http://localhost:3000/**                    │
│ http://127.0.0.1:3000/**                    │
└─────────────────────────────────────────────┘
```

---

## 2️⃣ Supabase Dashboard → Settings → Auth

Link: https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/settings/auth

### JWT Settings

```
JWT Expiry: 3600
```

(1 soat - minimum tavsiya etiladi)

### Enable bunday sozlamalar:

- ✅ Enable automatic reuse detection
- ✅ Enable refresh token rotation
- Reuse Interval: `10` (default)

---

## 3️⃣ Vercel Environment Variables

Vercel Dashboard → Your Project → Settings → Environment Variables

Link: https://vercel.com/umidjon098s-projects/remote-testing-system/settings/environment-variables

Quyidagilar ALBATTA bo'lishi kerak:

```
NEXT_PUBLIC_SUPABASE_URL=https://qnprrprzeamfbnsbxyui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHJycHJ6ZWFtZmJuc2J4eXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDUzODcsImV4cCI6MjA4MTYyMTM4N30.aGCx2MW_C-Bl0L0IEJfLyEZKaY2Jv3dn5slqaQkukXQ
```

---

## 4️⃣ Netlify Environment Variables

Netlify Dashboard → Site Settings → Environment Variables

Link: https://app.netlify.com/sites/remote-testing-system/settings/env

Xuddi shu variable-lar:

```
NEXT_PUBLIC_SUPABASE_URL=https://qnprrprzeamfbnsbxyui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHJycHJ6ZWFtZmJuc2J4eXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDUzODcsImV4cCI6MjA4MTYyMTM4N30.aGCx2MW_C-Bl0L0IEJfLyEZKaY2Jv3dn5slqaQkukXQ
```

---

## 5️⃣ Deploy

```bash
git add .
git commit -m "Fix: Remove localStorage, use cookie-only auth for Next.js"
git push
```

Vercel va Netlify avtomatik rebuild qiladi.

---

## 6️⃣ Test

### Vercel test:

1. https://remote-testing-system.vercel.app oching
2. Login qiling
3. Browser DevTools → Console-da "Auth state changed: SIGNED_IN" ko'rinishi kerak
4. Application → Cookies → `sb-qnprrprzeamfbnsbxyui-auth-token` bor bo'lishi kerak
5. 5 daqiqa kuting
6. Sahifani refresh qiling - login saqlanishi kerak ✅

### Netlify test:

1. https://remote-testing-system.netlify.app oching
2. Xuddi shu test

---

## ✅ Success Indicators

Hammasi ishlasa:

- ✅ Login → redirect ishlaydi
- ✅ Refresh → login saqlanadi
- ✅ Cookie-larda `sb-...-auth-token` ko'rinadi
- ✅ Console-da "Token refreshed successfully" har 5 daqiqada
- ✅ 1+ soat login saqlanadi

---

## ❌ Muammo Bo'lsa

### Cookie yo'q

**Tekshiring**:

1. Supabase Site URL to'g'rimi?
2. Redirect URLs-da `/**` bormi?
3. Browser third-party cookies blocked emasmi?

### "Invalid session"

**Tekshiring**:

1. JWT Expiry minimum 3600 mi?
2. Token rotation enabled mi?
3. Environment variables to'g'rimi?

### Redirect loop

**Tekshiring**:

1. Supabase Redirect URLs to'liqmi?
2. Browser cache tozalang
3. Incognito mode-da sinab ko'ring

---

## 📞 Qo'shimcha Yordam

Batafsil qo'llanma: [SUPABASE_COOKIE_FIX.md](SUPABASE_COOKIE_FIX.md)

Deployment qo'llanma: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
