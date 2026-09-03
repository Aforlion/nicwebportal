import { Client } from 'pg'

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1'
]

async function testConnection() {
  const password = 'bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV'
  const user = 'postgres.fyaeabdaxqrdosdksqwx'
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`
    const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`
    
    const client = new Client({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
    try {
      await client.connect()
      console.log(`\n🎉 SUCCESSFULLY CONNECTED TO REGION: ${region}!\n`)
      await client.end()
      break
    } catch (err: any) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Skip tenant not found
      } else {
        console.log(`Region ${region}: ${err.message}`)
      }
    }
  }
}

testConnection()
