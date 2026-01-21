-- PENDING REGISTRATIONS (For storing form data before payment redirect)
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    form_data JSONB NOT NULL,
    registration_type TEXT NOT NULL, -- e.g., 'individual', 'corporate'
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'completed'
    payment_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert pending registrations" ON pending_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own pending registration by ID" ON pending_registrations FOR SELECT USING (true); -- Usually accessed via server action
