-- ====================================================================
-- TRUSTCHAIN RLS FIX – RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/lnzivwuupgeuhvrcwoyw/sql
-- Paste and click "RUN"
-- ====================================================================

-- 1. Drop all existing policies that block anonymous access
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 2. Disable Row Level Security on all tables so web client can write
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proofs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions to anon (frontend) and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Set default privileges for any future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Success confirmation notice
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled and full privileges granted to anon and authenticated successfully!';
END $$;
