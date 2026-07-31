-- Create course recommendations table
CREATE TABLE IF NOT EXISTS course_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    recommended_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agency_id, student_id, course_id)
);

-- Enable RLS
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow agencies to manage their own recommendations
CREATE POLICY "Agencies can manage recommendations"
ON course_recommendations FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM facilities
        WHERE facilities.id = course_recommendations.agency_id
        AND facilities.owner_id = auth.uid()
    )
);

-- Allow students/caregivers to view recommendations sent to them
CREATE POLICY "Students can view recommendations"
ON course_recommendations FOR SELECT
TO authenticated
USING (student_id = auth.uid());
