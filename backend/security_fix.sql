-- Security Fixes for Supabase RLS and Storage
-- UPDATED: Only logged-in users can view or interact with data

-- 1. Enable RLS on all mentioned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Handle tables that might not exist in the local schema yet
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
        ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create "Private" Policies (Only Authenticated Users)

-- Profiles: Only logged-in users can view profiles. Only owner can update.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role()::text = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::uuid = id::uuid);

-- Drives: Only logged-in users can view drives. Only NGOs can manage their own.
DROP POLICY IF EXISTS "Drives are viewable by everyone" ON public.drives;
CREATE POLICY "Authenticated users can view drives" ON public.drives
    FOR SELECT USING (auth.role()::text = 'authenticated');

DROP POLICY IF EXISTS "NGOs can insert drives" ON public.drives;
CREATE POLICY "NGOs can insert drives" ON public.drives
    FOR INSERT WITH CHECK (auth.uid()::uuid = ngo_id::uuid);

DROP POLICY IF EXISTS "NGOs can update own drives" ON public.drives;
CREATE POLICY "NGOs can update own drives" ON public.drives
    FOR UPDATE USING (auth.uid()::uuid = ngo_id::uuid);

-- Milestones: Only logged-in users can view. NGO managers via drives.
DROP POLICY IF EXISTS "Milestones are viewable by everyone" ON public.milestones;
CREATE POLICY "Authenticated users can view milestones" ON public.milestones
    FOR SELECT USING (auth.role()::text = 'authenticated');

DROP POLICY IF EXISTS "NGOs can manage milestones" ON public.milestones;
CREATE POLICY "NGOs can manage milestones" ON public.milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.drives
            WHERE public.drives.id = public.milestones.drive_id
            AND public.drives.ngo_id::uuid = auth.uid()::uuid
        )
    );

-- Proofs: Only logged-in users can view.
DROP POLICY IF EXISTS "Proofs are viewable by everyone" ON public.proofs;
CREATE POLICY "Authenticated users can view proofs" ON public.proofs
    FOR SELECT USING (auth.role()::text = 'authenticated');

-- Donations: Only logged-in users can view and insert.
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
        DROP POLICY IF EXISTS "Donations are viewable by everyone" ON public.donations;
        CREATE POLICY "Authenticated users can view donations" ON public.donations 
            FOR SELECT USING (auth.role()::text = 'authenticated');
        
        DROP POLICY IF EXISTS "Authenticated users can donate" ON public.donations;
        CREATE POLICY "Authenticated users can donate" ON public.donations 
            FOR INSERT WITH CHECK (auth.role()::text = 'authenticated');
    END IF;
END $$;

-- Audit Logs: Only logged-in users can view. Read-only.
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        DROP POLICY IF EXISTS "Audit logs are viewable by everyone" ON public.audit_logs;
        CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs 
            FOR SELECT USING (auth.role()::text = 'authenticated');
        
        DROP POLICY IF EXISTS "Audit logs are read-only" ON public.audit_logs;
        CREATE POLICY "Audit logs are read-only" ON public.audit_logs 
            FOR INSERT WITH CHECK (false);
    END IF;
END $$;

-- 3. Storage Bucket Policy (Private Access)
-- Ensure 'proofs' bucket is unchecked "Public" in the UI
BEGIN;
  DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
  CREATE POLICY "Authenticated Storage Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'proofs' AND auth.role()::text = 'authenticated');
COMMIT;
