-- ============================================
-- IN BLOOM — Emotional Intelligence tab (v10, with Coaching log)
-- Run ONCE in: Supabase > SQL Editor > New Query
-- Run this BEFORE deploying the new code.
-- Safe to run again if you already ran an earlier copy.
-- ============================================

-- Emotion check-ins
create table if not exists ei_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  quadrant text not null,
  emotion text not null,
  intensity int not null,
  trigger text,
  body text,
  response text,
  reaction text,
  created_at timestamptz default now()
);

-- Practice log
create table if not exists ei_practice_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  practice_id text not null,
  note text,
  logged_date date not null default current_date,
  created_at timestamptz default now()
);

-- Monthly self-assessments
create table if not exists ei_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ratings jsonb not null,
  focus text,
  ideal_self text,
  created_at timestamptz default now()
);

create index if not exists ei_checkins_user_id_idx on ei_checkins(user_id);
create index if not exists ei_practice_logs_user_id_idx on ei_practice_logs(user_id);
create index if not exists ei_assessments_user_id_idx on ei_assessments(user_id);

alter table ei_checkins enable row level security;
drop policy if exists "Users manage own ei checkins" on ei_checkins;
create policy "Users manage own ei checkins" on ei_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table ei_practice_logs enable row level security;
drop policy if exists "Users manage own ei practice logs" on ei_practice_logs;
create policy "Users manage own ei practice logs" on ei_practice_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table ei_assessments enable row level security;
drop policy if exists "Users manage own ei assessments" on ei_assessments;
create policy "Users manage own ei assessments" on ei_assessments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coaching log: situations to discuss in a coaching session.
-- Private to each user, like everything else in this tab.
create table if not exists ei_coaching_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  checkin_id uuid references ei_checkins(id) on delete set null,
  title text not null,
  what_happened text,
  felt text,
  did text,
  want text,
  discussed boolean not null default false,
  takeaway text,
  discussed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists ei_coaching_items_user_id_idx on ei_coaching_items(user_id);

alter table ei_coaching_items enable row level security;
drop policy if exists "Users manage own ei coaching items" on ei_coaching_items;
create policy "Users manage own ei coaching items" on ei_coaching_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
