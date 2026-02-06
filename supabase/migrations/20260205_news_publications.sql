-- Add News and Events tables
CREATE TABLE IF NOT EXISTS news_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'news', -- 'news' or 'event'
  location TEXT, -- only for events
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Publications table for Advocacy & Research
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  abstract TEXT,
  file_url TEXT,
  category TEXT NOT NULL DEFAULT 'research', -- 'research' or 'policy'
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Select policies (Public viewable)
CREATE POLICY "Public news_events are viewable by everyone." ON news_events FOR SELECT USING (true);
CREATE POLICY "Public publications are viewable by everyone." ON publications FOR SELECT USING (true);

-- Admin policies (Insert/Update/Delete)
-- Assuming we use the user_role enum 'admin' from profiles
CREATE POLICY "Admins can manage news_events" ON news_events 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage publications" ON publications 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Update updated_at triggers
CREATE TRIGGER update_news_events_updated_at BEFORE UPDATE ON news_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
