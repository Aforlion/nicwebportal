-- Add document columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS passport_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_card_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
