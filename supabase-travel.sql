-- ============================================
-- IN BLOOM — Travel Log Schema
-- Run in: Supabase > SQL Editor > New Query
-- ============================================

-- Trips table
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  destination text not null,
  country text,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  summary jsonb,
  created_at timestamptz default now()
);

-- Daily travel entries
create table if not exists travel_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  trip_id uuid references trips(id) on delete cascade not null,
  entry_date date not null,
  location text,
  moment text,
  food text,
  people text,
  surprise text,
  feeling text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists trips_user_id_idx on trips(user_id);
create index if not exists travel_entries_trip_id_idx on travel_entries(trip_id);

-- RLS
alter table trips enable row level security;
create policy "Users manage own trips" on trips for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table travel_entries enable row level security;
create policy "Users manage own travel entries" on travel_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
