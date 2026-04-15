-- ============================================
-- Reflective Log — Schema UPDATE (v3)
-- Run this in: Supabase > SQL Editor > New Query
-- Adds: profiles, saved_reflections, approval system
-- ============================================

-- User profiles (display name + approval status)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  is_approved boolean default false,
  requested_at timestamptz default now(),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, is_approved)
  values (new.id, false);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Mark the FIRST user (you) as approved automatically
-- Run this separately after your first login if needed:
-- update profiles set is_approved = true where id = (select id from auth.users order by created_at limit 1);

-- Saved reflections
create table if not exists saved_reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_id uuid references entries(id) on delete cascade,  -- null = multi-entry insight
  type text check (type in ('single', 'multi')) not null default 'single',
  content text not null,
  created_at timestamptz default now()
);

create index if not exists saved_reflections_user_id_idx on saved_reflections(user_id);
create index if not exists saved_reflections_entry_id_idx on saved_reflections(entry_id);

-- RLS for profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- RLS for saved_reflections
alter table saved_reflections enable row level security;

create policy "Users manage own saved reflections"
  on saved_reflections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- AFTER RUNNING THIS SCRIPT:
-- Approve yourself by running this query:
-- update profiles set is_approved = true, approved_at = now()
-- where id = (select id from auth.users order by created_at asc limit 1);
-- ============================================
