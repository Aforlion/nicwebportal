import * as dns from 'dns'

const hosts = [
  'db.fyaeabdaxqrdosdksqwx.supabase.co',
  'db.fyaeabdaxqrdosdksqwx.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'fyaeabdaxqrdosdksqwx.supabase.co'
]

async function resolve() {
  for (const host of hosts) {
    try {
      const addresses = await dns.promises.lookup(host)
      console.log(`Resolved ${host}:`, addresses)
    } catch (err: any) {
      console.log(`Failed to resolve ${host}:`, err.message)
    }
  }
}

resolve()
