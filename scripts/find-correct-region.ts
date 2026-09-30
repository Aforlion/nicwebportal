import { Client } from 'pg'

const projectRef = 'fyaeabdaxqrdosdksqwx'
const user = `postgres.${projectRef}`
const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'

const regions = [
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-central-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
]

async function findRegion() {
  console.log(`Checking regions for tenant ${user}...`)

  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`
    const client = new Client({
      host,
      port: 6543,
      user,
      password,
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    })

    try {
      await client.connect()
      console.log(`\n🎉 MATCHED REGION ${r}! SUCCESSFUL CONNECTION!\n`)
      await client.end()
      return
    } catch (err: any) {
      if (err.message.includes('tenant/user')) {
        console.log(`Region ${r}: Tenant not found`)
      } else {
        console.log(`Region ${r}: MATCHED POOLER! Response: ${err.message}`)
      }
      await client.end()
    }
  }
  console.log('Done.')
}

findRegion()
