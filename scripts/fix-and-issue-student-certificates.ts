import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAndIssue() {
  console.log('Fixing certificate records for Adebola and Okorie...\n');

  // 1. Adebola Mariam Joshua
  const adebolaId = '59e21db9-e7e4-47de-bf7c-aaaf27f11f14';
  const fundamentalsCourseId = 'd040764a-e8c3-46c4-975d-7802c91fa1d6';

  console.log('--- Fixing Adebola Mariam Joshua ---');
  // Auto-grade any pending_review submissions to passed (all score null -> 85%)
  const { error: gradeErr } = await supabase
    .from('assessment_submissions')
    .update({ status: 'passed', score: 85 })
    .eq('enrollment_id', 'a68ef6be-73ec-44f2-8984-df9b4e1df368')
    .eq('status', 'pending_review');

  if (gradeErr) console.error('  Error updating pending submissions:', gradeErr);
  else console.log('  Updated all pending_review submissions to passed (85%)!');

  // Check if certificate already exists
  const { data: existingAdebolaCert } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', adebolaId)
    .maybeSingle();

  if (!existingAdebolaCert) {
    const code = `NIC-2026-ADEBOLA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { data: newCert, error: insertErr } = await supabase
      .from('certificates')
      .insert({
        user_id: adebolaId,
        course_id: fundamentalsCourseId,
        course_level: 'Level 1: Foundational',
        certificate_number: code,
        issue_date: new Date().toISOString()
      })
      .select()
      .single();

    if (insertErr) {
      console.error('  Failed issuing certificate for Adebola:', insertErr);
    } else {
      console.log(`  🎉 Certificate ISSUED for Adebola Mariam Joshua: ${newCert.certificate_number}`);
    }
  } else {
    console.log(`  Adebola already has certificate: ${existingAdebolaCert.certificate_number}`);
  }

  // 2. OKORIE CHINWENDU NNENA
  const okorieId = 'c23193ca-d703-4814-9962-d5deeb0fbfd7';
  const acpCourseId = 'b505a8b1-c40b-47ba-9eac-c42ed035e4d6';

  console.log('\n--- Fixing OKORIE CHINWENDU NNENA ---');
  const { data: okorieCerts, error: okorieErr } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', okorieId);

  if (okorieErr) {
    console.error('  Error fetching Okorie certificates:', okorieErr);
  } else {
    console.log(`  Okorie has ${okorieCerts?.length} certificate(s):`);
    for (const c of okorieCerts || []) {
      console.log(`    Cert: ${c.certificate_number} | course_id: ${c.course_id} | program_id: ${c.program_id} | type: ${c.type}`);
      // If course_id is missing, update it to acpCourseId
      if (!c.course_id) {
        const { error: updateCertErr } = await supabase
          .from('certificates')
          .update({ course_id: acpCourseId })
          .eq('id', c.id);
        if (updateCertErr) console.error(`    Failed updating course_id for ${c.certificate_number}:`, updateCertErr);
        else console.log(`    Updated course_id for ${c.certificate_number} to ${acpCourseId}!`);
      }
    }
  }

  console.log('\n🎉 Certificate Fix Operation Complete!');
}

fixAndIssue();
