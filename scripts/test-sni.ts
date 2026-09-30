import { Client } from 'pg'

const passwords = [
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV',
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV123!',
  'nicnigeria2026',
  'fyaeabdaxqrdosdksqwx'
]

async function testSni() {
  const host = 'aws-0-eu-west-1.pooler.supabase.com'
  const projectRef = 'fyaeabdaxqrdosdksqwx'
  const user = `postgres.${projectRef}`
  
  for (const pwd of passwords) {
    console.log(`Testing user: ${user} with password candidate...`)
    const client = new Client({
      host,
      port: 6543,
      user,
      password: pwd,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        servername: `db.${projectRef}.supabase.co`
      }
    })

    try {
      await client.connect()
      console.log(`\n🎉 SUCCESSFUL DB CONNECTION! User: ${user}, Password: ${pwd}\n`)
      await client.end()
      return pwd
    } catch (err: any) {
      console.log(`Failed: ${err.message}`)
    }
  }
}

testSni()
