-- =========================================================
-- TRUSTCHAIN: V8 "DEMO MODE" (NO-AUTH REQUIRED)
-- Strategy: Allow public access and bypass login checks
-- =========================================================

-- 1. CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_donation_created ON public.donations;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.proofs CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.drives CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.milestone_status CASCADE;
DROP TYPE IF EXISTS public.proof_type CASCADE;

-- 2. TYPES
CREATE TYPE public.user_role AS ENUM ('NGO', 'Donor', 'Admin');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.proof_type AS ENUM ('image', 'video', 'pdf', 'gps');

-- 3. TABLES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Demo: Auto-generate ID
    email TEXT,
    full_name TEXT,
    role public.user_role NOT NULL DEFAULT 'NGO', -- Demo: Default to NGO
    avatar_url TEXT,
    max_drive_limit DECIMAL DEFAULT 1000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE A GLOBAL PLACEHOLDER NGO FOR DEMO MODE
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@trustchain.org', 'Demo NGO', 'NGO');

CREATE TABLE public.drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID DEFAULT '00000000-0000-0000-0000-000000000000', -- Demo: Always use placeholder
    title TEXT NOT NULL,
    description TEXT,
    problem_statement TEXT,
    category TEXT DEFAULT 'General',
    location TEXT,
    target_amount DECIMAL NOT NULL CHECK (target_amount > 0),
    raised_amount DECIMAL DEFAULT 0.0 CHECK (raised_amount >= 0),
    status TEXT DEFAULT 'active',
    image_url TEXT,
    start_date DATE,
    end_date DATE,
    beneficiaries_count INTEGER DEFAULT 0,
    urgency_level TEXT DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID REFERENCES public.drives(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL NOT NULL CHECK (target_amount > 0),
    target_date DATE,
    status public.milestone_status DEFAULT 'pending',
    gps_required BOOLEAN DEFAULT FALSE,
    photo_required BOOLEAN DEFAULT TRUE,
    video_required BOOLEAN DEFAULT FALSE,
    invoice_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE NOT NULL,
    proof_type public.proof_type NOT NULL,
    proof_url TEXT NOT NULL,
    status public.milestone_status DEFAULT 'pending',
    gps_location TEXT,
    beneficiary_count INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    drive_id UUID REFERENCES public.drives(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL NOT NULL CHECK (amount > 0),
    transaction_id TEXT UNIQUE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    actor_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    target_table TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DISABLE RLS FOR DEMO MODE
-- This allows anyone to read/write without being logged in.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- 5. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- 6. AUTOMATION
CREATE OR REPLACE FUNCTION public.update_drive_raised_amount()
RETURNS trigger AS $$
BEGIN
    UPDATE public.drives SET raised_amount = raised_amount + new.amount WHERE id = new.drive_id;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_donation_created AFTER INSERT ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_drive_raised_amount();
