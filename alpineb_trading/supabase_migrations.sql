-- ============================================================
-- AlpineB Trading — Migracije
-- Zaženite v: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- STRATEGIES
create table if not exists public.strategies (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  title         text        not null,
  description   text        not null,
  entry_rules   text,
  exit_rules    text,
  risk_mgmt     text,
  category      text        default 'swing',
  timeframe     text        default '1d',
  asset_class   text        default 'general',
  created_at    timestamptz default now() not null
);
alter table public.strategies enable row level security;
create policy "Vsi vidijo strategije"           on public.strategies for select using (true);
create policy "Prijavljeni dodajo strategijo"   on public.strategies for insert with check (auth.uid() = user_id);
create policy "Avtor ureja svojo strategijo"    on public.strategies for update using (auth.uid() = user_id);
create policy "Avtor briše svojo strategijo"    on public.strategies for delete using (auth.uid() = user_id);

-- EDUCATION
create table if not exists public.education (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  content     text        not null,
  category    text        default 'general',
  difficulty  text        default 'beginner',
  read_time   int         default 5,
  created_at  timestamptz default now() not null
);
alter table public.education enable row level security;
create policy "Vsi vidijo članke"           on public.education for select using (true);
create policy "Prijavljeni dodajo članek"   on public.education for insert with check (auth.uid() = user_id);
create policy "Avtor ureja svoj članek"     on public.education for update using (auth.uid() = user_id);
create policy "Avtor briše svoj članek"     on public.education for delete using (auth.uid() = user_id);

-- RESOURCES
create table if not exists public.resources (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  description text        not null,
  url         text        not null,
  category    text        default 'tool',
  created_at  timestamptz default now() not null
);
alter table public.resources enable row level security;
create policy "Vsi vidijo vire"           on public.resources for select using (true);
create policy "Prijavljeni dodajo vir"    on public.resources for insert with check (auth.uid() = user_id);
create policy "Avtor ureja svoj vir"      on public.resources for update using (auth.uid() = user_id);
create policy "Avtor briše svoj vir"      on public.resources for delete using (auth.uid() = user_id);
