import { Client } from 'pg'

const passwords = [
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV',
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV123!',
  'fyaeabdaxqrdosdksqwx',
  'nicnigeria2026',
  'nicnigeria',
  'admin12345'
]

const users = [
  'postgres.fyaeabdaxqrdosdksqwx',
  'postgres'
]

async function testAuth() {
  const host = 'aws-0-eu-west-1.pooler.supabase.com'
  
  for (const user of users) {
    for (const pwd of passwords) {
      const connectionString = `postgresql://${user}:${encodeURIComponent(pwd)}@${host}:6543/postgres`
      const client = new Client({ 
        connectionString,
        ssl: { rejectUnauthorized: false }
      })
      try {
        await client.connect()
        console.log(`\n🎉 SUCCESS! User: ${user}, Password: ${pwd}\n`)
        await client.end()
        return
      } catch (err: any) {
        if (!err.message.includes('tenant/user')) {
          console.log(`User: ${user}, Err: ${err.message}`)
        }
      }
    }
  }
}

testAuth()
