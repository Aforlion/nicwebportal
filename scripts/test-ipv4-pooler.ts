import { Client } from 'pg'

const projectRef = 'fyaeabdaxqrdosdksqwx'
const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'
const poolerHost = 'aws-0-eu-west-1.pooler.supabase.com'

const configs = [
  { name: '1. Port 6543, user postgres.ref, SNI db.ref', port: 6543, user: `postgres.${projectRef}`, ssl: { rejectUnauthorized: false, servername: `db.${projectRef}.supabase.co` } },
  { name: '2. Port 5432, user postgres.ref, SNI db.ref', port: 5432, user: `postgres.${projectRef}`, ssl: { rejectUnauthorized: false, servername: `db.${projectRef}.supabase.co` } },
  { name: '3. Port 6543, user postgres, SNI db.ref', port: 6543, user: 'postgres', ssl: { rejectUnauthorized: false, servername: `db.${projectRef}.supabase.co` } },
  { name: '4. Port 5432, user postgres, SNI db.ref', port: 5432, user: 'postgres', ssl: { rejectUnauthorized: false, servername: `db.${projectRef}.supabase.co` } },
  { name: '5. Port 6543, user postgres.ref, no SNI', port: 6543, user: `postgres.${projectRef}`, ssl: { rejectUnauthorized: false } },
  { name: '6. Port 5432, user postgres.ref, no SNI', port: 5432, user: `postgres.${projectRef}`, ssl: { rejectUnauthorized: false } },
]

async function run() {
  for (const cfg of configs) {
    console.log(`\nTesting Config: ${cfg.name}...`)
    const client = new Client({
      host: poolerHost,
      port: cfg.port,
      user: cfg.user,
      password,
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: cfg.ssl
    })

    try {
      await client.connect()
      console.log(`\n🎉🎉🎉 SUCCESS WITH CONFIG: ${cfg.name} 🎉🎉🎉\n`)
      await client.end()
      return cfg
    } catch (err: any) {
      console.log(`Failed: ${err.message}`)
    }
  }
}

run()
