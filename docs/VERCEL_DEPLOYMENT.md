# Vercel Deployment Instructions

## Cookie Issues Fix

Agar Vercel-da deploy qilgandan so'ng login qilsangiz lekin darhol qayta login sahifasiga redirect bo'lib qolsangiz, quyidagi sozlamalarni tekshiring:

### 1. Environment Variables (Vercel Dashboard)

Vercel dashboard-da Project Settings -> Environment Variables bo'limiga o'ting va quyidagi o'zgaruvchilarni qo'shing:

```
NEXT_PUBLIC_SUPABASE_URL=https://qnprrprzeamfbnsbxyui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase Dashboard Settings

Supabase dashboard-da:

1. **Authentication -> URL Configuration** bo'limiga o'ting
2. **Site URL** ga Vercel deployment URL-ni qo'shing: `https://your-app.vercel.app`
3. **Redirect URLs** ga quyidagilarni qo'shing:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (local development uchun)

### 3. Cookie Settings

Loyihada quyidagi cookie sozlamalari qo'llanilgan:

- **SameSite**: `lax` - Cross-site so'rovlar uchun
- **Secure**: Production-da `true` (HTTPS uchun)
- **Path**: `/` - Barcha yo'llar uchun
- **HttpOnly**: Supabase tomonidan avtomatik sozlanadi

### 4. Deploy

O'zgarishlarni commit qiling va Vercel-ga push qiling:

```bash
git add .
git commit -m "Fix cookie settings for production"
git push
```

Vercel avtomatik ravishda rebuild qiladi.

### 5. Clear Browser Cache

Agar muammo davom etsa:

1. Browser cache-ni tozalang
2. Browser Developer Tools -> Application -> Cookies-da barcha cookie-larni o'chiring
3. Sahifani yangilang va qayta login qiling

### 6. Debug

Agar muammo hali ham bo'lsa, Vercel Functions logs-ni tekshiring:

1. Vercel Dashboard -> Deployments -> Latest Deployment
2. **Functions** tab-ga o'ting
3. Log-larni ko'rib chiqing

## Deployment Commands

```bash
# Local development
npm run dev

# Production build test
npm run build
npm start

# Deploy to Vercel (automatic on git push)
git push origin main
```

## Common Issues

### Issue: "User not found" after login

**Solution**: Middleware-da cookie settings to'g'ri sozlanganini tekshiring.

### Issue: Infinite redirect loop

**Solution**: Supabase Redirect URLs to'g'ri sozlanganini va Site URL Vercel URL bilan mos kelishini tekshiring.

### Issue: CORS errors

**Solution**: Supabase dashboard-da CORS settings-ni tekshiring va Vercel URL-ni whitelist-ga qo'shing.
