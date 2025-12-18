# Remote Testing System (MVP)

Next.js (App Router) + Supabase MVP for learning centers:

- Admins create tests (MCQ), set correct answers, publish.
- Students take tests with timer + auto-submit.
- Results are stored and viewable (student: own, admin: all).

## 🚨 Production Deployment Issues?

**Cookie o'chib ketayaptimi?**

1. **Tezkor hal qilish**: [docs/QUICK_FIX.md](docs/QUICK_FIX.md) ⚡
2. **Batafsil**: [docs/SUPABASE_COOKIE_FIX.md](docs/SUPABASE_COOKIE_FIX.md) 📖
3. **Deployment**: [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) 🚀

**Production URLs:**

- Vercel: https://remote-testing-system.vercel.app
- Netlify: https://remote-testing-system.netlify.app

## Setup

### 1) Supabase

- Create a Supabase project.
- Run SQL in `../supabase/schema.sql` (repo root) in the Supabase SQL editor.

### 2) Environment

- Copy `.env.example` to `.env.local` and fill values.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used to compute scores securely)

### 3) Make an admin user

Create a user via `/login` (Sign up), then in Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

## Run

```bash
cd web
npm run dev
```

Open:

- `/login`
- `/admin/tests` (admin)
- `/student/tests` (student)

## Docs

- `docs/openapi.yaml`
- `docs/admin_manual.md`
- `docs/student_user_guide.md`

# remote-testing-system
