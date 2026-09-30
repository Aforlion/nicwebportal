import { Client } from 'pg'
import dns from 'dns/promises'

const projectRef = 'fyaeabdaxqrdosdksqwx'
const passwords = [
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV',
  'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV123!',
  'nicnigeria2026',
  'nicnigeria'
]

const hosts = [
  `db.${projectRef}.supabase.co`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-us-west-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`,
  `aws-0-ap-southeast-1.pooler.supabase.com`
]

const ports = [5432, 6543]

async function testAll() {
  console.log('Resolving DNS for direct host...')
  try {
    const ips = await dns.resolve4(`db.${projectRef}.supabase.co`)
    console.log(`db.${projectRef}.supabase.co resolved to IPs:`, ips)
  } catch (err: any) {
    console.log(`DNS lookup failed for db.${projectRef}.supabase.co:`, err.message)
  }

  for (const host of hosts) {
    for (const port of ports) {
      const userCandidates = host.includes('supabase.co')
        ? ['postgres']
        : [`postgres.${projectRef}`, 'postgres']

      for (const user of userCandidates) {
        for (const pwd of passwords) {
          const client = new Client({
            host,
            port,
            user,
            password: pwd,
            database: 'postgres',
            connectionTimeoutMillis: 3000,
            ssl: { rejectUnauthorized: false }
          })

          try {
            await client.connect()
            console.log(`\n🎉 MATCH FOUND! Host: ${host}:${port}, User: ${user}, Password: ${pwd}\n`)
            await client.end()
            return { host, port, user, password: pwd }
          } catch (err: any) {
            // Ignore timeout / refuse / not found errors in noise
            if (!err.message.includes('timeout') && !err.message.includes('ECONNREFUSED')) {
              console.log(`Tried ${host}:${port} user=${user} pwd=${pwd.substring(0,4)}... Error: ${err.message}`)
            }
          }
        }
      }
    }
  }
  console.log('Finished search.')
}

testAll()
