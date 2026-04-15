-- ============================================
-- IN BLOOM — Schema Fix
-- Run this in: Supabase > SQL Editor > New Query
-- Fixes: morning entry type, habits cleanup
-- ============================================

-- Fix 1: Add 'morning' to the allowed entry types
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_type_check;
ALTER TABLE entries ADD CONSTRAINT entries_type_check 
  CHECK (type IN ('daily', 'freewrite', 'weekly', 'morning'));

-- Fix 2: Clear out all existing habits so the app can reseed with the new defaults
DELETE FROM habit_logs WHERE user_id IN (SELECT id FROM auth.users);
DELETE FROM habits WHERE user_id IN (SELECT id FROM auth.users);
