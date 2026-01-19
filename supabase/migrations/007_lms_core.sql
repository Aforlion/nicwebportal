-- ============================================
-- Phase 4: Learning Management System (LMS)
-- ============================================

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for url friendly access
    description TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    duration_hours INTEGER,
    level TEXT DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modules Table (Sections within a course)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lessons Table (Content units)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT, -- Markdown content
    video_url TEXT, -- Vimeo/YouTube
    resource_url TEXT, -- PDF/Doc download
    duration_minutes INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false, -- Free preview
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, slug)
);

-- 4. Enrollments Table (Student <-> Course)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', -- active, completed, expired
    progress DECIMAL(5, 2) DEFAULT 0.00,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- 5. Lesson Progress (Detailed tracking)
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

-- 6. Assessments (Quizzes / Projects)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- quiz, project
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    max_score INTEGER DEFAULT 100,
    questions JSONB, -- For quizzes: [{question, options, answer}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessment Submissions (Grades)
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    score INTEGER,
    status TEXT DEFAULT 'submitted', -- submitted, graded, pending_review
    submission_data JSONB, -- Student answers or project file URL
    feedback TEXT,
    graded_by UUID REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ
);

-- 8. Course Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    certificate_code TEXT UNIQUE NOT NULL, -- NIC-CERT-YYYY-XXXX
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Courses: Public can view published, Admins view all
CREATE POLICY "Public view published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer'))
);

-- Modules/Lessons: Public view if course is published
CREATE POLICY "Public view modules" ON modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = modules.course_id AND is_published = true)
);
CREATE POLICY "Public view lessons" ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM modules JOIN courses ON modules.course_id = courses.id WHERE modules.id = lessons.module_id AND courses.is_published = true)
);

-- Enrollments: Users view own, Admins view all
CREATE POLICY "Users view own enrollments" ON enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all enrollments" ON enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Progress: Users manage own
CREATE POLICY "Users manage own progress" ON lesson_progress FOR ALL USING (
    EXISTS (SELECT 1 FROM enrollments WHERE id = lesson_progress.enrollment_id AND user_id = auth.uid())
);

-- Assessments: Viewable by enrolled students
CREATE POLICY "Enrolled students view assessments" ON assessments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM lessons
        JOIN modules ON lessons.module_id = modules.id
        JOIN enrollments ON modules.course_id = enrollments.course_id
        WHERE lessons.id = assessments.lesson_id AND enrollments.user_id = auth.uid()
    )
);

-- Submissions: Users manage own, Admins manage all
CREATE POLICY "Users manage own submissions" ON assessment_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM enrollments WHERE id = assessment_submissions.enrollment_id AND user_id = auth.uid())
);
CREATE POLICY "Admins manage submissions" ON assessment_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
