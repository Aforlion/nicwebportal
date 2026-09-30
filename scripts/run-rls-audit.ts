
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runRlsAudit() {
  const connectionString = 'postgresql://postgres:bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV@db.fyaeabdaxqrdosdksqwx.supabase.co:6543/postgres';

  console.log('==================================================');
  console.log('  Executing Production RLS Audit Script...');
  console.log('==================================================');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to target Supabase host.');

    const sqlPath = path.join(process.cwd(), 'supabase', 'audit_rls_policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    const res = await client.query(sqlContent);

    // Find the select query result
    const selectRes = Array.isArray(res) ? res[res.length - 2] || res[res.length - 1] : res;

    if (selectRes && selectRes.rows) {
      console.log('\n📊 Production Row Level Security (RLS) Status:');
      console.table(selectRes.rows);
    }

    console.log('==================================================');
    console.log('🎉 RLS Policies Successfully Audit-Enforced!');
  } catch (err: any) {
    console.error('❌ Error executing RLS audit script:', err.message);
  } finally {
    await client.end();
  }
}

runRlsAudit();
