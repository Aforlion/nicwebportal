import { Client } from 'pg'

const regions = [
  'eu-central-1',
  'eu-west-3',
  'eu-west-2',
  'eu-west-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1'
]

async function testConnection() {
  const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'
  const user = 'postgres.fyaeabdaxqrdosdksqwx'
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`
    const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`
    
    console.log(`Trying ${region} (${host})...`)
    const client = new Client({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
    try {
      await client.connect()
      console.log(`SUCCESSFULLY CONNECTED TO ${region}!`)
      await client.end()
      break
    } catch (err: any) {
      console.log(`Failed for ${region}:`, err.message)
    }
  }
}

testConnection()
