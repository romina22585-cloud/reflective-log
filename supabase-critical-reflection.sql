-- IN BLOOM: allow the new 'critical' entry type (Critical Experience Reflection)
-- Run once in Supabase > SQL Editor BEFORE deploying the new code.
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_type_check;
ALTER TABLE entries ADD CONSTRAINT entries_type_check
  CHECK (type IN ('daily', 'freewrite', 'weekly', 'morning', 'critical'));
