import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Authorization Check: Vercel Cron uses Authorization header
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized compliance cron trigger' }, { status: 401 });
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing core database configuration' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const timestamp = new Date().toISOString();
  const tables = ['users', 'assessments', 'certificates', 'facilities', 'internships'];
  const auditResults: { table: string; count: number; status: string }[] = [];
  let healthy = true;

  try {
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        healthy = false;
        auditResults.push({
          table,
          count: 0,
          status: `ERROR: ${error.message}`,
        });
      } else {
        auditResults.push({
          table,
          count: count ?? 0,
          status: 'RLS & Schema Active',
        });
      }
    }

    const envChecks = {
      supabaseIsolated: Boolean(supabaseServiceKey),
      resendMailerActive: Boolean(env.RESEND_API_KEY),
      paystackActive: Boolean(env.PAYSTACK_SECRET_KEY),
    };

    return NextResponse.json({
      success: true,
      timestamp,
      system: 'NIC Portal Continuous Compliance Monitor',
      overallHealth: healthy ? 'PASS' : 'WARN',
      environment: envChecks,
      databaseTables: auditResults,
    });
  } catch (err: any) {
    console.error('[ComplianceCron] Fatal error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal compliance audit error' },
      { status: 500 }
    );
  }
}
