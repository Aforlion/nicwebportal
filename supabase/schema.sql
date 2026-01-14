-- ENUMS
CREATE TYPE user_role AS ENUM ('student', 'member', 'admin', 'inspector');
CREATE TYPE membership_category AS ENUM ('student', 'associate', 'full', 'trainer', 'institutional');
CREATE TYPE attendance_mode AS ENUM ('online', 'physical', 'blended');
CREATE TYPE compliance_status AS ENUM ('compliant', 'under_review', 'sanctioned');

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAMS (Courses)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration TEXT, -- e.g., '6 weeks'
  mode attendance_mode DEFAULT 'blended',
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENROLLMENTS
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled', -- enrolled, active, completed, dropped
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  progress INTEGER DEFAULT 0, -- 0 to 100
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- MEMBERSHIPS
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category membership_category NOT NULL,
  nic_id TEXT UNIQUE, -- e.g., NIC-2024-0001
  expiry_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  digital_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CERTIFICATES
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issue_date DATE DEFAULT CURRENT_DATE,
  file_url TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FACILITIES
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  compliance_status compliance_status DEFAULT 'under_review',
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSPECTIONS
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ,
  conducted_at TIMESTAMPTZ,
  report_url TEXT,
  score INTEGER,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Examples
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are viewable by everyone." ON programs FOR SELECT USING (is_published = true);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own enrollments." ON enrollments FOR SELECT USING (auth.uid() = user_id);

-- FUNCTION: Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
