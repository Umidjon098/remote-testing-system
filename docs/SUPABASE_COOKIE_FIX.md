# 🔧 Supabase Configuration for Production

## MUHIM: Cookie Clear Muammosini Hal Qilish

Agar Netlify/Vercel-da cookie-lar doimiy o'chib ketsa, quyidagi sozlamalarni **ANIQ** bajarishingiz kerak:

---

## 1. Supabase Dashboard Settings

### A. Authentication → URL Configuration

Supabase Dashboard: https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/auth/url-configuration

#### Site URL (Eng Muhim!)

Production URL-ni qo'ying (FAQAT BITTASINI):

**Vercel uchun:**

```
https://remote-testing-system.vercel.app
```

**yoki Netlify uchun:**

```
https://remote-testing-system.netlify.app
```

⚠️ **MUHIM QOIDALAR**:

- Trailing slash (`/`) qo'ymang!
- `http://` emas, FAQAT `https://` ishlatilsin
- Development uchun `http://localhost:3000` qoldiring
- Production-da FAQAT bitta URL bo'lishi kerak (Vercel yoki Netlify)

#### Redirect URLs

**TO'LIQ** quyidagi URL-larni qo'shing:

```
https://remote-testing-system.vercel.app/**
https://remote-testing-system.netlify.app/**
http://localhost:3000/**
http://127.0.0.1:3000/**
```

⚠️ `**` belgisi MUHIM - barcha nested route-lar uchun!

---

### B. Authentication → Settings

https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/settings/auth

#### 🔑 JWT Settings

```
JWT Expiry: 3600 (1 soat)
```

⚠️ Juda qisqa qilmang! Minimum 3600 (1 soat)

#### 🔄 Token Refresh Settings

```
☑ Enable automatic reuse detection
Reuse Interval: 10 (soniya)
☑ Enable refresh token rotation
```

#### 📧 Email Settings (agar ishlatilsa)

```
☑ Enable email confirmations (yoki disable qilishingiz mumkin test uchun)
☐ Secure email change (disable qiling development uchun)
```

#### 🔒 Security Settings

```
☐ Disable signup (faqat kerak bo'lsa)
☑ Enable anonymous sign-ins (faqat kerak bo'lsa)
```

---

### C. Authentication → Rate Limits

https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/settings/auth

Cookie clear bo'lishiga sabab bo'lishi mumkin:

```
Rate Limit Window: 3600 (1 soat)
Max Requests: 100 (yoki oshiring)
```

Agar rate limit tugasa, Supabase session-ni o'chirishi mumkin.

---

## 2. Environment Variables (Production)

### Vercel Dashboard

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qnprrprzeamfbnsbxyui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Netlify Dashboard

Xuddi shu environment variables-ni qo'shing.

⚠️ **MUHIM**: Environment variables o'zgargandan so'ng **REDEPLOY** qiling!

---

## 3. Debug: Cookie Tekshirish

### Browser DevTools

1. **F12** → **Application** → **Cookies**
2. Quyidagi cookie-larni izlang:

   ```
   sb-qnprrprzeamfbnsbxyui-auth-token
   sb-qnprrprzeamfbnsbxyui-auth-token-code-verifier
   ```

3. Cookie properties tekshiring:
   - ✅ **Domain**: `.your-domain.com` yoki `your-domain.com`
   - ✅ **Path**: `/`
   - ✅ **Secure**: `true` (production)
   - ✅ **SameSite**: `Lax`
   - ✅ **Max-Age**: `604800` (7 kun)
   - ✅ **Expires**: Kelajakdagi sana

### Browser Console

⚠️ **DIQQAT**: Next.js da localStorage ishlatilmaydi! Faqat cookie-lar ishlatiladi.

Console-da cookie-larni tekshiring:

```javascript
// Console-ga kiriting
document.cookie.split("; ").filter((c) => c.includes("sb-"));
```

Supabase cookie-lari ko'rinishi kerak:

```
sb-qnprrprzeamfbnsbxyui-auth-token=...
sb-qnprrprzeamfbnsbxyui-auth-token-code-verifier=...
```

---

## 4. Keng Tarqalgan Muammolar va Yechimlar

### ❌ Cookie darhol o'chib ketadi

**Sabab 1**: Supabase Site URL noto'g'ri

- **Yechim**: Site URL Production URL bilan aniq mos kelishi kerak

**Sabab 2**: Third-party cookies blocked

- **Yechim**: Browser settings-da third-party cookies-ni enable qiling
- **Yechim**: Supabase ham, app ham bitta domain ichida bo'lishi kerak

**Sabab 3**: JWT Expiry juda qisqa

- **Yechim**: Minimum 3600 (1 soat) ga sozlang

**Sabab 4**: PKCE flow noto'g'ri

- **Yechim**: Next.js da localStorage ishlatilmaydi!
- **Yechim**: Code yangilangan - faqat cookie-based auth
- **Yechim**: `persistSession: true` cookie-larga saqlanadi

### ❌ Redirect loop

**Yechim**:

1. Supabase Redirect URLs-ga production URL qo'shilganini tekshiring
2. Middleware-da `/login` exempt ekanligini tekshiring
3. Browser cache tozalang

### ❌ "Invalid refresh token"

**Yechim**:

1. Supabase-da "Refresh Token Rotation" enabled bo'lsin
2. `AuthProvider` component ishlayotganini tekshiring
3. Hamma cookie-lar saqlanayotganini tekshiring

---

## 5. Test Qilish

### Local Test

```bash
npm run build
npm start
```

### Production Test

1. Deploy qiling
2. Incognito/Private mode-da oching
3. Login qiling
4. 5-10 daqiqa kuting
5. Sahifani refresh qiling - login saqlanishi kerak

### Console Log Monitoring

`AuthProvider.tsx`-da console.log-lar bor:

- "Auth state changed: SIGNED_IN"
- "Token refreshed successfully"
- "Token expiring soon, refreshing..."

Bu log-lar production-da ham ko'rinadi (Browser Console-da).

---

## 6. Supabase-dan Tashqari Tekshirish Kerak Bo'lgan

### Netlify Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Vercel Settings

Automatic - hech narsa qilish shart emas.

---

## 📞 Muammo Hal Bo'lmasa

1. **Supabase Logs** tekshiring:
   https://supabase.com/dashboard/project/qnprrprzeamfbnsbxyui/logs/edge-logs

2. **Vercel/Netlify Function Logs** tekshiring

3. **Browser Network Tab**-da:

   - `POST /auth/v1/token?grant_type=password` so'rovini tekshiring
   - Response-da `access_token` va `refresh_token` borligini tekshiring
   - Cookie-lar `Set-Cookie` header bilan kelayotganini tekshiring

4. Issue yarating yoki men bilan bog'laning!

---

## ✅ Success Indicators

Hammasi to'g'ri ishlasa:

- ✅ Login qilgandan keyin redirect ishlaydi
- ✅ Sahifa refresh qilganda login saqlanadi
- ✅ 1 soat+ login saqlanadi
- ✅ Token avtomatik refresh bo'ladi (console log ko'rinadi)
- ✅ Logout ishlaydi
