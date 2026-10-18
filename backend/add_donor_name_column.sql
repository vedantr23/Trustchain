-- =========================================================
-- FIX SCHEMA MISMATCH: ADD DONOR_NAME COLUMN
-- Run this in Supabase SQL Editor
-- =========================================================

-- Add missing donor_name column to donations table
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS donor_name TEXT DEFAULT 'Anonymous Supporter';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'donations' AND table_schema = 'public';

-- Test insert with donor_name
INSERT INTO public.donations (drive_id, amount, donor_name, donor_id, transaction_id, blockchain_tx_hash, status)
VALUES (
  (SELECT id FROM public.drives LIMIT 1),
  100,
  'Test Donor After Schema Fix',
  '00000000-0000-0000-0000-000000000000',
  'test-schema-fix-tx',
  '0xtesthash',
  'completed'
);

-- Clean up test data
DELETE FROM public.donations WHERE transaction_id = 'test-schema-fix-tx';