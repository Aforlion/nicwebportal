import { Client } from 'pg'

const hosts = [
  'gcp-us-east4.pooler.supabase.com',
  'gcp-us-central1.pooler.supabase.com',
  'gcp-europe-west3.pooler.supabase.com',
  'gcp-europe-west9.pooler.supabase.com',
  'gcp-asia-southeast1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-3.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com'
]

async function testConnection() {
  const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'
  const user = 'postgres.fyaeabdaxqrdosdksqwx'
  
  for (const host of hosts) {
    const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`
    
    const client = new Client({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
    try {
      await client.connect()
      console.log(`\n🎉 SUCCESSFULLY CONNECTED TO HOST: ${host}!\n`)
      await client.end()
      break
    } catch (err: any) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Skip tenant not found
      } else {
        console.log(`Host ${host}: ${err.message}`)
      }
    }
  }
}

testConnection()
