-- Remote Testing System (MVP) - Supabase schema
-- Apply in Supabase SQL editor.

-- Extensions
create extension if not exists pgcrypto;

-- ----------
-- Helpers
-- ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------
-- Core tables
-- ----------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null check (role in ('admin', 'student')) default 'student',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Requires profiles table
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  time_limit_seconds int not null default 600 check (time_limit_seconds > 0),
  max_attempts int not null default 1 check (max_attempts >= 1),
  published boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tests_set_updated_at
before update on public.tests
for each row execute function public.set_updated_at();

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  prompt text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_id, position)
);

create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  text text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, position)
);

create trigger options_set_updated_at
before update on public.options
for each row execute function public.set_updated_at();

-- Correct answer is stored separately so students cannot select it via RLS.
create table if not exists public.correct_options (
  question_id uuid primary key references public.questions(id) on delete cascade,
  option_id uuid not null references public.options(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger correct_options_set_updated_at
before update on public.correct_options
for each row execute function public.set_updated_at();

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  status text not null check (status in ('in_progress', 'submitted', 'expired')) default 'in_progress',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score int,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, test_id, id)
);

create index if not exists attempts_student_test_idx on public.attempts(student_id, test_id);

create trigger attempts_set_updated_at
before update on public.attempts
for each row execute function public.set_updated_at();

-- -------------
-- Audit logs
-- -------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_entity_id uuid;
  v_action text;
begin
  v_actor := auth.uid();
  v_entity_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid);
  v_action := tg_op;

  insert into public.audit_logs(actor_id, action, entity_table, entity_id, payload)
  values (v_actor, v_action, tg_table_name, v_entity_id, jsonb_build_object('new', to_jsonb(new), 'old', to_jsonb(old)));

  return coalesce(new, old);
end;
$$;

-- Attach audit triggers (minimal but useful)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_tests') then
    create trigger audit_tests after insert or update or delete on public.tests
    for each row execute function public.write_audit_log();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_questions') then
    create trigger audit_questions after insert or update or delete on public.questions
    for each row execute function public.write_audit_log();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_options') then
    create trigger audit_options after insert or update or delete on public.options
    for each row execute function public.write_audit_log();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_correct_options') then
    create trigger audit_correct_options after insert or update or delete on public.correct_options
    for each row execute function public.write_audit_log();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_attempts') then
    create trigger audit_attempts after insert or update or delete on public.attempts
    for each row execute function public.write_audit_log();
  end if;
end $$;

-- ---------------------------
-- Auto-create profiles on signup
-- ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(user_id, email, role)
  values (new.id, new.email, 'student')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end $$;

-- ----------------
-- Row Level Security
-- ----------------
alter table public.profiles enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.correct_options enable row level security;
alter table public.attempts enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on public.profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- tests
create policy "tests_select_published_or_admin" on public.tests
for select
to authenticated
using (published = true or public.is_admin());

create policy "tests_admin_write" on public.tests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- questions
create policy "questions_select_if_test_visible" on public.questions
for select
to authenticated
using (
  exists (
    select 1 from public.tests t
    where t.id = questions.test_id
      and (t.published = true or public.is_admin())
  )
);

create policy "questions_admin_write" on public.questions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- options
create policy "options_select_if_test_visible" on public.options
for select
to authenticated
using (
  exists (
    select 1
    from public.questions q
    join public.tests t on t.id = q.test_id
    where q.id = options.question_id
      and (t.published = true or public.is_admin())
  )
);

create policy "options_admin_write" on public.options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- correct_options (admins only)
create policy "correct_options_admin_only" on public.correct_options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- attempts
create policy "attempts_select_own_or_admin" on public.attempts
for select
to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "attempts_insert_own" on public.attempts
for insert
to authenticated
with check (student_id = auth.uid());

-- attempts updates are handled server-side with service role; keep student updates off.
create policy "attempts_admin_update" on public.attempts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- audit logs (admins only)
create policy "audit_logs_admin_only" on public.audit_logs
for select
to authenticated
using (public.is_admin());
