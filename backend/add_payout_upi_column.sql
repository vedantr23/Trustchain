-- ─────────────────────────────────────────────────────────────────
-- Migration: Add payout_upi_id to drives table
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.drives
  ADD COLUMN IF NOT EXISTS payout_upi_id TEXT DEFAULT NULL;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'drives' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
