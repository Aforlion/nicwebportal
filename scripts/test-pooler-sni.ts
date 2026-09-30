import { Client } from 'pg'

const projectRef = 'fyaeabdaxqrdosdksqwx'
const passwords = [
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV',
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV123!',
  'nicnigeria2026',
  'fyaeabdaxqrdosdksqwx'
]

const poolerHosts = [
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com'
]

const ports = [6543, 5432]

async function testPoolerSni() {
  const user = `postgres.${projectRef}`
  console.log(`Testing pooler connection for user ${user}...`)

  for (const host of poolerHosts) {
    for (const port of ports) {
      for (const pwd of passwords) {
        const client = new Client({
          host,
          port,
          user,
          password: pwd,
          database: 'postgres',
          connectionTimeoutMillis: 3000,
          ssl: {
            rejectUnauthorized: false,
            servername: `db.${projectRef}.supabase.co`
          }
        })

        try {
          await client.connect()
          console.log(`\n🎉🎉🎉 SUCCESSFUL DB CONNECTION! 🎉🎉🎉`)
          console.log(`Host: ${host}:${port}`)
          console.log(`User: ${user}`)
          console.log(`Password: ${pwd}\n`)
          await client.end()
          return { host, port, user, pwd }
        } catch (err: any) {
          if (!err.message.includes('tenant/user') && !err.message.includes('timeout')) {
            console.log(`[${host}:${port}] pwd=${pwd.substring(0,4)}... Error: ${err.message}`)
          }
        }
      }
    }
  }
  console.log('Search finished.')
}

testPoolerSni()
