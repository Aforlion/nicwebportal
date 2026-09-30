import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const resendApiKey = process.env.RESEND_API_KEY || '';

console.log('==================================================');
console.log('  Diagnosing Tuesday & Monthly Cron Mail Delivery');
console.log('==================================================');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Resend API Key Present: ${Boolean(resendApiKey)}`);

async function diagnose() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const resend = new Resend(resendApiKey);

  // 1. Check Tuesday Cron Query
  console.log('\n--- 1. Testing Tuesday Cron Query ---');
  const { data: enrollments, error: eErr } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress,
      status,
      user_id,
      courses ( title ),
      profiles ( full_name, email )
    `)
    .neq('status', 'completed')
    .lt('progress', 100);

  if (eErr) {
    console.error('❌ Tuesday Cron Query Error:', eErr);
  } else {
    console.log(`✅ Tuesday Cron Query Found ${enrollments?.length || 0} active enrollments.`);
    if (enrollments && enrollments.length > 0) {
      console.log('Sample enrollment record:', JSON.stringify(enrollments[0], null, 2));
    }
  }

  // 2. Check Monthly Cron Query
  console.log('\n--- 2. Testing Monthly Cron Query ---');
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['student', 'member']);

  if (pErr) {
    console.error('❌ Monthly Cron Query Error:', pErr);
  } else {
    console.log(`✅ Monthly Cron Query Found ${profiles?.length || 0} student/member profiles.`);
    const { data: allEnrollments } = await supabase.from('enrollments').select('user_id');
    const enrolledSet = new Set((allEnrollments || []).map((e) => e.user_id));
    const nonEnrolled = (profiles || []).filter((p) => p.email && !enrolledSet.has(p.id));
    console.log(`✅ Non-enrolled users count: ${nonEnrolled.length}`);
    if (nonEnrolled.length > 0) {
      console.log('Sample non-enrolled user:', nonEnrolled[0]);
    }
  }

  // 3. Test Resend Email Send to Test/Admin Address
  console.log('\n--- 3. Testing Resend API Sender Address ---');
  try {
    const testResult = await resend.emails.send({
      from: 'National Institute of Caregivers <notifications@nicnigeria.org>',
      to: 'ikechukwuamalu2@gmail.com',
      subject: '🧪 Test Diagnostic Mail for Tuesday/Monthly Cron',
      html: '<p>This is a diagnostic email testing Resend delivery from notifications@nicnigeria.org</p>',
    });

    console.log('Resend Test Output:', JSON.stringify(testResult, null, 2));
  } catch (err: any) {
    console.error('❌ Resend Exception:', err);
  }

  console.log('==================================================');
}

diagnose();
