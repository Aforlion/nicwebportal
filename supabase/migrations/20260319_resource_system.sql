-- ============================================
-- Resource System (Knowledge Center)
-- ============================================

-- Create a bucket for resources if it doesn't exist
-- Note: Bucket creation is usually done via API or UI, 
-- but we can insert into storage.buckets if needed.
-- However, we'll assume the bucket exists or is created via init_storage.sql logic.

-- Consolidated Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT, -- Markdown or HTML content for articles
  excerpt TEXT, -- Short description for cards
  file_url TEXT, -- URL for downloadable resources (PDF, etc.)
  image_url TEXT, -- Featured image URL
  
  -- Category & Type
  category TEXT NOT NULL DEFAULT 'general', -- 'research', 'article', 'policy', 'guide', etc.
  resource_type TEXT NOT NULL DEFAULT 'article', -- 'article', 'download', 'link'
  
  -- Metadata
  is_published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Published resources are viewable by everyone" ON resources;
CREATE POLICY "Published resources are viewable by everyone" ON resources
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all resources" ON resources;
CREATE POLICY "Admins can manage all resources" ON resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at 
  BEFORE UPDATE ON resources 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_is_published ON resources(is_published);
