import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  console.warn('Failed to set DNS servers', e)
}

async function resolveDns() {
  const hostname = 'db.fyaeabdaxqrdosdksqwx.supabase.co'
  console.log(`Analyzing DNS for ${hostname}...`)

  try {
    const cnames = await dns.promises.resolveCname(hostname)
    console.log('CNAME records:', cnames)
  } catch (err: any) {
    console.log('CNAME resolution failed:', err.message)
  }

  try {
    const anyRecords = await dns.promises.resolve(hostname, 'ANY')
    console.log('ANY records:', anyRecords)
  } catch (err: any) {
    console.log('ANY resolution failed:', err.message)
  }

  try {
    const srvRecords = await dns.promises.resolveSrv(hostname)
    console.log('SRV records:', srvRecords)
  } catch (err: any) {
    console.log('SRV resolution failed:', err.message)
  }
}

resolveDns()
