import { Client } from 'pg'

async function run() {
  const connectionString = 'postgresql://postgres:bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV@db.fyaeabdaxqrdosdksqwx.supabase.co:6543/postgres'
  
  console.log('Connecting to database...')
  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected successfully!')
    
    // Query triggers on profiles table
    const result = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement,
        action_orientation,
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'profiles';
    `)
    
    console.log('\n--- Triggers on profiles table ---')
    console.log(JSON.stringify(result.rows, null, 2))

    // Query function source for protect_profile_roles and protect_role_updates
    const funcResult = await client.query(`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname IN ('protect_profile_roles', 'protect_role_updates', 'protect_profile_role');
    `)
    
    console.log('\n--- Trigger functions ---')
    for (const row of funcResult.rows) {
      console.log(`\n=== Function: ${row.proname} ===`)
      console.log(row.prosrc)
    }

  } catch (err: any) {
    console.error('Failed:', err.message)
  } finally {
    await client.end()
  }
}

run()
