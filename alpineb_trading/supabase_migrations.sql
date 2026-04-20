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

-- STRATEGY IMAGES (Storage)
-- Zaženite v: Supabase Dashboard → SQL Editor → New Query
alter table public.strategies add column if not exists images text[];

insert into storage.buckets (id, name, public)
  values ('strategy-images', 'strategy-images', true)
  on conflict (id) do nothing;

create policy "Javni dostop do slik strategij"
  on storage.objects for select
  using (bucket_id = 'strategy-images');

create policy "Prijavljeni nalagajo slike strategij"
  on storage.objects for insert
  with check (bucket_id = 'strategy-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avtor briše svoje slike strategij"
  on storage.objects for delete
  using (bucket_id = 'strategy-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- TRADING SYMBOL
alter table public.strategies add column if not exists tv_symbol text;

-- ============================================================
-- ADMIN PANEL
-- ============================================================

-- 1. Dodaj is_admin stolpec na profiles
alter table public.profiles add column if not exists is_admin boolean default false;

-- 2. Ustvari admin@scv.si uporabnika v Supabase Dashboard → Authentication → Users → Add User
--    Email: admin@scv.si | Password: 123123123 | potrdi email
--    Nato zaženi spodnji UPDATE (zamenjaj <UUID> z ID-jem iz auth.users):

-- UPDATE public.profiles SET is_admin = true
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@scv.si');

-- 3. Admin RLS politike — admin lahko briše karkoli
create policy "Admin briše vse objave"
  on public.posts for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admin briše vse odgovore"
  on public.replies for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admin briše vse strategije"
  on public.strategies for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admin briše vse profile"
  on public.profiles for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admin ureja vse profile"
  on public.profiles for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

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
