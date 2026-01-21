-- Add is_founding flag to memberships
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS is_founding BOOLEAN DEFAULT FALSE;

-- Create membership_invitations table
CREATE TABLE IF NOT EXISTS membership_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    category membership_category DEFAULT 'full',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for invitations (Only admins can manage invitations)
ALTER TABLE membership_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" 
ON membership_invitations 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow public access to view an invitation by token (for onboarding)
CREATE POLICY "Public can view invitation by token" 
ON membership_invitations 
FOR SELECT 
USING (NOT is_used AND expires_at > NOW());
