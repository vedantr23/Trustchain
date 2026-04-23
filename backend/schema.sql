-- backend/schema.sql
-- Create custom types
CREATE TYPE user_role AS ENUM ('NGO', 'Donor', 'Admin');
CREATE TYPE milestone_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE proof_type AS ENUM ('image', 'video', 'pdf', 'gps');

-- User Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'Donor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drives Table
CREATE TABLE drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  raised_amount DECIMAL DEFAULT 0.0,
  ngo_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Milestones Table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id UUID REFERENCES drives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  status milestone_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Proofs Table
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  proof_type proof_type NOT NULL,
  proof_url TEXT NOT NULL,
  status milestone_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Default Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- For initial development, we'll allow all operations
-- Profiles
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true);
-- Drives
CREATE POLICY "Allow all on drives" ON drives FOR ALL USING (true);
-- Milestones
CREATE POLICY "Allow all on milestones" ON milestones FOR ALL USING (true);
-- Proofs
CREATE POLICY "Allow all on proofs" ON proofs FOR ALL USING (true);

-- Enabling Real-time updates for these tables
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'drives'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE drives, milestones;
    END IF;
  END
  $$;
COMMIT;
