import { Client } from 'pg'

async function run() {
  const connectionString = 'postgresql://postgres:bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV@db.fyaeabdaxqrdosdksqwx.supabase.co:6543/postgres'
  
  console.log('Connecting to database...')
  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected successfully!')
    
    console.log('Updating protect_profile_roles function...')
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
    await client.query(sql)
    console.log('Updated trigger function protect_profile_roles!')

    console.log('Fixing kolawole Olusola Christwealth (telldirector@live.com)...')
    await client.query(`
      UPDATE public.profiles 
      SET role = 'facility_admin' 
      WHERE email = 'telldirector@live.com';
    `)
    await client.query(`
      UPDATE public.memberships 
      SET category = 'institutional' 
      WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'telldirector@live.com');
    `)
    console.log('Successfully fixed profile and membership for telldirector@live.com!')

  } catch (err: any) {
    console.error('Database connection or query failed:', err.message)
  } finally {
    await client.end()
  }
}

run()
