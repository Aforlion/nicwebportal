import { createClient } from '@supabase/supabase-js'

const url = 'https://fyaeabdaxqrdosdksqwx.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU'

const supabase = createClient(url, serviceKey)

async function testRpc() {
  console.log('Testing RPC functions on fyaeabdaxqrdosdksqwx...')
  
  const candidateRpcs = [
    'exec_sql',
    'execute_sql',
    'run_sql',
    'exec',
    'pg_execute'
  ]

  for (const rpcName of candidateRpcs) {
    const { data, error } = await supabase.rpc(rpcName, { query: 'SELECT 1;' })
    if (error) {
      console.log(`RPC '${rpcName}': ${error.message} (${error.code})`)
    } else {
      console.log(`🎉 RPC '${rpcName}' IS AVAILABLE AND EXECUTED QUERY!`, data)
    }
  }
}

testRpc()
