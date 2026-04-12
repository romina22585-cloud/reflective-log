-- ============================================
-- Reflective Log — Supabase Database Schema
-- Run this in: Supabase > SQL Editor > New Query
-- ============================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- Entries table
create table entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('daily', 'freewrite', 'weekly')) not null,
  content jsonb not null default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user queries
create index entries_user_id_idx on entries(user_id);
create index entries_created_at_idx on entries(created_at desc);

-- Row Level Security: users can only see their own entries
alter table entries enable row level security;

create policy "Users can view own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own entries"
  on entries for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
  before update on entries
  for each row execute procedure update_updated_at();
