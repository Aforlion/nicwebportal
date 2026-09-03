import dns from 'dns'
import { Client } from 'pg'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  console.warn('Failed to set DNS servers', e)
}

async function run() {
  const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'
  const hostname = 'db.fyaeabdaxqrdosdksqwx.supabase.co'
  
  console.log(`Resolving ${hostname}...`)
  let resolvedIp = ''
  try {
    const ips = await dns.promises.resolve4(hostname)
    resolvedIp = ips[0]
    console.log(`Resolved ${hostname} to ${resolvedIp}`)
  } catch (err: any) {
    console.error('DNS Resolution failed:', err.message)
    return
  }

  const ports = [5432, 6543]
  
  for (const port of ports) {
    console.log(`Connecting to ${resolvedIp}:${port} (Host: ${hostname})...`)
    
    const client = new Client({
      host: resolvedIp,
      port,
      user: 'postgres',
      password,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        servername: hostname
      }
    })
    
    try {
      await client.connect()
      console.log(`SUCCESS connected on port ${port}! Updating trigger function...`)
      
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
      console.log('Successfully updated trigger function protect_profile_roles!')
      await client.end()
      return
    } catch (err: any) {
      console.log(`Failed on port ${port}: ${err.message}`)
    }
  }
}

run()
