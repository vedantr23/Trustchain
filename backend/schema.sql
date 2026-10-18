-- ============================================================
-- TRUSTCHAIN  –  Clean Database Schema (v2)
-- PostgreSQL / Supabase
-- Run this against a FRESH Supabase project (SQL Editor)
-- ============================================================

-- ── 0. EXTENSIONS ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ENUM TYPES ──────────────────────────────────────────
CREATE TYPE public.user_role      AS ENUM ('NGO', 'Admin', 'Donor');
CREATE TYPE public.drive_status   AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE public.ms_status      AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE public.proof_kind     AS ENUM ('photo', 'invoice', 'video', 'gps', 'document');
CREATE TYPE public.donation_status AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE public.audit_action   AS ENUM (
  'DRIVE_CREATED', 'DRIVE_UPDATED', 'DRIVE_CANCELLED',
  'MILESTONE_CREATED', 'MILESTONE_SUBMITTED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED',
  'DONATION_RECEIVED', 'FUNDS_RELEASED',
  'NGO_LIMIT_UPDATED', 'PROOF_UPLOADED'
);

-- ── 2. PROFILES ─────────────────────────────────────────────
-- One row per user (linked to Supabase Auth via id)
CREATE TABLE public.profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT UNIQUE NOT NULL,
  full_name        TEXT NOT NULL,
  role             public.user_role NOT NULL DEFAULT 'Donor',
  avatar_url       TEXT,
  -- NGO-specific
  max_drive_limit  NUMERIC(14,2) DEFAULT 1000000 CHECK (max_drive_limit >= 0),
  wallet_address   TEXT,          -- Ethereum wallet for blockchain integration
  -- timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default "demo NGO" used when no auth is wired up yet
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@trustchain.org', 'Demo NGO', 'NGO')
ON CONFLICT (id) DO NOTHING;

-- ── 3. DRIVES (Fundraising Campaigns) ───────────────────────
CREATE TABLE public.drives (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ngo_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT
                        DEFAULT '00000000-0000-0000-0000-000000000000',
  title               TEXT NOT NULL,
  description         TEXT,
  problem_statement   TEXT,
  category            TEXT NOT NULL DEFAULT 'General',
  location            TEXT,
  target_amount       NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  raised_amount       NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  status              public.drive_status NOT NULL DEFAULT 'active',
  image_url           TEXT,
  start_date          DATE,
  end_date            DATE,
  beneficiaries_count INTEGER DEFAULT 0 CHECK (beneficiaries_count >= 0),
  urgency_level       TEXT DEFAULT 'Medium'
                        CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Critical')),
  -- Blockchain anchor
  blockchain_id       INTEGER,
  blockchain_tx_hash  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. MILESTONES ────────────────────────────────────────────
CREATE TABLE public.milestones (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id         UUID NOT NULL REFERENCES public.drives(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  target_amount    NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  target_date      DATE,
  status           public.ms_status NOT NULL DEFAULT 'pending',
  -- Proof requirements (NGO declares what they will submit)
  requires_gps     BOOLEAN NOT NULL DEFAULT FALSE,
  requires_photo   BOOLEAN NOT NULL DEFAULT TRUE,
  requires_video   BOOLEAN NOT NULL DEFAULT FALSE,
  requires_invoice BOOLEAN NOT NULL DEFAULT TRUE,
  -- Blockchain anchor
  blockchain_index INTEGER,
  blockchain_ipfs_hash TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. PROOFS ────────────────────────────────────────────────
-- Evidence uploaded by NGOs per milestone (stored on IPFS via Pinata)
CREATE TABLE public.proofs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id     UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  uploaded_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  proof_kind       public.proof_kind NOT NULL,
  ipfs_cid         TEXT,            -- Pinata / IPFS content ID
  file_url         TEXT NOT NULL,   -- Public gateway URL
  gps_latitude     NUMERIC(10,7),
  gps_longitude    NUMERIC(10,7),
  beneficiary_count INTEGER,
  notes            TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. DONATIONS ─────────────────────────────────────────────
CREATE TABLE public.donations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id         UUID NOT NULL REFERENCES public.drives(id) ON DELETE CASCADE,
  donor_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL
                     DEFAULT '00000000-0000-0000-0000-000000000000',
  donor_name       TEXT NOT NULL DEFAULT 'Anonymous',
  amount           NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status           public.donation_status NOT NULL DEFAULT 'completed',
  -- Payment & blockchain
  transaction_id       TEXT UNIQUE,
  blockchain_tx_hash   TEXT,
  payment_gateway      TEXT DEFAULT 'razorpay',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 7. AUDIT LOGS ────────────────────────────────────────────
-- Immutable record of every significant action in the system
CREATE TABLE public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action       public.audit_action NOT NULL,
  actor_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_table TEXT,
  target_id    UUID,
  details      JSONB DEFAULT '{}',   -- flexible key-value bag
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. UPDATED_AT TRIGGERS ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_drives_updated_at
  BEFORE UPDATE ON public.drives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 9. DONATION → raised_amount TRIGGER ─────────────────────
CREATE OR REPLACE FUNCTION public.increment_drive_raised_amount()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.drives
      SET raised_amount = raised_amount + NEW.amount
      WHERE id = NEW.drive_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_donation_increment
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.increment_drive_raised_amount();

-- ── 10. USEFUL INDEXES ───────────────────────────────────────
CREATE INDEX idx_drives_ngo_id      ON public.drives(ngo_id);
CREATE INDEX idx_drives_status      ON public.drives(status);
CREATE INDEX idx_milestones_drive   ON public.milestones(drive_id);
CREATE INDEX idx_milestones_status  ON public.milestones(status);
CREATE INDEX idx_proofs_milestone   ON public.proofs(milestone_id);
CREATE INDEX idx_donations_drive    ON public.donations(drive_id);
CREATE INDEX idx_donations_donor    ON public.donations(donor_id);
CREATE INDEX idx_audit_actor        ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_created      ON public.audit_logs(created_at DESC);

-- ── 11. ROW LEVEL SECURITY (disable for prototype) ──────────
-- TODO: Enable and configure RLS policies before production.
ALTER TABLE public.profiles    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs  DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ── 12. REALTIME ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.drives;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- ── 13. SEED DATA ────────────────────────────────────────────
INSERT INTO public.drives (id, title, description, category, location, target_amount, raised_amount, urgency_level, beneficiaries_count, blockchain_id)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001',
   'Emergency Flood Relief 2026',
   'Providing immediate disaster relief – food ration kits, drinking water, and dry shelters to families displaced by severe coastal flooding.',
   'Disaster Relief', 'Nagpur & Coastal Regions',
   300000, 0, 'Critical', 1200, 1),
  ('a1b2c3d4-0002-0002-0002-000000000002',
   'Rural Girls Solar STEM Lab',
   'Establishing a solar-powered computer science lab with internet access and digital robotics kits for underprivileged girls.',
   'Education', 'Rural Rajasthan',
   250000, 0, 'High', 450, 2),
  ('a1b2c3d4-0003-0003-0003-000000000003',
   'Clean Drinking Water Borewell Project',
   'Installing solar-powered deep borewell water filtration stations for tribal hamlets with zero access to safe potable water.',
   'Healthcare', 'Thane Tribal Belt',
   150000, 0, 'Medium', 800, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.milestones (id, drive_id, title, description, target_amount, status, requires_gps, requires_photo, requires_invoice)
VALUES
  ('b1000001-0001-0001-0001-000000000001',
   'a1b2c3d4-0001-0001-0001-000000000001',
   'Phase 1 – 500 Emergency Food Ration Kits',
   'Procurement and field distribution of 500 family food packages.',
   100000, 'approved', true, true, true),
  ('b1000002-0002-0002-0002-000000000002',
   'a1b2c3d4-0001-0001-0001-000000000001',
   'Phase 2 – Water Filtration & Hygiene Supplies',
   'Distribution of portable filtration systems and hygiene packs.',
   100000, 'pending', true, true, true),
  ('b1000003-0003-0003-0003-000000000003',
   'a1b2c3d4-0002-0002-0002-000000000002',
   'Procure 10 Refurbished Laptops & Solar Battery Bank',
   'Procurement of 10 Linux laptops, solar panels, and 5kWh battery inverter.',
   120000, 'pending', false, true, true),
  ('b1000004-0004-0004-0004-000000000004',
   'a1b2c3d4-0003-0003-0003-000000000003',
   'Hydro-Geological Survey & Ground Drilling',
   'Ground survey by certified geologists and heavy rig drilling to 350 ft.',
   75000, 'pending', true, true, true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
