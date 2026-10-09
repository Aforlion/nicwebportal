import dns from 'dns'
import { Client } from 'pg'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {}

const projectRef = 'fyaeabdaxqrdosdksqwx'
const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'

const poolerHosts = [
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com'
]

async function run() {
  console.log('Connecting to database via pooler...')
  for (const host of poolerHosts) {
    console.log(`Trying ${host}...`)
    const client = new Client({
      host,
      port: 6543,
      user: `postgres.${projectRef}`,
      password,
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    })

    try {
      await client.connect()
      console.log(`SUCCESS connected to ${host}! Executing DDL...`)
      await client.query(`
        ALTER TABLE modules ADD COLUMN IF NOT EXISTS video_url TEXT;
        ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
        ALTER TABLE lessons ADD COLUMN IF NOT EXISTS banner_url TEXT;
      `)
      console.log('Migration completed successfully!')
      await client.end()
      return
    } catch (err: any) {
      console.log(`Failed on ${host}: ${err.message}`)
    }
  }
}

run()
