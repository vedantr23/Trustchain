-- =========================================================
-- TRUSTCHAIN: REAL UPI & MILESTONE ESCROW SCHEMA UPDATE
-- =========================================================

-- 1. Add NGO Payout UPI and Admin Escrow fields to Drives
ALTER TABLE public.drives 
  ADD COLUMN IF NOT EXISTS payout_upi_id TEXT DEFAULT 'ngo.trustchain@okaxis',
  ADD COLUMN IF NOT EXISTS escrow_account_id TEXT DEFAULT 'ayushsahu882004@oksbi';

-- 2. Add Milestone-specific Escrow and Payout fields
ALTER TABLE public.milestones 
  ADD COLUMN IF NOT EXISTS payout_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS escrow_locked_amount NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_released_amount NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS release_upi_ref TEXT;

-- 3. Add milestone segregation and escrow status to Donations
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS upi_ref_id TEXT,
  ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'locked';

-- 4. Enable Realtime on these columns
COMMENT ON COLUMN public.drives.payout_upi_id IS 'NGO UPI ID for receiving released milestone funds';
COMMENT ON COLUMN public.milestones.escrow_locked_amount IS 'Funds locked in Admin Escrow specifically for this milestone';
