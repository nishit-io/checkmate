-- ============================================================================
--  Checkmate — Supabase schema
--  Paste this whole file into Supabase Dashboard → SQL Editor → New query → Run.
--  Safe to re-run: every statement is idempotent (drop-if-exists / if-not-exists).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#6366f1',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  description text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  status      text not null default 'backlog' check (status in ('backlog','todo','in-progress','done')),
  due_date    date,
  subtasks    jsonb not null default '[]'::jsonb,
  sort_order  double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Helpful indexes for per-user reads
create index if not exists tasks_user_idx       on public.tasks (user_id);
create index if not exists tasks_user_cell_idx  on public.tasks (user_id, status, priority);
create index if not exists categories_user_idx  on public.categories (user_id, sort_order);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY  (the only wall between users — never disable)
-- ----------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.tasks      enable row level security;

drop policy if exists "categories are private to owner" on public.categories;
create policy "categories are private to owner"
  on public.categories for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks are private to owner" on public.tasks;
create policy "tasks are private to owner"
  on public.tasks for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. AUTO-UPDATE updated_at ON tasks
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. SEED DEFAULT CATEGORIES FOR EVERY NEW USER
--    Fires once when a user signs up (Google or email/password).
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, color, sort_order) values
    (new.id, 'Work',     '#6366f1', 0),
    (new.id, 'Personal', '#ec4899', 1),
    (new.id, 'Shopping', '#10b981', 2),
    (new.id, 'Wellness', '#f59e0b', 3);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. REALTIME — broadcast row changes to subscribed clients
-- ----------------------------------------------------------------------------

do $$
begin
  -- add tables to the realtime publication if not already members
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'categories'
  ) then
    alter publication supabase_realtime add table public.categories;
  end if;
end $$;

-- Done. Tables, RLS, seeding, and realtime are configured.
