-- ============================================
-- Reflective Log — Schema UPDATE (v2)
-- Run this in: Supabase > SQL Editor > New Query
-- This ADDS to your existing schema, safe to run
-- ============================================

-- Custom habits definition per user
create table if not exists habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text default '✦',
  is_default boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

-- Daily habit completions
create table if not exists habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  logged_date date not null,
  created_at timestamptz default now() not null,
  unique(user_id, habit_id, logged_date)
);

-- Indexes
create index if not exists habits_user_id_idx on habits(user_id);
create index if not exists habit_logs_user_id_idx on habit_logs(user_id);
create index if not exists habit_logs_date_idx on habit_logs(logged_date desc);

-- Row Level Security for habits
alter table habits enable row level security;
create policy "Users manage own habits" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Row Level Security for habit_logs
alter table habit_logs enable row level security;
create policy "Users manage own habit logs" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
