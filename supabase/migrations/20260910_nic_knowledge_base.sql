-- 20260910_nic_knowledge_base.sql
-- Single Source of Truth Knowledge System Schema for NIC

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. KB Articles Table
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  prohibited_claims_guard TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  published_version_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KB Versions Table
CREATE TABLE IF NOT EXISTS public.kb_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  change_summary TEXT DEFAULT 'Initial version',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, version_number)
);

-- 3. KB Embeddings Table
CREATE TABLE IF NOT EXISTS public.kb_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  chunk_content TEXT NOT NULL,
  embedding vector(1536),
  version_number INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KB Escalations (Unanswered Queries & AI Guardrail Triggers)
CREATE TABLE IF NOT EXISTS public.kb_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'website',
  user_identifier TEXT,
  user_name TEXT,
  query_text TEXT NOT NULL,
  bot_response TEXT,
  reason TEXT NOT NULL DEFAULT 'human_requested',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KB Feedback
CREATE TABLE IF NOT EXISTS public.kb_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_feedback ENABLE ROW LEVEL SECURITY;

-- Explicit Grants for REST API Schema Cache & Queries
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.kb_articles TO anon, authenticated;
GRANT SELECT ON public.kb_versions TO anon, authenticated;
GRANT SELECT ON public.kb_embeddings TO anon, authenticated;
GRANT SELECT, INSERT ON public.kb_feedback TO anon, authenticated;
GRANT INSERT ON public.kb_escalations TO anon, authenticated;

DROP POLICY IF EXISTS "Public articles read" ON public.kb_articles;
CREATE POLICY "Public articles read" ON public.kb_articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Full access to kb_articles" ON public.kb_articles;
CREATE POLICY "Full access to kb_articles" ON public.kb_articles FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to kb_versions" ON public.kb_versions;
CREATE POLICY "Full access to kb_versions" ON public.kb_versions FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to kb_embeddings" ON public.kb_embeddings;
CREATE POLICY "Full access to kb_embeddings" ON public.kb_embeddings FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to kb_escalations" ON public.kb_escalations;
CREATE POLICY "Full access to kb_escalations" ON public.kb_escalations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public insert feedback" ON public.kb_feedback;
CREATE POLICY "Public insert feedback" ON public.kb_feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Full access feedback" ON public.kb_feedback;
CREATE POLICY "Full access feedback" ON public.kb_feedback FOR ALL USING (true);

