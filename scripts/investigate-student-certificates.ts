import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const targetNames = [
  'Adebola Mariam Joshua',
  'OKORIE CHINWENDU NNENA',
  'Adebola',
  'Chinwendu'
];

async function investigate() {
  console.log('Searching for student profiles...');

  for (const name of targetNames) {
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .ilike('full_name', `%${name}%`);

    if (profError) {
      console.error(`Error searching ${name}:`, profError);
      continue;
    }

    if (!profiles || profiles.length === 0) {
      console.log(`No profile found matching "${name}"`);
      continue;
    }

    console.log(`\n==================================================`);
    console.log(`Found ${profiles.length} profile(s) for query: "${name}":`);

    for (const p of profiles) {
      console.log(`\n--- STUDENT PROFILE: ${p.full_name} (${p.email}) ---`);
      console.log(`User ID: ${p.id}`);
      console.log(`Role: ${p.role}`);
      console.log(`Created At: ${p.created_at}`);

      // Fetch enrollments
      const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          program_id,
          progress,
          status,
          enrolled_at,
          completed_at,
          courses (
            id,
            title,
            level
          )
        `)
        .eq('user_id', p.id);

      if (enrollErr) {
        console.error('  Error fetching enrollments:', enrollErr);
      } else {
        console.log(`  Enrollments Count: ${enrollments?.length || 0}`);
        for (const e of enrollments || []) {
          const course = e.courses as any;
          console.log(`    Course: ${course?.title || 'Unknown'} (ID: ${e.course_id})`);
          console.log(`      Progress: ${e.progress}% | Status: ${e.status}`);
          console.log(`      Enrolled: ${e.enrolled_at} | Completed: ${e.completed_at || 'Not completed'}`);

          // Fetch submissions for this enrollment
          const { data: submissions, error: subErr } = await supabase
            .from('assessment_submissions')
            .select(`
              id,
              assessment_id,
              score,
              status,
              submitted_at,
              assessments (
                title,
                passing_score
              )
            `)
            .eq('enrollment_id', e.id);

          if (subErr) {
            console.error('      Error fetching submissions:', subErr);
          } else {
            console.log(`      Submissions Count: ${submissions?.length || 0}`);
            for (const sub of submissions || []) {
              const ast = sub.assessments as any;
              console.log(`        Quiz: "${ast?.title || 'Assessment'}" | Score: ${sub.score}% (Passing: ${ast?.passing_score || 70}%) | Status: ${sub.status}`);
            }
          }
        }
      }

      // Fetch certificates
      const { data: certs, error: certErr } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', p.id);

      if (certErr) {
        console.error('  Error fetching certificates:', certErr);
      } else {
        console.log(`  Certificates Count in DB: ${certs?.length || 0}`);
        for (const c of certs || []) {
          console.log(`    Certificate Number: ${c.certificate_number} | Issue Date: ${c.issue_date} | Level: ${c.course_level}`);
        }
      }
    }
  }
}

investigate();
