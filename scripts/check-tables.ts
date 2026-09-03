import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('Replacing protect_profile_roles trigger function...')

  const sql = `
CREATE OR REPLACE FUNCTION protect_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service_role to change roles
    IF auth.role() = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF (OLD.role IS DISTINCT FROM NEW.role) AND 
       NOT EXISTS (
           SELECT 1 FROM profiles 
           WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
       ) THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: sql
  })

  if (error) {
    console.error('Error running exec_sql RPC:', error.message)
  } else {
    console.log('Successfully updated protect_profile_roles function!', data)
  }
}

checkTables()
